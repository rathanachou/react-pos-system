
import { CirclePlus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { IProduct } from "../types/product";

import { Spinner } from "../components/ui/spinner";
import { getAccessToken } from "../utils/TokenStorage";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import ProductForm from "../components/Products/ProductForm";
import { DataTable } from "../components/data-table";
import { columns } from "../components/Products/columns";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../components/ui/pagination";
import { useProduct, useDeleteProduct } from "../hooks/useProduct";



const Product = () => {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");

  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [selectedProduct, setSelectedProduct] = useState<IProduct | undefined>(
    undefined,
  );
  const { data: productData, isLoading } = useProduct(search, page, limit);
  const { mutate: deleteProductMutate } = useDeleteProduct();

  const pagination = productData?.pagination;
  const totalPages = Math.ceil(
    (pagination?.total || 0) / (pagination?.limit || 1),
  );
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  console.log("pagination", pagination);

  const accessToken = getAccessToken();
  if (!accessToken) {
    navigate("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const handleSearch = () => {
    console.log("search input", searchInput);
    setSearch(searchInput);
  };

  const onEdit = (product: IProduct) => {
    console.log("edit product", product);
    setSelectedProduct(product);
    setOpen(true);
  };

  const onDelete = (product: IProduct) => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      deleteProductMutate(product.id);
    }
  };

  return (
    <div>
      <div className="flex justify-between">
        <div className="flex gap-2 mb-4">
          <Input
            className="w-[200px]"
            onChange={(e) => setSearchInput(e.target.value)}
            value={searchInput}
          />
          <Button onClick={() => handleSearch()}>Search</Button>
        </div>

        <Button onClick={() => setOpen(true)}>
          <CirclePlus /> Create
        </Button>
      </div>

      <ProductForm open={open}
       setOpen={ () => {
        setOpen(false);
        setSelectedProduct(undefined)
       }} product={selectedProduct}  
       />

      <DataTable
        columns={columns({ onEdit, onDelete })}
        data={productData?.data ?? []}
      />

      <div className="flex justify-between mt-4">
        <div className="flex w-full items-center gap-2">
          <p>Rows per page</p>

          <Select
            defaultValue="10"
            onValueChange={(value) => setLimit(Number(value))}
          >
            <SelectTrigger className="w-20" id="select-rows-per-page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectGroup>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <Pagination className="flex justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage(pagination?.prevPage)}
              />
            </PaginationItem>
            {pages.map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  isActive={p === pagination?.currentPage}
                  onClick={() => setPage(p)}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext onClick={() => setPage(pagination?.nextPage)} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default Product;