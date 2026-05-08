
import { number } from "zod";
import type { ProductSchema } from "../components/Products/ProductForm";
import api from "./libs/axios";

export const fetchProduct = async (
  search?: string,
  page: number = 1,
  limit: number = 10,
  categoryId?:  number ,
) => {
  const data = await api.get("/api/v1/products", {
    params: { search, page, limit , categoryId},
  });
  console.log("fetch data", data);
  return data;
};

export const createProduct = async (request: ProductSchema) => {
  const data = await api.post("/api/v1/products", request);
  return data;
};

export const createBulkProducts = async (requests: ProductSchema[]) => {
  const results = await Promise.all(
    requests.map((item) => api.post("/api/v1/products", item))
  );
  return results;
};

export const updateProduct = async (id: number, request: ProductSchema) => {
  const data = await api.put(`/api/v1/products/${id}`, request);
  return data;
};

export const uploadProductImage = async (id: number, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return await api.post(`/api/v1/products/${id}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteProductImage = async (id?: number) => {
  return await api.delete(`/api/v1/products/images/${id}`);
};

export const deleteProduct = async (id: number) => {
  return await api.delete(`/api/v1/products/${id}`);
};