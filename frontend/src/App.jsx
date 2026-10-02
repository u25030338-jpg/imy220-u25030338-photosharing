import { useState } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Splash from "./pages/Splash/Splash";
import Home from "./pages/Home/Home";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import PostPage from "./pages/PostPage/PostPage";

function App() {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("photoshareUser");
        return saved ? JSON.parse(saved) : null;
    });

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem(
            "photoshareUser",
            JSON.stringify(userData)
        );
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("photoshareUser");
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        user ? (
                            <Navigate to="/home" replace />
                        ) : (
                            <Splash onLogin={login} />
                        )
                    }
                />

                <Route
                    path="/home"
                    element={
                        user ? (
                            <Home user={user} onLogout={logout} />
                        ) : (
                            <Navigate to="/" replace />
                        )
                    }
                />

                <Route
                    path="/profile/:id"
                    element={
                        user ? (
                            <ProfilePage
                                user={user}
                                onLogout={logout}
                            />
                        ) : (
                            <Navigate to="/" replace />
                        )
                    }
                />

                <Route
                    path="/post/:id"
                    element={
                        user ? (
                            <PostPage
                                user={user}
                                onLogout={logout}
                            />
                        ) : (
                            <Navigate to="/" replace />
                        )
                    }
                />

                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;