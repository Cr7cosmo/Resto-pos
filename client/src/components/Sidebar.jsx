import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: "📊" },
  { to: "/admin/menu", label: "Menu", icon: "🍽️" },
  { to: "/admin/tables", label: "Tables", icon: "🪑" },
  { to: "/admin/analytics", label: "Analytics", icon: "📈" },
  { to: "/kitchen", label: "Kitchen", icon: "👨‍🍳" },
];

const kitchenLinks = [
  { to: "/kitchen", label: "Kitchen", icon: "👨‍🍳" },
];

export default function Sidebar() {
  const { user } = useAuth();
  const links = user?.role === "admin" ? adminLinks : kitchenLinks;

  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-800 min-h-screen p-4 flex flex-col gap-1">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === "/admin"}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? "bg-orange-500/20 text-orange-400"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`
          }
        >
          <span className="text-lg">{link.icon}</span>
          {link.label}
        </NavLink>
      ))}
    </aside>
  );
}