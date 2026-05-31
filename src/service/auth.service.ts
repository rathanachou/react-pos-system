import api from "./libs/axios";

export interface PayLoad {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: string;
  role: string;
}

export interface AuthResponse {
  message: string;
  data: {
    token: string;
  };
}

export const authLogin = async (request: PayLoad): Promise<AuthResponse> => {
  return api.post("/api/v1/auth/login", request);
};

export const authRegister = async (
  request: RegisterPayload
): Promise<AuthResponse> => {
  return api.post("/api/v1/auth/register", request);
};