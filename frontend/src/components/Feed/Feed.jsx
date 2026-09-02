import PostPreview from "../PostPreview/PostPreview";

function Feed({ posts }) {
    return (
        <section className="feed">
            <h2>Latest Posts</h2>

            {posts.length === 0 ? (
                <p>No posts found.</p>
            ) : (
                posts.map((post) => (
                    <PostPreview
                        key={post.id}
                        post={post}
                    />
                ))
            )}
        </section>
    );
}

export default Feed;