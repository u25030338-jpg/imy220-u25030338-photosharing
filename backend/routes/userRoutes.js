const express = require("express");
const { getDatabase } = require("../db");
const { verify } = require("../authTokens");

function authenticated(req, res, next) {
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    const payload = verify(token);
    if (!payload?.id) return res.status(401).json({ success: false, message: "Sign in required." });
    req.authUserId = Number(payload.id);
    next();
}

const router = express.Router();


// =========================
// FRIENDSHIP WORKFLOWS
// Public profiles connect immediately; private profiles require acceptance.
// =========================
router.get("/friendships/status/:targetId", authenticated, async (req,res)=>{
    try { const db=getDatabase(); const targetId=Number(req.params.targetId); const [me,target,request]=await Promise.all([db.collection("users").findOne({id:req.authUserId}),db.collection("users").findOne({id:targetId}),db.collection("friendRequests").findOne({fromId:req.authUserId,toId:targetId,status:"pending"})]); if(!me||!target)return res.status(404).json({success:false,message:"User not found."}); const friends=(me.friends||[]).map(Number).includes(targetId); res.json({status:friends?"friends":request?"pending":"none",isPublic:target.isPublic!==false}); }
    catch(e){res.status(500).json({success:false,message:"Could not load friendship status."});}
});

router.post("/friendships/:targetId", authenticated, async (req, res) => {
    try {
        const db = getDatabase();
        const fromId = req.authUserId;
        const targetId = Number(req.params.targetId);
        if (!Number.isInteger(targetId) || targetId <= 0 || targetId === fromId) return res.status(400).json({ success:false, message:"Invalid friend target." });
        const users = db.collection("users");
        const [sender, target] = await Promise.all([users.findOne({id:fromId}), users.findOne({id:targetId})]);
        if (!sender || !target) return res.status(404).json({success:false,message:"User not found."});
        if ((sender.friends || []).map(Number).includes(targetId)) return res.json({success:true,status:"friends",message:"Already friends."});
        const requests = db.collection("friendRequests");
        const existing = await requests.findOne({fromId, toId:targetId, status:"pending"});
        if (existing) return res.json({success:true,status:"pending",message:"Friend request already pending."});
        if (target.isPublic !== false) {
            await users.updateOne({id:fromId}, {$addToSet:{friends:targetId}});
            await users.updateOne({id:targetId}, {$addToSet:{friends:fromId}});
            return res.json({success:true,status:"friends",message:"You are now friends."});
        }
        await requests.insertOne({fromId,toId:targetId,status:"pending",createdAt:new Date()});
        res.status(201).json({success:true,status:"pending",message:"Friend request sent."});
    } catch (error) { console.error("Friend request failed:",error); res.status(500).json({success:false,message:"Could not process friend request."}); }
});

router.get("/friendships/requests/incoming", authenticated, async (req,res) => {
    try { const db=getDatabase(); const requests=await db.collection("friendRequests").find({toId:req.authUserId,status:"pending"}).toArray(); const ids=requests.map(r=>r.fromId); const users=ids.length ? await db.collection("users").find({id:{$in:ids}}).project({password:0}).toArray() : []; res.json({requests:requests.map(r=>({...r,from:users.find(u=>u.id===r.fromId)||null}))}); }
    catch(e){res.status(500).json({success:false,message:"Could not load friend requests."});}
});

router.patch("/friendships/requests/:requestId", authenticated, async (req,res) => {
    try { const db=getDatabase(); const {action}=req.body; if(!["accept","decline"].includes(action)) return res.status(400).json({success:false,message:"Action must be accept or decline."}); const {ObjectId}=require("mongodb"); let request; try {request=await db.collection("friendRequests").findOne({_id:new ObjectId(req.params.requestId),toId:req.authUserId,status:"pending"});} catch {} if(!request) return res.status(404).json({success:false,message:"Pending request not found."}); if(action==="accept"){ const users=db.collection("users"); const [a,b]=await Promise.all([users.findOne({id:req.authUserId}),users.findOne({id:request.fromId})]); if(!a||!b) return res.status(404).json({success:false,message:"User not found."}); await Promise.all([users.updateOne({id:req.authUserId},{$addToSet:{friends:request.fromId}}),users.updateOne({id:request.fromId},{$addToSet:{friends:req.authUserId}})]); } await db.collection("friendRequests").updateOne({_id:request._id},{$set:{status:action==="accept"?"accepted":"declined",respondedAt:new Date()}}); res.json({success:true,status:action}); }
    catch(e){console.error("Friend request response failed:",e);res.status(500).json({success:false,message:"Could not respond to request."});}
});

router.delete("/friendships/:targetId", authenticated, async (req,res)=>{
    try {const db=getDatabase();const targetId=Number(req.params.targetId);if(!Number.isInteger(targetId)||targetId===req.authUserId)return res.status(400).json({success:false,message:"Invalid friend."});await Promise.all([db.collection("users").updateOne({id:req.authUserId},{$pull:{friends:targetId}}),db.collection("users").updateOne({id:targetId},{$pull:{friends:req.authUserId}})]);res.json({success:true,status:"removed"});}
    catch(e){res.status(500).json({success:false,message:"Could not remove friend."});}
});

// =========================
// GET ALL USERS
// =========================

router.get("/", async (req, res) => {
    try {
        const db = getDatabase();

        const users = await db
            .collection("users")
            .find()
            .project({
                password: 0
            })
            .toArray();

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

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID."
            });
        }

        const user = await db
            .collection("users")
            .findOne(
                { id: userId },
                { projection: { password: 0 } }
            );

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

        const cleanUsername = String(username).trim();
        const cleanEmail = String(email).trim().toLowerCase();

        if (!cleanUsername) {
            return res.status(400).json({
                success: false,
                message: "Username cannot be empty."
            });
        }

        if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
            return res.status(400).json({
                success: false,
                message:
                    "Username can only contain letters, numbers and underscores."
            });
        }

        if (cleanUsername.length < 3 || cleanUsername.length > 30) {
            return res.status(400).json({
                success: false,
                message: "Username must be between 3 and 30 characters."
            });
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address."
            });
        }

        if (String(password).length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters."
            });
        }

        const existingEmail = await db
            .collection("users")
            .findOne({
                email: cleanEmail
            });

        if (existingEmail) {
            return res.status(409).json({
                success: false,
                message: "A user with this email already exists."
            });
        }

        const existingUsername = await db
            .collection("users")
            .findOne({
                username: cleanUsername
            });

        if (existingUsername) {
            return res.status(409).json({
                success: false,
                message: "This username is already taken."
            });
        }

        const lastUser = await db
            .collection("users")
            .find()
            .sort({ id: -1 })
            .limit(1)
            .toArray();

        const newId =
            lastUser.length > 0
                ? lastUser[0].id + 1
                : 1;

        const newUser = {
            id: newId,
            username: cleanUsername,
            email: cleanEmail,
            password,
            friends: [],
            isPublic: true,
            createdAt: new Date()
        };

        await db
            .collection("users")
            .insertOne(newUser);

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

router.put("/:id", authenticated, async (req, res) => {
    try {
        const db = getDatabase();

        const userId = Number(req.params.id);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID."
            });
        }

        if (req.authUserId !== userId) {
            return res.status(403).json({ success: false, message: "You can only edit your own profile." });
        }

        const { username, email, profilePicture, isPublic } = req.body;

        const updateFields = {};
        if (isPublic !== undefined) updateFields.isPublic = Boolean(isPublic);

        // Optional profile image stored as a data URL. Empty string removes it.
        if (profilePicture !== undefined) {
            if (profilePicture !== "" && (typeof profilePicture !== "string" || !/^data:image\/(png|jpe?g|gif|webp);base64,/i.test(profilePicture))) {
                return res.status(400).json({ success: false, message: "Profile picture must be a valid image." });
            }
            if (typeof profilePicture === "string" && profilePicture.length > 7 * 1024 * 1024) {
                return res.status(413).json({ success: false, message: "Profile picture is too large. Choose an image under 5 MB." });
            }
            updateFields.profilePicture = profilePicture;
        }

        // -------------------------
        // Username validation
        // -------------------------

        if (username !== undefined) {
            const cleanUsername = String(username).trim();

            if (!cleanUsername) {
                return res.status(400).json({
                    success: false,
                    message: "Username cannot be empty."
                });
            }

            if (cleanUsername.length < 3 || cleanUsername.length > 30) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Username must be between 3 and 30 characters."
                });
            }

            if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Username can only contain letters, numbers and underscores."
                });
            }

            const existingUsername = await db
                .collection("users")
                .findOne({
                    username: cleanUsername,
                    id: { $ne: userId }
                });

            if (existingUsername) {
                return res.status(409).json({
                    success: false,
                    message: "This username is already taken."
                });
            }

            updateFields.username = cleanUsername;
        }

        // -------------------------
        // Email validation
        // -------------------------

        if (email !== undefined) {
            const cleanEmail = String(email)
                .trim()
                .toLowerCase();

            if (!cleanEmail) {
                return res.status(400).json({
                    success: false,
                    message: "Email cannot be empty."
                });
            }

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(cleanEmail)) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid email address."
                });
            }

            const existingEmail = await db
                .collection("users")
                .findOne({
                    email: cleanEmail,
                    id: { $ne: userId }
                });

            if (existingEmail) {
                return res.status(409).json({
                    success: false,
                    message: "This email is already in use."
                });
            }

            updateFields.email = cleanEmail;
        }

        // -------------------------
        // Nothing to update
        // -------------------------

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields provided for update."
            });
        }

        // -------------------------
        // Update user
        // -------------------------

        const result = await db
            .collection("users")
            .updateOne(
                { id: userId },
                { $set: updateFields }
            );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const updatedUser = await db
            .collection("users")
            .findOne(
                { id: userId },
                { projection: { password: 0 } }
            );

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

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID."
            });
        }

        const result = await db
            .collection("users")
            .deleteOne({
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