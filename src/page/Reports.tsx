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
  getDailySales,
} from "@/service/dashboard.service";
import type {
  IDailySales,
  IOrderWithDetails,
} from "@/types/dashboard";

export default function Reports() {
  const [monthlySales, setMonthlySales] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [dailySales, setDailySales] = useState<IDailySales | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  // Fetch monthly & top products once
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

  // Fetch daily sales whenever date changes
  useEffect(() => {
    const fetchDaily = async () => {
      setDailyLoading(true);
      try {
        const res = await getDailySales(selectedDate);
        setDailySales((res as any)?.data ?? res);
      } catch (error) {
        console.error("Daily sales error:", error);
        setDailySales(null);
      } finally {
        setDailyLoading(false);
      }
    };
    fetchDaily();
  }, [selectedDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">⏳ Loading Reports...</p>
      </div>
    );
  }

  const summary = dailySales?.summary;
  const orders: IOrderWithDetails[] = dailySales?.data ?? [];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">📈 Sales Reports</h1>

      {/* ── Daily Report ── */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-semibold">📅 Daily Report</h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {dailyLoading ? (
          <p className="text-gray-400 text-sm">⏳ Loading daily data...</p>
        ) : !dailySales ? (
          <p className="text-gray-400 text-sm">No data for this date.</p>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SummaryCard
                label="Total Orders"
                value={String(summary?.totalOrders ?? 0)}
                icon="🧾"
                color="bg-indigo-50 text-indigo-700"
              />
              <SummaryCard
                label="Total Sales"
                value={`$${Number(summary?.totalSales ?? 0).toFixed(2)}`}
                icon="💰"
                color="bg-green-50 text-green-700"
              />
              <SummaryCard
                label="Discount"
                value={`$${Number(summary?.totalDiscount ?? 0).toFixed(2)}`}
                icon="🏷️"
                color="bg-yellow-50 text-yellow-700"
              />
              <SummaryCard
                label="Net Sales"
                value={`$${Number(summary?.netSales ?? 0).toFixed(2)}`}
                icon="✅"
                color="bg-blue-50 text-blue-700"
              />
            </div>

            {/* Orders Table */}
            {orders.length === 0 ? (
              <p className="text-gray-400 text-sm">No orders found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-left">
                      <th className="px-4 py-2 font-medium">#</th>
                      <th className="px-4 py-2 font-medium">Order No.</th>
                      <th className="px-4 py-2 font-medium">Total</th>
                      <th className="px-4 py-2 font-medium">Discount</th>
                      <th className="px-4 py-2 font-medium">Date</th>
                      <th className="px-4 py-2 font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, idx) => (
                      <>
                        <tr
                          key={order.id}
                          className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-2 text-gray-400">{idx + 1}</td>
                          <td className="px-4 py-2 font-medium text-gray-700">
                            {order.orderNumber}
                          </td>
                          <td className="px-4 py-2 text-green-600 font-semibold">
                            ${Number(order.total).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-yellow-600">
                            ${Number(order.discount).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-gray-500">
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-4 py-2">
                            <button
                              onClick={() =>
                                setExpandedOrder(
                                  expandedOrder === order.id ? null : order.id
                                )
                              }
                              className="text-indigo-500 hover:text-indigo-700 text-xs underline"
                            >
                              {expandedOrder === order.id ? "Hide" : "View"}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded order detail rows */}
                        {expandedOrder === order.id &&
                          order.orderDetails.map((item) => (
                            <tr
                              key={item.id}
                              className="bg-indigo-50 text-xs text-gray-600"
                            >
                              <td />
                              <td
                                className="px-6 py-1.5 italic text-gray-500"
                                colSpan={1}
                              >
                                ↳ {item.productName}
                              </td>
                              <td className="px-4 py-1.5">
                                ${Number(item.productPrice).toFixed(2)} × {item.qty}
                              </td>
                              <td className="px-4 py-1.5 text-green-600 font-medium">
                                ${Number(item.amount).toFixed(2)}
                              </td>
                              <td colSpan={2} />
                            </tr>
                          ))}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Monthly Sales ── */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">📆 Monthly Sales</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlySales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              formatter={(value) => [
                `$${Number(value ?? 0).toFixed(2)}`,
                "Sales",
              ]}
            />
            <Legend />
            <Bar dataKey="totalSales" fill="#6366f1" name="Sales ($)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="totalOrders" fill="#22c55e" name="Orders" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Top Products ── */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">🏆 Top Products</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topProducts}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="productName" />
            <YAxis />
            <Tooltip formatter={(value) => [Number(value ?? 0), "Qty"]} />
            <Legend />
            <Bar dataKey="totalQty" fill="#f59e0b" name="Qty Sold" radius={[4, 4, 0, 0]} />
            <Bar dataKey="totalAmount" fill="#3b82f6" name="Revenue ($)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Small reusable summary card
function SummaryCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <div className={`rounded-lg p-4 ${color} flex flex-col gap-1`}>
      <span className="text-xl">{icon}</span>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}