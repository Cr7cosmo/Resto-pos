import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { useSocket } from "../context/SocketContext";
import Loader from "../components/Loader";

const STEPS = ["pending", "accepted", "preparing", "ready", "served"];
const STEP_LABELS = {
  pending:   { label: "Order Placed",  icon: "📋", desc: "Your order has been received" },
  accepted:  { label: "Confirmed",     icon: "✅", desc: "Kitchen has accepted your order" },
  preparing: { label: "Preparing",     icon: "👨‍🍳", desc: "Chef is preparing your meal" },
  ready:     { label: "Ready!",        icon: "🔔", desc: "Your order is ready to be served" },
  served:    { label: "Served",        icon: "🍽️", desc: "Enjoy your meal!" },
};

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const { socket } = useSocket();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        setOrder(res.data.data);
        // Join table socket room
        if (socket && res.data.data.tableId) {
          const tableRoom = `table_${res.data.data.tableId._id || res.data.data.tableId}`;

          socket.emit("joinTable", tableRoom);
        }
      } catch {}
      setLoading(false);
    };
    fetchOrder();
  }, [orderId, socket]);

  // Listen for live updates
  useEffect(() => {
    if (!socket) return;
    const handler = (updatedOrder) => {
      if (updatedOrder._id === orderId || updatedOrder._id?.toString() === orderId) {
        setOrder(updatedOrder);
      }
    };
    socket.on("orderUpdated", handler);
    socket.on("orderReady", handler);
    socket.on("orderServed", handler);
    return () => {
      socket.off("orderUpdated", handler);
      socket.off("orderReady", handler);
      socket.off("orderServed", handler);
    };
  }, [socket, orderId]);

  if (loading) return <Loader text="Tracking your order..." />;
  if (!order) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center"><div className="text-5xl mb-4">❌</div><p className="text-white">Order not found</p></div>
    </div>
  );

  const currentStep = STEPS.indexOf(order.orderStatus);
  const isCompleted = order.orderStatus === "completed" || order.orderStatus === "served";

  return (
    <div className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-md mx-auto pt-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="text-5xl mb-2">{STEP_LABELS[order.orderStatus]?.icon || "⏳"}</div>
          <h1 className="text-2xl font-bold text-white">{STEP_LABELS[order.orderStatus]?.label}</h1>
          <p className="text-gray-400 text-sm mt-1">{STEP_LABELS[order.orderStatus]?.desc}</p>
          <p className="text-orange-400 font-semibold mt-2">{order.orderNumber} · Table {order.tableNumber}</p>
        </div>

        {/* Progress Steps */}
        <div className="card p-6">
          <div className="relative">
            {/* Progress line */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-700" />
            <div
              className="absolute top-5 left-5 h-0.5 bg-orange-500 transition-all duration-700"
              style={{ width: `${(currentStep / (STEPS.length - 1)) * (100 - (100 / STEPS.length))}%` }}
            />
            <div className="flex justify-between relative z-10">
              {STEPS.map((step, i) => {
                const done = i <= currentStep;
                return (
                  <div key={step} className="flex flex-col items-center gap-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
                      done ? "bg-orange-500 border-orange-500" : "bg-gray-800 border-gray-700"
                    }`}>
                      {STEP_LABELS[step]?.icon}
                    </div>
                    <span className={`text-xs text-center ${done ? "text-orange-400 font-medium" : "text-gray-600"}`}>
                      {STEP_LABELS[step]?.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Estimated Time */}
        {!isCompleted && (
          <div className="card p-4 flex items-center gap-3">
            <span className="text-3xl">⏱</span>
            <div>
              <p className="text-gray-400 text-xs">Estimated time</p>
              <p className="text-white font-bold text-lg">{order.estimatedTime} minutes</p>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="card p-4 space-y-2">
          <h3 className="font-semibold text-white mb-3">Your Order</h3>
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-300">{item.name} × {item.quantity}</span>
              <span className="text-orange-400">₹{(item.price * item.quantity).toFixed(0)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-white pt-2 border-t border-gray-700">
            <span>Total</span><span>₹{order.totalPrice?.toFixed(2)}</span>
          </div>
        </div>

        {isCompleted && (
          <div className="card p-6 text-center border-green-500/30">
            <div className="text-4xl mb-2">😋</div>
            <p className="text-green-400 font-bold text-lg">Enjoy your meal!</p>
            <p className="text-gray-400 text-sm mt-1">Thank you for dining with us</p>
          </div>
        )}
      </div>
    </div>
  );
}