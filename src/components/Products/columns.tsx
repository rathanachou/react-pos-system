"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { Button } from "../../components/ui/button";
import { MoreHorizontal, SquarePen, Trash2, } from "lucide-react";
import type { IProduct } from "../../types/product";

interface Props  {
  onEdit: ( product: IProduct) => void;
  onDelete: ( product: IProduct) => void;
}

  export const columns  = ( {onEdit , onDelete }: Props ): ColumnDef<IProduct>[] => [
  {
    accessorKey: "No",
     cell: ({ row }) => <div>{row.index + 1}</div>,
  },
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    header: "Image",
    cell: ({ row }) => (
      <div>
        <img
          className="aspect-square w-[100px] h-[100px]"
          src={row.original.productImages?.[0]?.imageUrl ?? "/no-image.png"}
        />
      </div>
    ),
  },

   {
    accessorKey: "title",
    header: "ProductName",
    cell: ({row}) => <div>{row.original.name}</div>
  },
  {
    header: "Category",
    cell: ({row}) => 
    (
      <div>
        <Badge className="bg-blue-500"> {row.original.category?.name || "No Category"}</Badge>
      </div>
    ),
  },
 
  
  {
    accessorKey: "price",
    header: "Price",
    cell: ({row}) => 
    (
      <div>
        <Badge className="bg-blue-500">{row.original.price}</Badge>
      </div>
    ),
  },
  {
    header: "qty",
    cell: ({row}) =>
      <div>
        <Badge className="bg-blue-500">{row.original.qty}</Badge>
      </div>     
  },

 
 {
    id: "actions",
    cell: ({ row }) => {
      console.log('row', row)
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem  onClick={ () =>  onEdit(row.original)}><SquarePen /> Edit</DropdownMenuItem>
            <DropdownMenuItem  onClick={ () =>   onDelete(row.original) }>< Trash2  className="text-red-500"/> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
];