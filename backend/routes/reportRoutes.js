const express = require("express");
const { getDatabase } = require("../db");
const { verify, requireAdmin } = require("../authTokens");
const router = express.Router();
const REASONS = ["Spam", "Harassment or bullying", "Inappropriate or explicit content", "Hate speech", "Violence or dangerous content", "Copyright violation", "Other"];
async function currentUser(req) {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const payload = verify(token);
  if (!payload?.id) return null;
  return getDatabase().collection("users").findOne({ id: Number(payload.id) });
}
// Reporting is available only to signed-in users. Admins view all reports via /api/admin/reports.
router.post("/", async (req, res) => {
  try {
    const db = getDatabase(), user = await currentUser(req);
    if (!user) return res.status(401).json({ success: false, message: "Please sign in first." });
    const postId = Number(req.body.postId), reason = String(req.body.reason || "").trim();
    if (!postId || !reason) return res.status(400).json({ success: false, message: "Post and reason are required." });
    const post = await db.collection("posts").findOne({ id: postId });
    if (!post) return res.status(404).json({ success: false, message: "Post not found." });
    if (Number(post.userId) === Number(user.id)) return res.status(400).json({ success: false, message: "You cannot report your own post." });
    if (reason.length > 500) return res.status(400).json({ success: false, message: "Reason must be 500 characters or fewer." });
    const existing = await db.collection("reports").findOne({ postId, userId: Number(user.id), status: { $ne: "Dismissed" } });
    if (existing) return res.status(409).json({ success: false, message: "You have already reported this post." });
    const last = await db.collection("reports").find().sort({ id: -1 }).limit(1).toArray();
    const report = { id: last.length ? Number(last[0].id) + 1 : 1, postId, userId: Number(user.id), reason, status: "Pending", createdAt: new Date() };
    await db.collection("reports").insertOne(report);
    res.status(201).json({ success: true, message: "Report submitted successfully.", report });
  } catch (error) { console.error("Error creating report:", error); res.status(500).json({ success: false, message: "Failed to create report." }); }
});
// Retained for legacy clients, but only administrators may review/change report records.
router.get("/", requireAdmin, async (_req, res) => {
  try { res.json(await getDatabase().collection("reports").find().sort({ createdAt: -1 }).toArray()); }
  catch (error) { res.status(500).json({ success: false, message: "Failed to retrieve reports." }); }
});
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const status = String(req.body.status || "");
    if (!["Pending", "Reviewed", "Dismissed", "Actioned"].includes(status)) return res.status(400).json({ success: false, message: "Invalid report status." });
    const db = getDatabase(), id = Number(req.params.id);
    const result = await db.collection("reports").updateOne({ id }, { $set: { status, reviewedAt: new Date() } });
    if (!result.matchedCount) return res.status(404).json({ success: false, message: "Report not found." });
    res.json({ success: true, message: "Report updated successfully." });
  } catch (error) { res.status(500).json({ success: false, message: "Failed to update report." }); }
});
module.exports = router;
