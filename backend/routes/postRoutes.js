const express = require("express");
const { getDatabase } = require("../db");
const { verify } = require("../authTokens");
const router = express.Router();

async function currentUser(req) {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const payload = verify(token);
  if (!payload?.id) return null;
  return getDatabase().collection("users").findOne({ id: Number(payload.id) });
}
function deny(res) { return res.status(403).json({ success: false, message: "You can only edit or delete your own posts." }); }

// Public feed; posts with more than two reports are flagged so the UI can offer a reveal option.
router.get("/", async (_req, res) => {
  try {
    const db = getDatabase();
    const [posts, reports] = await Promise.all([
      db.collection("posts").find().sort({ createdAt: -1 }).toArray(),
      db.collection("reports").aggregate([{ $match: { status: { $ne: "Dismissed" } } }, { $group: { _id: "$postId", count: { $sum: 1 } } }]).toArray()
    ]);
    const counts = new Map(reports.map(r => [Number(r._id), r.count]));
    res.json(posts.map(p => ({ ...p, reportCount: counts.get(Number(p.id)) || 0, hiddenByReports: (counts.get(Number(p.id)) || 0) > 2 })));
  } catch (error) { console.error("Error getting posts:", error); res.status(500).json({ success: false, message: "Failed to retrieve posts." }); }
});

router.get("/:id", async (req, res) => {
  try {
    const post = await getDatabase().collection("posts").findOne({ id: Number(req.params.id) });
    if (!post) return res.status(404).json({ success: false, message: "Post not found." });
    res.json(post);
  } catch (error) { console.error("Error getting post:", error); res.status(500).json({ success: false, message: "Failed to retrieve post." }); }
});

router.post("/", async (req, res) => {
  try {
    const db = getDatabase(), user = await currentUser(req);
    if (!user) return res.status(401).json({ success: false, message: "Please sign in first." });
    const { userId, image, description, hashtags } = req.body;
    if (!image) return res.status(400).json({ success: false, message: "An image is required." });
    if (userId != null && Number(userId) !== Number(user.id)) return deny(res);
    const last = await db.collection("posts").find().sort({ id: -1 }).limit(1).toArray();
    const newPost = { id: last.length ? Number(last[0].id) + 1 : 1, userId: Number(user.id), image, description: String(description || ""), hashtags: Array.isArray(hashtags) ? hashtags : [], comments: [], createdAt: new Date() };
    await db.collection("posts").insertOne(newPost);
    res.status(201).json({ success: true, message: "Post created successfully.", post: newPost });
  } catch (error) { console.error("Error creating post:", error); res.status(500).json({ success: false, message: "Failed to create post." }); }
});

router.put("/:id", async (req, res) => {
  try {
    const db = getDatabase(), user = await currentUser(req);
    if (!user) return res.status(401).json({ success: false, message: "Please sign in first." });
    const postId = Number(req.params.id), post = await db.collection("posts").findOne({ id: postId });
    if (!post) return res.status(404).json({ success: false, message: "Post not found." });
    if (Number(post.userId) !== Number(user.id) && user.role !== "admin") return deny(res);
    const updateFields = {};
    if (req.body.description !== undefined) updateFields.description = String(req.body.description);
    if (req.body.hashtags !== undefined) updateFields.hashtags = Array.isArray(req.body.hashtags) ? req.body.hashtags : [];
    if (!Object.keys(updateFields).length) return res.status(400).json({ success: false, message: "Provide a description or hashtags to update." });
    await db.collection("posts").updateOne({ id: postId }, { $set: updateFields });
    res.json({ success: true, message: "Post updated successfully.", post: await db.collection("posts").findOne({ id: postId }) });
  } catch (error) { console.error("Error updating post:", error); res.status(500).json({ success: false, message: "Failed to update post." }); }
});

router.delete("/:id", async (req, res) => {
  try {
    const db = getDatabase(), user = await currentUser(req);
    if (!user) return res.status(401).json({ success: false, message: "Please sign in first." });
    const postId = Number(req.params.id), post = await db.collection("posts").findOne({ id: postId });
    if (!post) return res.status(404).json({ success: false, message: "Post not found." });
    if (Number(post.userId) !== Number(user.id) && user.role !== "admin") return deny(res);
    await Promise.all([
      db.collection("posts").deleteOne({ id: postId }),
      db.collection("comments").deleteMany({ postId }),
      db.collection("reports").deleteMany({ postId }),
      db.collection("albums").updateMany({ postIds: postId }, { $pull: { postIds: postId } })
    ]);
    res.json({ success: true, message: "Post and its comments were deleted successfully." });
  } catch (error) { console.error("Error deleting post:", error); res.status(500).json({ success: false, message: "Failed to delete post." }); }
});
module.exports = router;
