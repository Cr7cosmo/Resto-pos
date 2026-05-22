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
  <div className="min-h-screen bg-gray-950 text-white flex flex-col">

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
            <span className="text-gray-400 text-sm hidden sm:block">{connected ? "Live" : "Offline"}</span>
          </div>
          <button onClick={fetchOrders} className="bg-gray-800 hover:bg-gray-700 transition px-3 py-1.5 rounded-xl text-sm">
            Refresh
          </button>
        </div>
      </div>

      {/* TABS — mobile only */}
      <div className="flex md:hidden border-t border-gray-800 overflow-x-auto scrollbar-none">
        {COLUMNS.map(({ key, label }) => {
          const count = orders.filter((o) => o.orderStatus === key).length;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 min-w-max px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-all border-b-2 ${
                activeTab === key
                  ? "border-orange-500 text-orange-400"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              {label}
              {count > 0 && (
                <span className="ml-1.5 bg-orange-500/20 text-orange-400 text-xs rounded-full px-1.5 py-0.5">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>

    {/* KANBAN BOARD */}
    <div className="flex-1 p-4 pb-24 md:pb-4 overflow-hidden">

      {/* MOBILE: single active tab */}
      <div className="md:hidden">
        {COLUMNS.filter(({ key }) => key === activeTab).map(({ key, label, color }) => {
          const colOrders = orders.filter((o) => o.orderStatus === key);
          return (
            <div key={key} className={`bg-gray-900 border ${color} rounded-2xl p-4`}>
              <div className="space-y-3">
                {colOrders.length === 0 ? (
                  <div className="text-center py-16 text-gray-600">
                    <div className="text-4xl mb-2">🍽️</div>
                    <p>No orders here</p>
                  </div>
                ) : (
                  colOrders.map((order) => (
                    <OrderCard key={order._id} order={order} showActions onStatusUpdate={updateStatus} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP: all columns side by side */}
      <div className="hidden md:flex gap-4 overflow-x-auto pb-4 h-full">
        {COLUMNS.map(({ key, label, color }) => {
          const colOrders = orders.filter((o) => o.orderStatus === key);
          return (
            <div key={key} className={`bg-gray-900 border ${color} rounded-2xl p-4 min-w-[300px] max-w-[360px] flex-shrink-0 flex flex-col`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">{label}</h2>
                <span className="bg-gray-800 text-gray-400 text-xs rounded-full px-2 py-1">{colOrders.length}</span>
              </div>
              <div className="space-y-3 overflow-y-auto flex-1">
                {colOrders.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">No orders</div>
                ) : (
                  colOrders.map((order) => (
                    <OrderCard key={order._id} order={order} showActions onStatusUpdate={updateStatus} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);
}