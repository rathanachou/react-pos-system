import { useState, useEffect } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  AlertTriangle,
  RefreshCw,
  Calendar,
  BarChart3,
  Activity,
  Sun,
  Moon,
} from "lucide-react";

// ── Dark / Light mode hook ─────────────────────────────────
function useDarkMode() {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem("dashboard-theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    localStorage.setItem("dashboard-theme", dark ? "dark" : "light");
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return { dark, toggle: () => setDark((d) => !d) };
}

// ── Theme tokens ───────────────────────────────────────────
// Light = Arctic Blue  |  Dark = Midnight Indigo
function useTheme(dark: boolean) {
  return {
    // backgrounds
    pageBg:    dark ? "#0f1117"  : "#f0f4ff",
    cardBg:    dark ? "#1a1d2e"  : "#ffffff",
    cardBorder:dark ? "#252840"  : "#dbeafe",
    hoverBg:   dark ? "#252840"  : "#eff6ff",

    // text
    textPrimary:   dark ? "#f1f5f9"  : "#0f172a",
    textSecondary: dark ? "#94a3b8"  : "#374151",
    textMuted:     dark ? "#475569"  : "#6b7280",

    // chart internals
    gridColor: dark ? "rgba(255,255,255,0.05)" : "rgba(59,130,246,0.08)",
    tickColor: dark ? "#475569" : "#9ca3af",
    tooltipBg: dark ? "#1e2235" : "#ffffff",
    tooltipBorder: dark ? "#2d3148" : "#dbeafe",
    tooltipText: dark ? "#e2e8f0" : "#0f172a",
    tooltipMuted: dark ? "#94a3b8" : "#6b7280",
    axisLine:  dark ? "rgba(255,255,255,0.08)" : "rgba(59,130,246,0.15)",

    // low stock card
    stockBg:     dark ? "#1a1520" : "#fff5f5",
    stockBorder: dark ? "rgba(153,27,27,0.4)" : "#fecaca",
    stockRow:    dark ? "#1e1520" : "#fff1f1",

    // refresh btn
    btnBg:     dark ? "#1a1d2e" : "#eff6ff",
    btnBorder: dark ? "#252840" : "#bfdbfe",
    btnText:   dark ? "#94a3b8" : "#3b82f6",
    btnHover:  dark ? "#252840" : "#dbeafe",

    // toggle btn
    toggleBg:     dark ? "#252840" : "#dbeafe",
    toggleText:   dark ? "#fbbf24" : "#3b82f6",
  };
}

// ── Chart color palette — Arctic Blue ─────────────────────
const CHART_COLORS = ["#3b82f6", "#06b6d4", "#8b5cf6", "#f59e0b", "#10b981"];

// ── Custom Tooltip ─────────────────────────────────────────
const CustomTooltip = ({
  active,
  payload,
  label,
  dark,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  dark: boolean;
}) => {
  const t = useTheme(dark);
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: t.tooltipBg,
        border: `1px solid ${t.tooltipBorder}`,
        borderRadius: 10,
        padding: "10px 14px",
        fontSize: 12,
        color: t.tooltipText,
        boxShadow: dark ? "none" : "0 4px 24px rgba(0,0,0,0.08)",
      }}
    >
      <p style={{ marginBottom: 6, color: t.tooltipMuted, fontWeight: 600 }}>
        {label}
      </p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color, margin: "2px 0" }}>
          {p.name}:{" "}
          <span style={{ fontWeight: 700 }}>
            {p.name.toLowerCase().includes("sales") ||
            p.name.toLowerCase().includes("revenue")
              ? `$${Number(p.value ?? 0).toFixed(2)}`
              : Number(p.value ?? 0)}
          </span>
        </p>
      ))}
    </div>
  );
};

// ── Dashboard ──────────────────────────────────────────────
export default function Dashboard() {
  const { dark, toggle } = useDarkMode();
  const t = useTheme(dark);

  const {
    summary,
    monthlySales,
    topProducts,
    categoryData,
    dailySales,
    loading,
    error,
    refetch,
  } = useDashboard();

  const axisProps = {
    tick: { fill: t.tickColor, fontSize: 11 },
    axisLine: { stroke: t.axisLine },
    tickLine: false as const,
  };

  const gridProps = {
    strokeDasharray: "3 3",
    stroke: t.gridColor,
    vertical: false,
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{ background: t.pageBg }}
      >
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin" style={{ color: "#3b82f6" }} />
          <p
            className="text-sm tracking-widest uppercase"
            style={{ color: t.textMuted }}
          >
            Loading Dashboard…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center h-screen gap-4"
        style={{ background: t.pageBg }}
      >
        <div className="p-4 rounded-full bg-red-500/10">
          <AlertTriangle className="h-10 w-10 text-red-400" />
        </div>
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={refetch}
          className="flex items-center gap-2 text-white px-5 py-2 rounded-xl text-sm transition-colors"
          style={{ background: "#3b82f6" }}
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-6 space-y-5 transition-colors duration-300"
      style={{ background: t.pageBg, color: t.textPrimary }}
    >
      {/* ── Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "#3b82f6", boxShadow: "0 4px 14px rgba(59,130,246,0.35)" }}>
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1
              className="text-base font-semibold tracking-wide"
              style={{ color: t.textPrimary }}
            >
              LAVARSTORE
            </h1>
            <p className="text-xs" style={{ color: t.textMuted }}>
              Sales Dashboard · Live
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* ── Dark / Light toggle ── */}
          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
            style={{
              background: t.toggleBg,
              color: t.toggleText,
              border: `1px solid ${t.cardBorder}`,
            }}
          >
            {dark ? (
              <>
                <Sun className="h-3.5 w-3.5" />
                Light
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5" />
                Dark
              </>
            )}
          </button>

          {/* ── Refresh ── */}
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all duration-200"
            style={{
              background: t.btnBg,
              border: `1px solid ${t.btnBorder}`,
              color: t.btnText,
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Summary Cards ──────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="Today Sales"
          value={`$${Number(summary?.today?.totalSales ?? 0).toFixed(2)}`}
          sub={`${summary?.today?.totalOrders ?? 0} orders`}
          icon={<DollarSign className="h-4 w-4" />}
          accent="#3b82f6"
          t={t}
        />
        <MetricCard
          label="Weekly Sales"
          value={`$${Number(summary?.weekly?.totalSales ?? 0).toFixed(2)}`}
          sub={`${summary?.weekly?.totalOrders ?? 0} orders`}
          icon={<TrendingUp className="h-4 w-4" />}
          accent="#06b6d4"
          t={t}
        />
        <MetricCard
          label="Monthly Sales"
          value={`$${Number(summary?.monthly?.totalSales ?? 0).toFixed(2)}`}
          sub={`${summary?.monthly?.totalOrders ?? 0} orders`}
          icon={<Calendar className="h-4 w-4" />}
          accent="#f59e0b"
          t={t}
        />
        <MetricCard
          label="Products"
          value={summary?.totalProducts ?? 0}
          sub={`${summary?.totalCustomers ?? 0} customers`}
          icon={<Package className="h-4 w-4" />}
          accent="#8b5cf6"
          t={t}
        />
      </div>

      {/* ── Daily Sales Strip ───────────────────────── */}
      {dailySales?.summary && (
        <div
          className="rounded-2xl p-4 transition-colors duration-300"
          style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4" style={{ color: "#3b82f6" }} />
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#3b82f6" }}>
              Today's Detail — {dailySales.date}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <DailyStat
              label="Total Orders"
              value={String(dailySales.summary.totalOrders)}
              icon={<ShoppingCart className="h-4 w-4" />}
              color="#3b82f6"
              bg="rgba(59,130,246,0.08)"
            />
            <DailyStat
              label="Total Sales"
              value={`$${Number(dailySales.summary.totalSales).toFixed(2)}`}
              icon={<DollarSign className="h-4 w-4" />}
              color="#06b6d4"
              bg="rgba(6,182,212,0.08)"
            />
            <DailyStat
              label="Discount"
              value={`-$${Number(dailySales.summary.totalDiscount).toFixed(2)}`}
              icon={<TrendingUp className="h-4 w-4" />}
              color="#f59e0b"
              bg="rgba(245,158,11,0.08)"
            />
            <DailyStat
              label="Net Sales"
              value={`$${Number(dailySales.summary.netSales).toFixed(2)}`}
              icon={<BarChart3 className="h-4 w-4" />}
              color="#8b5cf6"
              bg="rgba(139,92,246,0.08)"
            />
          </div>
        </div>
      )}

      {/* ── Monthly Sales Line Chart ─────────────────── */}
      <ChartCard
        title="Monthly Sales"
        icon={<TrendingUp className="h-4 w-4" style={{ color: "#3b82f6" }} />}
        t={t}
      >
        <ResponsiveContainer width="100%" height={260}>
          <LineChart
            data={monthlySales}
            margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
          >
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="month" {...axisProps} />
            <YAxis
              {...axisProps}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip dark={dark} />} />
            <Legend
              wrapperStyle={{ fontSize: 11, color: t.tickColor, paddingTop: 8 }}
            />
            <Line
              type="monotone"
              dataKey="totalSales"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              name="Total Sales"
            />
            <Line
              type="monotone"
              dataKey="totalOrders"
              stroke="#06b6d4"
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={{ r: 3, fill: "#06b6d4", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              name="Total Orders"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ── Bottom Charts ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Products horizontal bar */}
        <ChartCard
          title="Top Products"
          icon={<Package className="h-4 w-4" style={{ color: "#f59e0b" }} />}
          t={t}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={topProducts}
              layout="vertical"
              margin={{ top: 0, right: 12, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                {...gridProps}
                horizontal={false}
                vertical={true}
              />
              <XAxis type="number" {...axisProps} />
              <YAxis
                type="category"
                dataKey="productName"
                width={90}
                tick={{ fill: t.tickColor, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip dark={dark} />} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: t.tickColor, paddingTop: 8 }}
              />
              <Bar
                dataKey="totalQty"
                fill="#06b6d4"
                name="Qty Sold"
                radius={[0, 5, 5, 0]}
              />
              <Bar
                dataKey="totalAmount"
                fill="#3b82f6"
                name="Revenue ($)"
                radius={[0, 5, 5, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Category donut */}
        <ChartCard
          title="Revenue by Category"
          icon={<BarChart3 className="h-4 w-4" style={{ color: "#8b5cf6" }} />}
          t={t}
        >
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="totalSales"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={3}
                label={({ percent }) =>
                  percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ""
                }
                labelLine={{ stroke: t.tickColor, strokeWidth: 1 }}
              >
                {categoryData?.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: t.tooltipBg,
                  border: `1px solid ${t.tooltipBorder}`,
                  borderRadius: 10,
                  color: t.tooltipText,
                  fontSize: 12,
                }}
                formatter={(value) => [
                  `$${Number(value ?? 0).toFixed(2)}`,
                  "Revenue",
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, color: t.tickColor, paddingTop: 8 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Low Stock Alert ───────────────────────────── */}
      {(summary?.lowStock?.length ?? 0) > 0 && (
        <div
          className="rounded-2xl p-5 transition-colors duration-300"
          style={{
            background: t.stockBg,
            border: `1px solid ${t.stockBorder}`,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <h2 className="text-xs font-semibold text-red-400 uppercase tracking-widest">
              Low Stock Alert
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${t.stockBorder}` }}>
                <th
                  className="pb-2 text-left text-[10px] uppercase tracking-widest font-semibold"
                  style={{ color: t.textMuted }}
                >
                  Product
                </th>
                <th
                  className="pb-2 text-center text-[10px] uppercase tracking-widest font-semibold"
                  style={{ color: t.textMuted }}
                >
                  Qty Left
                </th>
                <th
                  className="pb-2 text-right text-[10px] uppercase tracking-widest font-semibold"
                  style={{ color: t.textMuted }}
                >
                  Price
                </th>
              </tr>
            </thead>
            <tbody>
              {summary?.lowStock?.map((product) => (
                <tr
                  key={product.id}
                  className="transition-colors"
                  style={{ borderBottom: `1px solid ${t.stockRow}` }}
                >
                  <td
                    className="py-3 flex items-center gap-2"
                    style={{ color: t.textSecondary }}
                  >
                    <Package className="h-4 w-4" style={{ color: t.textMuted }} />
                    {product.name}
                  </td>
                  <td className="py-3 text-center">
                    <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                      {product.qty} left
                    </span>
                  </td>
                  <td
                    className="py-3 text-right font-semibold"
                    style={{ color: t.textSecondary }}
                  >
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

// ── MetricCard ─────────────────────────────────────────────
interface Theme {
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textMuted: string;
  [key: string]: string;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  accent: string;
  t: Theme;
}

function MetricCard({ label, value, sub, icon, accent, t }: MetricCardProps) {
  return (
    <div
      className="rounded-2xl p-4 relative overflow-hidden transition-colors duration-300"
      style={{
        background: t.cardBg,
        border: `1px solid ${t.cardBorder}`,
        borderTopColor: accent,
        borderTopWidth: 2,
      }}
    >
      <div
        className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-10 blur-xl pointer-events-none"
        style={{ background: accent, transform: "translate(30%,-30%)" }}
      />
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
        style={{ background: `${accent}20`, color: accent }}
      >
        {icon}
      </div>
      <p
        className="text-[10px] uppercase tracking-widest font-semibold mb-1"
        style={{ color: t.textMuted }}
      >
        {label}
      </p>
      <p className="text-xl font-bold" style={{ color: t.textPrimary }}>
        {value}
      </p>
      <p className="text-[11px] mt-0.5" style={{ color: t.textMuted }}>
        {sub}
      </p>
    </div>
  );
}

// ── DailyStat ──────────────────────────────────────────────
interface DailyStatProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

function DailyStat({ label, value, icon, color, bg }: DailyStatProps) {
  return (
    <div
      className="rounded-xl p-3 flex items-center gap-3"
      style={{ background: bg }}
    >
      <div style={{ color }}>{icon}</div>
      <div>
        <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-500">
          {label}
        </p>
        <p className="text-base font-bold mt-0.5" style={{ color }}>
          {value}
        </p>
      </div>
    </div>
  );
}

// ── ChartCard ──────────────────────────────────────────────
interface ChartCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  t: Theme;
}

function ChartCard({ title, icon, children, t }: ChartCardProps) {
  return (
    <div
      className="rounded-2xl p-5 transition-colors duration-300"
      style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}
    >
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: t.textSecondary }}
        >
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}