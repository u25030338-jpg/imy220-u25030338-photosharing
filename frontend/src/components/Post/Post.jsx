import Image from "../Image/Image";

function Post({ post }) {
    return (
        <article className="post">
            <header>
                <h1>{post.username}'s Post</h1>
                <p>{post.date}</p>
            </header>

            <Image
                src={post.image}
                alt={post.description}
            />

            <section>
                <p>{post.description}</p>
                <p>❤️ {post.likes} likes</p>
            </section>
        </article>
    );
}

export default Post;