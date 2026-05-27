
import api from "./libs/axios";
import { getAccessToken } from "../utils/TokenStorage";

const BASE_URL = import.meta.env.VITE_API_URL;

// ─── Types ────────────────────────────────────────────────
export interface OrderPayload {
  discount: number;
  items: {
    productId: number;
    qty: number;
  }[];
}

// ─── Create Order ─────────────────────────────────────────
export const createOrder = async (request: OrderPayload) => {
  return await api.post("/api/v1/orders", request); 
};

// ─── Get All Orders ───────────────────────────────────────
export const getOrders = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return await api.get("/api/v1/orders", { params });
};

// ─── Get Order by ID ──────────────────────────────────────
export const getOrderById = async (id: number) => {
  return await api.get(`/api/v1/orders/${id}`);
};

// ─── Generate Order Doc (.docx) ───────────────────────────
export const generateOrderDoc = async (id: number): Promise<void> => {
  const res = await api.get(
    `${BASE_URL}/api/v1/orders/${id}/generate-doc`,
    {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    }
  );

  const blob = new Blob([res.data], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `order-${id}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

// ─── Complete Order ───────────────────────────────────────
export const completeOrder = async (id: number): Promise<void> => {
  await api.patch(`/api/v1/orders/${id}/complete`);
};

// service/orders.service.ts
export const cancelOrder = async (
  id: number,
  reason?: string
) => {
  return await api.patch(`/api/v1/orders/${id}/cancel`, {
    reason: reason || "Customer cancelled",
  });
};