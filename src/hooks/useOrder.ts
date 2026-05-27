

import { cancelOrder, completeOrder, createOrder, generateOrderDoc, getOrderById, getOrders } from "@/service/orders.service";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

// ─── Create Order ─────────────────────────────────────────
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      toast.success("Order created successfully! 🛒");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to create order ❌");
      console.error("Failed to create order", error);
    },
  });
};

// ─── Get All Orders ───────────────────────────────────────
export const useOrders = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => getOrders(params),
  });
};

// ─── Get Order by ID ──────────────────────────────────────
export const useOrderById = (id: number) => {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => getOrderById(id),
    enabled: !!id,
  });
};

// ─── Generate Order Doc ───────────────────────────────────
export const useGenerateOrderDoc = () => {
  return useMutation({
    mutationFn: generateOrderDoc,
    onSuccess: () => {
      toast.success("Document downloaded! 📄");
    },
    onError: () => {
      toast.error("Failed to generate document ❌");
    },
  });
};

// ─── Cancel Order Hook ────────────────────────────────────
export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      cancelOrder(id, reason),
    onSuccess: () => {
      toast.success(" Order cancelled — Stock restored");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => {
      toast.error("❌ Failed to cancel order");
    },
  });
};


// ─── Complete Order Hook ──────────────────────────────────
export const useCompleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => completeOrder(id),
    onSuccess: () => {
      toast.success(" Order completed!");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
