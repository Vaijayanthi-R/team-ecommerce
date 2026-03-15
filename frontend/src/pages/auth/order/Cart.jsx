import React, { useState } from "react";

function Cart() {

  const [cart, setCart] = useState([]);

  const removeItem = (index) => {
    const newCart = [...cart];
    newCart.splice(index,1);
    setCart(newCart);
  }

  return (
    <div>
      <h2>Cart</h2>

      {cart.map((item,index)=>(
        <div key={index}>
          <p>{item.name}</p>
          <p>Qty: {item.quantity}</p>
          <button onClick={()=>removeItem(index)}>Remove</button>
        </div>
      ))}
    </div>
  );
}

export default Cart;