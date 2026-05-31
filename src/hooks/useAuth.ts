import { useMutation } from "@tanstack/react-query";
import {
  authLogin,
  authRegister,
  type PayLoad,
  type RegisterPayload,
} from "../service/auth.service";

export const useAuthLogin = () => {
  return useMutation({
    mutationFn: (request: PayLoad) => authLogin(request),
    onError: (error: Error) => {
      console.error("Failed to Login", error);
    },
  });
};

export const useAuthRegister = () => {
  return useMutation({
    mutationFn: (request: RegisterPayload) => authRegister(request),
    onError: (error: Error) => {
      console.error("Failed to Register", error);
    },
  });
};