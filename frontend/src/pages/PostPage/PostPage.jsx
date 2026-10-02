import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../api";

export default function PostPage({ user, onLogout }) {
    const { id } = useParams();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [users, setUsers] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        description: "",
        hashtags: ""
    });
    const [message, setMessage] = useState("");

    async function loadPost() {
        try {
            const [postResult, commentResult, userResult] =
                await Promise.all([
                    api.getPost(id),
                    api.getComments(id),
                    api.getUsers()
                ]);

            const loadedPost = postResult.post || postResult;

            setPost(loadedPost);
            setComments(commentResult.comments || commentResult);
            setUsers(userResult.users || userResult);

            setEditForm({
                description: loadedPost.description || "",
                hashtags: (loadedPost.hashtags || []).join(", ")
            });
        } catch (error) {
            setMessage(error.message);
        }
    }

    useEffect(() => {
        loadPost();
    }, [id]);

    function username(userId) {
        const found = users.find((item) => item.id === userId);
        return found?.username || "User";
    }

    async function addComment(e) {
        e.preventDefault();

        if (!commentText.trim()) return;

        try {
            await api.createComment({
                postId: Number(id),
                userId: user.id,
                text: commentText.trim()
            });

            setCommentText("");
            await loadPost();
        } catch (error) {
            setMessage(error.message);
        }
    }

    async function deleteComment(commentId) {
        try {
            await api.deleteComment(commentId);
            await loadPost();
        } catch (error) {
            setMessage(error.message);
        }
    }

    async function savePost(e) {
        e.preventDefault();

        try {
            await api.updatePost(id, {
                description: editForm.description,
                hashtags: editForm.hashtags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean)
            });

            setEditing(false);
            await loadPost();
        } catch (error) {
            setMessage(error.message);
        }
    }

    async function deletePost() {
        if (!window.confirm("Delete this post?")) return;

        try {
            await api.deletePost(id);
            window.location.href = "/home";
        } catch (error) {
            setMessage(error.message);
        }
    }

    async function reportPost() {
        const reason = window.prompt(
            "Why are you reporting this post?"
        );

        if (!reason) return;

        try {
            await api.createReport({
                postId: Number(id),
                userId: user.id,
                reason,
                status: "Pending"
            });

            setMessage("Post reported successfully.");
        } catch (error) {
            setMessage(error.message);
        }
    }

    if (!post) {
        return (
            <main className="min-h-screen bg-slate-100 p-8">
                Loading post...
            </main>
        );
    }

    const owner = Number(post.userId) === Number(user.id);

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="bg-slate-950 text-white">
                <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <Link
                        to="/home"
                        className="text-2xl font-bold"
                    >
                        PhotoShare
                    </Link>

                    <div className="flex gap-3">
                        <Link
                            to={`/profile/${user.id}`}
                            className="rounded-lg px-3 py-2 hover:bg-slate-800"
                        >
                            Profile
                        </Link>

                        <button
                            onClick={onLogout}
                            className="rounded-lg bg-red-500 px-4 py-2"
                        >
                            Logout
                        </button>
                    </div>
                </nav>
            </header>

            <main className="mx-auto max-w-3xl px-6 py-8">
                {message && (
                    <div className="mb-5 rounded-lg bg-blue-100 p-3 text-blue-800">
                        {message}
                    </div>
                )}

                <article className="overflow-hidden rounded-2xl bg-white shadow">
                    <img
                        src={post.image}
                        alt={post.description}
                        className="max-h-[600px] w-full object-cover"
                    />

                    <div className="p-6">
                        <p className="text-sm font-semibold text-blue-600">
                            @{username(post.userId)}
                        </p>

                        {editing ? (
                            <form
                                onSubmit={savePost}
                                className="mt-4 space-y-4"
                            >
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            description:
                                                e.target.value
                                        })
                                    }
                                    className="w-full rounded-lg border p-3"
                                    rows="3"
                                    required
                                />

                                <input
                                    value={editForm.hashtags}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            hashtags:
                                                e.target.value
                                        })
                                    }
                                    className="w-full rounded-lg border p-3"
                                    placeholder="nature, travel, photo"
                                />

                                <div className="flex gap-3">
                                    <button className="rounded-lg bg-green-600 px-4 py-2 text-white">
                                        Save
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditing(false)
                                        }
                                        className="rounded-lg bg-slate-200 px-4 py-2"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <h1 className="mt-3 text-2xl font-bold">
                                    {post.description}
                                </h1>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    {(post.hashtags || []).map(
                                        (tag) => (
                                            <span
                                                key={tag}
                                                className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
                                            >
                                                #{tag}
                                            </span>
                                        )
                                    )}
                                </div>
                            </>
                        )}

                        <div className="mt-6 flex flex-wrap gap-3">
                            {owner && !editing && (
                                <>
                                    <button
                                        onClick={() =>
                                            setEditing(true)
                                        }
                                        className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={deletePost}
                                        className="rounded-lg bg-red-600 px-4 py-2 text-white"
                                    >
                                        Delete
                                    </button>
                                </>
                            )}

                            {!owner && (
                                <button
                                    onClick={reportPost}
                                    className="rounded-lg bg-orange-500 px-4 py-2 text-white"
                                >
                                    Report
                                </button>
                            )}
                        </div>
                    </div>
                </article>

                <section className="mt-8 rounded-2xl bg-white p-6 shadow">
                    <h2 className="text-2xl font-bold">
                        Comments
                    </h2>

                    <form
                        onSubmit={addComment}
                        className="mt-5 flex gap-3"
                    >
                        <input
                            value={commentText}
                            onChange={(e) =>
                                setCommentText(e.target.value)
                            }
                            placeholder="Write a comment..."
                            className="flex-1 rounded-lg border p-3"
                        />

                        <button className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white">
                            Comment
                        </button>
                    </form>

                    <div className="mt-6 space-y-4">
                        {comments.length === 0 ? (
                            <p className="text-slate-500">
                                No comments yet.
                            </p>
                        ) : (
                            comments.map((comment) => (
                                <article
                                    key={comment.id}
                                    className="rounded-lg bg-slate-100 p-4"
                                >
                                    <div className="flex justify-between">
                                        <strong>
                                            @{username(comment.userId)}
                                        </strong>

                                        {Number(comment.userId) ===
                                            Number(user.id) && (
                                            <button
                                                onClick={() =>
                                                    deleteComment(
                                                        comment.id
                                                    )
                                                }
                                                className="text-sm text-red-600"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>

                                    <p className="mt-2">
                                        {comment.text}
                                    </p>
                                </article>
                            ))
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}