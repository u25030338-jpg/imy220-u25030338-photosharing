import { useState } from "react";
import CreatePost from "../../components/CreatePost/CreatePost";

import Header from "../../components/Header/Header";
import SearchInput from "../../components/SearchInput/SearchInput";
import Feed from "../../components/Feed/Feed";

function Home() {
    const [searchTerm, setSearchTerm] = useState("");

    const posts = [
        {
            id: 1,
            username: "Alex",
            date: "2 September 2026",
            image: "https://picsum.photos/600/400?random=1",
            description: "Beautiful day outside!",
            likes: 24
        },
        {
            id: 2,
            username: "Jordan",
            date: "1 September 2026",
            image: "https://picsum.photos/600/400?random=2",
            description: "Exploring new places.",
            likes: 41
        },
        {
            id: 3,
            username: "Taylor",
            date: "31 August 2026",
            image: "https://picsum.photos/600/400?random=3",
            description: "Some of my favourite memories.",
            likes: 17
        }
    ];

    return (
        <>
            <Header />

           <main className="home-page">
    <section className="home-content">
        <h1>Home</h1>

        <SearchInput
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
        />

        <CreatePost />

        <Feed posts={posts} />
    </section>

    <aside>
        <h2>Welcome to PhotoShare</h2>

        <p>
            Discover photos and connect with
            other users.
        </p>
    </aside>
</main>
        </>
    );
}

export default Home;