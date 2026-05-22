import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

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

  // MOBILE SIDEBAR
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="min-h-screen bg-gray-950 text-white flex overflow-hidden">

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:static top-0 left-0 z-50
          h-full w-64 bg-gray-900 border-r border-gray-800
          transform transition-transform duration-300
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
          md:translate-x-0
        `}
      >
        {/* SIDEBAR HEADER */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            🍽️ RestoPOS
          </h2>

          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={22} />
          </button>
        </div>

        {/* SIDEBAR MENU */}
        <div className="p-4">
          <button className="w-full text-left bg-orange-500/20 text-orange-400 px-4 py-3 rounded-xl font-semibold">
            👨‍🍳 Kitchen
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-hidden">

        {/* TOP BAR */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-3">

            {/* HAMBURGER */}
            <button
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            <div>
              <h1 className="text-2xl font-bold">
                👨‍🍳 Kitchen Dashboard
              </h1>

              <p className="text-gray-400 text-sm">
                {orders.length} active orders
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">

            <div
              className={`w-2 h-2 rounded-full ${
                connected
                  ? "bg-green-500 animate-pulse"
                  : "bg-red-500"
              }`}
            />

            <span className="text-gray-400 text-sm hidden sm:block">
              {connected ? "Live" : "Disconnected"}
            </span>

            <button
              onClick={fetchOrders}
              className="btn-ghost text-sm px-3 py-1.5"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* KANBAN BOARD */}
        <div className="p-4 overflow-x-auto">

          <div className="flex gap-4 min-w-max">

            {COLUMNS.map(({ key, label, color }) => {
              const colOrders = orders.filter(
                (o) => o.orderStatus === key
              );

              return (
                <div
                  key={key}
                  className={`
                    bg-gray-900 border ${color}
                    rounded-2xl p-4
                    min-w-[320px]
                    max-w-[320px]
                    flex-shrink-0
                  `}
                >
                  {/* COLUMN HEADER */}
                  <div className="flex items-center justify-between mb-4">

                    <h2 className="font-semibold text-sm sm:text-base">
                      {label}
                    </h2>

                    <span className="bg-gray-800 text-gray-400 text-xs rounded-full px-2 py-0.5">
                      {colOrders.length}
                    </span>
                  </div>

                  {/* ORDERS */}
                  <div className="space-y-3">

                    {colOrders.length === 0 ? (
                      <p className="text-gray-600 text-sm text-center py-10">
                        No orders
                      </p>
                    ) : (
                      colOrders.map((order) => (
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
            })}
          </div>
        </div>
      </main>
    </div>
  );
}