import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

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
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* ── BOTTOM NAV — mobile only (< md) ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden
                      bg-gray-900 border-t border-gray-800 safe-area-pb">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/admin"}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-all ${
                isActive
                  ? "text-orange-400"
                  : "text-gray-500 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`text-xl leading-none p-1.5 rounded-xl transition-all ${
                  isActive ? "bg-orange-500/20" : ""
                }`}>
                  {link.icon}
                </span>
                <span className="truncate max-w-[56px] text-center">
                  {link.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── SIDEBAR — desktop (≥ md) ── */}
      <aside className={`hidden md:flex flex-col
                         bg-gray-900 border-r border-gray-800 min-h-screen
                         transition-all duration-300 ease-in-out
                         ${collapsed ? "w-16" : "w-56"} p-2 gap-1 relative`}>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="self-end mb-2 p-2 rounded-lg text-gray-500
                     hover:bg-gray-800 hover:text-white transition-all"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? "→" : "←"}
        </button>

        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/admin"}
            title={collapsed ? link.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium
               transition-all overflow-hidden whitespace-nowrap ${
                isActive
                  ? "bg-orange-500/20 text-orange-400"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <span className="text-lg shrink-0">{link.icon}</span>
            {!collapsed && <span className="truncate">{link.label}</span>}
          </NavLink>
        ))}
      </aside>
    </>
  );
}