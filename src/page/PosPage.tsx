"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft, ChevronRight, Plus, Trash2, QrCode,
  TrashIcon, MinusIcon, PlusIcon, AlertTriangle,
  ChevronDown, ChevronUp, Camera,
} from "lucide-react";
import type { ICategory, IProduct } from "@/types/product";
import { useCategories } from "@/hooks/useCategories";
import { toast } from "sonner";
import type { ICart } from "@/types/cart";
import SharedDialog from "@/components/SharedDialog";
import { useCreateOrder, useCancelOrder } from "@/hooks/useOrder";
import { Input } from "@/components/ui/input";
import { useOutOfStockProducts, useProduct } from "@/hooks/useProduct";
import type { OrderPayload } from "@/service/orders.service";
import { useCreatePayment, useCheckPayment } from "@/hooks/usePayment";
import { useQueryClient } from "@tanstack/react-query";
import BarcodeScanner from "@/components/BarcodeScanner";
import { useUsbScanner } from "@/hooks/useUsbScanner";
import PrintReceipt from "@/components/PrintReceipt";

declare const AbaPayway: any;

// ─── ProductCard Component ────────────────────────────────
interface ProductCardProps {
  item: IProduct;
  disabled?: boolean;
  onAdd: (item: IProduct) => void;
}

const ProductCard = ({ item, disabled = false, onAdd }: ProductCardProps) => (
  <Card
    className={`group overflow-hidden border-transparent bg-white shadow-sm
      transition-all duration-300 ${
        disabled
          ? "opacity-60 cursor-not-allowed grayscale"
          : "cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:border-blue-100"
      }`}
    onClick={() => !disabled && onAdd(item)}
  >
    <CardContent className="p-0">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={item.productImages?.[0]?.imageUrl ?? "/no-image.png"}
          alt={item.name}
          className="h-full w-full object-cover transition-transform
                     duration-500 group-hover:scale-110"
        />
        {disabled ? (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white text-xs font-bold uppercase
                             tracking-wider bg-red-500 px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        ) : (
          <div className="absolute inset-0 bg-black/40 opacity-0
                          transition-opacity duration-300 group-hover:opacity-100
                          flex items-center justify-center">
            <div className="bg-white text-blue-600 p-3 rounded-full
                            transform translate-y-4 opacity-0 transition-all
                            duration-300 group-hover:translate-y-0
                            group-hover:opacity-100 shadow-lg">
              <Plus className="h-6 w-6" />
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="inline-flex items-center rounded-md bg-blue-50
                           px-2 py-1 text-xs font-medium text-blue-700
                           ring-1 ring-inset ring-blue-700/10">
            {item?.category?.name || "Uncategorized"}
          </span>
          <span className={`text-xs font-semibold ${
            item.qty > 0 ? "text-green-600" : "text-red-500"
          }`}>
            {item.qty > 0 ? `${item.qty} in stock` : "Out of stock"}
          </span>
        </div>
        <h3 className="mb-3 line-clamp-1 text-base font-semibold text-gray-900">
          {item.name}
        </h3>
        <p className="text-xl font-bold text-blue-600">
          ${Number(item.price).toFixed(2)}
        </p>
      </div>
    </CardContent>
  </Card>
);

// ─── PosPage ──────────────────────────────────────────────
export default function PosPage() {
  const [searchText, setSearchText]             = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [cartItems, setCartItems]               = useState<ICart[]>([]);
  const [isOpen, setIsOpen]                     = useState(false);
  const [isLoading, setIsLoading]               = useState(false);
  const [isSuccess, setIsSuccess]               = useState(false);
  const [showStockAlert, setShowStockAlert]     = useState(false);
  const [showScanner, setShowScanner]           = useState(false);
  const [currentOrderId, setCurrentOrderId]     = useState<number | null>(null);

  // ─── Receipt state ────────────────────────────────────────
  const [showReceipt, setShowReceipt]       = useState(false);
  const [receiptItems, setReceiptItems]     = useState<ICart[]>([]);
  const [receiptTotal, setReceiptTotal]     = useState(0);
  const [receiptOrderId, setReceiptOrderId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  const { data: productData }    = useProduct(searchText, 1, 100, selectedCategory);
  const { data: outOfStockData } = useOutOfStockProducts(searchText, selectedCategory);
  const { data: categoryData }   = useCategories();

  const { mutate: createOrderMutate }   = useCreateOrder();
  const { mutate: createPaymentMutate } = useCreatePayment();
  const { mutate: cancelOrderMutate }   = useCancelOrder();
  const { mutate: checkPaymentMutate }  = useCheckPayment();

  // ─── Check tranId on page load (ABA redirect back) ──────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tranId = params.get("tranId");
    if (!tranId) return;

    window.history.replaceState({}, "", window.location.pathname);

    checkPaymentMutate(tranId, {
      onSuccess: (res: any) => {
        const status = res?.data?.payment?.status;
        if (status === "PAID") {
          toast.success("Payment confirmed! Order completed.");

          // ─── Save receipt snapshot before clearing cart ───
          setReceiptItems((prev) => {
            // cartItems may still have data here via closure
            return cartItems.length > 0 ? [...cartItems] : prev;
          });
          setReceiptTotal(subtotal);
          setReceiptOrderId(currentOrderId);
          setShowReceipt(true);

          setIsSuccess(true);
          setCartItems([]);
          setTimeout(() => {
            window.location.href = "/admin/pos";
          }, 8000);
        } else if (status === "FAILED") {
          toast.error("❌ Payment failed. Order cancelled.");
        } else {
          toast.warning("⏳ Payment still pending.");
        }
      },
      onError: () => {
        toast.error("❌ Could not verify payment.");
      },
    });
  }, []); 

  useEffect(() => {
    if (!isSuccess) return;
    const timer = setTimeout(() => setIsSuccess(false), 10000);
    return () => clearTimeout(timer);
  }, [isSuccess]);

  const products           = (productData?.data    as IProduct[]) ?? [];
  const outOfStockProducts = (outOfStockData?.data as IProduct[]) ?? [];
  const categories         = (categoryData?.data   as ICategory[]) ?? [];
  const allCategories      = [{ id: undefined, name: "All" }, ...categories];

  // ─── Add to Cart ─────────────────────────────────────────
  const addToCart = useCallback((product: IProduct) => {
    if (product.qty <= 0) {
      toast.warning("Product out of stock");
      return;
    }
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.qty >= existing.stock) {
          toast.warning(`Only ${existing.stock} items available in stock`);
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id:       product.id,
          name:     product.name,
          category: product.category?.name || "Uncategorized",
          price:    Number(product.price),
          imageUrl: product.productImages?.[0]?.imageUrl || "/placeholder.svg",
          stock:    product.qty,
          qty:      1,
        },
      ];
    });
  }, []);

  // ─── Barcode Scan ─────────────────────────────────────────
  const handleBarcodeScan = useCallback(
    (code: string) => {
      const trimmed = code.trim();
      const found = products.find(
        (p) =>
          String(p.id) === trimmed ||
          (p as any).barcode === trimmed ||
          (p as any).sku    === trimmed ||
          p.name            === trimmed
      );
      if (found) {
        addToCart(found);
        toast.success(`: ${found.name}`);
        setShowScanner(false);
      } else {
        toast.warning(` Product : ${code}`);
      }
    },
    [products, addToCart]
  );

  useUsbScanner(handleBarcodeScan, !showScanner);

  // ─── Remove + Update Cart ─────────────────────────────────
  const removeFromCart = (id: number) =>
    setCartItems((prev) => prev.filter((item) => item.id !== id));

  const updateQty = (id: number, qty: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;
          if (qty <= 0) return null as any;
          if (qty > item.stock) {
            toast.warning(`Only ${item.stock} items available in stock`);
            return item;
          }
          return { ...item, qty };
        })
        .filter(Boolean) as ICart[]
    );
  };

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const total    = subtotal;

  // ─── Cancel Order ────────────────────────────────────────
  const handleCancelOrder = useCallback(
    (orderId: number, reason = "Customer cancelled") => {
      cancelOrderMutate(
        { id: orderId, reason },
        {
          onSuccess: () => {
            toast.info("Order cancelled.");
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["products-out-of-stock"] });
            setCurrentOrderId(null);
            setIsOpen(false);
          },
          onError: () => {
            toast.error("❌ Failed to cancel order");
          },
        }
      );
    },
    [cancelOrderMutate, queryClient]
  );

  // ─── Place Order ──────────────────────────────────────────
  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      toast.warning("Cart is empty");
      return;
    }

    setIsLoading(true);

    const payload: OrderPayload = {
      discount: 0,
      items: cartItems.map((item) => ({
        productId: item.id,
        qty:       item.qty,
      })),
    };

    createOrderMutate(payload, {
      onSuccess: (res) => {
        const orderId = res.data.id;
        setCurrentOrderId(orderId);

        createPaymentMutate(orderId, {
          onSuccess: (payRes) => {
            if (payRes.data) {
              const payway = payRes.data.payway;

              // ─── Snapshot cart for receipt before ABA redirect ───
              setReceiptItems([...cartItems]);
              setReceiptTotal(total);
              setReceiptOrderId(orderId);

              const form  = document.createElement("form");
              form.id     = "aba_merchant_request";
              form.method = payway.method;
              form.action = payway.action;
              form.target = payway.target;

              Object.entries(payway.fields).forEach(([key, value]) => {
                const input = document.createElement("input");
                input.type  = "hidden";
                input.name  = key;
                input.value = String(value);
                form.appendChild(input);
              });

              document.body.appendChild(form);
              setIsOpen(false);
              AbaPayway?.checkout();
            }
          },
          onError: () => {
            toast.error("Payment failed — cancelling order...");
            handleCancelOrder(orderId, "Payment creation failed");
          },
        });
      },
      onError: (error: any) => {
        const msg = error?.response?.data?.message || "Order failed. Please try again.";
        toast.error(msg);
      },
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <div>
      <div className="flex h-screen">

        {/* ─── Left: Products ──────────────────────────────── */}
        <div className="flex flex-1 flex-col overflow-hidden">

          {/* Header */}
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">Categories</h1>
              <div className="flex items-center gap-2">
                <ChevronLeft className="text-muted-foreground h-5 w-5" />
                <ChevronRight className="text-muted-foreground h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="border-b p-4">
            <div className="flex gap-2 overflow-x-auto">
              {allCategories.map((category, index) => (
                <div
                  key={index}
                  className={`hover:bg-muted flex min-w-[80px] cursor-pointer
                    flex-col items-center rounded-lg p-2 transition-colors ${
                      selectedCategory === category.id
                        ? "bg-orange-300 font-semibold"
                        : "bg-orange-100"
                    }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <span className="text-center text-[18px] px-2 py-1">
                    {category.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-auto p-6">

            {/* Search + Scan */}
            <div className="flex gap-2 mb-6">
              <Input
                placeholder="Search product name..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-[500px]"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowScanner(true)}
                className="flex items-center gap-2 border-blue-300
                           text-blue-600 hover:bg-blue-50"
              >
                <Camera className="h-4 w-4" />
                <span className="text-sm">Scan</span>
              </Button>
            </div>

            {/* In-Stock Products */}
            {products.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-6">
                {products.map((item) => (
                  <ProductCard key={item.id} item={item} onAdd={addToCart} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center
                              py-16 text-muted-foreground">
                <p className="text-lg">No products available</p>
                <p className="text-sm mt-1">Try a different category or search term</p>
              </div>
            )}

            {/* Out of Stock Alert */}
            {outOfStockProducts.length > 0 && (
              <div className="mt-10">
                <button
                  type="button"
                  onClick={() => setShowStockAlert((prev) => !prev)}
                  className="w-full flex items-center justify-between px-4 py-3
                             rounded-xl bg-red-50 border border-red-200
                             text-red-700 hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                    <span className="font-semibold text-sm">
                      Stock Alert — Out of Stock Products
                    </span>
                    <Badge className="bg-red-500 hover:bg-red-500 text-white
                                     text-xs px-2 py-0.5 ml-1">
                      {outOfStockProducts.length}
                    </Badge>
                  </div>
                  {showStockAlert
                    ? <ChevronUp   className="h-4 w-4 shrink-0" />
                    : <ChevronDown className="h-4 w-4 shrink-0" />
                  }
                </button>

                {showStockAlert && (
                  <div className="mt-4 grid grid-cols-1 gap-6
                                  md:grid-cols-2 lg:grid-cols-6">
                    {outOfStockProducts.map((item) => (
                      <ProductCard
                        key={item.id}
                        item={item}
                        disabled
                        onAdd={addToCart}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── Right: Cart Sidebar ─────────────────────────── */}
        <div className="flex w-96 flex-col border-l">

          {/* Cart Header */}
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Cart ({cartItems.length})</h2>
              <div className="flex items-center gap-2">
                <QrCode
                  className="h-4 w-4 text-blue-500 cursor-pointer hover:text-blue-700"
                  onClick={() => setShowScanner(true)}
                />
                <Trash2
                  className="h-4 w-4 text-red-500 cursor-pointer"
                  onClick={() => setCartItems([])}
                />
              </div>
            </div>
          </div>

          {/* Cart Items */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {cartItems.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Cart is empty
                </p>
              )}
              {cartItems.map((item: ICart, index: number) => (
                <div key={`${item.id}-${index}`} className="flex items-center gap-3">
                  <div className="bg-muted flex h-12 w-12 items-center
                                  justify-center rounded-lg overflow-hidden shrink-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{item.name}</h4>
                    <p className="text-muted-foreground text-xs">{item.category}</p>
                    <p className="text-sm">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="font-semibold">${(item.price * item.qty).toFixed(2)}</p>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="outline" type="button"
                        onClick={() => updateQty(item.id, item.qty - 1)}>
                        <MinusIcon className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm">{item.qty}</span>
                      <Button size="icon" variant="outline" type="button"
                        onClick={() => updateQty(item.id, item.qty + 1)}>
                        <PlusIcon className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="destructive" type="button"
                        onClick={() => removeFromCart(item.id)}>
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Cart Footer */}
          <div className="border-t p-4">
            <div className="mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2">
              <Button variant="outline"
                className="flex h-auto flex-col items-center bg-transparent p-4">
                <div className="mb-2 flex h-8 w-8 items-center justify-center
                                rounded-lg bg-green-100">
                  <span className="font-semibold text-green-600">$</span>
                </div>
                <span className="text-xs">Cash</span>
              </Button>
              <Button variant="outline"
                className="flex h-auto flex-col items-center bg-transparent p-4"
                onClick={() => cartItems.length > 0 && setIsOpen(true)}>
                <div className="mb-2 flex h-8 w-8 items-center justify-center
                                rounded-lg bg-purple-100">
                  <QrCode className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-xs">Scan</span>
              </Button>
            </div>

            <Button
              onClick={() => cartItems.length > 0 && setIsOpen(true)}
              disabled={cartItems.length === 0}
              className="w-full bg-blue-600 py-3 text-white
                         hover:bg-blue-700 disabled:opacity-50"
            >
              Checkout ${total.toFixed(2)}
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Camera Barcode Scanner ───────────────────────── */}
      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* ─── Order Summary Dialog ─────────────────────────── */}
      <SharedDialog
        open={isOpen}
        setOpen={(val) => {
          if (!val && currentOrderId) {
            handleCancelOrder(currentOrderId, "Customer closed dialog");
          } else {
            setIsOpen(val);
          }
        }}
        isCancel={false}
        title="Order Summary"
        desc="Please review your order before placing"
      >
        <div className="space-y-4">
          {cartItems.map((item: ICart, index: number) => (
            <div key={`${item.id}-${index}`} className="flex items-center gap-4">
              <div className="bg-muted flex w-[60px] h-[60px] items-center
                              justify-center rounded-lg overflow-hidden shrink-0">
                <img src={item.imageUrl} alt={item.name}
                  className="object-cover w-full h-full" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium">{item.name}</h4>
                <p className="text-muted-foreground text-xs">{item.category}</p>
                <div className="flex gap-4 text-sm">
                  <p className="text-primary">${item.price.toFixed(2)}</p>
                  <p>× {item.qty}</p>
                </div>
              </div>
              <p className="font-semibold">${(item.price * item.qty).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between items-center">
          <span className="font-semibold">Total</span>
          <p className="text-xl font-bold">${total.toFixed(2)}</p>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-red-300 text-red-500 hover:bg-red-50"
            onClick={() => {
              if (currentOrderId) {
                handleCancelOrder(currentOrderId, "Customer cancelled");
              } else {
                setIsOpen(false);
              }
            }}
          >
            ❌ Cancel
          </Button>
          <Button
            type="button"
            onClick={handlePlaceOrder}
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? "Processing..." : "Place Order"}
          </Button>
        </div>
      </SharedDialog>

      {/* ─── Success Dialog ───────────────────────────────── */}
      <SharedDialog
        open={isSuccess}
        setOpen={setIsSuccess}
        isCancel={false}
        title="Payment Confirmed!"
        width="35%"
      >
        <div className="flex flex-col items-center justify-center py-4">
          <img className="w-[120px] h-[120px]" src="/no-images.png" alt="success icon" />
          <p className="text-xl mt-6 font-medium">Order completed successfully!</p>
          <p className="text-muted-foreground text-sm mt-2">
            Payment received. Stock has been updated.
          </p>
          {/* ─── Print Receipt button inside success dialog ── */}
          <Button
            type="button"
            onClick={() => setShowReceipt(true)}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            🖨️ Print Receipt
          </Button>
        </div>
      </SharedDialog>

      {/* ─── Print Receipt ────────────────────────────────── */}
      {showReceipt && (
        <PrintReceipt
          cartItems={receiptItems}
          total={receiptTotal}
          orderId={receiptOrderId}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
}