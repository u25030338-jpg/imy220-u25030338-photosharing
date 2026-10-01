const express = require("express");
const { getDatabase } = require("../db");

const router = express.Router();


// =========================
// GET ALL ALBUMS
// =========================

router.get("/", async (req, res) => {
    try {
        const db = getDatabase();

        const albums = await db.collection("albums")
            .find()
            .sort({ createdAt: -1 })
            .toArray();

        res.json(albums);
    } catch (error) {
        console.error("Error getting albums:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve albums."
        });
    }
});


// =========================
// GET ALBUM BY ID
// =========================

router.get("/:id", async (req, res) => {
    try {
        const db = getDatabase();

        const albumId = Number(req.params.id);

        const album = await db.collection("albums").findOne({
            id: albumId
        });

        if (!album) {
            return res.status(404).json({
                success: false,
                message: "Album not found."
            });
        }

        res.json(album);
    } catch (error) {
        console.error("Error getting album:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve album."
        });
    }
});


// =========================
// CREATE ALBUM
// =========================

router.post("/", async (req, res) => {
    try {
        const db = getDatabase();

        const {
            userId,
            name,
            description
        } = req.body;

        if (!userId || !name) {
            return res.status(400).json({
                success: false,
                message: "User ID and album name are required."
            });
        }

        const user = await db.collection("users").findOne({
            id: Number(userId)
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const lastAlbum = await db.collection("albums")
            .find()
            .sort({ id: -1 })
            .limit(1)
            .toArray();

        const newId = lastAlbum.length > 0
            ? lastAlbum[0].id + 1
            : 1;

        const newAlbum = {
            id: newId,
            userId: Number(userId),
            name,
            description: description || "",
            postIds: [],
            createdAt: new Date()
        };

        await db.collection("albums").insertOne(newAlbum);

        res.status(201).json({
            success: true,
            message: "Album created successfully.",
            album: newAlbum
        });
    } catch (error) {
        console.error("Error creating album:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create album."
        });
    }
});


// =========================
// UPDATE ALBUM
// =========================

router.put("/:id", async (req, res) => {
    try {
        const db = getDatabase();

        const albumId = Number(req.params.id);

        const {
            name,
            description
        } = req.body;

        const updateFields = {};

        if (name !== undefined) {
            updateFields.name = name;
        }

        if (description !== undefined) {
            updateFields.description = description;
        }

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields provided for update."
            });
        }

        const result = await db.collection("albums").updateOne(
            { id: albumId },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Album not found."
            });
        }

        const updatedAlbum = await db.collection("albums").findOne({
            id: albumId
        });

        res.json({
            success: true,
            message: "Album updated successfully.",
            album: updatedAlbum
        });
    } catch (error) {
        console.error("Error updating album:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update album."
        });
    }
});


// =========================
// ADD POST TO ALBUM
// =========================

router.post("/:id/posts/:postId", async (req, res) => {
    try {
        const db = getDatabase();

        const albumId = Number(req.params.id);
        const postId = Number(req.params.postId);

        const album = await db.collection("albums").findOne({
            id: albumId
        });

        if (!album) {
            return res.status(404).json({
                success: false,
                message: "Album not found."
            });
        }

        const post = await db.collection("posts").findOne({
            id: postId
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found."
            });
        }

        if (album.postIds.includes(postId)) {
            return res.status(400).json({
                success: false,
                message: "Post is already in this album."
            });
        }

        await db.collection("albums").updateOne(
            { id: albumId },
            { $push: { postIds: postId } }
        );

        const updatedAlbum = await db.collection("albums").findOne({
            id: albumId
        });

        res.json({
            success: true,
            message: "Post added to album.",
            album: updatedAlbum
        });
    } catch (error) {
        console.error("Error adding post to album:", error);

        res.status(500).json({
            success: false,
            message: "Failed to add post to album."
        });
    }
});


// =========================
// REMOVE POST FROM ALBUM
// =========================

router.delete("/:id/posts/:postId", async (req, res) => {
    try {
        const db = getDatabase();

        const albumId = Number(req.params.id);
        const postId = Number(req.params.postId);

        const result = await db.collection("albums").updateOne(
            { id: albumId },
            { $pull: { postIds: postId } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Album not found."
            });
        }

        const updatedAlbum = await db.collection("albums").findOne({
            id: albumId
        });

        res.json({
            success: true,
            message: "Post removed from album.",
            album: updatedAlbum
        });
    } catch (error) {
        console.error("Error removing post from album:", error);

        res.status(500).json({
            success: false,
            message: "Failed to remove post from album."
        });
    }
});


// =========================
// DELETE ALBUM
// =========================

router.delete("/:id", async (req, res) => {
    try {
        const db = getDatabase();

        const albumId = Number(req.params.id);

        const result = await db.collection("albums").deleteOne({
            id: albumId
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Album not found."
            });
        }

        res.json({
            success: true,
            message: "Album deleted successfully."
        });
    } catch (error) {
        console.error("Error deleting album:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete album."
        });
    }
});


module.exports = router;