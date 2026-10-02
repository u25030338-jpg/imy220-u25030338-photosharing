const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const client = new MongoClient(process.env.MONGODB_URI);

async function seedDatabase() {
    try {
        await client.connect();

        const db = client.db("PhotoShareDB");

        console.log("Connected to MongoDB Atlas.");

        // Clear existing collections
        await db.collection("users").deleteMany({});
        await db.collection("posts").deleteMany({});
        await db.collection("albums").deleteMany({});
        await db.collection("comments").deleteMany({});
        await db.collection("reports").deleteMany({});

        console.log("Existing data cleared.");

        // =========================
        // USERS
        // =========================

        const users = [
            {
                id: 1,
                username: "Alex",
                email: "alex@example.com",
                password: "Password123",
                friends: [2],
                createdAt: new Date()
            },
            {
                id: 2,
                username: "Jordan",
                email: "jordan@example.com",
                password: "Password123",
                friends: [1],
                createdAt: new Date()
            }
        ];

        await db.collection("users").insertMany(users);

        // =========================
        // POSTS
        // =========================

        const posts = [
            {
                id: 1,
                userId: 1,
                image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
                description: "Beautiful day outdoors!",
                hashtags: ["nature", "photography", "outdoors"],
                comments: [],
                createdAt: new Date()
            },
            {
                id: 2,
                userId: 2,
                image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390",
                description: "Exploring the city.",
                hashtags: ["city", "travel", "photography"],
                comments: [],
                createdAt: new Date()
            }
        ];

        await db.collection("posts").insertMany(posts);

        // =========================
        // ALBUM
        // =========================

        const albums = [
            {
                id: 1,
                userId: 1,
                name: "My Favourite Photos",
                description: "A collection of my favourite photos.",
                postIds: [1, 2],
                createdAt: new Date()
            }
        ];

        await db.collection("albums").insertMany(albums);

        // =========================
        // COMMENTS
        // =========================

        const comments = [
            {
                id: 1,
                postId: 1,
                userId: 2,
                text: "Great photo!",
                createdAt: new Date()
            }
        ];

        await db.collection("comments").insertMany(comments);

        // =========================
        // REPORTS
        // =========================

        const reports = [];

        if (reports.length > 0) {
            await db.collection("reports").insertMany(reports);
        }

        console.log("Database seeded successfully.");

        console.log("Created:");
        console.log("- 2 users");
        console.log("- 2 posts");
        console.log("- 1 album");
        console.log("- 1 friendship");
        console.log("- 1 comment");

    } catch (error) {
        console.error("Database seeding failed:", error);
    } finally {
        await client.close();
        console.log("MongoDB connection closed.");
    }
}

seedDatabase();