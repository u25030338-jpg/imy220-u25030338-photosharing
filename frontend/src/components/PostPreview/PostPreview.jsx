function PostPreview({ post }) {
    return (
        <article className="post-preview">
            <header>
                <h3>{post.username}</h3>
                <span>{post.date}</span>
            </header>

            <img
                src={post.image}
                alt={post.description}
            />

            <section>
                <p>{post.description}</p>
                <p>❤️ {post.likes} likes</p>
            </section>

            <footer>
                <button>Like</button>
                <button>Comment</button>
            </footer>
        </article>
    );
}

export default PostPreview;