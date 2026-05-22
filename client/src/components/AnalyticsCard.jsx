export default function AnalyticsCard({ icon, label, value, sub, color = "text-orange-400" }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`text-3xl ${color}`}>{icon}</div>
      <div>
        <p className="text-gray-400 text-xs font-medium">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}