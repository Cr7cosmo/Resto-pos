import { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { useToast } from "../components/Toast";
import { useSound } from "../hooks/useSound";
import api from "../services/api";
import OrderCard from "../components/OrderCard";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

const COLUMNS = [
  { key: "pending",   label: "🆕 New Orders",   color: "border-yellow-500/40" },
  { key: "accepted",  label: "✅ Accepted",      color: "border-blue-500/40" },
  { key: "preparing", label: "👨‍🍳 Preparing",    color: "border-orange-500/40" },
  { key: "ready",     label: "🔔 Ready",         color: "border-green-500/40" },
];

export default function KitchenDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket, connected } = useSocket();
  const { toast } = useToast();
  const { playNotification } = useSound();

  const fetchOrders = async () => {
    try {
      const res = await api.get("/admin/live-orders");
      setOrders(res.data.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    // Join kitchen room
    if (socket) socket.emit("joinKitchen");
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleNew = (order) => {
      setOrders((prev) => {
        const exists = prev.find((o) => o._id === order._id);
        return exists ? prev : [order, ...prev];
      });
      playNotification();
      toast(`🆕 New order from Table ${order.tableNumber}!`, "info");
    };

    const handleUpdate = (order) => {
      setOrders((prev) => {
        const filtered = prev.filter(
          (o) => !["served", "completed", "cancelled"].includes(order.orderStatus)
        );
        const updated = filtered.map((o) => (o._id === order._id ? order : o));
        return updated.some((o) => o._id === order._id)
          ? updated
          : filtered;
      });
      // Remove if served
      if (["served", "completed"].includes(order.orderStatus)) {
        setOrders((prev) => prev.filter((o) => o._id !== order._id));
      }
    };

    socket.on("newOrder", handleNew);
    socket.on("orderUpdated", handleUpdate);
    return () => {
      socket.off("newOrder", handleNew);
      socket.off("orderUpdated", handleUpdate);
    };
  }, [socket]);

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      toast(`Order marked as ${status}`, "success");
    } catch {
      toast("Failed to update status", "error");
    }
  };

  if (loading) return <Loader text="Loading kitchen orders..." />;

  return (
    <div className="min-h-screen bg-gray-950 p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">👨‍🍳 Kitchen Dashboard</h1>
          <p className="text-gray-400 text-sm">{orders.length} active orders</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
          <span className="text-gray-400 text-sm">{connected ? "Live" : "Disconnected"}</span>
          <button onClick={fetchOrders} className="btn-ghost text-sm px-3 py-1.5 ml-2">Refresh</button>
        </div>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map(({ key, label, color }) => {
          const colOrders = orders.filter((o) => o.orderStatus === key);
          return (
            <div key={key} className={`bg-gray-900 border ${color} rounded-2xl p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-white text-sm">{label}</h2>
                <span className="bg-gray-800 text-gray-400 text-xs rounded-full px-2 py-0.5">{colOrders.length}</span>
              </div>
              <div className="space-y-3 min-h-32">
                {colOrders.length === 0
                  ? <p className="text-gray-600 text-xs text-center py-8">No orders</p>
                  : colOrders.map((order) => (
                      <OrderCard key={order._id} order={order} showActions onStatusUpdate={updateStatus} />
                    ))
                }
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}