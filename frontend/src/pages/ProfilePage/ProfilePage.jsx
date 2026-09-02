import { useState } from "react";
import { useParams } from "react-router-dom";

import Header from "../../components/Header/Header";
import Profile from "../../components/Profile/Profile";
import EditProfile from "../../components/EditProfile/EditProfile";
import Friends from "../../components/Friends/Friends";
import PostPreview from "../../components/PostPreview/PostPreview";

function ProfilePage() {
    const { id } = useParams();

    const [editing, setEditing] = useState(false);

    const [user, setUser] = useState({
        id: id,
        username: "Alex",
        bio: "Photography enthusiast and traveller.",
        location: "Pretoria, South Africa",
        profilePicture: "https://picsum.photos/150/150?random=10"
    });

    const posts = [
        {
            id: 1,
            username: user.username,
            date: "2 September 2026",
            image: "https://picsum.photos/600/400?random=11",
            description: "A beautiful afternoon.",
            likes: 32
        },
        {
            id: 2,
            username: user.username,
            date: "30 August 2026",
            image: "https://picsum.photos/600/400?random=12",
            description: "Another great memory.",
            likes: 18
        }
    ];

    const friends = [
        {
            id: 2,
            username: "Jordan",
            profilePicture: "https://picsum.photos/100/100?random=20"
        },
        {
            id: 3,
            username: "Taylor",
            profilePicture: "https://picsum.photos/100/100?random=21"
        },
        {
            id: 4,
            username: "Morgan",
            profilePicture: "https://picsum.photos/100/100?random=22"
        }
    ];

    const handleSaveProfile = (updatedUser) => {
        setUser(updatedUser);
        setEditing(false);
    };

    return (
        <>
            <Header />

            <main className="profile-page">
                <Profile user={user} />

                <button
                    type="button"
                    onClick={() => setEditing(!editing)}
                >
                    {editing ? "Cancel" : "Edit Profile"}
                </button>

                {editing && (
                    <EditProfile
                        user={user}
                        onSave={handleSaveProfile}
                    />
                )}

                <section className="user-posts">
                    <h2>Posts</h2>

                    {posts.map((post) => (
                        <PostPreview
                            key={post.id}
                            post={post}
                        />
                    ))}
                </section>

                <Friends friends={friends} />
            </main>
        </>
    );
}

export default ProfilePage;