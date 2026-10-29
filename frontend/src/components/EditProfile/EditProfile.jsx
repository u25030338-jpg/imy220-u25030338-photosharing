import { useState } from "react";

function EditProfile({ user, onSave }) {
    const [username, setUsername] = useState(user.username);
    const [bio, setBio] = useState(user.bio);
    const [location, setLocation] = useState(user.location);

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!username.trim() || !bio.trim() || !location.trim()) {
            alert("Please complete all profile fields.");
            return;
        }

        onSave({
            ...user,
            username,
            bio,
            location
        });
    };

    return (
        <section className="edit-profile">
            <h2>Edit Profile</h2>

            <form onSubmit={handleSubmit}>
                <label htmlFor="username">
                    Username
                </label>

                <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(event) =>
                        setUsername(event.target.value)
                    }
                    required
                />

                <label htmlFor="bio">
                    Bio
                </label>

                <textarea
                    id="bio"
                    value={bio}
                    onChange={(event) =>
                        setBio(event.target.value)
                    }
                    required
                />

                <label htmlFor="location">
                    Location
                </label>

                <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(event) =>
                        setLocation(event.target.value)
                    }
                    required
                />

                <button type="submit">
                    Save Changes
                </button>
            </form>
        </section>
    );
}

export default EditProfile;