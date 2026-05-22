export default function EmptyState({ icon = "🍽️", title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <div className="text-6xl">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-300">{title}</h3>
      {desc && <p className="text-gray-500 text-sm max-w-sm">{desc}</p>}
    </div>
  );
}