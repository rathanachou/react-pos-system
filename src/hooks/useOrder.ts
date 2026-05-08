
import { createOrder } from "@/service/orders.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";


export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      toast.success("Order created successfully");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to created order");
      console.log("Failed to create order", error);
    },
  });
};