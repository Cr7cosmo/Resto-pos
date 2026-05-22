import StatusBadge from "./StatusBadge";

// Elapsed time helper
const elapsed = (createdAt) => {
  const diff = Math.floor((Date.now() - new Date(createdAt)) / 1000);

  if (diff < 60) return `${diff}s ago`;

  const m = Math.floor(diff / 60);

  return `${m}m ago`;
};

export default function OrderCard({
  order,
  onStatusUpdate,
  showActions,
}) {
  const nextStatus = {
    pending: {
      label: "Accept",
      next: "accepted",
      color: "bg-blue-500 hover:bg-blue-600",
    },

    accepted: {
      label: "Start Preparing",
      next: "preparing",
      color: "bg-orange-500 hover:bg-orange-600",
    },

    preparing: {
      label: "Mark Ready",
      next: "ready",
      color: "bg-green-500 hover:bg-green-600",
    },

    ready: {
      label: "Mark Served",
      next: "served",
      color: "bg-purple-500 hover:bg-purple-600",
    },
  };

  const action = nextStatus[order.orderStatus];

  return (
    <div className="card p-3 sm:p-4 space-y-3 animate-fade-in overflow-hidden break-words min-w-0">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-white text-sm sm:text-base break-all">
            {order.orderNumber}
          </p>

          <p className="text-gray-400 text-xs break-words">
            Table {order.tableNumber} · {elapsed(order.createdAt)}
          </p>
        </div>

        <StatusBadge status={order.orderStatus} />
      </div>

      {/* Items */}
      <div className="space-y-2">
        {order.items.map((item, i) => (
          <div
            key={i}
            className="flex items-start justify-between gap-2 text-sm"
          >
            <span className="text-gray-300 break-words flex-1">
              <span
                className={`mr-1 ${
                  item.isVeg ? "text-green-400" : "text-red-400"
                }`}
              >
                ●
              </span>

              {item.name}
            </span>

            <span className="text-gray-400 whitespace-nowrap">
              × {item.quantity}
            </span>
          </div>
        ))}
      </div>

      {/* Special Instructions */}
      {order.specialInstructions && (
        <p className="text-xs text-yellow-400 bg-yellow-900/20 rounded-lg px-3 py-2 break-words">
          📝 {order.specialInstructions}
        </p>
      )}

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-800">
        
        <span className="font-bold text-orange-400 text-sm sm:text-base">
          ₹{order.totalPrice?.toFixed(2)}
        </span>

        {showActions && action && (
          <button
            onClick={() =>
              onStatusUpdate(order._id, action.next)
            }
            className={`text-white text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${action.color}`}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}