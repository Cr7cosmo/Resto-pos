import StatusBadge from "./StatusBadge";

// Elapsed time helper
const elapsed = (createdAt) => {
  const diff = Math.floor((Date.now() - new Date(createdAt)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  return `${m}m ago`;
};

export default function OrderCard({ order, onStatusUpdate, showActions }) {
  const nextStatus = {
    pending:   { label: "Accept", next: "accepted",  color: "bg-blue-500 hover:bg-blue-600" },
    accepted:  { label: "Start Preparing", next: "preparing", color: "bg-orange-500 hover:bg-orange-600" },
    preparing: { label: "Mark Ready", next: "ready",  color: "bg-green-500 hover:bg-green-600" },
    ready:     { label: "Mark Served", next: "served", color: "bg-purple-500 hover:bg-purple-600" },
  };

  const action = nextStatus[order.orderStatus];

  return (
    <div className="card p-4 space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-white">{order.orderNumber}</p>
          <p className="text-gray-400 text-xs">Table {order.tableNumber} · {elapsed(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.orderStatus} />
      </div>

      <div className="space-y-1">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-gray-300">
              <span className={`mr-1 ${item.isVeg ? "text-green-400" : "text-red-400"}`}>●</span>
              {item.name}
            </span>
            <span className="text-gray-400">× {item.quantity}</span>
          </div>
        ))}
      </div>

      {order.specialInstructions && (
        <p className="text-xs text-yellow-400 bg-yellow-900/20 rounded-lg px-3 py-2">
          📝 {order.specialInstructions}
        </p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-800">
        <span className="font-bold text-orange-400">₹{order.totalPrice?.toFixed(2)}</span>
        {showActions && action && (
          <button
            onClick={() => onStatusUpdate(order._id, action.next)}
            className={`text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${action.color}`}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}