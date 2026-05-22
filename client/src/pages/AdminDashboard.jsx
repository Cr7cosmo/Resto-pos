import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useSocket } from "../context/SocketContext";
import AnalyticsCard from "../components/AnalyticsCard";
import OrderCard from "../components/OrderCard";
import Loader from "../components/Loader";
import { useToast } from "../components/Toast";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [liveOrders, setLiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [aRes, oRes] = await Promise.all([
        api.get("/admin/analytics"),
        api.get("/admin/live-orders"),
      ]);
      setAnalytics(aRes.data.data);
      setLiveOrders(oRes.data.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    if (socket) socket.emit("joinAdmin");
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    const handler = () => { fetchData(); };
    socket.on("newOrder", handler);
    socket.on("orderUpdated", handler);
    return () => { socket.off("newOrder", handler); socket.off("orderUpdated", handler); };
  }, [socket]);

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      toast(`Status updated to ${status}`, "success");
      fetchData();
    } catch { toast("Failed to update", "error"); }
  };

  if (loading) return <Loader text="Loading dashboard..." />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">📊 Dashboard</h1>
        <button onClick={fetchData} className="btn-ghost text-sm">Refresh</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard icon="🧾" label="Orders Today" value={analytics?.totalOrdersToday || 0} color="text-blue-400" />
        <AnalyticsCard icon="💰" label="Revenue Today" value={`₹${analytics?.revenueToday?.toFixed(0) || 0}`} color="text-green-400" />
        <AnalyticsCard icon="🪑" label="Active Tables" value={`${analytics?.activeTables || 0}/${analytics?.totalTables || 0}`} color="text-orange-400" />
        <AnalyticsCard icon="⭐" label="Top Dish" value={analytics?.popularItems?.[0]?.name || "—"} color="text-yellow-400" />
      </div>

      {/* Live Orders + Popular Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">🔴 Live Orders ({liveOrders.length})</h2>
            <Link to="/kitchen" className="text-orange-400 text-sm hover:underline">Kitchen View →</Link>
          </div>
          {liveOrders.length === 0 ? (
            <div className="card p-8 text-center">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-gray-400">No active orders right now</p>
            </div>
          ) : (
            <div className="space-y-3">
              {liveOrders.slice(0, 5).map((order) => (
                <OrderCard key={order._id} order={order} showActions onStatusUpdate={updateStatus} />
              ))}
            </div>
          )}
        </div>

        {/* Popular Items */}
        <div>
          <h2 className="font-semibold text-white mb-4">🏆 Popular Items</h2>
          <div className="card p-4 space-y-3">
            {analytics?.popularItems?.length === 0 && <p className="text-gray-500 text-sm">No data yet</p>}
            {analytics?.popularItems?.map((item, i) => (
              <div key={item._id} className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-600 w-6">#{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.orderCount} orders · ₹{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}