import { useState } from "react";
import { useParams } from "react-router-dom";

import Header from "../../components/Header/Header";
import Post from "../../components/Post/Post";
import Comments from "../../components/Comments/Comments";
import EditPost from "../../components/EditPost/EditPost";

function PostPage() {
    const { id } = useParams();

    const [editing, setEditing] = useState(false);

    const [post, setPost] = useState({
        id: id,
        username: "Alex",
        date: "2 September 2026",
        image: "https://picsum.photos/800/500?random=30",
        description: "A beautiful day captured in a photo.",
        likes: 42
    });

    const comments = [
        {
            id: 1,
            username: "Jordan",
            text: "Great photo!"
        },
        {
            id: 2,
            username: "Taylor",
            text: "I really like this."
        }
    ];

    const handleSavePost = (updatedPost) => {
        setPost(updatedPost);
        setEditing(false);
    };

    return (
        <>
            <Header />

            <main className="post-page">
                <Post post={post} />

                <button
                    type="button"
                    onClick={() => setEditing(!editing)}
                >
                    {editing ? "Cancel" : "Edit Post"}
                </button>

                {editing && (
                    <EditPost
                        post={post}
                        onSave={handleSavePost}
                    />
                )}

                <Comments initialComments={comments} />
            </main>
        </>
    );
}

export default PostPage;