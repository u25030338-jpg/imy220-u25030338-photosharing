import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../api";

export default function PostPage({ user }) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [creator, setCreator] = useState(null);
    const [comments, setComments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [commentText, setCommentText] = useState("");
    const [commentError, setCommentError] = useState("");
    const [commentLoading, setCommentLoading] = useState(false);

    const [reportReason, setReportReason] = useState("");
    const [reportError, setReportError] = useState("");
    const [reportSuccess, setReportSuccess] = useState("");
    const [reportLoading, setReportLoading] = useState(false);

    const [editing, setEditing] = useState(false);
    const [editDescription, setEditDescription] = useState("");
    const [editHashtags, setEditHashtags] = useState("");
    const [editError, setEditError] = useState("");
    const [editLoading, setEditLoading] = useState(false);

    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        loadPost();
    }, [id]);

    async function loadPost() {
        setLoading(true);
        setError("");

        try {
            const postResult = await api.getPost(Number(id));
            const foundPost = postResult.post || postResult;

            if (!foundPost || !foundPost.id) {
                throw new Error("Post could not be found.");
            }

            setPost(foundPost);

            setEditDescription(foundPost.description || "");
            setEditHashtags(
                Array.isArray(foundPost.hashtags)
                    ? foundPost.hashtags.join(", ")
                    : ""
            );

            const [userResult, commentResult] = await Promise.all([
                api.getUser(foundPost.userId),
                api.getComments(foundPost.id)
            ]);

            setCreator(userResult.user || userResult);

            setComments(
                commentResult.comments || commentResult || []
            );
        } catch (err) {
            console.error("Failed to load post:", err);

            setError(
                err.message ||
                "Unable to load this post."
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleCommentSubmit(event) {
        event.preventDefault();

        setCommentError("");

        const trimmedComment = commentText.trim();

        if (!user || !user.id) {
            setCommentError(
                "You must be logged in to comment."
            );
            return;
        }

        if (!trimmedComment) {
            setCommentError("Comment cannot be empty.");
            return;
        }

        if (trimmedComment.length > 500) {
            setCommentError(
                "Comment cannot be longer than 500 characters."
            );
            return;
        }

        setCommentLoading(true);

        try {
            const result = await api.createComment({
                postId: Number(id),
                userId: Number(user.id),
                text: trimmedComment
            });

            const newComment = result.comment || result;

            setComments((current) => [
                ...current,
                newComment
            ]);

            setCommentText("");
        } catch (err) {
            console.error("Comment failed:", err);

            setCommentError(
                err.message ||
                "Unable to add your comment. Please try again."
            );
        } finally {
            setCommentLoading(false);
        }
    }

    async function handleDeleteComment(commentId) {
        if (!commentId) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to delete this comment?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.deleteComment(commentId);

            setComments((current) =>
                current.filter(
                    (comment) => comment.id !== commentId
                )
            );
        } catch (err) {
            console.error("Delete comment failed:", err);

            setError(
                err.message ||
                "Unable to delete the comment."
            );
        }
    }

    function validateEdit() {
        const trimmedDescription = editDescription.trim();

        if (!trimmedDescription) {
            return "Post description cannot be empty.";
        }

        if (trimmedDescription.length > 200) {
            return "Description cannot be longer than 200 characters.";
        }

        if (editHashtags.trim()) {
            const tags = editHashtags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean);

            for (const tag of tags) {
                if (tag.length > 30) {
                    return "Each hashtag must be 30 characters or less.";
                }

                if (!/^[a-zA-Z0-9_]+$/.test(tag)) {
                    return `Invalid hashtag: "${tag}". Use letters, numbers and underscores only.`;
                }
            }
        }

        return null;
    }

    async function handleEditSubmit(event) {
        event.preventDefault();

        setEditError("");

        if (!post) {
            return;
        }

        if (!user || Number(user.id) !== Number(post.userId)) {
            setEditError(
                "You are not allowed to edit this post."
            );
            return;
        }

        const validationError = validateEdit();

        if (validationError) {
            setEditError(validationError);
            return;
        }

        setEditLoading(true);

        try {
            const hashtags = editHashtags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean);

            const result = await api.updatePost(
                Number(post.id),
                {
                    description: editDescription.trim(),
                    hashtags
                }
            );

            const updatedPost = result.post || result;

            setPost(updatedPost);

            setEditDescription(
                updatedPost.description || ""
            );

            setEditHashtags(
                Array.isArray(updatedPost.hashtags)
                    ? updatedPost.hashtags.join(", ")
                    : ""
            );

            setEditing(false);
        } catch (err) {
            console.error("Update post failed:", err);

            setEditError(
                err.message ||
                "Unable to update this post."
            );
        } finally {
            setEditLoading(false);
        }
    }

    async function handleDeletePost() {
        if (!post) {
            return;
        }

        if (!user || Number(user.id) !== Number(post.userId)) {
            setError(
                "You are not allowed to delete this post."
            );
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to delete this post?"
        );

        if (!confirmed) {
            return;
        }

        setDeleteLoading(true);
        setError("");

        try {
            await api.deletePost(Number(post.id));

            navigate("/home");
        } catch (err) {
            console.error("Delete post failed:", err);

            setError(
                err.message ||
                "Unable to delete this post."
            );

            setDeleteLoading(false);
        }
    }

    async function handleReportSubmit(event) {
        event.preventDefault();

        setReportError("");
        setReportSuccess("");

        const trimmedReason = reportReason.trim();

        if (!user || !user.id) {
            setReportError(
                "You must be logged in to report a post."
            );
            return;
        }

        if (!trimmedReason) {
            setReportError(
                "Please provide a reason for reporting this post."
            );
            return;
        }

        if (trimmedReason.length < 5) {
            setReportError(
                "Report reason must be at least 5 characters."
            );
            return;
        }

        if (trimmedReason.length > 500) {
            setReportError(
                "Report reason cannot be longer than 500 characters."
            );
            return;
        }

        setReportLoading(true);

        try {
            await api.createReport({
                postId: Number(id),
                userId: Number(user.id),
                reason: trimmedReason
            });

            setReportReason("");
            setReportSuccess(
                "Report submitted successfully."
            );
        } catch (err) {
            console.error("Report failed:", err);

            setReportError(
                err.message ||
                "Unable to submit the report."
            );
        } finally {
            setReportLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100">
                <div className="mx-auto max-w-4xl px-6 py-12">
                    <div className="rounded-2xl bg-white p-8 text-center shadow">
                        <p className="text-slate-500">
                            Loading post...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !post) {
        return (
            <div className="min-h-screen bg-slate-100">
                <div className="mx-auto max-w-4xl px-6 py-12">

                    <Link
                        to="/home"
                        className="mb-6 inline-flex rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800"
                    >
                        ← Back to Home
                    </Link>

                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
                        <h1 className="text-xl font-bold">
                            Unable to load post
                        </h1>

                        <p className="mt-2">
                            {error}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const isCreator =
        user &&
        post &&
        Number(user.id) === Number(post.userId);

    return (
        <div className="min-h-screen bg-slate-100">

            {/* Header */}
            <header className="sticky top-0 z-10 bg-slate-950 text-white shadow">
                <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">

                    <Link
                        to="/home"
                        className="text-2xl font-bold"
                    >
                        PhotoShare
                    </Link>

                    <Link
                        to={`/profile/${user.id}`}
                        className="rounded-lg px-3 py-2 hover:bg-slate-800"
                    >
                        Profile
                    </Link>
                </nav>
            </header>

            <main className="mx-auto max-w-4xl px-6 py-8">

                {/* Back */}
                <Link
                    to="/home"
                    className="mb-6 inline-flex rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800"
                >
                    ← Back to Home
                </Link>

                {/* General error */}
                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {/* Post */}
                <article className="overflow-hidden rounded-2xl bg-white shadow-lg">

                    {post.image && (
                        <img
                            src={post.image}
                            alt={post.description || "Photo"}
                            className="max-h-[600px] w-full object-cover"
                        />
                    )}

                    <div className="p-6">

                        {/* Creator */}
                        <div className="mb-5 flex items-center justify-between">

                            <Link
                                to={`/profile/${post.userId}`}
                                className="font-semibold text-blue-600 hover:text-blue-800"
                            >
                                @{creator?.username || "Unknown user"}
                            </Link>

                            <span className="text-sm text-slate-400">
                                Post #{post.id}
                            </span>
                        </div>

                        {/* Edit form */}
                        {editing ? (
                            <form
                                onSubmit={handleEditSubmit}
                                className="space-y-4"
                            >
                                <div>
                                    <label
                                        htmlFor="edit-description"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Description
                                    </label>

                                    <textarea
                                        id="edit-description"
                                        value={editDescription}
                                        onChange={(event) => {
                                            setEditDescription(
                                                event.target.value
                                            );
                                            setEditError("");
                                        }}
                                        maxLength={200}
                                        rows={4}
                                        className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                    <p className="mt-1 text-right text-xs text-slate-500">
                                        {editDescription.length}/200
                                    </p>
                                </div>

                                <div>
                                    <label
                                        htmlFor="edit-hashtags"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Hashtags
                                    </label>

                                    <input
                                        id="edit-hashtags"
                                        type="text"
                                        value={editHashtags}
                                        onChange={(event) => {
                                            setEditHashtags(
                                                event.target.value
                                            );
                                            setEditError("");
                                        }}
                                        placeholder="travel, nature, photography"
                                        className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                {editError && (
                                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                        {editError}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={editLoading}
                                        className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 disabled:bg-slate-400"
                                    >
                                        {editLoading
                                            ? "Saving..."
                                            : "Save Changes"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditing(false);
                                            setEditError("");
                                            setEditDescription(
                                                post.description || ""
                                            );
                                            setEditHashtags(
                                                Array.isArray(post.hashtags)
                                                    ? post.hashtags.join(", ")
                                                    : ""
                                            );
                                        }}
                                        className="rounded-lg bg-slate-200 px-5 py-2 font-semibold text-slate-700 hover:bg-slate-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <h1 className="text-2xl font-bold text-slate-900">
                                    {post.description}
                                </h1>

                                {/* Hashtags */}
                                {post.hashtags?.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {post.hashtags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Creator controls */}
                                {isCreator && (
                                    <div className="mt-6 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditing(true);
                                                setEditError("");
                                            }}
                                            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                                        >
                                            Edit Post
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleDeletePost}
                                            disabled={deleteLoading}
                                            className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:bg-slate-400"
                                        >
                                            {deleteLoading
                                                ? "Deleting..."
                                                : "Delete Post"}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </article>

                {/* Comments */}
                <section className="mt-8 rounded-2xl bg-white p-6 shadow-lg">

                    <h2 className="text-xl font-bold text-slate-900">
                        Comments
                    </h2>

                    {/* Comment form */}
                    <form
                        onSubmit={handleCommentSubmit}
                        className="mt-5"
                    >
                        <textarea
                            value={commentText}
                            onChange={(event) => {
                                setCommentText(
                                    event.target.value
                                );
                                setCommentError("");
                            }}
                            placeholder="Write a comment..."
                            maxLength={500}
                            rows={3}
                            className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                        <div className="mt-1 flex justify-between text-xs text-slate-500">
                            <span>
                                {commentText.length}/500
                            </span>

                            <span>
                                Please keep comments respectful.
                            </span>
                        </div>

                        {commentError && (
                            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                {commentError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={commentLoading}
                            className="mt-4 rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                            {commentLoading
                                ? "Posting..."
                                : "Post Comment"}
                        </button>
                    </form>

                    {/* Comment list */}
                    <div className="mt-8 space-y-4">

                        {comments.length === 0 ? (
                            <p className="text-sm text-slate-500">
                                No comments yet. Be the first to comment.
                            </p>
                        ) : (
                            comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className="rounded-xl bg-slate-50 p-4"
                                >
                                    <div className="flex items-start justify-between gap-4">

                                        <div>
                                            <Link
                                                to={`/profile/${comment.userId}`}
                                                className="font-semibold text-blue-600 hover:text-blue-800"
                                            >
                                                User #{comment.userId}
                                            </Link>

                                            <p className="mt-2 text-slate-700">
                                                {comment.text}
                                            </p>
                                        </div>

                                        {user &&
                                            Number(user.id) ===
                                                Number(comment.userId) && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteComment(
                                                            comment.id
                                                        )
                                                    }
                                                    className="text-sm font-semibold text-red-600 hover:text-red-800"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Report */}
                <section className="mt-8 rounded-2xl bg-white p-6 shadow-lg">

                    <h2 className="text-xl font-bold text-slate-900">
                        Report Post
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        If this post violates the rules, provide a reason.
                    </p>

                    <form
                        onSubmit={handleReportSubmit}
                        className="mt-5"
                    >
                        <textarea
                            value={reportReason}
                            onChange={(event) => {
                                setReportReason(
                                    event.target.value
                                );
                                setReportError("");
                                setReportSuccess("");
                            }}
                            placeholder="Explain why you are reporting this post..."
                            maxLength={500}
                            rows={4}
                            className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        />

                        <div className="mt-1 text-right text-xs text-slate-500">
                            {reportReason.length}/500
                        </div>

                        {reportError && (
                            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                {reportError}
                            </div>
                        )}

                        {reportSuccess && (
                            <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                                {reportSuccess}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={reportLoading}
                            className="mt-4 rounded-lg bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                            {reportLoading
                                ? "Submitting..."
                                : "Report Post"}
                        </button>
                    </form>
                </section>

                {/* Bottom navigation */}
                <div className="mt-8 text-center">
                    <Link
                        to="/home"
                        className="inline-block rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800"
                    >
                        ← Return to Home
                    </Link>
                </div>

            </main>
        </div>
    );
}