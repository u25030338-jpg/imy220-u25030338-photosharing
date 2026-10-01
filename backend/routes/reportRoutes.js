const express = require("express");
const { getDatabase } = require("../db");

const router = express.Router();


// =========================
// GET ALL REPORTS
// =========================

router.get("/", async (req, res) => {
    try {
        const db = getDatabase();

        const reports = await db.collection("reports")
            .find()
            .sort({ createdAt: -1 })
            .toArray();

        res.json(reports);
    } catch (error) {
        console.error("Error getting reports:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve reports."
        });
    }
});


// =========================
// CREATE REPORT
// =========================

router.post("/", async (req, res) => {
    try {
        const db = getDatabase();

        const {
            postId,
            userId,
            reason
        } = req.body;

        if (!postId || !userId || !reason) {
            return res.status(400).json({
                success: false,
                message: "Post ID, user ID and reason are required."
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

        const lastReport = await db.collection("reports")
            .find()
            .sort({ id: -1 })
            .limit(1)
            .toArray();

        const newId = lastReport.length > 0
            ? lastReport[0].id + 1
            : 1;

        const newReport = {
            id: newId,
            postId: Number(postId),
            userId: Number(userId),
            reason,
            status: "Pending",
            createdAt: new Date()
        };

        await db.collection("reports").insertOne(newReport);

        res.status(201).json({
            success: true,
            message: "Report submitted successfully.",
            report: newReport
        });
    } catch (error) {
        console.error("Error creating report:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create report."
        });
    }
});


// =========================
// UPDATE REPORT STATUS
// =========================

router.put("/:id", async (req, res) => {
    try {
        const db = getDatabase();

        const reportId = Number(req.params.id);

        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Report status is required."
            });
        }

        const result = await db.collection("reports").updateOne(
            { id: reportId },
            { $set: { status: status } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Report not found."
            });
        }

        const updatedReport = await db.collection("reports").findOne({
            id: reportId
        });

        res.json({
            success: true,
            message: "Report updated successfully.",
            report: updatedReport
        });
    } catch (error) {
        console.error("Error updating report:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update report."
        });
    }
});


module.exports = router;