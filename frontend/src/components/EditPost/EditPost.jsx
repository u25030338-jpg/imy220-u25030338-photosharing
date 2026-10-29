import { useState } from "react";

function EditPost({ post, onSave }) {
    const [description, setDescription] = useState(
        post.description
    );

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!description.trim()) {
            alert("Description cannot be empty.");
            return;
        }

        onSave({
            ...post,
            description
        });
    };

    return (
        <section className="edit-post">
            <h2>Edit Post</h2>

            <form onSubmit={handleSubmit}>
                <label htmlFor="post-description">
                    Description
                </label>

                <textarea
                    id="post-description"
                    value={description}
                    onChange={(event) =>
                        setDescription(event.target.value)
                    }
                    required
                />

                <button type="submit">
                    Save Post
                </button>
            </form>
        </section>
    );
}

export default EditPost;