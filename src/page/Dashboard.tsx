import { useDashboard } from "@/hooks/useDashboard";
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6"];

export default function Dashboard() {
  const {
    summary,
    monthlySales,
    topProducts,
    categoryData,
    loading,
  } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">⏳ Loading Dashboard...</p>
      </div>
    );
  }

  

  return (
    <div className="p-6 space-y-6">

      {/* ─── Title ─────────────────────────────────── */}
      <h1 className="text-2xl font-bold text-gray-800">
        📊 Mini Mart Dashboard
      </h1>

      {/* ─── Summary Cards ──────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Today Sales"
          value={`$${Number(summary?.today?.totalSales ?? 0).toFixed(2)}`}
          sub={`${summary?.today?.totalOrders ?? 0} Orders`}
          color="bg-indigo-500"
          icon="💰"
        />
        <SummaryCard
          title="Weekly Sales"
          value={`$${Number(summary?.weekly?.totalSales ?? 0).toFixed(2)}`}
          sub={`${summary?.weekly?.totalOrders ?? 0} Orders`}
          color="bg-green-500"
          icon="📅"
        />
        <SummaryCard
          title="Monthly Sales"
          value={`$${Number(summary?.monthly?.totalSales ?? 0).toFixed(2)}`}
          sub={`${summary?.monthly?.totalOrders ?? 0} Orders`}
          color="bg-yellow-500"
          icon="📆"
        />
        <SummaryCard
          title="Total Products"
          value={summary?.totalProducts ?? 0}
          sub={`${summary?.totalCustomers ?? 0} Customers`}
          color="bg-blue-500"
          icon="📦"
        />
      </div>

      {/* ─── Line Chart: Monthly Sales ──────────────── */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          📈 Monthly Sales
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlySales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" /> 
            <YAxis />
           
            <Tooltip
              formatter={(value) => [
                `$${Number(value ?? 0).toFixed(2)}`,
                "Sales"
              ]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="totalSales"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Total Sales"
            />
            <Line
              type="monotone"
              dataKey="totalOrders"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Total Orders"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ─── Bar Chart: Top Products ───────────────── */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            🏆 Top 5 Products
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="productName" />
              <YAxis />
             
              <Tooltip
                formatter={(value) => [
                  Number(value ?? 0),
                  "Qty Sold"
                ]}
              />
              <Legend />
              <Bar
                dataKey="totalQty"
                fill="#6366f1"
                name="Qty Sold"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="totalAmount"
                fill="#22c55e"
                name="Revenue ($)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ─── Pie Chart: Sales by Category ─────────── */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            🥧 Revenue by Category
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
               data={categoryData}
               dataKey="totalSales"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}        
                label={(props) => {
                  const name = props.name ?? "";
                  const percent = props.percent ?? 0
                  return `${name} ${(percent * 100).toFixed(0)}%`;
                }}
              >
                {categoryData?.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
          
              <Tooltip
                formatter={(value) => [
                  `$${Number(value ?? 0).toFixed(2)}`,
                  "Revenue"
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── Low Stock Alert ────────────────────────── */}
      {(summary?.lowStock?.length ?? 0) > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-red-500">
            ⚠️ Low Stock Alert
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-red-50 text-red-600">
                <th className="p-2 text-left">Product</th>
                <th className="p-2 text-center">Qty Left</th>
                <th className="p-2 text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {summary?.lowStock?.map((product: any) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{product.name}</td>
                  <td className="p-2 text-center">
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-bold">
                      {product.qty} left
                    </span>
                  </td>
                  <td className="p-2 text-right">
                    ${Number(product.price).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}

// ─── Summary Card Component ───────────────────────────────
interface SummaryCardProps {
  title: string;
  value: string | number;
  sub: string;
  color: string;
  icon: string;
}

function SummaryCard({ title, value, sub, color, icon }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
      <div className={`${color} text-white text-2xl p-3 rounded-lg`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
        <p className="text-gray-400 text-xs">{sub}</p>
      </div>
    </div>
  );
}
