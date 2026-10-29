const { MongoClient } = require("mongodb");
require("dotenv").config();

const client = new MongoClient(process.env.MONGODB_URI);

let db;

async function connectToDatabase() {
    try {
        await client.connect();

        db = client.db("PhotoShareDB");

        console.log("Connected to MongoDB Atlas.");

        return db;
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        throw error;
    }
}

function getDatabase() {
    if (!db) {
        throw new Error("Database has not been connected yet.");
    }

    return db;
}

module.exports = {
    connectToDatabase,
    getDatabase
};