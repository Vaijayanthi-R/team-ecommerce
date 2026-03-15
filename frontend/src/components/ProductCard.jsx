function ProductCard({ product }) {
    return (
        <div className="product-card">
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>${product.price.toFixed(2)}</p>
        </div>
    );
}