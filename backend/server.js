const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const { connectToDatabase } = require("./db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const albumRoutes = require("./routes/albumRoutes");
const commentRoutes = require("./routes/commentRoutes");
const reportRoutes = require("./routes/reportRoutes");
const adminRoutes = require("./routes/adminRoutes");
const searchRoutes = require("./routes/searchRoutes");

const app = express();

const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/search", searchRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "PhotoShare backend is running."
    });
});

connectToDatabase()
    .then(async () => {
        console.log("MongoDB connection successful.");
        await seedAdminAccounts();

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Backend server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Server could not start.");
        console.error(error);

        process.exit(1);
    });
async function seedAdminAccounts() {
  const raw = process.env.ADMIN_ACCOUNTS_JSON;
  if (!raw) { console.warn("ADMIN_ACCOUNTS_JSON not set; no administrator accounts were seeded."); return; }
  let accounts; try { accounts = JSON.parse(raw); } catch { throw new Error("ADMIN_ACCOUNTS_JSON must be valid JSON."); }
  if (!Array.isArray(accounts)) throw new Error("ADMIN_ACCOUNTS_JSON must be an array.");
  const db = require("./db").getDatabase();
  for (const account of accounts) {
    const username=String(account.username||"").trim(), email=String(account.email||"").trim().toLowerCase(), password=String(account.password||"");
    if (!username || !email || password.length < 12) throw new Error("Each admin needs username, email, and a password of at least 12 characters.");
    const existing=await db.collection("users").findOne({$or:[{email},{username}]});
    const passwordHash=await bcrypt.hash(password,12);
    if (existing) await db.collection("users").updateOne({id:existing.id},{$set:{username,email,password:passwordHash,role:"admin"}});
    else { const last=await db.collection("users").find().sort({id:-1}).limit(1).toArray(); const id=last.length?Number(last[0].id)+1:1; await db.collection("users").insertOne({id,username,email,password:passwordHash,role:"admin",friends:[],createdAt:new Date()}); }
    console.log(`Administrator account provisioned: ${email}`);
  }
}
