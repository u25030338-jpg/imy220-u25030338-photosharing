import { Link } from "react-router-dom";

function Header() {
    return (
        <header className="site-header">
            <nav>
                <div className="logo">
                    <Link to="/home">
                        PhotoShare
                    </Link>
                </div>

                <div className="nav-links">
                    <Link to="/home">
                        Home
                    </Link>

                    <Link to="/create">
                        Create Post
                    </Link>

                    <Link to="/profile/23532">
                        Profile
                    </Link>

                    <Link to="/">
                        Logout
                    </Link>
                </div>
            </nav>
        </header>
    );
}

export default Header;