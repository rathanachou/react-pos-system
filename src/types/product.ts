export interface IProduct {
  id: number;
  name:string;
  price: number;
  qty: number;
  categoryId: string;
  isActive: boolean;
  category:{
    id: number;
    name: string; 
  }
}