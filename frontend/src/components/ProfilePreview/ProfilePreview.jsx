function ProfilePreview({ user }) {
    return (
        <article className="profile-preview">
            <img
                src={user.profilePicture}
                alt={`${user.username}'s profile`}
            />

            <h3>{user.username}</h3>
            <p>{user.bio}</p>
        </article>
    );
}

export default ProfilePreview;