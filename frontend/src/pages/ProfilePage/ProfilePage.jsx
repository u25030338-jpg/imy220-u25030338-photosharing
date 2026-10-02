import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../api";

export default function ProfilePage({ user, onLogout }) {
    const { id } = useParams();

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function loadProfile() {
            try {
                const [userResult, postResult] = await Promise.all([
                    api.getUser(id),
                    api.getPosts()
                ]);

                const loadedUser = userResult.user || userResult;

                setProfile(loadedUser);
                setForm({
                    username: loadedUser.username,
                    email: loadedUser.email
                });

                const allPosts = postResult.posts || postResult;

                setPosts(
                    allPosts.filter(
                        (post) => post.userId === Number(id)
                    )
                );
            } catch (error) {
                setMessage(error.message);
            }
        }

        loadProfile();
    }, [id]);

    async function saveProfile(e) {
        e.preventDefault();

        try {
            const result = await api.updateUser(id, form);
            const updated = result.user || result;

            setProfile(updated);
            setEditing(false);
            setMessage("Profile updated successfully.");
        } catch (error) {
            setMessage(error.message);
        }
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-slate-100 p-8">
                Loading profile...
            </div>
        );
    }

    const ownProfile = Number(id) === Number(user.id);

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="bg-slate-950 text-white">
                <nav className="mx-auto flex max-w-6xl justify-between px-6 py-4">
                    <Link to="/home" className="text-2xl font-bold">
                        PhotoShare
                    </Link>

                    <button
                        onClick={onLogout}
                        className="rounded-lg bg-red-500 px-4 py-2"
                    >
                        Logout
                    </button>
                </nav>
            </header>

            <main className="mx-auto max-w-5xl px-6 py-8">
                <section className="rounded-2xl bg-white p-8 shadow">
                    <div className="flex flex-col justify-between gap-6 md:flex-row">
                        <div>
                            <p className="text-4xl font-bold">
                                {profile.username}
                            </p>

                            <p className="mt-2 text-slate-500">
                                {profile.email}
                            </p>

                            <p className="mt-4">
                                <strong>
                                    {profile.friends?.length || 0}
                                </strong>{" "}
                                friends
                            </p>
                        </div>

                        {ownProfile && (
                            <button
                                onClick={() =>
                                    setEditing(!editing)
                                }
                                className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white"
                            >
                                {editing
                                    ? "Cancel"
                                    : "Edit Profile"}
                            </button>
                        )}
                    </div>

                    {message && (
                        <p className="mt-4 rounded-lg bg-slate-100 p-3">
                            {message}
                        </p>
                    )}

                    {editing && (
                        <form
                            onSubmit={saveProfile}
                            className="mt-6 space-y-4 border-t pt-6"
                        >
                            <input
                                value={form.username || ""}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        username: e.target.value
                                    })
                                }
                                className="w-full rounded-lg border p-3"
                                placeholder="Username"
                                required
                            />

                            <input
                                type="email"
                                value={form.email || ""}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        email: e.target.value
                                    })
                                }
                                className="w-full rounded-lg border p-3"
                                placeholder="Email"
                                required
                            />

                            <button className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white">
                                Save Changes
                            </button>
                        </form>
                    )}
                </section>

                <section className="mt-8">
                    <h2 className="mb-4 text-2xl font-bold">
                        Posts
                    </h2>

                    <div className="grid gap-6 md:grid-cols-2">
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

                                <div className="p-4">
                                    <p className="font-semibold">
                                        {post.description}
                                    </p>

                                    <Link
                                        to={`/post/${post.id}`}
                                        className="mt-3 inline-block text-blue-600"
                                    >
                                        View Post →
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}