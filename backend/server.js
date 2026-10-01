const express = require("express");
const cors = require("cors");

const { connectToDatabase } = require("./db");

const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const albumRoutes = require("./routes/albumRoutes");
const commentRoutes = require("./routes/commentRoutes");
const reportRoutes = require("./routes/reportRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

const PORT = 5000;


// =========================
// MIDDLEWARE
// =========================

app.use(cors());
app.use(express.json());


// =========================
// API ROUTES
// =========================

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/auth", authRoutes);


// =========================
// TEST ROUTE
// =========================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "PhotoShare backend is running."
    });
});


// =========================
// START SERVER
// =========================

connectToDatabase()
    .then(() => {
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Backend server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Server could not start:", error);
    });