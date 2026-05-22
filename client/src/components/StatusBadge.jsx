const colors = {
  pending:   "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  accepted:  "bg-blue-500/20 text-blue-400 border-blue-500/30",
  preparing: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  ready:     "bg-green-500/20 text-green-400 border-green-500/30",
  served:    "bg-purple-500/20 text-purple-400 border-purple-500/30",
  completed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  available: "bg-green-500/20 text-green-400 border-green-500/30",
  occupied:  "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${colors[status] || "bg-gray-700 text-gray-300"}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}