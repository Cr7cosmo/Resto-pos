import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import api from "../services/api";
import AnalyticsCard from "../components/AnalyticsCard";
import Loader from "../components/Loader";

const PIE_COLORS = ["#f97316", "#3b82f6", "#22c55e", "#a855f7", "#f59e0b", "#ef4444"];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/analytics").then((res) => { setData(res.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading analytics..." />;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">📈 Analytics</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard icon="🧾" label="Orders Today" value={data?.totalOrdersToday || 0} color="text-blue-400" />
        <AnalyticsCard icon="💰" label="Revenue Today" value={`₹${data?.revenueToday?.toFixed(0) || 0}`} color="text-green-400" />
        <AnalyticsCard icon="🪑" label="Active Tables" value={`${data?.activeTables}/${data?.totalTables}`} color="text-orange-400" />
        <AnalyticsCard icon="⭐" label="Top Item" value={data?.popularItems?.[0]?.name || "—"} color="text-yellow-400" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-4">Revenue (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.last7Days || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }} />
              <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-4">Orders (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data?.last7Days || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }} />
              <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Popular Items + Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Items */}
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-4">🏆 Popular Items</h2>
          <div className="space-y-3">
            {data?.popularItems?.map((item, i) => (
              <div key={item._id} className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-600 w-8">#{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{item.name}</p>
                  <div className="w-full bg-gray-800 rounded-full h-1.5 mt-1">
                    <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${Math.min((item.orderCount / (data.popularItems[0].orderCount || 1)) * 100, 100)}%` }} />
                  </div>
                </div>
                <span className="text-orange-400 text-sm font-semibold">{item.orderCount} orders</span>
              </div>
            ))}
          </div>
        </div>

        {/* Orders by Status Pie */}
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-4">Orders by Status</h2>
          {(data?.ordersByStatus?.length || 0) === 0 ? (
            <div className="text-center py-12 text-gray-500">No order data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.ordersByStatus.map((s) => ({ name: s._id, value: s.count }))} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {data.ordersByStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}