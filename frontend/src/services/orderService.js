import axios from "axios";

const API = "http://localhost:8080/orders";

export const placeOrder = (orderData) => {
  return axios.post(API, orderData);
};