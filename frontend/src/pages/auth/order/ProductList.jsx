import React, {useState, useEffect} from "react";

function ProductList(){

  const [products,setProducts] = useState([]);
  const [cart,setCart] = useState([]);

  const addToCart = (product) => {

    const item = {
      productId: product.id,
      quantity: 1,
      price: product.price
    };

    setCart([...cart,item]);
  };

  return(
    <div>
      <h2>Products</h2>

      {products.map(product=>(
        <div key={product.id}>
          <p>{product.name}</p>
          <p>{product.price}</p>

          <button onClick={()=>addToCart(product)}>
            Add to Cart
          </button>
        </div>
      ))}

    </div>
  );
}

export default ProductList;