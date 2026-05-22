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
      <div className="flex items-center justify-between px-4 py-4">

        {/* LEFT */}
        <div>
          <h1 className="text-2xl font-bold">
            👨‍🍳 Kitchen Dashboard
          </h1>

          <p className="text-gray-400 text-sm">
            {orders.length} active orders
          </p>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                connected
                  ? "bg-green-500 animate-pulse"
                  : "bg-red-500"
              }`}
            />

            <span className="text-gray-400 text-sm hidden sm:block">
              {connected ? "Live" : "Offline"}
            </span>
          </div>

          <button
            onClick={fetchOrders}
            className="bg-gray-800 hover:bg-gray-700 transition px-4 py-2 rounded-xl text-sm"
          >
            Refresh
          </button>
        </div>
      </div>
    </header>

    {/* KANBAN BOARD */}
    <div className="p-4">

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">

        {COLUMNS.map(({ key, label, color }) => {
          const colOrders = orders.filter(
            (o) => o.orderStatus === key
          );

          return (
            <div
              key={key}
              className={`
                snap-start
                bg-gray-900 border ${color}
                rounded-2xl p-4
                min-w-[85vw]
                sm:min-w-[380px]
                max-w-[420px]
                flex-shrink-0
              `}
            >

              {/* COLUMN HEADER */}
              <div className="flex items-center justify-between mb-4">

                <h2 className="font-semibold text-lg">
                  {label}
                </h2>

                <span className="bg-gray-800 text-gray-400 text-xs rounded-full px-2 py-1">
                  {colOrders.length}
                </span>
              </div>

              {/* ORDERS */}
              <div className="space-y-3">

                {colOrders.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    No orders
                  </div>
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
  </div>
);
}