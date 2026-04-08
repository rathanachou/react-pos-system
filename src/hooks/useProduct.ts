import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBulkProducts, createProduct, fetchProduct, updateProduct, uploadProductImage } from "../service/product.service";

// hooks/useProduct.ts
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"], exact: false }); // ← key fix
    },
    onError: (error: any) => {
      console.log("Failed to create product", error);
    },
  });
};
  // const query = useQuery({
  //   queryKey: ["products", search],
  //   queryFn: () => fetchProduct(search),
  // });


export const useProduct = (search?: string , page?: number , limit?: number) => {
  return useQuery({
   queryKey: ["products", search, page, limit],
    queryFn: () => fetchProduct(search, page, limit),
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: any }) =>
      updateProduct(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"], exact: false }); // ← key fix
    },
    onError: (error: any) => {
      console.log("Failed to update product", error);
    },  
  });
};
export const useCreateBulkProducts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBulkProducts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"], exact: false });
    },
    onError: (error: any) => {
      console.log("Failed to bulk create products", error);
    },
  });
};

export const useUploadProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: File }) =>
      uploadProductImage(id, request),
    onSuccess: () => {
      console.log("Product image uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: Error) => {
      console.log("Failed to upload product image", error);
    },
  });
}