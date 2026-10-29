import { useEffect, useState } from "react";
import { api } from "../../api";

export default function CreatePost({ user, onPostCreated }) {
    const [description, setDescription] = useState("");
    const [hashtags, setHashtags] = useState("");
    const [albums, setAlbums] = useState([]);
    const [albumId, setAlbumId] = useState("");

    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

    useEffect(() => {
        let active = true;
        api.getMyAlbums(user.id).then((result) => {
            if (active) setAlbums((result.albums || result || []).filter((album) => Number(album.userId) === Number(user.id)));
        }).catch((err) => console.warn("Could not load your albums:", err.message));
        return () => { active = false; };
    }, [user.id]);

    function handleImageChange(event) {
        setError("");
        setSuccess("");

        const file = event.target.files[0];

        if (!file) {
            setImage(null);
            setImagePreview("");
            return;
        }

        // Check file type
        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file.");
            event.target.value = "";
            setImage(null);
            setImagePreview("");
            return;
        }

        // Check file size
        if (file.size > MAX_IMAGE_SIZE) {
            setError("Image must be smaller than 5 MB.");
            event.target.value = "";
            setImage(null);
            setImagePreview("");
            return;
        }

        setImage(file);

        const reader = new FileReader();

        reader.onload = () => {
            setImagePreview(reader.result);
        };

        reader.onerror = () => {
            setError("Could not read the selected image.");
            setImage(null);
            setImagePreview("");
        };

        reader.readAsDataURL(file);
    }

    function removeImage() {
        setImage(null);
        setImagePreview("");
        setError("");
        
        const input = document.getElementById("post-image");

        if (input) {
            input.value = "";
        }
    }

    function validateForm() {
        if (!user || !user.id) {
            return "You must be logged in to create a post.";
        }

        if (!image) {
            return "Please select an image.";
        }

        if (!description.trim()) {
            return "Please enter a description.";
        }

        if (description.trim().length > 200) {
            return "Description cannot be longer than 200 characters.";
        }

        // Validate hashtags
        if (hashtags.trim()) {
            const hashtagList = hashtags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean);

            for (const tag of hashtagList) {
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

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setSuccess("");

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);

        try {
            const reader = new FileReader();

            reader.onload = async () => {
                try {
                    const imageData = reader.result;

                    const hashtagList = hashtags
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean);

                    const result = await api.createPost({
                        userId: user.id,
                        image: imageData,
                        description: description.trim(),
                        hashtags: hashtagList
                    });

                    const createdPost = result.post || result;
                    if (albumId) {
                        // The album selector is populated only with this user's albums.
                        await api.addPostToAlbum(albumId, createdPost.id);
                    }

                    setSuccess("Post created successfully!");

                    setDescription("");
                    setHashtags("");
                    setAlbumId("");
                    setImage(null);
                    setImagePreview("");

                    const input = document.getElementById("post-image");

                    if (input) {
                        input.value = "";
                    }

                    if (onPostCreated) {
                        onPostCreated(createdPost);
                    }
                } catch (error) {
                    console.error("Create post failed:", error);

                    setError(
                        error.message ||
                        "Something went wrong while creating the post."
                    );
                } finally {
                    setLoading(false);
                }
            };

            reader.onerror = () => {
                setError("Could not read the selected image.");
                setLoading(false);
            };

            reader.readAsDataURL(image);
        } catch (error) {
            console.error("Create post failed:", error);

            setError(
                error.message ||
                "Something went wrong while creating the post."
            );

            setLoading(false);
        }
    }

    return (
        <section className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                    Create a Post
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Share a photo with the PhotoShare community.
                </p>
            </div>

            {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {success && (
                <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

                {/* Image */}
                <div>
                    <label
                        htmlFor="post-image"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Image
                    </label>

                    <input
                        id="post-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full rounded-lg border border-slate-300 bg-white p-3 text-sm"
                    />

                    <p className="mt-1 text-xs text-slate-500">
                        Maximum file size: 5 MB.
                    </p>
                </div>

                {/* Preview */}
                {imagePreview && (
                    <div className="relative overflow-hidden rounded-xl border border-slate-200">
                        <img
                            src={imagePreview}
                            alt="Post preview"
                            className="max-h-96 w-full object-cover"
                        />

                        <button
                            type="button"
                            onClick={removeImage}
                            className="absolute right-3 top-3 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-red-700"
                        >
                            Remove
                        </button>
                    </div>
                )}

                {/* Description */}
                <div>
                    <label
                        htmlFor="post-description"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Description
                    </label>

                    <textarea
                        id="post-description"
                        value={description}
                        onChange={(event) => {
                            setDescription(event.target.value);
                            setError("");
                        }}
                        placeholder="What's on your mind?"
                        maxLength={200}
                        rows={4}
                        className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <div className="mt-1 text-right text-xs text-slate-500">
                        {description.length}/200
                    </div>
                </div>

                {/* Hashtags */}
                <div>
                    <label
                        htmlFor="post-hashtags"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Hashtags
                    </label>

                    <input
                        id="post-hashtags"
                        type="text"
                        value={hashtags}
                        onChange={(event) => {
                            setHashtags(event.target.value);
                            setError("");
                        }}
                        placeholder="travel, nature, photography"
                        className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <p className="mt-1 text-xs text-slate-500">
                        Separate hashtags with commas.
                    </p>
                </div>

                {/* Optional album assignment: only this user's albums are listed. */}
                <div>
                    <label htmlFor="post-album" className="mb-2 block text-sm font-semibold text-slate-700">
                        Save to an album (optional)
                    </label>
                    <select id="post-album" value={albumId} onChange={(event) => setAlbumId(event.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white p-3">
                        <option value="">Keep as an individual post</option>
                        {albums.map((album) => <option key={album.id} value={album.id}>{album.name}</option>)}
                    </select>
                    {albums.length === 0 && <p className="mt-1 text-xs text-slate-500">You have no albums yet. You can create one from My Albums.</p>}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                    {loading ? "Creating Post..." : "Create Post"}
                </button>
            </form>
        </section>
    );
}