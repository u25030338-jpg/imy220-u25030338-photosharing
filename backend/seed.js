const { MongoClient } = require("mongodb");
require("dotenv").config();

const client = new MongoClient(process.env.MONGODB_URI || "");
const SEED_TAG = "photoshare-final-demo-v1";

const userTemplates = [
  { username: "Manasse", email: "test@test.com", password: "test1234", bio: "Sharing everyday moments, places and people.", profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377?auto=format&fit=crop&w=400&q=80" },
  { username: "Alex Morgan", email: "alex@example.com", password: "Photo123", bio: "Street photography and city walks." },
  { username: "Jordan Lee", email: "jordan@example.com", password: "Photo123", bio: "Finding the little details in nature." },
  { username: "Mia Chen", email: "mia@example.com", password: "Photo123", bio: "Travel, food and weekend adventures." },
  { username: "Noah Williams", email: "noah@example.com", password: "Photo123", bio: "Landscape and outdoor photography." },
  { username: "Ava Patel", email: "ava@example.com", password: "Photo123", bio: "Colour, architecture and design." },
  { username: "Ethan Dlamini", email: "ethan@example.com", password: "Photo123", bio: "Pretoria through my lens." }
];

const photoUrls = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"
];
const postTemplates = [
  [0, "A quiet morning outdoors reminded me to slow down and notice the details.", ["nature", "morning", "photography"]],
  [1, "An evening walk through the city as the lights came on.", ["city", "streetphotography", "evening"]],
  [2, "A mountain view worth waking up early for.", ["mountains", "travel", "landscape"]],
  [3, "A weekend escape with fresh air and open skies.", ["weekend", "outdoors", "travel"]],
  [4, "Layers of green, mist and sunlight on the trail.", ["forest", "hiking", "nature"]],
  [5, "The ocean always has a different mood every day.", ["ocean", "coast", "blue"]],
  [6, "Architecture can turn an ordinary walk into an adventure.", ["architecture", "design", "city"]],
  [7, "Golden light across the landscape at sunrise.", ["sunrise", "goldenhour", "landscape"]],
  [8, "A little reminder to get outside and explore somewhere new.", ["explore", "adventure", "photography"]],
  [9, "The scale of the mountains never gets old.", ["mountains", "outdoors", "travel"]]
];

async function upsertBySeedKey(collection, key, doc) {
  const existing = await collection.findOne({ seedKey: key });
  if (existing) {
    await collection.updateOne({ _id: existing._id }, { $set: { ...doc, seedKey: key, seededBy: SEED_TAG } });
    return { ...existing, ...doc, seedKey: key, seededBy: SEED_TAG };
  }
  const inserted = { ...doc, seedKey: key, seededBy: SEED_TAG };
  await collection.insertOne(inserted);
  return inserted;
}

async function seedDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing. Set it in your .env file before seeding.");
  }
  try {
    await client.connect();
    const db = client.db("PhotoShareDB");
    const usersCol = db.collection("users");
    const postsCol = db.collection("posts");
    const albumsCol = db.collection("albums");
    const commentsCol = db.collection("comments");

    // Use the app's bcrypt-based login for newly created accounts. The required
    // test account is stored as plaintext per the course spec; signin supports both.
    const users = [];
    for (let i = 0; i < userTemplates.length; i++) {
      const template = userTemplates[i];
      const existing = await usersCol.findOne({ email: template.email.toLowerCase() });
      const next = await usersCol.find().sort({ id: -1 }).limit(1).toArray();
      const id = existing?.id ?? ((next[0]?.id || 0) + 1);
      const user = {
        id,
        username: template.username,
        email: template.email.toLowerCase(),
        password: template.password,
        friends: [],
        bio: template.bio,
        profileImage: template.profileImage || "",
        role: template.role || "user",
        isAdmin: Boolean(template.isAdmin),
        createdAt: existing?.createdAt || new Date(Date.now() - (userTemplates.length - i) * 86400000),
        seedKey: `user-${template.email}`,
        seededBy: SEED_TAG
      };
      if (existing) await usersCol.updateOne({ _id: existing._id }, { $set: user });
      else await usersCol.insertOne(user);
      users.push(user);
    }
    const byEmail = Object.fromEntries(users.map(u => [u.email, u]));

    // Ensure the required test user has two friends, and friendship is reciprocal.
    const testUser = byEmail["test@test.com"];
    const friendIds = [byEmail["alex@example.com"].id, byEmail["jordan@example.com"].id];
    await usersCol.updateOne({ email: "test@test.com" }, { $set: { friends: friendIds } });
    for (const email of ["alex@example.com", "jordan@example.com"]) {
      const user = byEmail[email];
      const friends = Array.isArray(user.friends) ? user.friends.filter(id => id !== testUser.id) : [];
      friends.push(testUser.id);
      await usersCol.updateOne({ email }, { $set: { friends: [...new Set(friends)] } });
    }

    const postOwners = [testUser, byEmail["alex@example.com"], byEmail["jordan@example.com"], byEmail["mia@example.com"], byEmail["noah@example.com"], byEmail["ava@example.com"], byEmail["ethan@example.com"]];
    const posts = [];
    for (let i = 0; i < postTemplates.length; i++) {
      const [photoIndex, description, hashtags] = postTemplates[i];
      const owner = i === 0 ? testUser : postOwners[i % postOwners.length];
      const key = `post-${i + 1}`;
      const existing = await postsCol.findOne({ seedKey: key });
      const max = await postsCol.find().sort({ id: -1 }).limit(1).toArray();
      const id = existing?.id ?? ((max[0]?.id || 0) + 1);
      const post = {
        id, userId: owner.id, image: photoUrls[photoIndex], description, hashtags,
        comments: [], createdAt: new Date(Date.now() - (postTemplates.length - i) * 3600000),
        seedKey: key, seededBy: SEED_TAG
      };
      if (existing) await postsCol.updateOne({ _id: existing._id }, { $set: post });
      else await postsCol.insertOne(post);
      posts.push(post);
    }

    const albumTemplates = [
      { name: "Everyday Nature", description: "Green spaces, trails and small moments outside.", postIndexes: [0, 2, 4] },
      { name: "City Details", description: "Architecture, streets and city light.", postIndexes: [1, 6] },
      { name: "Weekend Escapes", description: "Places to breathe and explore.", postIndexes: [2, 3, 8, 9] },
      { name: "Blue Horizons", description: "Water, coastlines and open skies.", postIndexes: [5, 7] },
      { name: "Travel Journal", description: "A growing collection of places worth remembering.", postIndexes: [0, 3, 6, 9] }
    ];
    for (let i = 0; i < albumTemplates.length; i++) {
      const t = albumTemplates[i];
      const key = `album-${i + 1}`;
      const existing = await albumsCol.findOne({ seedKey: key });
      const max = await albumsCol.find().sort({ id: -1 }).limit(1).toArray();
      const id = existing?.id ?? ((max[0]?.id || 0) + 1);
      const owner = i === 0 ? testUser : postOwners[(i + 1) % postOwners.length];
      const album = {
        id, userId: owner.id, name: t.name, description: t.description,
        postIds: t.postIndexes.map(index => posts[index].id),
        hashtags: [...new Set(t.postIndexes.flatMap(index => postTemplates[index][2]))],
        createdAt: new Date(Date.now() - (albumTemplates.length - i) * 86400000),
        seedKey: key, seededBy: SEED_TAG
      };
      if (existing) await albumsCol.updateOne({ _id: existing._id }, { $set: album });
      else await albumsCol.insertOne(album);
    }

    // Add a few sample comments for the feed and post-detail screens.
    const commentTemplates = [
      { key: "comment-1", post: posts[0], user: byEmail["alex@example.com"], text: "Love the calm atmosphere in this photo." },
      { key: "comment-2", post: posts[1], user: byEmail["jordan@example.com"], text: "The light in the city looks amazing." },
      { key: "comment-3", post: posts[2], user: byEmail["mia@example.com"], text: "Adding this place to my travel list!" },
      { key: "comment-4", post: posts[0], user: byEmail["jordan@example.com"], text: "Such a good reminder to slow down." },
      { key: "comment-5", post: posts[5], user: byEmail["noah@example.com"], text: "That colour is incredible." }
    ];
    for (const c of commentTemplates) {
      const existing = await commentsCol.findOne({ seedKey: c.key });
      const max = await commentsCol.find().sort({ id: -1 }).limit(1).toArray();
      const comment = {
        id: existing?.id ?? ((max[0]?.id || 0) + 1), postId: c.post.id,
        userId: c.user.id, text: c.text,
        createdAt: new Date(Date.now() - 60000), seedKey: c.key, seededBy: SEED_TAG
      };
      if (existing) await commentsCol.updateOne({ _id: existing._id }, { $set: comment });
      else await commentsCol.insertOne(comment);
    }

    console.log("Demo data is ready. Existing non-demo records were not deleted.");
    console.log("Seeded demo users: 8 | posts: 10 | albums: 5 | comments: 5");
    console.log("Required test account: test@test.com / test1234");
    console.log("Demo admin account: admin@photoshare.test / Admin123 (admin UI/routes still need verification)");
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

seedDatabase();
