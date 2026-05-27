import { useState, useEffect } from "react";
import {
  getDashboardSummary,
  getMonthlySales,
  getSalesByCategory,
} from "../service/dashboard.service";
import type {
  IDashboardSummary,
  IMonthlySale,
  ICategorySale,
} from "../types/dashboard";

export const useDashboard = () => {
  const [summary, setSummary] = useState<IDashboardSummary | null>(null);
  const [monthlySales, setMonthlySales] = useState<IMonthlySale[]>([]);
  const [categoryData, setCategoryData] = useState<ICategorySale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [sum, monthly, category] = await Promise.all([
          getDashboardSummary(),
          getMonthlySales(),
          getSalesByCategory(),
        ]);

        setSummary(sum.data);
        setMonthlySales(monthly.data ?? []);
        setCategoryData(category.data ?? []);

      } catch (err) {
        console.error("Dashboard error:", err);
        setError("មានបញ្ហាក្នុងការទាញទិន្នន័យ!");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [refreshKey]);

  const refetch = () => setRefreshKey(k => k + 1);

  return {
    summary,
    monthlySales,
    today: summary?.today,
    weekly: summary?.weekly,
    monthly: summary?.monthly,
    totalProducts: summary?.totalProducts ?? 0,
    totalCustomers: summary?.totalCustomers ?? 0,
    lowStock: summary?.lowStock ?? [],
    topProducts: summary?.topProducts ?? [],
    categoryData,
    loading,
    error,
    refetch,
  };
};