import { useState } from "react";
import { api } from "../../api";

export default function Splash({ onLogin }) {
    const [mode, setMode] = useState("login");

    const [loginForm, setLoginForm] = useState({
        email: "",
        password: ""
    });

    const [signupForm, setSignupForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [message, setMessage] = useState("");

    async function handleLogin(e) {
        e.preventDefault();
        setMessage("");

        if (!loginForm.email || !loginForm.password) {
            setMessage("Please complete all fields.");
            return;
        }

        try {
            const result = await api.signin(loginForm);
            onLogin(result.user);
        } catch (error) {
            setMessage(error.message);
        }
    }

    async function handleSignup(e) {
        e.preventDefault();
        setMessage("");

        if (
            !signupForm.username ||
            !signupForm.email ||
            !signupForm.password
        ) {
            setMessage("Please complete all fields.");
            return;
        }

        if (signupForm.password !== signupForm.confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        try {
            await api.signup({
                username: signupForm.username,
                email: signupForm.email,
                password: signupForm.password
            });

            setMessage("Account created. You can now sign in.");
            setMode("login");
        } catch (error) {
            setMessage(error.message);
        }
    }

    return (
        <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
            <section className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">
                    PhotoShare
                </h1>

                <p className="text-slate-500 mb-6">
                    Share moments. Connect with friends.
                </p>

                <div className="flex mb-6 border-b">
                    <button
                        onClick={() => setMode("login")}
                        className={`flex-1 py-3 font-semibold ${
                            mode === "login"
                                ? "border-b-2 border-blue-600 text-blue-600"
                                : "text-slate-500"
                        }`}
                    >
                        Sign In
                    </button>

                    <button
                        onClick={() => setMode("signup")}
                        className={`flex-1 py-3 font-semibold ${
                            mode === "signup"
                                ? "border-b-2 border-blue-600 text-blue-600"
                                : "text-slate-500"
                        }`}
                    >
                        Sign Up
                    </button>
                </div>

                {message && (
                    <div className="mb-4 rounded-lg bg-slate-100 p-3 text-sm">
                        {message}
                    </div>
                )}

                {mode === "login" ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="email"
                            placeholder="Email"
                            value={loginForm.email}
                            onChange={(e) =>
                                setLoginForm({
                                    ...loginForm,
                                    email: e.target.value
                                })
                            }
                            className="w-full rounded-lg border p-3"
                            required
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={loginForm.password}
                            onChange={(e) =>
                                setLoginForm({
                                    ...loginForm,
                                    password: e.target.value
                                })
                            }
                            className="w-full rounded-lg border p-3"
                            required
                        />

                        <button className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700">
                            Sign In
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSignup} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Username"
                            value={signupForm.username}
                            onChange={(e) =>
                                setSignupForm({
                                    ...signupForm,
                                    username: e.target.value
                                })
                            }
                            className="w-full rounded-lg border p-3"
                            required
                        />

                        <input
                            type="email"
                            placeholder="Email"
                            value={signupForm.email}
                            onChange={(e) =>
                                setSignupForm({
                                    ...signupForm,
                                    email: e.target.value
                                })
                            }
                            className="w-full rounded-lg border p-3"
                            required
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            minLength="6"
                            value={signupForm.password}
                            onChange={(e) =>
                                setSignupForm({
                                    ...signupForm,
                                    password: e.target.value
                                })
                            }
                            className="w-full rounded-lg border p-3"
                            required
                        />

                        <input
                            type="password"
                            placeholder="Confirm password"
                            value={signupForm.confirmPassword}
                            onChange={(e) =>
                                setSignupForm({
                                    ...signupForm,
                                    confirmPassword: e.target.value
                                })
                            }
                            className="w-full rounded-lg border p-3"
                            required
                        />

                        <button className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700">
                            Create Account
                        </button>
                    </form>
                )}
            </section>
        </main>
    );
}