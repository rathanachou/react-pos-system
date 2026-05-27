import { useEffect, useState } from "react";
import {
  BarChart, Bar,
  XAxis, YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getMonthlySales,
  getTopProducts,
} from "@/service/dashboard.service";

export default function Reports() {
  const [monthlySales, setMonthlySales] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [monthly, top] = await Promise.all([
          getMonthlySales(),
          getTopProducts(10),
        ]);
        setMonthlySales((monthly as any)?.data || []);
        setTopProducts((top as any)?.data || []);
      } catch (error) {
        console.error("Reports error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">⏳ Loading Reports...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">📈 Sales Reports</h1>

      {/* Monthly Sales */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">📅 Monthly Sales</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlySales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, "Sales"]} />
            <Legend />
            <Bar dataKey="totalSales" fill="#6366f1" name="Sales ($)" radius={[4,4,0,0]} />
            <Bar dataKey="totalOrders" fill="#22c55e" name="Orders" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">🏆 Top Products</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topProducts}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="productName" />
            <YAxis />
            <Tooltip formatter={(value) => [Number(value ?? 0), "Qty"]} />
            <Legend />
            <Bar dataKey="totalQty" fill="#f59e0b" name="Qty Sold" radius={[4,4,0,0]} />
            <Bar dataKey="totalAmount" fill="#3b82f6" name="Revenue ($)" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}