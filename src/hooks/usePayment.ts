
import api from "@/service/libs/axios";
import { createPayment } from "@/service/payment.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";


export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      toast.success("Payment created successfully");
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to created payment");
      console.log("Failed to create payment", error);
    },
  });
};

// ─── Check Payment (called after ABA redirects back) ─────
const checkPayment = async (tranId: string) => {
  return await api.post(`/api/v1/payments/${tranId}/check`);
};

export const useCheckPayment = () => {
  return useMutation({ mutationFn: checkPayment });
};