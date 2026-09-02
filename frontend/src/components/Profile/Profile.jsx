function Profile({ user }) {
    return (
        <section className="profile-info">
            <img
                src={user.profilePicture}
                alt={`${user.username}'s profile`}
            />

            <div>
                <h1>{user.username}</h1>
                <p>{user.bio}</p>
                <p>
                    📍 {user.location}
                </p>
            </div>
        </section>
    );
}

export default Profile;