import { useState } from "react";

function CreatePost() {
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!description.trim() || !imageUrl.trim()) {
            setMessage("Please complete all fields.");
            return;
        }

        setMessage("Post created successfully!");

        setDescription("");
        setImageUrl("");
    };

    return (
        <section className="create-post">
            <h2>Create a Post</h2>

            <form onSubmit={handleSubmit}>
                <label htmlFor="post-image">
                    Image URL
                </label>

                <input
                    id="post-image"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(event) =>
                        setImageUrl(event.target.value)
                    }
                    required
                />

                <label htmlFor="post-description">
                    Description
                </label>

                <textarea
                    id="post-description"
                    placeholder="What's on your mind?"
                    value={description}
                    onChange={(event) =>
                        setDescription(event.target.value)
                    }
                    maxLength="200"
                    required
                />

                <p>
                    {description.length}/200 characters
                </p>

                <button type="submit">
                    Create Post
                </button>
            </form>

            {message && <p>{message}</p>}
        </section>
    );
}

export default CreatePost;