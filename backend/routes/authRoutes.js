const express = require("express");
const bcrypt = require("bcryptjs");
const { getDatabase } = require("../db");

const router = express.Router();


// =========================
// SIGN UP
// =========================

router.post("/signup", async (req, res) => {
    try {
        const db = getDatabase();

        const {
            username,
            email,
            password
        } = req.body;

        // Basic validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Username, email and password are required."
            });
        }

        // Check if email already exists
        const existingUser = await db.collection("users").findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        // Check if username already exists
        const existingUsername = await db.collection("users").findOne({
            username: username
        });

        if (existingUsername) {
            return res.status(409).json({
                success: false,
                message: "That username is already taken."
            });
        }

        // Generate next user ID
        const lastUser = await db.collection("users")
            .find()
            .sort({ id: -1 })
            .limit(1)
            .toArray();

        const newId = lastUser.length > 0
            ? lastUser[0].id + 1
            : 1;

       const hashedPassword = await bcrypt.hash(password, 10);

const newUser = {
    id: newId,
    username,
    email: email.toLowerCase(),
    password: hashedPassword,
    friends: [],
    createdAt: new Date()
};

        await db.collection("users").insertOne(newUser);

        // Never send password back to frontend
        res.status(201).json({
            success: true,
            message: "Account created successfully.",
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                friends: newUser.friends
            }
        });

    } catch (error) {
        console.error("Signup error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create account."
        });
    }
});


// =========================
// SIGN IN
// =========================

router.post("/signin", async (req, res) => {
    try {
        const db = getDatabase();

        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const user = await db.collection("users").findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

       const passwordMatches = await bcrypt.compare(
    password,
    user.password
);

if (!passwordMatches) {
    return res.status(401).json({
        success: false,
        message: "Invalid email or password."
    });
}

        // Never send password back
        res.json({
            success: true,
            message: "Sign in successful.",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                friends: user.friends
            }
        });

    } catch (error) {
        console.error("Signin error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to sign in."
        });
    }
});


// =========================
// LOGOUT
// =========================

router.post("/logout", (req, res) => {
    res.json({
        success: true,
        message: "Logout successful."
    });
});


module.exports = router;