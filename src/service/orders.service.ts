
import api from "./libs/axios";

export interface OrderPayload{
  discount: number;
  items: {
    productId: number;
    qty: number;
  }[]
}
export const createOrder = async (request: OrderPayload) => {
  return await api.post("/api/v1/orders", request)
};
