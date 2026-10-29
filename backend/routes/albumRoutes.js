const express = require("express");
const { getDatabase } = require("../db");
const { verify } = require("../authTokens");

const router = express.Router();

async function authenticatedUser(req) {
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    const payload = verify(token);
    if (!payload?.id) return null;
    return getDatabase().collection("users").findOne({ id: Number(payload.id) });
}

function forbidden(res) {
    return res.status(403).json({ success: false, message: "You can only manage albums and posts that belong to your account." });
}

// Return albums for the signed-in user. The optional userId is checked against the token.
router.get("/", async (req, res) => {
    try {
        const db = getDatabase();
        const user = await authenticatedUser(req);
        if (!user) return res.status(401).json({ success: false, message: "Please sign in to view albums." });
        if (req.query.userId && Number(req.query.userId) !== Number(user.id) && user.role !== "admin") return forbidden(res);
        const ownerId = req.query.userId && user.role === "admin" ? Number(req.query.userId) : Number(user.id);
        const albums = await db.collection("albums").find({ userId: ownerId }).sort({ createdAt: -1 }).toArray();
        res.json(albums);
    } catch (error) {
        console.error("Error getting albums:", error);
        res.status(500).json({ success: false, message: "Failed to retrieve albums." });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const db = getDatabase();
        const user = await authenticatedUser(req);
        if (!user) return res.status(401).json({ success: false, message: "Please sign in to view albums." });
        const album = await db.collection("albums").findOne({ id: Number(req.params.id) });
        if (!album) return res.status(404).json({ success: false, message: "Album not found." });
        if (Number(album.userId) !== Number(user.id) && user.role !== "admin") return forbidden(res);
        res.json(album);
    } catch (error) {
        console.error("Error getting album:", error);
        res.status(500).json({ success: false, message: "Failed to retrieve album." });
    }
});

router.post("/", async (req, res) => {
    try {
        const db = getDatabase();
        const user = await authenticatedUser(req);
        if (!user) return res.status(401).json({ success: false, message: "Please sign in to create an album." });
        const { name, description } = req.body;
        if (!name || !String(name).trim()) return res.status(400).json({ success: false, message: "Album name is required." });
        const lastAlbum = await db.collection("albums").find().sort({ id: -1 }).limit(1).toArray();
        const newId = lastAlbum.length ? Number(lastAlbum[0].id) + 1 : 1;
        const newAlbum = { id: newId, userId: Number(user.id), name: String(name).trim(), description: String(description || "").trim(), postIds: [], createdAt: new Date() };
        await db.collection("albums").insertOne(newAlbum);
        res.status(201).json({ success: true, message: "Album created successfully.", album: newAlbum });
    } catch (error) {
        console.error("Error creating album:", error);
        res.status(500).json({ success: false, message: "Failed to create album." });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const db = getDatabase();
        const user = await authenticatedUser(req);
        if (!user) return res.status(401).json({ success: false, message: "Please sign in to update an album." });
        const albumId = Number(req.params.id);
        const album = await db.collection("albums").findOne({ id: albumId });
        if (!album) return res.status(404).json({ success: false, message: "Album not found." });
        if (Number(album.userId) !== Number(user.id) && user.role !== "admin") return forbidden(res);
        const updateFields = {};
        if (req.body.name !== undefined) {
            if (!String(req.body.name).trim()) return res.status(400).json({ success: false, message: "Album name cannot be empty." });
            updateFields.name = String(req.body.name).trim();
        }
        if (req.body.description !== undefined) updateFields.description = String(req.body.description).trim();
        if (!Object.keys(updateFields).length) return res.status(400).json({ success: false, message: "No fields provided for update." });
        await db.collection("albums").updateOne({ id: albumId }, { $set: updateFields });
        res.json({ success: true, message: "Album updated successfully.", album: await db.collection("albums").findOne({ id: albumId }) });
    } catch (error) {
        console.error("Error updating album:", error);
        res.status(500).json({ success: false, message: "Failed to update album." });
    }
});

router.post("/:id/posts/:postId", async (req, res) => {
    try {
        const db = getDatabase();
        const user = await authenticatedUser(req);
        if (!user) return res.status(401).json({ success: false, message: "Please sign in to add a photo to an album." });
        const albumId = Number(req.params.id), postId = Number(req.params.postId);
        const album = await db.collection("albums").findOne({ id: albumId });
        if (!album) return res.status(404).json({ success: false, message: "Album not found." });
        if (Number(album.userId) !== Number(user.id) && user.role !== "admin") return forbidden(res);
        const post = await db.collection("posts").findOne({ id: postId });
        if (!post) return res.status(404).json({ success: false, message: "Post not found." });
        if (Number(post.userId) !== Number(user.id) && user.role !== "admin") return res.status(403).json({ success: false, message: "You can only add your own posts to your albums." });
        if ((album.postIds || []).map(Number).includes(postId)) return res.status(400).json({ success: false, message: "Post is already in this album." });
        await db.collection("albums").updateOne({ id: albumId }, { $addToSet: { postIds: postId } });
        res.json({ success: true, message: "Post added to album.", album: await db.collection("albums").findOne({ id: albumId }) });
    } catch (error) {
        console.error("Error adding post to album:", error);
        res.status(500).json({ success: false, message: "Failed to add post to album." });
    }
});

router.delete("/:id/posts/:postId", async (req, res) => {
    try {
        const db = getDatabase();
        const user = await authenticatedUser(req);
        if (!user) return res.status(401).json({ success: false, message: "Please sign in to edit an album." });
        const albumId = Number(req.params.id), postId = Number(req.params.postId);
        const album = await db.collection("albums").findOne({ id: albumId });
        if (!album) return res.status(404).json({ success: false, message: "Album not found." });
        if (Number(album.userId) !== Number(user.id) && user.role !== "admin") return forbidden(res);
        await db.collection("albums").updateOne({ id: albumId }, { $pull: { postIds: postId } });
        res.json({ success: true, message: "Photo removed from album. The post remains on the feed.", album: await db.collection("albums").findOne({ id: albumId }) });
    } catch (error) {
        console.error("Error removing post from album:", error);
        res.status(500).json({ success: false, message: "Failed to remove post from album." });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const db = getDatabase();
        const user = await authenticatedUser(req);
        if (!user) return res.status(401).json({ success: false, message: "Please sign in to delete an album." });
        const albumId = Number(req.params.id);
        const album = await db.collection("albums").findOne({ id: albumId });
        if (!album) return res.status(404).json({ success: false, message: "Album not found." });
        if (Number(album.userId) !== Number(user.id) && user.role !== "admin") return forbidden(res);
        await db.collection("albums").deleteOne({ id: albumId });
        res.json({ success: true, message: "Album deleted successfully." });
    } catch (error) {
        console.error("Error deleting album:", error);
        res.status(500).json({ success: false, message: "Failed to delete album." });
    }
});

module.exports = router;
