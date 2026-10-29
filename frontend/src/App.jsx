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
import AdminDashboard from "./pages/AdminDashboard";
import AlbumsPage from "./pages/AlbumsPage";

function App() {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("photoshareUser");
        return saved ? JSON.parse(saved) : null;
    });

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem("photoshareUser", JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("photoshareUser");
        localStorage.removeItem("photoshareToken");
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        user ? (
                            <Navigate to={user.role === "admin" ? "/admin" : "/home"} replace />
                        ) : (
                            <Splash onLogin={login} />
                        )
                    }
                />

                <Route path="/albums" element={user ? <AlbumsPage user={user} onLogout={logout} /> : <Navigate to="/" replace />} />
                <Route path="/admin" element={user?.role === "admin" ? <AdminDashboard user={user} onLogout={logout} /> : <Navigate to={user ? "/home" : "/"} replace />} />
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