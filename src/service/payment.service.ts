import api from "./libs/axios";

export const createPayment = async (orderId: number) => {
  return await api.post(`/api/v1/payments/${orderId}`);
};

