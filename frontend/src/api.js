const API_URL = "/api";
let usersCache = null;
let usersCacheAt = 0;
let postsCache = null;
let postsCacheAt = 0;

async function request(url, options = {}) {
    const response = await fetch(`${API_URL}${url}`, {
        headers: {
            "Content-Type": "application/json",
            ...(localStorage.getItem("photoshareToken") ? { Authorization: `Bearer ${localStorage.getItem("photoshareToken")}` } : {}),
            ...(options.headers || {})
        },
        ...options
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}

export const api = {
    // AUTH
    signup: async (data) => {
        const result = await request("/auth/signup", { method: "POST", body: JSON.stringify(data) });
        usersCache = null; return result;
    },

    signin: (data) =>
        request("/auth/signin", {
            method: "POST",
            body: JSON.stringify(data)
        }),

    logout: () =>
        request("/auth/logout", {
            method: "POST"
        }),

    // USERS
    getUsers: async () => {
        if (usersCache && Date.now() - usersCacheAt < 20000) return usersCache;
        usersCache = await request("/users"); usersCacheAt = Date.now(); return usersCache;
    },

    getUser: (id) => request(`/users/${id}`),

    updateUser: (id, data) =>
        request(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    friendshipStatus: (id) => request(`/users/friendships/status/${id}`),
    sendFriendRequest: (id) => request(`/users/friendships/${id}`, { method: "POST" }),
    removeFriend: (id) => request(`/users/friendships/${id}`, { method: "DELETE" }),
    incomingFriendRequests: () => request("/users/friendships/requests/incoming"),
    respondFriendRequest: (id, action) => request(`/users/friendships/requests/${id}`, { method: "PATCH", body: JSON.stringify({ action }) }),

    // POSTS
    getPosts: async () => {
        if (postsCache && Date.now() - postsCacheAt < 2500) return postsCache;
        postsCache = await request("/posts"); postsCacheAt = Date.now(); return postsCache;
    },

    getPost: (id) => request(`/posts/${id}`),

    createPost: async (data) => {
        const result = await request("/posts", { method: "POST", body: JSON.stringify(data) });
        postsCache = null; return result;
    },

    updatePost: (id, data) =>
        request(`/posts/${id}`, {
            method: "PUT",
            body: JSON.stringify(data)
        }),

    deletePost: async (id) => { const result = await request(`/posts/${id}`, { method: "DELETE" }); postsCache = null; return result; },

    // ALBUMS
    getAlbums: () => request("/albums"),

    getMyAlbums: (userId) => request(`/albums?userId=${encodeURIComponent(userId)}`),

    getAlbum: (id) => request(`/albums/${id}`),

    createAlbum: (data) =>
        request("/albums", {
            method: "POST",
            body: JSON.stringify(data)
        }),

    updateAlbum: (id, data) =>
        request(`/albums/${id}`, {
            method: "PUT",
            body: JSON.stringify(data)
        }),

    addPostToAlbum: (id, postId) =>
        request(`/albums/${id}/posts/${postId}`, {
            method: "POST"
        }),

    removePostFromAlbum: (id, postId) =>
        request(`/albums/${id}/posts/${postId}`, {
            method: "DELETE"
        }),

    deleteAlbum: (id) =>
        request(`/albums/${id}`, {
            method: "DELETE"
        }),

    // COMMENTS
    getComments: (postId) =>
        request(`/comments/post/${postId}`),

    createComment: (data) =>
        request("/comments", {
            method: "POST",
            body: JSON.stringify(data)
        }),

    deleteComment: (id) =>
        request(`/comments/${id}`, {
            method: "DELETE"
        }),

    // REPORTS
    getReports: () => request("/reports"),
    search: (q) => request(`/search?q=${encodeURIComponent(q)}`),
    adminSummary: () => request("/admin/summary"),
    adminUsers: () => request("/admin/users"),
    adminDeleteUser: (id) => request(`/admin/users/${id}`, { method: "DELETE" }),
    adminPosts: () => request("/admin/posts"),
    adminDeletePost: (id) => request(`/admin/posts/${id}`, { method: "DELETE" }),
    adminReports: () => request("/admin/reports"),
    adminUpdateReport: (id, status) => request(`/admin/reports/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),

    createReport: (data) =>
        request("/reports", {
            method: "POST",
            body: JSON.stringify(data)
        }),

    updateReport: (id, data) =>
        request(`/reports/${id}`, {
            method: "PUT",
            body: JSON.stringify(data)
        })
};