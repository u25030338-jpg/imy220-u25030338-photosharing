const express = require("express");
const { getDatabase } = require("../db");

const router = express.Router();


// =========================
// GET ALL POSTS
// =========================

router.get("/", async (req, res) => {
    try {
        const db = getDatabase();

        const posts = await db.collection("posts")
            .find()
            .sort({ createdAt: -1 })
            .toArray();

        res.json(posts);
    } catch (error) {
        console.error("Error getting posts:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve posts."
        });
    }
});


// =========================
// GET POST BY ID
// =========================

router.get("/:id", async (req, res) => {
    try {
        const db = getDatabase();

        const postId = Number(req.params.id);

        const post = await db.collection("posts").findOne({
            id: postId
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found."
            });
        }

        res.json(post);
    } catch (error) {
        console.error("Error getting post:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve post."
        });
    }
});


// =========================
// CREATE POST
// =========================

router.post("/", async (req, res) => {
    try {
        const db = getDatabase();

        const {
            userId,
            image,
            description,
            hashtags
        } = req.body;

        if (!userId || !image) {
            return res.status(400).json({
                success: false,
                message: "User ID and image are required."
            });
        }

        const user = await db.collection("users").findOne({
            id: Number(userId)
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Creator user not found."
            });
        }

        const lastPost = await db.collection("posts")
            .find()
            .sort({ id: -1 })
            .limit(1)
            .toArray();

        const newId = lastPost.length > 0
            ? lastPost[0].id + 1
            : 1;

        const newPost = {
            id: newId,
            userId: Number(userId),
            image,
            description: description || "",
            hashtags: hashtags || [],
            comments: [],
            createdAt: new Date()
        };

        await db.collection("posts").insertOne(newPost);

        res.status(201).json({
            success: true,
            message: "Post created successfully.",
            post: newPost
        });
    } catch (error) {
        console.error("Error creating post:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create post."
        });
    }
});


// =========================
// UPDATE POST
// =========================

router.put("/:id", async (req, res) => {
    try {
        const db = getDatabase();

        const postId = Number(req.params.id);

        const {
            description,
            hashtags
        } = req.body;

        const updateFields = {};

        if (description !== undefined) {
            updateFields.description = description;
        }

        if (hashtags !== undefined) {
            updateFields.hashtags = hashtags;
        }

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields provided for update."
            });
        }

        const result = await db.collection("posts").updateOne(
            { id: postId },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Post not found."
            });
        }

        const updatedPost = await db.collection("posts").findOne({
            id: postId
        });

        res.json({
            success: true,
            message: "Post updated successfully.",
            post: updatedPost
        });
    } catch (error) {
        console.error("Error updating post:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update post."
        });
    }
});


// =========================
// DELETE POST
// =========================

router.delete("/:id", async (req, res) => {
    try {
        const db = getDatabase();

        const postId = Number(req.params.id);

        const result = await db.collection("posts").deleteOne({
            id: postId
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Post not found."
            });
        }

        res.json({
            success: true,
            message: "Post deleted successfully."
        });
    } catch (error) {
        console.error("Error deleting post:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete post."
        });
    }
});


module.exports = router;