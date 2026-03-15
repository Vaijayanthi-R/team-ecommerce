import React from "react";
import { placeOrder } from "../../services/orderService";

function PlaceOrder({cart}) {

  const handleOrder = async () => {

    const order = {
      items: cart
    };

    try{
      await placeOrder(order);
      alert("Order placed successfully");
    }
    catch(error){
      console.log(error);
    }

  };

  return (
    <div>
      <button onClick={handleOrder}>
        Place Order
      </button>
    </div>
  );
}

export default PlaceOrder;