function Friends({ friends }) {
    return (
        <section className="friends">
            <h2>Friends</h2>

            {friends.map((friend) => (
                <article key={friend.id}>
                    <img
                        src={friend.profilePicture}
                        alt={`${friend.username}'s profile`}
                    />

                    <h3>{friend.username}</h3>
                </article>
            ))}
        </section>
    );
}

export default Friends;