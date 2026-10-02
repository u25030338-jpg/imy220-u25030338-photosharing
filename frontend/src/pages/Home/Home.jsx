import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";

export default function Home({ user, onLogout }) {
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [showCreate, setShowCreate] = useState(false);

const [newPost, setNewPost] = useState({
    image: "",
    description: "",
    hashtags: ""
});

    useEffect(() => {
        async function loadData() {
            try {
                const [postResult, userResult] = await Promise.all([
                    api.getPosts(),
                    api.getUsers()
                ]);

                setPosts(postResult.posts || postResult);
                setUsers(userResult.users || userResult);
            } catch (error) {
                setMessage(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    function getUsername(userId) {
        const found = users.find((item) => item.id === userId);
        return found ? found.username : "Unknown user";
    }

    async function createPost(e) {
    e.preventDefault();

    try {
        const result = await api.createPost({
            userId: user.id,
            image: newPost.image,
            description: newPost.description,
            hashtags: newPost.hashtags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
        });

        const created = result.post || result;

        setPosts((current) => [...current, created]);

        setNewPost({
            image: "",
            description: "",
            hashtags: ""
        });

        setShowCreate(false);
    } catch (error) {
        setMessage(error.message);
    }
}

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="sticky top-0 z-10 bg-slate-950 text-white shadow">
                <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <Link to="/home" className="text-2xl font-bold">
                        PhotoShare
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link
                            to={`/profile/${user.id}`}
                            className="rounded-lg px-3 py-2 hover:bg-slate-800"
                        >
                            Profile
                        </Link>

                        <button
                            onClick={onLogout}
                            className="rounded-lg bg-red-500 px-4 py-2 font-semibold hover:bg-red-600"
                        >
                            Logout
                        </button>
                    </div>
                </nav>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-8">
                <section className="mb-8">
                    <h1 className="text-3xl font-bold">
                        Welcome, {user.username}
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Explore the latest photos from PhotoShare.
                    </p>
                </section>

                <button
    onClick={() => setShowCreate(!showCreate)}
    className="mb-6 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white"
>
    {showCreate ? "Cancel" : "+ Create Post"}
</button>

{showCreate && (
    <form
        onSubmit={createPost}
        className="mb-8 rounded-xl bg-white p-6 shadow"
    >
        <h2 className="mb-4 text-xl font-bold">
            Create a Post
        </h2>

        <div className="space-y-4">
            <input
                type="url"
                required
                placeholder="Image URL"
                value={newPost.image}
                onChange={(e) =>
                    setNewPost({
                        ...newPost,
                        image: e.target.value
                    })
                }
                className="w-full rounded-lg border p-3"
            />

            <textarea
                required
                placeholder="Description"
                value={newPost.description}
                onChange={(e) =>
                    setNewPost({
                        ...newPost,
                        description: e.target.value
                    })
                }
                className="w-full rounded-lg border p-3"
                rows="3"
            />

            <input
                placeholder="Hashtags separated by commas"
                value={newPost.hashtags}
                onChange={(e) =>
                    setNewPost({
                        ...newPost,
                        hashtags: e.target.value
                    })
                }
                className="w-full rounded-lg border p-3"
            />

            <button className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white">
                Publish Post
            </button>
        </div>
    </form>
)}

                {message && (
                    <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
                        {message}
                    </div>
                )}

                {loading ? (
                    <p className="text-slate-500">
                        Loading posts...
                    </p>
                ) : posts.length === 0 ? (
                    <div className="rounded-xl bg-white p-8 text-center shadow">
                        <h2 className="text-xl font-semibold">
                            No posts yet
                        </h2>

                        <p className="mt-2 text-slate-500">
                            Create the first post.
                        </p>
                    </div>
                ) : (
                    <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post) => (
                            <article
                                key={post.id}
                                className="overflow-hidden rounded-xl bg-white shadow"
                            >
                                <img
                                    src={post.image}
                                    alt={post.description}
                                    className="h-64 w-full object-cover"
                                />

                                <div className="p-5">
                                    <p className="mb-2 text-sm font-semibold text-blue-600">
                                        @{getUsername(post.userId)}
                                    </p>

                                    <h2 className="font-semibold text-slate-900">
                                        {post.description}
                                    </h2>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {(post.hashtags || []).map(
                                            (tag) => (
                                                <span
                                                    key={tag}
                                                    className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700"
                                                >
                                                    #{tag}
                                                </span>
                                            )
                                        )}
                                    </div>

                                    <Link
                                        to={`/post/${post.id}`}
                                        className="mt-4 inline-block font-semibold text-blue-600 hover:text-blue-800"
                                    >
                                        View post →
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </main>
        </div>
    );
}