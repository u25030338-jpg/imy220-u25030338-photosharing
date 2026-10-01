const express = require("express");
const { getDatabase } = require("../db");

const router = express.Router();


// =========================
// GET COMMENTS FOR A POST
// =========================

router.get("/post/:postId", async (req, res) => {
    try {
        const db = getDatabase();

        const postId = Number(req.params.postId);

        const comments = await db.collection("comments")
            .find({ postId: postId })
            .sort({ createdAt: 1 })
            .toArray();

        res.json(comments);
    } catch (error) {
        console.error("Error getting comments:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve comments."
        });
    }
});


// =========================
// CREATE COMMENT
// =========================

router.post("/", async (req, res) => {
    try {
        const db = getDatabase();

        const {
            postId,
            userId,
            text
        } = req.body;

        if (!postId || !userId || !text) {
            return res.status(400).json({
                success: false,
                message: "Post ID, user ID and comment text are required."
            });
        }

        const post = await db.collection("posts").findOne({
            id: Number(postId)
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found."
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

        const lastComment = await db.collection("comments")
            .find()
            .sort({ id: -1 })
            .limit(1)
            .toArray();

        const newId = lastComment.length > 0
            ? lastComment[0].id + 1
            : 1;

        const newComment = {
            id: newId,
            postId: Number(postId),
            userId: Number(userId),
            text,
            createdAt: new Date()
        };

        await db.collection("comments").insertOne(newComment);

        res.status(201).json({
            success: true,
            message: "Comment created successfully.",
            comment: newComment
        });
    } catch (error) {
        console.error("Error creating comment:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create comment."
        });
    }
});


// =========================
// DELETE COMMENT
// =========================

router.delete("/:id", async (req, res) => {
    try {
        const db = getDatabase();

        const commentId = Number(req.params.id);

        const result = await db.collection("comments").deleteOne({
            id: commentId
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Comment not found."
            });
        }

        res.json({
            success: true,
            message: "Comment deleted successfully."
        });
    } catch (error) {
        console.error("Error deleting comment:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete comment."
        });
    }
});


module.exports = router;