import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import CreatePost from "../../components/CreatePost/CreatePost";

export default function Home({ user, onLogout }) {
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState(null);
    const [searchError, setSearchError] = useState("");
    const [revealedReportedPosts, setRevealedReportedPosts] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);
            setMessage("");

            const [postResult, userResult] = await Promise.all([
                api.getPosts(),
                api.getUsers()
            ]);

            setPosts(postResult.posts || postResult);
            setUsers(userResult.users || userResult);
        } catch (error) {
            console.error("Failed to load Home:", error);
            setMessage(error.message || "Failed to load posts.");
        } finally {
            setLoading(false);
        }
    }

    function getUsername(userId) {
        const found = users.find(
            (item) => Number(item.id) === Number(userId)
        );

        return found ? found.username : "Unknown user";
    }

    function handlePostCreated(createdPost) {
        setPosts((current) => [createdPost, ...current]);
        setShowCreate(false);
        setMessage("Your post has been published successfully.");
    }

    return (
        <div className="home-shell">

            {/* Header */}
            <header className="home-header">
                <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

                    <Link
                        to="/home"
                        className="text-2xl font-bold tracking-tight"
                    >
                        PhotoShare
                    </Link>

                    <div className="flex items-center gap-2 sm:gap-4">

                        {user.role === "admin" && <Link to="/admin" className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-950">Admin</Link>}
                        <Link to="/albums" className="rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-slate-800">Albums</Link>
                        <Link
                            to={`/profile/${user.id}`}
                            className="rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-slate-800"
                        >
                            Profile
                        </Link>

                        <button
                            onClick={onLogout}
                            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold transition hover:bg-red-600"
                        >
                            Logout
                        </button>

                    </div>
                </nav>
            </header>

            <main className="home-main mx-auto max-w-6xl px-4 py-8 sm:px-6">
                <aside className="site-sidebar" aria-label="Main navigation">
                    <Link to="/home" className="sidebar-link"><span>⌂</span> Home</Link>
                    <a href="#search" className="sidebar-link"><span>⌕</span> Search</a>
                    <Link to="/albums" className="sidebar-link"><span>▦</span> Albums</Link>
                    <Link to={`/profile/${user.id}`} className="sidebar-link"><span>◉</span> Profile</Link>
                    {user.role === "admin" && <Link to="/admin" className="sidebar-link"><span>⚙</span> Admin</Link>}
                    <button onClick={() => setShowCreate(true)} className="sidebar-link"><span>＋</span> Create post</button>
                </aside>

                {/* Welcome section */}
                <section className="mb-8 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 p-8 text-white shadow-sm">

                    <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-100">
                        PhotoShare Community
                    </p>

                    <h1 className="text-3xl font-bold sm:text-4xl">
                        Welcome, {user.username}
                    </h1>

                    <p className="mt-2 max-w-2xl text-blue-100">
                        Discover photos, connect with friends and share
                        your moments with the PhotoShare community.
                    </p>

                </section>

                <section id="search" className="mb-6 rounded-xl bg-white p-4 shadow-sm">
                    <form className="flex flex-wrap gap-2" onSubmit={async (e)=>{e.preventDefault(); if(!searchTerm.trim()){setSearchResults(null);return;} try{setSearchError("");setSearchResults(await api.search(searchTerm.trim()));}catch(err){setSearchError(err.message);}}}>
                        <input aria-label="Search users, posts and albums" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3" placeholder="Search users, posts, albums or hashtags..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
                        <button className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white">Search</button>
                        {searchResults&&<button type="button" onClick={()=>{setSearchResults(null);setSearchTerm("")}} className="rounded-lg bg-slate-200 px-4">Clear</button>}
                    </form>
                    {searchError&&<p className="mt-2 text-red-600">{searchError}</p>}
                    {searchResults&&<div className="mt-4 grid gap-4 md:grid-cols-3"><div><h3 className="font-bold">Users</h3>{searchResults.users.map(u=><p key={u.id}><Link className="text-blue-700 underline" to={`/profile/${u.id}`}>{u.username}</Link></p>)}</div><div><h3 className="font-bold">Posts</h3>{searchResults.posts.map(p=><p key={p.id}><Link className="text-blue-700 underline" to={`/post/${p.id}`}>{p.description||`Post #${p.id}`}</Link></p>)}</div><div><h3 className="font-bold">Albums</h3>{searchResults.albums.map(a=><p key={a.id}><Link className="text-blue-700 underline" to={`/albums?album=${a.id}`}>{a.name}</Link></p>)}</div></div>}
                </section>

                {/* Create Post button */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">

                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            Activity Feed
                        </h2>

                        <p className="text-sm text-slate-500">
                            Latest posts from the community
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setShowCreate(!showCreate);
                            setMessage("");
                        }}
                        className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                        {showCreate
                            ? "Cancel"
                            : "+ Create Post"}
                    </button>

                </div>

                {/* Create Post */}
                {showCreate && (
                    <div className="mb-8">
                        <CreatePost
                            user={user}
                            onPostCreated={handlePostCreated}
                        />
                    </div>
                )}

                {/* Success/error message */}
                {message && (
                    <div
                        className={`mb-6 rounded-xl border px-5 py-3 text-sm font-medium ${
                            message.toLowerCase().includes("success")
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-red-200 bg-red-50 text-red-700"
                        }`}
                    >
                        {message}
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>

                        <p className="text-slate-500">
                            Loading posts...
                        </p>
                    </div>

                ) : posts.length === 0 ? (

                    /* Empty state */
                    <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-slate-200">

                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-2xl">
                            📷
                        </div>

                        <h2 className="text-xl font-bold text-slate-900">
                            No posts yet
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-slate-500">
                            Be the first person to share something
                            with the PhotoShare community.
                        </p>

                        <button
                            onClick={() => setShowCreate(true)}
                            className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
                        >
                            Create Your First Post
                        </button>

                    </div>

                ) : (

                    /* Posts */
                    <section className="feed-posts">

                        {posts.map((post) => (
                            post.hiddenByReports && !revealedReportedPosts.includes(Number(post.id)) ? (
                                <article key={post.id} className="rounded-2xl border border-amber-300 bg-amber-50 p-6 shadow-sm">
                                    <div className="text-2xl" aria-hidden="true">⚠️</div>
                                    <h2 className="mt-2 font-bold text-slate-900">This post has been reported</h2>
                                    <p className="mt-1 text-sm text-slate-600">This post has received more than two reports. You can choose to view it.</p>
                                    <button type="button" onClick={() => setRevealedReportedPosts(current => [...current, Number(post.id)])} className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">View post anyway</button>
                                </article>
                            ) : <article
                                key={post.id}
                                className="feed-post group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition"
                            >

                                {/* Image */}
                                <Link to={`/post/${post.id}`}>
                                    <div className="feed-post-image overflow-hidden bg-slate-200">

                                        <img
                                            src={post.image}
                                            alt={
                                                post.description ||
                                                "Photo post"
                                            }
                                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                        />

                                    </div>
                                </Link>

                                {/* Content */}
                                <div className="feed-post-content p-5">

                                    <Link
                                        to={`/profile/${post.userId}`}
                                        className="post-author mb-3 inline-block text-sm font-bold text-blue-600 hover:text-blue-800"
                                    >
                                        @{getUsername(post.userId)}
                                    </Link>

                                    <p className="line-clamp-3 text-sm leading-6 text-slate-700">
                                        {post.description ||
                                            "No description provided."}
                                    </p>

                                    {/* Hashtags */}
                                    {Array.isArray(post.hashtags) &&
                                        post.hashtags.length > 0 && (
                                            <div className="mt-4 flex flex-wrap gap-2">

                                                {post.hashtags.map(
                                                    (tag) => (
                                                        <span
                                                            key={tag}
                                                            className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                                                        >
                                                            #{tag}
                                                        </span>
                                                    )
                                                )}

                                            </div>
                                        )}

                                    {/* Footer */}
                                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                                        <span className="text-xs text-slate-400">
                                            {post.createdAt
                                                ? new Date(
                                                      post.createdAt
                                                  ).toLocaleDateString()
                                                : ""}
                                        </span>

                                        <Link
                                            to={`/post/${post.id}`}
                                            className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                                        >
                                            View Post →
                                        </Link>

                                    </div>

                                </div>
                            </article>
                        ))}

                    </section>
                )}

            </main>
        </div>
    );
}