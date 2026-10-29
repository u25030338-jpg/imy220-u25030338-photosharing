import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../api";
import Header from "../../components/Header/Header";

function ProfilePage({ user, onLogout }) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [friendActionBusy, setFriendActionBusy] = useState(false);
    const [localFriends, setLocalFriends] = useState((user?.friends || []).map(Number));
    const [requestPending, setRequestPending] = useState(false);

    const [loading, setLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        profilePicture: "",
        isPublic: true
    });

    const profileId = Number(id);
    const isOwnProfile = Number(user?.id) === profileId;

    useEffect(() => {
        loadProfile();
    }, [id]);

    async function loadProfile() {
        try {
            setLoading(true);
            setPostsLoading(true);
            setError("");
            setMessage("");

            const [profileResponse, postsResponse, usersResponse] =
                await Promise.all([
                    api.getUser(profileId),
                    api.getPosts(),
                    api.getUsers()
                ]);

            const loadedProfile = profileResponse.user || profileResponse;

            setProfile(loadedProfile);

            setFormData({
                username: loadedProfile.username || "",
                email: loadedProfile.email || "",
                profilePicture: loadedProfile.profilePicture || "",
                isPublic: loadedProfile.isPublic !== false
            });

            const loadedPosts = postsResponse.posts || postsResponse || [];

            const profilePosts = loadedPosts.filter(
                (post) => Number(post.userId) === profileId
            );

            setPosts(profilePosts);
            setAllUsers(usersResponse.users || usersResponse || []);
            if (Number(user?.id) !== profileId) {
                try { const status = await api.friendshipStatus(profileId); setRequestPending(status.status === "pending"); }
                catch (statusError) { console.warn("Could not load friendship status:", statusError.message); }
            }
            if (Number(user?.id) === profileId) {
                try { const incoming = await api.incomingFriendRequests(); setIncomingRequests(incoming.requests || []); }
                catch (requestError) { console.warn("Could not load friend requests:", requestError.message); }
            }
        } catch (err) {
            console.error("Failed to load profile:", err);
            setError(err.message || "Failed to load profile.");
        } finally {
            setLoading(false);
            setPostsLoading(false);
        }
    }

    function handleInputChange(event) {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    }

    async function handleSaveProfile(event) {
        event.preventDefault();

        if (!formData.username.trim() || !formData.email.trim()) {
            setError("Username and email are required.");
            return;
        }

        if (!formData.email.includes("@")) {
            setError("Please enter a valid email address.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            const response = await api.updateUser(profileId, {
                username: formData.username.trim(),
                email: formData.email.trim(),
                profilePicture: formData.profilePicture || "",
                isPublic: formData.isPublic
            });

            const updatedProfile =
                response.user || response.updatedUser || response;

            setProfile((previous) => ({
                ...previous,
                ...updatedProfile,
                username: formData.username.trim(),
                email: formData.email.trim(),
                profilePicture: formData.profilePicture || "",
                isPublic: formData.isPublic
            }));

            // Keep the logged-in user's local information updated.
            if (isOwnProfile) {
                const updatedLocalUser = {
                    ...user,
                    username: formData.username.trim(),
                    email: formData.email.trim(),
                    profilePicture: formData.profilePicture || "",
                    isPublic: formData.isPublic
                };

                localStorage.setItem(
                    "photoshareUser",
                    JSON.stringify(updatedLocalUser)
                );
            }

            setEditing(false);
            setMessage("Profile updated successfully.");
        } catch (err) {
            console.error("Failed to update profile:", err);
            setError(err.message || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    }

    async function handleFriendToggle() {
        if (!user || !profile || isOwnProfile) return;
        try {
            setFriendActionBusy(true);
            setError(""); setMessage("");
            if (isFriend) {
                await api.removeFriend(profileId);
                setProfile(previous => ({ ...previous, friends: (previous.friends || []).filter(x => Number(x) !== Number(user.id)) }));
                setLocalFriends(current => current.filter(x => Number(x) !== profileId));
                setRequestPending(false);
                const updated = { ...user, friends: (user.friends || []).filter(x => Number(x) !== profileId) };
                localStorage.setItem("photoshareUser", JSON.stringify(updated));
                setMessage(`You are no longer friends with ${profile.username}.`);
            } else {
                const result = await api.sendFriendRequest(profileId);
                if (result.status === "friends") {
                    setProfile(previous => ({ ...previous, friends: [...(previous.friends || []), Number(user.id)] }));
                    setLocalFriends(current => [...new Set([...current, profileId])]);
                    setRequestPending(false);
                    const updated = { ...user, friends: [...(user.friends || []), profileId] };
                    localStorage.setItem("photoshareUser", JSON.stringify(updated));
                }
                if (result.status === "pending") setRequestPending(true);
                setMessage(result.message || (result.status === "pending" ? "Friend request sent." : "You are now friends."));
            }
        } catch (err) { console.error("Friend update failed:", err); setError(err.message || "Failed to update friendship."); }
        finally { setFriendActionBusy(false); }
    }

    async function respondToFriendRequest(requestId, action) {
        try {
            setFriendActionBusy(true); setError("");
            await api.respondFriendRequest(requestId, action);
            setIncomingRequests(current => current.filter(request => request._id !== requestId));
            if (action === "accept") { await loadProfile(); setMessage("Friend request accepted."); }
            else setMessage("Friend request declined.");
        } catch (err) { setError(err.message || "Could not respond to friend request."); }
        finally { setFriendActionBusy(false); }
    }

    function getUserName(userId) {
        const foundUser = allUsers.find(
            (item) => Number(item.id) === Number(userId)
        );

        return foundUser?.username || "Unknown user";
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100">
                <Header user={user} onLogout={onLogout} />

                <main className="mx-auto max-w-6xl px-4 py-10">
                    <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
                        <p className="text-slate-600">
                            Loading profile...
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    if (error && !profile) {
        return (
            <div className="min-h-screen bg-slate-100">
                <Header user={user} onLogout={onLogout} />

                <main className="mx-auto max-w-6xl px-4 py-10">
                    <button
                        onClick={() => navigate("/home")}
                        className="mb-6 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                        ← Back to Home
                    </button>

                    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                        <h2 className="mb-2 text-xl font-bold text-red-800">
                            Unable to load profile
                        </h2>

                        <p className="mb-5 text-red-700">
                            {error}
                        </p>

                        <button
                            onClick={loadProfile}
                            className="rounded-lg bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700"
                        >
                            Try Again
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const friends = Array.isArray(profile?.friends)
        ? profile.friends
        : [];

    const isFriend =
        !isOwnProfile &&
        localFriends.some((friendId) => Number(friendId) === profileId);

    return (
        <div className="min-h-screen bg-slate-100">
            <Header user={user} onLogout={onLogout} />

            <main className="mx-auto max-w-6xl px-4 py-8">

                {/* Navigation */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <button
                        onClick={() => navigate("/home")}
                        className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                        ← Back to Home
                    </button>

                    <button
                        onClick={loadProfile}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        ↻ Refresh
                    </button>
                </div>

                {/* Messages */}
                {message && (
                    <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-sm font-medium text-green-800">
                        {message}
                    </div>
                )}

                {error && profile && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-medium text-red-800">
                        {error}
                    </div>
                )}

                {/* Profile Header */}
                <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">

                    {/* Cover */}
                    <div className="h-36 bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600"></div>

                    <div className="px-6 pb-6">

                        {/* Avatar + actions */}
                        <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

                            <div className="flex items-end gap-4">
                                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-900 text-3xl font-bold text-white shadow-lg">
                                    {profile?.profilePicture ? <img src={profile.profilePicture} alt={`${profile.username} profile`} className="h-full w-full object-cover" /> : (profile?.username?.charAt(0)?.toUpperCase() || "U")}
                                </div>

                                <div className="pb-1">
                                    <h1 className="text-3xl font-bold text-slate-900">
                                        {profile?.username}
                                    </h1>

                                    <p className="text-sm text-slate-500">
                                        {profile?.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {isOwnProfile ? (
                                    <button
                                        onClick={() => {
                                            setEditing(!editing);
                                            setError("");
                                            setMessage("");
                                        }}
                                        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                    >
                                        {editing
                                            ? "Cancel Edit"
                                            : "Edit Profile"}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleFriendToggle}
                                        disabled={friendActionBusy}
                                        className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                                            isFriend
                                                ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                                                : "bg-blue-600 text-white hover:bg-blue-700"
                                        }`}
                                    >
                                        {isFriend ? "✓ Friends · Remove" : (requestPending ? "Request sent" : (profile?.isPublic === false ? "+ Request to follow" : "+ Add Friend"))}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Statistics */}
                        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">

                            <div className="rounded-xl bg-slate-50 p-4 text-center">
                                <p className="text-2xl font-bold text-slate-900">
                                    {posts.length}
                                </p>
                                <p className="text-sm text-slate-500">
                                    Posts
                                </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-4 text-center">
                                <p className="text-2xl font-bold text-slate-900">
                                    {friends.length}
                                </p>
                                <p className="text-sm text-slate-500">
                                    Friends
                                </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-4 text-center">
                                <p className="text-2xl font-bold text-slate-900">
                                    {profile?.createdAt
                                        ? new Date(
                                              profile.createdAt
                                          ).toLocaleDateString()
                                        : "—"}
                                </p>
                                <p className="text-sm text-slate-500">
                                    Joined
                                </p>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Edit Profile */}
                {editing && isOwnProfile && (
                    <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

                        <div className="mb-5">
                            <h2 className="text-xl font-bold text-slate-900">
                                Edit Profile
                            </h2>

                            <p className="text-sm text-slate-500">
                                Update your account information below.
                            </p>
                        </div>

                        <form
                            onSubmit={handleSaveProfile}
                            className="grid gap-5 md:grid-cols-2"
                        >
                            <div>
                                <label
                                    htmlFor="username"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Username
                                </label>

                                <input
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    placeholder="Enter username"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Email
                                </label>

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    placeholder="Enter email"
                                />
                            </div>

                            <div className="md:col-span-2 rounded-xl border border-slate-200 p-4">
                                <label className="flex items-center justify-between gap-4">
                                    <span><strong className="block text-sm text-slate-800">Public profile</strong><span className="text-xs text-slate-500">Public profiles connect immediately; private profiles require approval.</span></span>
                                    <input type="checkbox" checked={formData.isPublic} onChange={e => setFormData(prev => ({...prev,isPublic:e.target.checked}))} className="h-5 w-5 accent-pink-600" />
                                </label>
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="edit-profile-picture" className="mb-2 block text-sm font-semibold text-slate-700">Profile picture (optional)</label>
                                <input id="edit-profile-picture" type="file" accept="image/*" onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    if (!file) return;
                                    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) { setError("Choose an image under 5 MB."); event.target.value = ""; return; }
                                    const reader = new FileReader();
                                    reader.onload = () => setFormData((previous) => ({ ...previous, profilePicture: String(reader.result || "") }));
                                    reader.onerror = () => setError("Could not read the selected image.");
                                    reader.readAsDataURL(file);
                                }} className="w-full rounded-lg border border-slate-300 p-3" />
                                {formData.profilePicture && <div className="mt-3 flex items-center gap-3"><img src={formData.profilePicture} alt="Profile preview" className="h-20 w-20 rounded-full object-cover" /><button type="button" onClick={() => setFormData((previous) => ({ ...previous, profilePicture: "" }))} className="rounded-lg bg-slate-200 px-3 py-2 text-sm">Remove picture</button></div>}
                                <p className="mt-1 text-xs text-slate-500">Images up to 5 MB. Leave empty to use your initials.</p>
                            </div>

                            <div className="md:col-span-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </section>
                )}

                {isOwnProfile && incomingRequests.length > 0 && (
                    <section className="mt-6 rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-slate-900">Friend requests <span className="rounded-full bg-pink-100 px-2 py-1 text-sm text-pink-700">{incomingRequests.length}</span></h2>
                        <div className="space-y-3">{incomingRequests.map(request => <div key={request._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"><Link to={`/profile/${request.fromId}`} className="font-semibold text-slate-800">@{request.from?.username || `User ${request.fromId}`}</Link><div className="flex gap-2"><button disabled={friendActionBusy} onClick={() => respondToFriendRequest(request._id, "accept")} className="rounded-full bg-pink-600 px-4 py-2 text-sm font-semibold text-white">Accept</button><button disabled={friendActionBusy} onClick={() => respondToFriendRequest(request._id, "decline")} className="rounded-full border border-slate-300 px-4 py-2 text-sm">Decline</button></div></div>)}</div>
                    </section>
                )}

                {/* Friends */}
                <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                Friends
                            </h2>

                            <p className="text-sm text-slate-500">
                                {friends.length === 0
                                    ? "No friends yet."
                                    : `${friends.length} friend${
                                          friends.length === 1
                                              ? ""
                                              : "s"
                                      }`}
                            </p>
                        </div>
                    </div>

                    {friends.length === 0 ? (
                        <div className="rounded-xl bg-slate-50 p-6 text-center">
                            <p className="text-slate-500">
                                This user hasn't added any friends yet.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {friends.map((friendId) => {
                                const friend = allUsers.find(
                                    (item) =>
                                        Number(item.id) ===
                                        Number(friendId)
                                );

                                if (!friend) return null;

                                return (
                                    <Link
                                        key={friendId}
                                        to={`/profile/${friend.id}`}
                                        className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 font-bold text-white">
                                            {friend.username
                                                ?.charAt(0)
                                                ?.toUpperCase()}
                                        </div>

                                        <div>
                                            <p className="font-semibold text-slate-900">
                                                {friend.username}
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                View profile →
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Posts */}
                <section className="mt-6">

                    <div className="mb-5 flex items-end justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">
                                Posts
                            </h2>

                            <p className="text-sm text-slate-500">
                                Photos shared by {profile?.username}
                            </p>
                        </div>
                    </div>

                    {postsLoading ? (
                        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                            <p className="text-slate-500">
                                Loading posts...
                            </p>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">
                                📷
                            </div>

                            <h3 className="mb-2 text-lg font-bold text-slate-900">
                                No posts yet
                            </h3>

                            <p className="mb-5 text-sm text-slate-500">
                                {isOwnProfile
                                    ? "Share your first photo with the PhotoShare community."
                                    : `${profile?.username} hasn't shared any posts yet.`}
                            </p>

                            {isOwnProfile && (
                                <button
                                    onClick={() => navigate("/home")}
                                    className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
                                >
                                    Go to Home
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                            {posts.map((post) => (
                                <Link
                                    key={post.id}
                                    to={`/post/${post.id}`}
                                    className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <div className="aspect-square overflow-hidden bg-slate-200">
                                        {post.image ? (
                                            <img
                                                src={post.image}
                                                alt={
                                                    post.description ||
                                                    "Photo post"
                                                }
                                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-slate-400">
                                                No image
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4">
                                        <p className="line-clamp-2 text-sm text-slate-700">
                                            {post.description ||
                                                "No description"}
                                        </p>

                                        {Array.isArray(
                                            post.hashtags
                                        ) &&
                                            post.hashtags.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {post.hashtags.map(
                                                        (tag) => (
                                                            <span
                                                                key={tag}
                                                                className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                                                            >
                                                                #
                                                                {tag}
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            )}

                                        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                                            <span>
                                                {post.createdAt
                                                    ? new Date(
                                                          post.createdAt
                                                      ).toLocaleDateString()
                                                    : ""}
                                            </span>

                                            <span className="font-semibold text-blue-600">
                                                View post →
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}

                        </div>
                    )}
                </section>

                {/* Bottom navigation */}
                <div className="mt-10 flex justify-center">
                    <button
                        onClick={() => navigate("/home")}
                        className="rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
                    >
                        ← Return to Home
                    </button>
                </div>

            </main>
        </div>
    );
}

export default ProfilePage;