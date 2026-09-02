import { Link } from "react-router-dom";

function Header() {
    return (
        <header className="site-header">
            <nav>
                <div className="logo">
                    <Link to="/">PhotoShare</Link>
                </div>

                <div className="nav-links">
                    <Link to="/home">Home</Link>
                    <Link to="/profile/1">Profile</Link>
                    <Link to="/post/1">Post</Link>
                </div>
            </nav>
        </header>
    );
}

export default Header;