import { useState } from "react";
import type { ICart, ICartSummary } from "../types/cart";
import { useCreateOrder } from "./useOrder";
import { toast } from "sonner";

export const useCart = () => {
  const [cartItems, setCartItems] = useState<ICart[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const { mutate: createOrder, isPending } = useCreateOrder();

  // ─── Add to Cart ──────────────────────────────────────
  const addToCart = (product: ICart) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
     
        if (existing.qty >= product.stock) {
          toast.error(`❌ Out of stock!`);
          return prev;
        }
    
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      toast.success(` ${product.name} added!`);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  // ─── Remove from Cart ─────────────────────────────────
  const removeFromCart = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    toast.info("Item removed from cart");
  };

  // ─── Increase Qty ─────────────────────────────────────
  const increaseQty = (id: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (item.qty >= item.stock) {
            toast.error("❌ Out of stock!");
            return item;
          }
          return { ...item, qty: item.qty + 1 };
        }
        return item;
      })
    );
  };

  // ─── Decrease Qty ─────────────────────────────────────
  const decreaseQty = (id: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  // ─── Clear Cart ───────────────────────────────────────
  const clearCart = () => {
    setCartItems([]);
    setDiscount(0);
  };

  // ─── Cart Summary ─────────────────────────────────────
  const cartSummary: ICartSummary = {
    items: cartItems,
    totalItems: cartItems.reduce((sum, item) => sum + item.qty, 0),
    totalPrice: cartItems.reduce(
      (sum, item) => sum + item.price * item.qty, 0
    ),
    discount,
    netTotal:
      cartItems.reduce((sum, item) => sum + item.price * item.qty, 0) -
      discount,
  };

  // ─── Checkout ─────────────────────────────────────────
  const checkout = () => {
    if (cartItems.length === 0) {
      toast.error("❌ Cart is empty!");
      return;
    }

    createOrder(
      {
        discount,
        items: cartItems.map((item) => ({
          productId: item.id,
          qty: item.qty,
        })),
      },
      {
        onSuccess: () => {
          clearCart();
        },
      }
    );
  };

  return {
    cartItems,
    discount,
    setDiscount,
    cartSummary,
    addToCart,
    removeFromCart,
    increaseQty,
    decreaseQty,
    clearCart,
    checkout,
    isPending,
  };
};