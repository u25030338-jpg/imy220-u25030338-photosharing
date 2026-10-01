const express = require("express");
const { getDatabase } = require("../db");

const router = express.Router();


// =========================
// GET ALL USERS
// =========================

router.get("/", async (req, res) => {
    try {
        const db = getDatabase();

        const users = await db.collection("users").find().toArray();

        res.json(users);
    } catch (error) {
        console.error("Error getting users:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve users."
        });
    }
});


// =========================
// GET USER BY ID
// =========================

router.get("/:id", async (req, res) => {
    try {
        const db = getDatabase();

        const userId = Number(req.params.id);

        const user = await db.collection("users").findOne({
            id: userId
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        res.json(user);
    } catch (error) {
        console.error("Error getting user:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve user."
        });
    }
});


// =========================
// CREATE USER
// =========================

router.post("/", async (req, res) => {
    try {
        const db = getDatabase();

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

        const existingUser = await db.collection("users").findOne({
            email: email
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "A user with this email already exists."
            });
        }

        const lastUser = await db.collection("users")
            .find()
            .sort({ id: -1 })
            .limit(1)
            .toArray();

        const newId = lastUser.length > 0
            ? lastUser[0].id + 1
            : 1;

        const newUser = {
            id: newId,
            username,
            email,
            password,
            friends: [],
            createdAt: new Date()
        };

        await db.collection("users").insertOne(newUser);

        res.status(201).json({
            success: true,
            message: "User created successfully.",
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                friends: newUser.friends
            }
        });
    } catch (error) {
        console.error("Error creating user:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create user."
        });
    }
});


// =========================
// UPDATE USER
// =========================

router.put("/:id", async (req, res) => {
    try {
        const db = getDatabase();

        const userId = Number(req.params.id);

        const {
            username,
            email
        } = req.body;

        const updateFields = {};

        if (username) {
            updateFields.username = username;
        }

        if (email) {
            updateFields.email = email;
        }

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields provided for update."
            });
        }

        const result = await db.collection("users").updateOne(
            { id: userId },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const updatedUser = await db.collection("users").findOne({
            id: userId
        });

        res.json({
            success: true,
            message: "User updated successfully.",
            user: updatedUser
        });
    } catch (error) {
        console.error("Error updating user:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update user."
        });
    }
});


// =========================
// DELETE USER
// =========================

router.delete("/:id", async (req, res) => {
    try {
        const db = getDatabase();

        const userId = Number(req.params.id);

        const result = await db.collection("users").deleteOne({
            id: userId
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        res.json({
            success: true,
            message: "User deleted successfully."
        });
    } catch (error) {
        console.error("Error deleting user:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete user."
        });
    }
});


module.exports = router;