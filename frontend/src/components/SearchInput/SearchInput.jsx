function SearchInput({ searchTerm, setSearchTerm }) {
    return (
        <form className="search-form">
            <label htmlFor="search">
                Search posts
            </label>

            <input
                id="search"
                type="search"
                placeholder="Search..."
                value={searchTerm}
                onChange={(event) =>
                    setSearchTerm(event.target.value)
                }
            />

            <button type="submit">
                Search
            </button>
        </form>
    );
}

export default SearchInput;