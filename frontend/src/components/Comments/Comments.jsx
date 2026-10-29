import { useState } from "react";

function Comments({ initialComments }) {
    const [comments, setComments] = useState(initialComments);
    const [newComment, setNewComment] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!newComment.trim()) {
            return;
        }

        const comment = {
            id: Date.now(),
            username: "You",
            text: newComment
        };

        setComments([...comments, comment]);
        setNewComment("");
    };

    return (
        <section className="comments">
            <h2>Comments</h2>

            {comments.map((comment) => (
                <article key={comment.id}>
                    <strong>{comment.username}</strong>
                    <p>{comment.text}</p>
                </article>
            ))}

            <form onSubmit={handleSubmit}>
                <label htmlFor="new-comment">
                    Add a comment
                </label>

                <input
                    id="new-comment"
                    type="text"
                    value={newComment}
                    onChange={(event) =>
                        setNewComment(event.target.value)
                    }
                    placeholder="Write a comment..."
                />

                <button type="submit">
                    Comment
                </button>
            </form>
        </section>
    );
}

export default Comments;