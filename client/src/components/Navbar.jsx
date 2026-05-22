import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <nav className="bg-gray-900/90 backdrop-blur border-b border-gray-800 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      <Link to="/" className="flex items-center gap-2">
        <span className="text-2xl">🍛</span>
        <span className="font-bold text-lg text-white">RestoPOS</span>
      </Link>

      <div className="flex items-center gap-4">
        {/* Connection indicator */}
        <div className="flex items-center gap-1.5 text-xs">
          <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
          <span className="text-gray-500 hidden sm:inline">{connected ? "Live" : "Offline"}</span>
        </div>

        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-white">{user.name}</span>
              <span className="text-xs text-gray-500 capitalize">{user.role}</span>
            </div>
            <button onClick={handleLogout} className="btn-ghost text-sm px-3 py-1.5">Logout</button>
          </div>
        ) : (
          <Link to="/login" className="btn-primary text-sm px-3 py-1.5">Login</Link>
        )}
      </div>
    </nav>
  );
}