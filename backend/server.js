const express = require("express");
const cors = require("cors");

const app = express();

const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());


// =========================
// SIGN IN
// =========================

app.post("/api/auth/signin", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required."
        });
    }

    res.json({
        success: true,
        message: "Sign in successful.",
        user: {
            id: 1,
            username: "Alex",
            email: email
        }
    });
});


// =========================
// SIGN UP
// =========================

app.post("/api/auth/signup", (req, res) => {
    const {
        username,
        email,
        password
    } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Username, email and password are required."
        });
    }

    res.status(201).json({
        success: true,
        message: "Account created successfully.",
        user: {
            id: 2,
            username: username,
            email: email
        }
    });
});


// =========================
// TEST ROUTE
// =========================

app.get("/", (req, res) => {
    res.json({
        message: "PhotoShare backend is running."
    });
});


// =========================
// START SERVER
// =========================

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend server running on port ${PORT}`);
});