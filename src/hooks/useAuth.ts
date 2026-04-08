import { useMutation } from "@tanstack/react-query";
import { authLogin, type PayLoad } from "../service/auth.service";


export const useAuthLogin = () => {
  return useMutation({
    mutationFn: ({ request }: { request: PayLoad }) => authLogin(request),
    onSuccess: () => {},
    onError: (error: any) => {
      console.log("Failed to Login", error);
    },
  });
};