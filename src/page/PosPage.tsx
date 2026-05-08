"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  QrCode,
  TrashIcon,
  MinusIcon,
  PlusIcon,
} from "lucide-react";

import type { IProduct } from "@/types/product";
import { useCategories } from "@/hooks/useCategories";
import type { ICategory } from "@/types/category";
import { toast } from "sonner";
import type { ICart } from "@/types/cart";
import SharedDialog from "@/components/SharedDialog";
import { useCreateOrder } from "@/hooks/useOrder";

import { Input } from "@/components/ui/input";
import { useProduct } from "@/hooks/useProduct";
import { Loading } from "@/components/Loading";
import type { OrderPayload } from "@/service/orders.service";
import { useCreatePayment } from "@/hooks/usePayment";

declare const AbaPayway: any;

export default function PosPage() {
  const [searchText, setSearchText] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(
    undefined,
  );
  const [cartItems, setCartItems] = useState<ICart[]>([]);

  const [isOpen, setIsOpen] = useState(false);

  const { data: productData } = useProduct(
    searchText,
    1,
    10,
    selectedCategory,
  );
  const { data: categoryData } = useCategories();

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isSuccess) return;

    const timer = setTimeout(() => {
      setIsSuccess(false);
    }, 10000); // 10 sec

    return () => clearTimeout(timer);
  }, [isSuccess]);

  useEffect(() => {
    const timer = setTimeout(() => {}, 5000); // delay 5 sec

    return () => clearTimeout(timer);
  }, [searchText]);

  const products = (productData?.data as IProduct[]) ?? [];
  const categories = (categoryData?.data as ICategory[]) ?? [];

  const allCategories = [
    {
      id: undefined,
      name: "All",
    },
    ...categories,
  ];

  console.log("products", products);

  const addToCart = (product: IProduct) => {
    console.log("add to order clicked");
    if (product.qty <= 0) {
      toast.warning("Product out of stock");
      return;
    }

    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);

      if (existingItem) {
        if (existingItem.qty >= existingItem.stock) {
          console.log("add to order clicked");
          toast.warning("Product out of stock");
          return prev;
        }

        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          category: product.category?.name || "Uncategorized",
          price: Number(product.price),
          imageUrl: product.productImages?.[0]?.imageUrl || "/placeholder.svg",
          stock: product.qty,
          qty: 1,
        },
      ];
    });
  };

  const removeFromCart = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );

  const total = subtotal;

  const updateQty = (id: number, qty: number) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.id !== id) return item;

          const newQty = Math.min(qty, item.stock);

          if (newQty === 0) return null;

          return { ...item, qty: newQty };
        })
        .filter(Boolean) as ICart[];
    });
  };

  const { mutate: createOrderMutate } = useCreateOrder();
  const { mutate: createPaymentMutate } = useCreatePayment();

  const handlePlaceOrder = () => {
    setIsLoading(true);

    const payload: OrderPayload = {
      discount: 0,
      items: cartItems.map((item) => ({
        productId: item.id,
        qty: item.qty,
      })),
    };

    createOrderMutate(payload, {
         onSuccess: (res) => {
        console.log("Res", res);
        const orderId = res.data.id;
        createPaymentMutate(orderId, {
          onSuccess: (res) => {
            if (res.data) {
              const payway = res.data.payway;
              const form = document.createElement("form");
              form.id = "aba_merchant_request";
              form.method = payway.method;
              form.action = payway.action;
              form.target = payway.target;
              Object.entries(payway.fields).forEach(([key, value]) => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = String(value);
                form.appendChild(input);
              });

              document.body.appendChild(form);

              setIsOpen(false);
              AbaPayway?.checkout();
            }
          },
        });
        // setCartItems([]);
        // setIsOpen(false);
        // setIsSuccess(true);
      },
      onSettled: () => {
        setIsLoading(false);
      },
    });
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex flex-1 flex-col">
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
                  className="hover:bg-muted flex min-w-[80px] cursor-pointer flex-col items-center rounded-lg p-2 bg-orange-100"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <span className=" text-center text-[18px]  px-2 py-1">
                    {category.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="flex-1 overflow-auto p-6">
            <Input
              placeholder="Search product name..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-[500px] mb-4"
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {products.map((item: IProduct) => (
                <Card
                  key={item.id}
                  className="group cursor-pointer overflow-hidden border-transparent bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-100"
                  onClick={() => addToCart(item)}
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                      <img
                        src={
                          item.productImages?.[0]?.imageUrl ?? "/no-image.png"
                        }
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
                        <div className="bg-white text-blue-600 p-3 rounded-full transform translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 shadow-lg">
                          <Plus className="h-6 w-6" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          {item?.category?.name || "Uncategorized"}
                        </span>
                        <span className={`text-xs font-semibold ${item.qty > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {item.qty > 0 ? `${item.qty} in stock` : 'Out of stock'}
                        </span>
                      </div>
                      <h3 className="mb-3 line-clamp-1 text-base font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-xl font-bold text-blue-600">
                          ${Number(item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Order Summary */}
        <div className="flex w-80 flex-col border-l">
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Cart</h2>
              <div className="flex items-center gap-2">
                <Plus className="text-muted-foreground h-4 w-4" />
                <Trash2
                  className=" h-4 w-4 text-red-500"
                  onClick={() => setCartItems([])}
                />
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {cartItems.map((item: ICart, index: number) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex items-center gap-3"
                >
                  <div className="bg-muted flex h-12 items-center justify-center rounded-lg">
                    <div className="">
                      <img src={item.imageUrl} alt={item.name} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{item.name}</h4>
                    <p className="text-muted-foreground text-xs">
                      {item.category}
                    </p>
                    <p>${item.price}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <p className="font-semibold">${item.price * item.qty}</p>

                    <div className="flex items-center gap-2">
                      <Button
                        className=""
                        type="button"
                        onClick={() => updateQty(item.id, item.qty - 1)}
                      >
                        <MinusIcon />
                      </Button>

                      <span>{item.qty}</span>

                      <Button
                        className=""
                        type="button"
                        onClick={() => updateQty(item.id, item.qty + 1)}
                      >
                        <PlusIcon />
                      </Button>

                      <Button
                        className="bg-red-500"
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <TrashIcon />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t p-4">
            <div className="mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{subtotal.toFixed(2)}$</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{total.toFixed(2)}$</span>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="flex h-auto flex-col items-center bg-transparent p-4"
              >
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                  <span className="font-semibold text-green-600">$</span>
                </div>
                <span className="text-xs">Cash</span>
              </Button>

              <Button
                variant="outline"
                className="flex h-auto flex-col items-center bg-transparent p-4"
              >
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                  <QrCode className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-xs">Scan</span>
              </Button>
            </div>

            <Button
              onClick={() => setIsOpen(true)}
              className="w-full bg-blue-600 py-3 text-white hover:bg-blue-700"
            >
              Checkout ${total.toFixed(2)}
            </Button>
          </div>
        </div>
      </div>

      <SharedDialog
        open={isOpen}
        setOpen={setIsOpen}
        isCancel={false}
        title="Order summary"
        desc="Please check the summary detail"
      >
        <div className="space-y-10">
          {cartItems.map((item: ICart, index: number) => (
            <div
              key={`${item.id}-${index}`}
              className="flex items-center gap-6"
            >
              <div className="bg-muted flex w-[100px] h-12 items-center justify-center rounded-lg">
                <div className="">
                  <img src={item.imageUrl} alt={item.name} />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium">{item.name}</h4>
                <p className="text-muted-foreground text-xs">{item.category}</p>
                <div className="flex gap-4">
                  <p className="text-primary">${item.price}</p>
                  <p>X {item.qty}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <p className="font-semibold">${item.price * item.qty}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <p className="text-xl">Total: $ {total.toFixed(2)}</p>
        </div>

        <Button
          onClick={handlePlaceOrder}
          type="button"
          className="w-full mt-8"
        >
          Place Order
        </Button>
      </SharedDialog>

      <SharedDialog
        open={isSuccess}
        setOpen={setIsSuccess}
        isCancel={false}
        title="Order Success"
        width="35%"
      >
        <div className="flex flex-col items-center justify-center">
          <img
            className="w-[150px] h-[150px]"
            src="/no-images.png"
            alt="tick icon"
          />
          <p className="text-xl mt-8">Order created successfully</p>
        </div>
      </SharedDialog>
    </div>
  );
}