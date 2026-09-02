import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Splash() {
    const navigate = useNavigate();

    const [showSignup, setShowSignup] = useState(false);
    const [message, setMessage] = useState("");

    const [loginData, setLoginData] = useState({
        email: "",
        password: ""
    });

    const [signupData, setSignupData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const handleLoginChange = (event) => {
        setLoginData({
            ...loginData,
            [event.target.name]: event.target.value
        });
    };

    const handleSignupChange = (event) => {
        setSignupData({
            ...signupData,
            [event.target.name]: event.target.value
        });
    };

    const handleLoginSubmit = async (event) => {
        event.preventDefault();

        if (!loginData.email || !loginData.password) {
            setMessage("Please fill in all login fields.");
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/signin",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(loginData)
                }
            );

            const data = await response.json();

            setMessage(data.message);

            if (data.success) {
                setTimeout(() => {
                    navigate("/home");
                }, 500);
            }
        } catch (error) {
            setMessage(
                "Unable to connect to the server."
            );
        }
    };

    const handleSignupSubmit = async (event) => {
        event.preventDefault();

        if (
            !signupData.username ||
            !signupData.email ||
            !signupData.password ||
            !signupData.confirmPassword
        ) {
            setMessage("Please fill in all sign-up fields.");
            return;
        }

        if (
            signupData.password !==
            signupData.confirmPassword
        ) {
            setMessage("Passwords do not match.");
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/signup",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username: signupData.username,
                        email: signupData.email,
                        password: signupData.password
                    })
                }
            );

            const data = await response.json();

            setMessage(data.message);

            if (data.success) {
                setTimeout(() => {
                    setShowSignup(false);
                    setMessage("");
                }, 1000);
            }
        } catch (error) {
            setMessage(
                "Unable to connect to the server."
            );
        }
    };

    return (
        <main className="splash-page">
            <section className="splash-content">
                <h1>PhotoShare</h1>

                <p>
                    Share your moments. Connect with friends.
                </p>

                {!showSignup ? (
                    <section className="auth-card">
                        <h2>Login</h2>

                        <form onSubmit={handleLoginSubmit}>
                            <label htmlFor="login-email">
                                Email
                            </label>

                            <input
                                id="login-email"
                                type="email"
                                name="email"
                                value={loginData.email}
                                onChange={handleLoginChange}
                                required
                            />

                            <label htmlFor="login-password">
                                Password
                            </label>

                            <input
                                id="login-password"
                                type="password"
                                name="password"
                                value={loginData.password}
                                onChange={handleLoginChange}
                                required
                            />

                            <button type="submit">
                                Login
                            </button>
                        </form>

                        {message && <p>{message}</p>}

                        <p>
                            Don't have an account?
                        </p>

                        <button
                            type="button"
                            onClick={() => {
                                setShowSignup(true);
                                setMessage("");
                            }}
                        >
                            Sign Up
                        </button>
                    </section>
                ) : (
                    <section className="auth-card">
                        <h2>Sign Up</h2>

                        <form onSubmit={handleSignupSubmit}>
                            <label htmlFor="signup-username">
                                Username
                            </label>

                            <input
                                id="signup-username"
                                type="text"
                                name="username"
                                value={signupData.username}
                                onChange={handleSignupChange}
                                required
                            />

                            <label htmlFor="signup-email">
                                Email
                            </label>

                            <input
                                id="signup-email"
                                type="email"
                                name="email"
                                value={signupData.email}
                                onChange={handleSignupChange}
                                required
                            />

                            <label htmlFor="signup-password">
                                Password
                            </label>

                            <input
                                id="signup-password"
                                type="password"
                                name="password"
                                value={signupData.password}
                                onChange={handleSignupChange}
                                required
                            />

                            <label htmlFor="signup-confirm-password">
                                Confirm Password
                            </label>

                            <input
                                id="signup-confirm-password"
                                type="password"
                                name="confirmPassword"
                                value={signupData.confirmPassword}
                                onChange={handleSignupChange}
                                required
                            />

                            <button type="submit">
                                Create Account
                            </button>
                        </form>

                        {message && <p>{message}</p>}

                        <p>
                            Already have an account?
                        </p>

                        <button
                            type="button"
                            onClick={() => {
                                setShowSignup(false);
                                setMessage("");
                            }}
                        >
                            Back to Login
                        </button>
                    </section>
                )}
            </section>
        </main>
    );
}

export default Splash;