import { useState, useEffect } from "react";

import { useSocket } from "../context/SocketContext";
import { useToast } from "../components/Toast";
import { useSound } from "../hooks/useSound";

import api from "../services/api";

import OrderCard from "../components/OrderCard";
import Loader from "../components/Loader";

const COLUMNS = [
  {
    key: "pending",
    label: "🆕 New Orders",
    color: "border-yellow-500/40",
  },

  {
    key: "accepted",
    label: "✅ Accepted",
    color: "border-blue-500/40",
  },

  {
    key: "preparing",
    label: "👨‍🍳 Preparing",
    color: "border-orange-500/40",
  },

  {
    key: "ready",
    label: "🔔 Ready",
    color: "border-green-500/40",
  },
];

export default function KitchenDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");


  const { socket, connected } = useSocket();

  const { toast } = useToast();

  const { playNotification } = useSound();

  // FETCH ORDERS
  const fetchOrders = async () => {
    try {
      const res = await api.get("/admin/live-orders");

      setOrders(res.data.data);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  // INITIAL LOAD
  useEffect(() => {
    fetchOrders();

    if (socket) {
      socket.emit("joinKitchen");
    }
  }, [socket]);

  // SOCKET EVENTS
  useEffect(() => {
    if (!socket) return;

    const handleNew = (order) => {
      setOrders((prev) => {
        const exists = prev.find((o) => o._id === order._id);

        return exists ? prev : [order, ...prev];
      });

      playNotification();

      toast(
        `🆕 New order from Table ${order.tableNumber}!`,
        "info"
      );
    };

    const handleUpdate = (order) => {
      setOrders((prev) => {
        const filtered = prev.filter(
          (o) =>
            !["served", "completed", "cancelled"].includes(
              order.orderStatus
            )
        );

        const updated = filtered.map((o) =>
          o._id === order._id ? order : o
        );

        return updated.some((o) => o._id === order._id)
          ? updated
          : filtered;
      });

      // REMOVE SERVED ORDERS
      if (
        ["served", "completed"].includes(order.orderStatus)
      ) {
        setOrders((prev) =>
          prev.filter((o) => o._id !== order._id)
        );
      }
    };

    socket.on("newOrder", handleNew);

    socket.on("orderUpdated", handleUpdate);

    return () => {
      socket.off("newOrder", handleNew);

      socket.off("orderUpdated", handleUpdate);
    };
  }, [socket]);

  // UPDATE STATUS
  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, {
        status,
      });

      toast(`Order marked as ${status}`, "success");
    } catch {
      toast("Failed to update status", "error");
    }
  };

  if (loading) {
    return <Loader text="Loading kitchen orders..." />;
  }

  return (
  <div className="min-h-screen bg-gray-950 text-white">

    {/* TOP NAVBAR */}
    <header className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <h1 className="text-xl font-bold">👨‍🍳 Kitchen Dashboard</h1>
          <p className="text-gray-400 text-xs">{orders.length} active orders</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            <span className="text-gray-400 text-sm">{connected ? "Live" : "Offline"}</span>
          </div>
          <button onClick={fetchOrders} className="bg-gray-800 hover:bg-gray-700 transition px-3 py-1.5 rounded-xl text-sm">
            Refresh
          </button>
        </div>
      </div>
    </header>

    {/* ORDERS LIST */}
    <div className="p-4 pb-24 space-y-3">
      {orders.length === 0 ? (
        <div className="text-center py-24 text-gray-600">
          <div className="text-5xl mb-3">🍽️</div>
          <p>No active orders</p>
        </div>
      ) : (
        orders.map((order) => (
          <OrderCard
            key={order._id}
            order={order}
            showActions
            onStatusUpdate={updateStatus}
          />
        ))
      )}
    </div>

  </div>
);
}