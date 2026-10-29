import { Link, useLocation } from "react-router-dom";

function Header({ user, onLogout }) {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

                {/* Logo */}
                <Link
                    to="/home"
                    className="flex items-center gap-3"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-lg font-bold text-white shadow-sm">
                        P
                    </div>

                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">
                            PhotoShare
                        </h1>

                        <p className="hidden text-xs text-slate-500 sm:block">
                            Share your moments
                        </p>
                    </div>
                </Link>

                {/* Navigation */}
                <nav className="flex items-center gap-2">

                    {/* Home */}
                    <Link
                        to="/home"
                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                            isActive("/home")
                                ? "bg-blue-50 text-blue-700"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                    >
                        Home
                    </Link>

                    {/* Create Post */}
                    <Link
                        to="/home"
                        className="hidden rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:block"
                    >
                        + Create Post
                    </Link>

                    {/* Profile */}
                    {user && (
                        <Link
                            to={`/profile/${user.id}`}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                                isActive(`/profile/${user.id}`)
                                    ? "bg-slate-100 text-slate-900"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            }`}
                        >
                            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-slate-900 text-xs font-bold text-white">
                                {user.profilePicture ? <img src={user.profilePicture} alt="" className="h-full w-full object-cover" /> : (user.username?.charAt(0)?.toUpperCase() || "U")}
                            </div>

                            <span className="hidden md:block">
                                {user.username}
                            </span>
                        </Link>
                    )}

                    {/* Logout */}
                    <button
                        onClick={onLogout}
                        className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                    >
                        Logout
                    </button>

                </nav>
            </div>
        </header>
    );
}

export default Header;