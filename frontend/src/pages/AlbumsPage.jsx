import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function AlbumsPage({ user, onLogout }) {
    const [albums, setAlbums] = useState([]);
    const [posts, setPosts] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [editing, setEditing] = useState(null);
    const [selectedAlbumId, setSelectedAlbumId] = useState("");
    const [photoDescription, setPhotoDescription] = useState("");
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState("");
    const [uploading, setUploading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    async function load() {
        try {
            setError("");
            const [albumResult, postResult] = await Promise.all([api.getMyAlbums(user.id), api.getPosts()]);
            const ownAlbums = (albumResult.albums || albumResult || []).filter((a) => Number(a.userId) === Number(user.id));
            setAlbums(ownAlbums);
            setPosts(postResult.posts || postResult || []);
            const requested = searchParams.get("album");
            if (requested && ownAlbums.some((a) => String(a.id) === requested)) setSelectedAlbumId(requested);
            else if (selectedAlbumId && !ownAlbums.some((a) => String(a.id) === selectedAlbumId)) setSelectedAlbumId("");
        } catch (e) { setError(e.message || "Could not load your albums."); }
    }

    useEffect(() => { load(); }, [user.id]);

    const selectedAlbum = useMemo(() => albums.find((a) => String(a.id) === String(selectedAlbumId)) || null, [albums, selectedAlbumId]);
    const albumPosts = useMemo(() => {
        if (!selectedAlbum) return [];
        const ids = new Set((selectedAlbum.postIds || []).map(Number));
        return posts.filter((post) => ids.has(Number(post.id)) && Number(post.userId) === Number(user.id));
    }, [selectedAlbum, posts, user.id]);

    async function submitAlbum(event) {
        event.preventDefault(); setError(""); setMessage("");
        try {
            if (editing !== null) await api.updateAlbum(editing, { name: name.trim(), description: description.trim() });
            else await api.createAlbum({ userId: user.id, name: name.trim(), description: description.trim() });
            setName(""); setDescription(""); setEditing(null); setMessage(editing !== null ? "Album updated." : "Album created."); await load();
        } catch (e) { setError(e.message || "Could not save album."); }
    }

    function choosePhoto(event) {
        const file = event.target.files?.[0]; setError(""); setMessage("");
        if (!file) { setPhotoFile(null); setPhotoPreview(""); return; }
        if (!file.type.startsWith("image/")) { setError("Please choose an image file."); event.target.value = ""; return; }
        if (file.size > MAX_IMAGE_SIZE) { setError("Image must be 5 MB or smaller."); event.target.value = ""; return; }
        setPhotoFile(file);
        const reader = new FileReader(); reader.onload = () => setPhotoPreview(String(reader.result || "")); reader.onerror = () => setError("Could not read this image."); reader.readAsDataURL(file);
    }

    async function uploadToAlbum(event) {
        event.preventDefault();
        if (!selectedAlbum || !photoFile) { setError("Choose an album and an image first."); return; }
        setUploading(true); setError(""); setMessage("");
        try {
            const image = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(photoFile); });
            const result = await api.createPost({ userId: user.id, image, description: photoDescription.trim() || `Photo added to ${selectedAlbum.name}`, hashtags: [] });
            const post = result.post || result;
            await api.addPostToAlbum(selectedAlbum.id, post.id);
            setPhotoFile(null); setPhotoPreview(""); setPhotoDescription("");
            const input = document.getElementById("album-photo-file"); if (input) input.value = "";
            setMessage("Photo added to your album."); await load();
        } catch (e) { setError(e.message || "Could not add the photo to the album."); }
        finally { setUploading(false); }
    }

    async function removePhoto(postId) {
        if (!selectedAlbum || !confirm("Remove this photo from the album? The post itself will remain on your feed.")) return;
        try { await api.removePostFromAlbum(selectedAlbum.id, postId); setMessage("Photo removed from album; the post remains on your feed."); await load(); }
        catch (e) { setError(e.message || "Could not remove photo."); }
    }

    async function deleteAlbum(album) {
        if (!confirm(`Delete album “${album.name}”? The posts themselves will not be deleted.`)) return;
        try { await api.deleteAlbum(album.id); if (String(selectedAlbumId) === String(album.id)) { setSelectedAlbumId(""); setSearchParams({}); } setMessage("Album deleted."); await load(); }
        catch (e) { setError(e.message || "Could not delete album."); }
    }

    return <div className="min-h-screen bg-slate-100">
        <header className="bg-slate-950 text-white p-4 flex justify-between items-center"><Link to="/home" className="text-2xl font-bold">PhotoShare</Link><div className="flex gap-3 items-center"><span className="hidden sm:inline">My albums</span><button onClick={onLogout} className="bg-red-600 rounded px-4 py-2">Logout</button></div></header>
        <main className="max-w-6xl mx-auto p-5">
            <div className="mb-5"><Link to="/home" className="inline-flex items-center rounded-lg bg-slate-800 px-4 py-2 font-semibold text-white hover:bg-slate-700">← Back to Home</Link></div>
            <h1 className="text-3xl font-bold mb-2">My Albums</h1><p className="text-slate-600 mb-5">Organise your own photos into collections. Only albums belonging to your account are shown here.</p>
            {message && <p role="status" className="mb-3 rounded bg-green-50 text-green-800 p-3">{message}</p>}{error && <p role="alert" className="mb-3 rounded bg-red-50 text-red-700 p-3">{error}</p>}
            <form onSubmit={submitAlbum} className="bg-white rounded-xl p-5 shadow mb-6 grid gap-3"><h2 className="text-xl font-bold">{editing !== null ? "Edit album" : "Create an album"}</h2><input required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} placeholder="Album name" className="border rounded p-3"/><textarea maxLength={300} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="border rounded p-3"/><div className="flex gap-2"><button className="bg-blue-600 text-white rounded px-5 py-2">{editing !== null ? "Save changes" : "Create album"}</button>{editing !== null && <button type="button" onClick={() => { setEditing(null); setName(""); setDescription(""); }} className="bg-slate-200 rounded px-4">Cancel</button>}</div></form>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">{albums.map((album) => { const count = (album.postIds || []).length; return <article key={album.id} className={`bg-white rounded-xl p-5 shadow border-2 ${String(selectedAlbumId) === String(album.id) ? "border-blue-500" : "border-transparent"}`}><h3 className="text-xl font-bold">{album.name}</h3><p className="text-slate-600 my-2">{album.description || "No description"}</p><p className="text-sm text-slate-500">{count} photo/post{count === 1 ? "" : "s"}</p><div className="flex flex-wrap gap-2 mt-4"><button onClick={() => { setSelectedAlbumId(String(album.id)); setSearchParams({ album: String(album.id) }); }} className="bg-blue-600 text-white rounded px-3 py-2">Open album</button><button onClick={() => { setEditing(album.id); setName(album.name); setDescription(album.description || ""); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="bg-slate-200 rounded px-3 py-2">Edit</button><button onClick={() => deleteAlbum(album)} className="bg-red-600 text-white rounded px-3 py-2">Delete</button></div></article>; })}</div>
            {albums.length === 0 && <p className="text-slate-600 mb-8">You have not created any albums yet. Create one above, then add pictures directly or save posts into it.</p>}
            {selectedAlbum && <section className="bg-white rounded-2xl shadow p-5"><div className="flex flex-wrap justify-between gap-3 items-start mb-5"><div><h2 className="text-2xl font-bold">{selectedAlbum.name}</h2><p className="text-slate-600">{selectedAlbum.description || "Your photo collection"}</p></div><button onClick={() => { setSelectedAlbumId(""); setSearchParams({}); }} className="rounded bg-slate-200 px-4 py-2">Close album</button></div>
                <form onSubmit={uploadToAlbum} className="rounded-xl border border-blue-100 bg-blue-50 p-4 mb-6 grid gap-3"><h3 className="font-bold text-lg">Add a picture directly to this album</h3><input id="album-photo-file" type="file" accept="image/*" required onChange={choosePhoto} className="block w-full rounded-lg border bg-white p-3"/><p className="text-xs text-slate-600">Images up to 5 MB. The picture is also created as your post and added to this album.</p>{photoPreview && <img src={photoPreview} alt="Selected album preview" className="max-h-72 rounded-lg object-contain bg-white"/>}<input value={photoDescription} onChange={(e) => setPhotoDescription(e.target.value)} maxLength={200} placeholder="Photo caption (optional)" className="rounded-lg border p-3"/><button disabled={uploading || !photoFile} className="rounded-lg bg-blue-600 text-white px-5 py-3 font-semibold disabled:opacity-50">{uploading ? "Adding photo…" : "Add photo to album"}</button></form>
                <h3 className="text-lg font-bold mb-3">Photos in this album</h3>{albumPosts.length === 0 ? <p className="text-slate-500">This album is empty. Add a picture above or create a post and select this album.</p> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{albumPosts.map((post) => <article key={post.id} className="overflow-hidden rounded-xl border bg-slate-50"><img src={post.image} alt={post.description || "Album photo"} className="w-full max-h-80 object-cover"/><div className="p-3"><p className="mb-3 break-words">{post.description}</p><div className="flex gap-2"><Link to={`/post/${post.id}`} className="rounded bg-blue-600 text-white px-3 py-2 text-sm">View post</Link><button onClick={() => removePhoto(post.id)} className="rounded bg-red-100 text-red-700 px-3 py-2 text-sm">Remove from album</button></div></div></article>)}</div>}
            </section>}
        </main>
    </div>;
}
