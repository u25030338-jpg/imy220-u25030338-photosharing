import { useState } from "react";
import { api } from "../../api";

export default function Splash({ onLogin }) {
    const [mode, setMode] = useState("signin");

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [profilePicture, setProfilePicture] = useState("");
    const [profilePicturePreview, setProfilePicturePreview] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    function switchMode(newMode) {
        setMode(newMode);

        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setProfilePicture("");
        setProfilePicturePreview("");

        setError("");
        setSuccess("");
    }

    function validateEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function validateSignIn() {
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            return "Please enter your email address.";
        }

        if (!validateEmail(trimmedEmail)) {
            return "Please enter a valid email address.";
        }

        if (!password) {
            return "Please enter your password.";
        }

        return null;
    }

    function validateSignUp() {
        const trimmedUsername = username.trim();
        const trimmedEmail = email.trim();

        if (!trimmedUsername) {
            return "Please enter a username.";
        }

        if (trimmedUsername.length < 3) {
            return "Username must be at least 3 characters.";
        }

        if (trimmedUsername.length > 30) {
            return "Username cannot be longer than 30 characters.";
        }

        if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
            return "Username can only contain letters, numbers and underscores.";
        }

        if (!trimmedEmail) {
            return "Please enter your email address.";
        }

        if (!validateEmail(trimmedEmail)) {
            return "Please enter a valid email address.";
        }

        if (!password) {
            return "Please enter a password.";
        }

        if (password.length < 6) {
            return "Password must be at least 6 characters.";
        }

        if (password.length > 100) {
            return "Password cannot be longer than 100 characters.";
        }

        if (!confirmPassword) {
            return "Please confirm your password.";
        }

        if (password !== confirmPassword) {
            return "Passwords do not match.";
        }

        return null;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setSuccess("");

        const validationError =
            mode === "signin"
                ? validateSignIn()
                : validateSignUp();

        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);

        try {
            if (mode === "signin") {
                const result = await api.signin({
                    email: email.trim().toLowerCase(),
                    password
                });

                if (result.token) localStorage.setItem("photoshareToken", result.token);
                const loggedInUser = result.user || result;

                if (!loggedInUser || !loggedInUser.id) {
                    throw new Error(
                        "Invalid login response from server."
                    );
                }

                onLogin(loggedInUser);
            } else {
                const result = await api.signup({
                    username: username.trim(),
                    email: email.trim().toLowerCase(),
                    password,
                    profilePicture
                });

                const newUser = result.user || result;

                if (!newUser || !newUser.id) {
                    throw new Error(
                        "Account was created, but the server returned invalid user data."
                    );
                }

                setSuccess("Account created successfully!");

                onLogin(newUser);
            }
        } catch (error) {
            console.error(
                mode === "signin"
                    ? "Sign in failed:"
                    : "Sign up failed:",
                error
            );

            setError(
                error.message ||
                (
                    mode === "signin"
                        ? "Unable to sign in. Please try again."
                        : "Unable to create your account. Please try again."
                )
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main
            className="relative min-h-screen overflow-hidden bg-slate-950"
            style={{
                backgroundImage:
                    "url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=2000&q=85')",
                backgroundSize: "cover",
                backgroundPosition: "center"
            }}
        >

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-slate-950/65" />

            {/* Decorative gradients */}
            <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

            <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />

            {/* Main content */}
            <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-6 py-10">

                <div className="grid w-full items-center gap-12 lg:grid-cols-2">

                    {/* Left side */}
                    <section className="hidden text-white lg:block">

                        <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
                            <span className="h-2 w-2 rounded-full bg-green-400" />

                            <span className="text-sm font-medium text-white/90">
                                Welcome to PhotoShare
                            </span>
                        </div>

                        <h1 className="max-w-xl text-6xl font-black leading-tight tracking-tight">
                            Share the
                            <span className="block text-blue-400">
                                moments
                            </span>
                            that matter.
                        </h1>

                        <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/75">
                            Capture your favourite moments, connect
                            with friends and build your own collection
                            of memories.
                        </p>

                        <div className="mt-10 grid max-w-lg grid-cols-3 gap-4">

                            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                                <p className="text-2xl font-bold">
                                    📸
                                </p>

                                <p className="mt-2 text-sm font-semibold">
                                    Share
                                </p>

                                <p className="mt-1 text-xs text-white/60">
                                    Your moments
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                                <p className="text-2xl font-bold">
                                    👥
                                </p>

                                <p className="mt-2 text-sm font-semibold">
                                    Connect
                                </p>

                                <p className="mt-1 text-xs text-white/60">
                                    With friends
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                                <p className="text-2xl font-bold">
                                    ❤️
                                </p>

                                <p className="mt-2 text-sm font-semibold">
                                    Discover
                                </p>

                                <p className="mt-1 text-xs text-white/60">
                                    New memories
                                </p>
                            </div>

                        </div>
                    </section>

                    {/* Login card */}
                    <section className="mx-auto w-full max-w-md">

                        <div className="rounded-3xl border border-white/20 bg-white/95 p-7 shadow-2xl backdrop-blur-xl sm:p-9">

                            {/* Mobile logo */}
                            <div className="mb-7 text-center lg:hidden">
                                <h1 className="text-3xl font-black text-slate-900">
                                    Photo<span className="text-blue-600">Share</span>
                                </h1>

                                <p className="mt-2 text-sm text-slate-500">
                                    Share your moments.
                                </p>
                            </div>

                            {/* Desktop card heading */}
                            <div className="mb-7 hidden lg:block">
                                <h2 className="text-2xl font-bold text-slate-900">
                                    {mode === "signin"
                                        ? "Welcome back"
                                        : "Create your account"}
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    {mode === "signin"
                                        ? "Sign in to continue to PhotoShare."
                                        : "Join PhotoShare and start sharing."}
                                </p>
                            </div>

                            {/* Tabs */}
                            <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">

                                <button
                                    type="button"
                                    onClick={() => switchMode("signin")}
                                    className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                                        mode === "signin"
                                            ? "bg-white text-blue-600 shadow-sm"
                                            : "text-slate-500 hover:text-slate-700"
                                    }`}
                                >
                                    Sign In
                                </button>

                                <button
                                    type="button"
                                    onClick={() => switchMode("signup")}
                                    className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                                        mode === "signup"
                                            ? "bg-white text-blue-600 shadow-sm"
                                            : "text-slate-500 hover:text-slate-700"
                                    }`}
                                >
                                    Sign Up
                                </button>

                            </div>

                            {/* Errors */}
                            {error && (
                                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                    <strong>Error:</strong> {error}
                                </div>
                            )}

                            {success && (
                                <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                                    {success}
                                </div>
                            )}

                            {/* Form */}
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-4"
                            >

                                {mode === "signup" && (
                                    <div>
                                        <label
                                            htmlFor="username"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Username
                                        </label>

                                        <input
                                            id="username"
                                            type="text"
                                            value={username}
                                            onChange={(event) => {
                                                setUsername(event.target.value);
                                                setError("");
                                            }}
                                            placeholder="Enter your username"
                                            maxLength={30}
                                            autoComplete="username"
                                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label
                                        htmlFor="email"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Email Address
                                    </label>

                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(event) => {
                                            setEmail(event.target.value);
                                            setError("");
                                        }}
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="password"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Password
                                    </label>

                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(event) => {
                                            setPassword(event.target.value);
                                            setError("");
                                        }}
                                        placeholder="Enter your password"
                                        autoComplete={
                                            mode === "signin"
                                                ? "current-password"
                                                : "new-password"
                                        }
                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                    />
                                </div>

                                {mode === "signup" && (
                                    <div>
                                        <label htmlFor="signup-profile-picture" className="mb-2 block text-sm font-semibold text-slate-700">Profile picture (optional)</label>
                                        <input id="signup-profile-picture" type="file" accept="image/*" onChange={(event) => {
                                            const file = event.target.files?.[0];
                                            setError("");
                                            if (!file) { setProfilePicture(""); setProfilePicturePreview(""); return; }
                                            if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) { setError("Choose an image under 5 MB."); event.target.value = ""; return; }
                                            const reader = new FileReader();
                                            reader.onload = () => { setProfilePicture(String(reader.result || "")); setProfilePicturePreview(String(reader.result || "")); };
                                            reader.onerror = () => setError("Could not read the selected image.");
                                            reader.readAsDataURL(file);
                                        }} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3" />
                                        {profilePicturePreview && <img src={profilePicturePreview} alt="Profile picture preview" className="mt-3 h-20 w-20 rounded-full object-cover" />}
                                    </div>
                                )}

                                {mode === "signup" && (
                                    <div>
                                        <label
                                            htmlFor="confirm-password"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Confirm Password
                                        </label>

                                        <input
                                            id="confirm-password"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(event) => {
                                                setConfirmPassword(event.target.value);
                                                setError("");
                                            }}
                                            placeholder="Confirm your password"
                                            autoComplete="new-password"
                                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                        />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="mt-2 w-full rounded-xl bg-blue-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-blue-600/30 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
                                >
                                    {loading
                                        ? "Please wait..."
                                        : mode === "signin"
                                            ? "Sign In"
                                            : "Create Account"}
                                </button>

                            </form>

                            {/* Footer */}
                            <p className="mt-6 text-center text-sm text-slate-500">
                                {mode === "signin"
                                    ? "Don't have an account?"
                                    : "Already have an account?"}

                                <button
                                    type="button"
                                    onClick={() =>
                                        switchMode(
                                            mode === "signin"
                                                ? "signup"
                                                : "signin"
                                        )
                                    }
                                    className="ml-1 font-semibold text-blue-600 hover:text-blue-800"
                                >
                                    {mode === "signin"
                                        ? "Sign Up"
                                        : "Sign In"}
                                </button>
                            </p>

                            <div className="mt-6 border-t border-slate-200 pt-5 text-center">
                                <p className="text-xs text-slate-400">
                                    PhotoShare • IMY 220 Project
                                </p>
                            </div>

                        </div>
                    </section>

                </div>
            </div>
        </main>
    );
}