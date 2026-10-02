const API_URL = "/api";

async function request(url, options = {}) {
    const response = await fetch(`${API_URL}${url}`, {
        headers: {
            "Content-Type": "application/json",
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
    signup: (data) =>
        request("/auth/signup", {
            method: "POST",
            body: JSON.stringify(data)
        }),

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
    getUsers: () => request("/users"),

    getUser: (id) => request(`/users/${id}`),

    updateUser: (id, data) =>
        request(`/users/${id}`, {
            method: "PUT",
            body: JSON.stringify(data)
        }),

    // POSTS
    getPosts: () => request("/posts"),

    getPost: (id) => request(`/posts/${id}`),

    createPost: (data) =>
        request("/posts", {
            method: "POST",
            body: JSON.stringify(data)
        }),

    updatePost: (id, data) =>
        request(`/posts/${id}`, {
            method: "PUT",
            body: JSON.stringify(data)
        }),

    deletePost: (id) =>
        request(`/posts/${id}`, {
            method: "DELETE"
        }),

    // ALBUMS
    getAlbums: () => request("/albums"),

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