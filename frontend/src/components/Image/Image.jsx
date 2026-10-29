function Image({ src, alt }) {
    return (
        <figure className="post-image">
            <img src={src} alt={alt} />
        </figure>
    );
}

export default Image;