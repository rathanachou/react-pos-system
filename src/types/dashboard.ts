// types/dashboard.ts

export interface IPeriodSales {
  totalSales: number;
  totalOrders: number;
}

export interface ILowStockProduct {
  id: number;
  name: string;
  qty: number;
  price: number;
}

export interface ITopProduct {
  productName: string;
  totalQty: number;
  totalAmount: number;
}


export interface IDashboardSummary {
  today: IPeriodSales;
  weekly: IPeriodSales;
  monthly: IPeriodSales;
  totalProducts: number;
  totalCustomers: number;
  lowStock: ILowStockProduct[];
  topProducts: ITopProduct[];
}

export interface IMonthlySale {
  month: string;
  totalSales: number;
  totalOrders: number;
}

export interface ICategorySale {
  category: string;
  totalSales: number;
  totalOrders: number;
}