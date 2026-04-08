import { useForm } from "@tanstack/react-form";

import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../../components/ui/field";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import z from "zod";
import { Spinner } from "../ui/spinner";
import { useEffect, useRef, useState } from "react";
import type { IProduct } from "../../types/product";
import { Trash2, Upload } from "lucide-react";
import { cn } from "../../lib/utils";
import { useCategoriesList } from "../../hooks/useCategories";
import { useCreateProduct, useUpdateProduct, useUploadProductImage } from "../../hooks/useProduct";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().min(0, "Price must be 0 or more"),
  categoryId: z
    .union([z.undefined(), z.number().min(1, "Category is required")])
    .refine((value) => value !== undefined, {
      message: "Category is required",
    }),
  qty: z.number().int().min(0, "Quantity must be 0 or more"),
});

export type ProductSchema = z.infer<typeof productSchema>;

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  product?: IProduct;
}

const ProductForm = ({ open, setOpen, product }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileProgresses, setFileProgresses] = useState<Record<string, number>>(
    {},
  );

  const { data } = useCategoriesList();

  const { mutate: createProductMutate } = useCreateProduct();
  const { mutate: updateProductMutate } = useUpdateProduct();
  const { mutate: uploadProductImageMutate } = useUploadProductImage();

  const form = useForm({
    defaultValues: {
      name: product?.name ?? "",
      price: product?.price ? Number(product.price) : 0,
      categoryId: product?.categoryId ?? undefined,
      qty: product?.qty ?? 0,
    },
    validators: {
      onSubmit: productSchema,
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);

      if (product) {
        updateProductMutate(
          { id: product.id, request: value },
          {
            onSuccess: () => {
              setOpen(false);
              form.reset();
            },
            onSettled: () => {
              setIsLoading(false);
            },
          },
        );
      } else {
        createProductMutate(value, {
          onSuccess: (res) => {
            console.log("created product response", res);
            if (res.data.id) {
              uploadedFiles.forEach((file) => {
                uploadProductImageMutate({ id: res.data.id, request: file });
              });
            }

            setOpen(false);
            form.reset();
          },
          onSettled: () => {
            setIsLoading(false);
          },
        });
      }
    },
  });

  // FIX 1: Added `form` to dependency array to satisfy exhaustive-deps rule.
  // Using form.setFieldValue is stable, so this won't cause infinite loops.
  useEffect(() => {
    if (product) {
      form.setFieldValue("name", product.name);
      form.setFieldValue("price", Number(product.price));
      form.setFieldValue("categoryId", product.categoryId);
      form.setFieldValue("qty", product.qty);
    } else {
      form.reset();
    }
  }, [product, form]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    setUploadedFiles((prev) => [...prev, ...newFiles]);

    newFiles.forEach((file) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        setFileProgresses((prev) => ({
          ...prev,
          [file.name]: Math.min(progress, 100),
        }));
      }, 300);
    });
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (filename: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.name !== filename));
    setFileProgresses((prev) => {
      const newProgresses = { ...prev };
      delete newProgresses[filename];
      return newProgresses;
    });
  };

  return (
    <div>
      {isLoading && <Spinner />}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Product Form</DialogTitle>
            <DialogDescription>Product Information Detail</DialogDescription>
          </DialogHeader>
          <form
            id="product-form"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field
                name="name"
                // FIX 2: Changed children render prop to a named render function
                // to avoid potential TS errors with implicit return types.
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Product Name</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Enter product name"
                        autoComplete="off"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              <form.Field
                name="price"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Price</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        type="number"
                        onChange={(e) =>
                          field.handleChange(e.target.valueAsNumber)
                        }
                        aria-invalid={isInvalid}
                        placeholder="Enter price"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              <form.Field
                name="qty"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Quantity</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        type="number"
                        onChange={(e) =>
                          field.handleChange(e.target.valueAsNumber)
                        }
                        aria-invalid={isInvalid}
                        placeholder="Enter quantity"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              <form.Field
                name="categoryId"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field orientation="responsive" data-invalid={isInvalid}>
                      <FieldContent>
                        <FieldLabel htmlFor="form-tanstack-select-language">
                          Category
                        </FieldLabel>

                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </FieldContent>
                      <Select
                        name={field.name}
                        // FIX 3: Guard against undefined value to avoid passing
                        // the string "undefined" into the Select component.
                        value={
                          field.state.value !== undefined
                            ? String(field.state.value)
                            : ""
                        }
                        onValueChange={(val) => field.handleChange(Number(val))}
                      >
                        <SelectTrigger
                          id="form-tanstack-select-language"
                          aria-invalid={isInvalid}
                          className="min-w-[120px]"
                        >
                          <SelectValue placeholder="Select the category" />
                        </SelectTrigger>
                        <SelectContent position="item-aligned">
                          {data?.data.map((category, index) => (
                            <SelectItem key={index} value={String(category.id)}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  );
                }}
              />

              <div>
                <div
                  className="border-2 border-dashed border-border rounded-md p-8 flex flex-col items-center justify-center text-center cursor-pointer"
                  onClick={handleBoxClick}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="mb-2 bg-muted rounded-full p-3">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-pretty text-sm font-medium text-foreground">
                    Upload product image
                  </p>
                  <p className="text-pretty text-sm text-muted-foreground mt-1">
                    or,{" "}
                    <label
                      htmlFor="fileUpload"
                      className="text-primary hover:text-primary/90 font-medium cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      click to browse
                    </label>{" "}
                    (4MB max)
                  </p>
                  <input
                    type="file"
                    id="fileUpload"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e.target.files)}
                  />
                </div>
              </div>

              <div
                className={cn(
                  "pb-5 space-y-3",
                  uploadedFiles.length > 0 ? "mt-4" : "",
                )}
              >
                {uploadedFiles.map((file, index) => {
                  // FIX 4: Create the object URL outside of JSX and store it
                  // so we can revoke it properly. Using a key-based approach
                  // here; for production consider useEffect with a Map ref.
                  const imageUrl = URL.createObjectURL(file);

                  return (
                    <div
                      className="border border-border rounded-lg p-2 flex flex-col"
                      key={file.name + index}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-18 h-14 bg-muted rounded-sm flex items-center justify-center self-start row-span-2 overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={file.name}
                            className="w-full h-full object-cover"
                            // FIX 4 (cont): Revoke the URL after the image
                            // loads to free memory — correctly placed here.
                            onLoad={() => URL.revokeObjectURL(imageUrl)}
                          />
                        </div>

                        <div className="flex-1 pr-1">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-foreground truncate max-w-[250px]">
                                {file.name}
                              </span>
                              <span className="text-sm text-muted-foreground whitespace-nowrap">
                                {Math.round(file.size / 1024)} KB
                              </span>
                            </div>
                            {/* FIX 5: Added type="button" so this doesn't
                                accidentally trigger form submission. */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="bg-transparent! hover:text-red-500"
                              onClick={() => removeFile(file.name)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="h-2 bg-muted rounded-full overflow-hidden flex-1">
                              <div
                                className="h-full bg-primary"
                                style={{
                                  width: `${fileProgresses[file.name] || 0}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {Math.round(fileProgresses[file.name] || 0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </FieldGroup>
          </form>
          <DialogFooter>
            <Field orientation="horizontal" className="flex justify-end">
              <DialogClose asChild>
                {/* FIX 6: Added type="button" to prevent accidental form submit. */}
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button className="bg-blue-500" type="submit" form="product-form">
                Save
              </Button>
            </Field>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductForm;