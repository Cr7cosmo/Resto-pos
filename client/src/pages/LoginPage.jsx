import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      toast("Welcome back!", "success");
      if (result.user.role === "kitchen") navigate("/kitchen");
      else navigate("/admin");
    } else {
      toast(result.message, "error");
    }
  };

  // Quick-fill helpers
  const fill = (e, p) => { setEmail(e); setPassword(p); };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🍛</div>
          <h1 className="text-3xl font-bold text-white">RestoPOS</h1>
          <p className="text-gray-400 mt-1">Restaurant Management System</p>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Staff Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@restaurant.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? "Logging in..." : "Login →"}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 border-t border-gray-800 pt-4 space-y-2">
            <p className="text-gray-500 text-xs text-center mb-3">Demo Credentials</p>
            {[
              ["admin@restaurant.com", "admin123", "Admin"],
              ["kitchen@restaurant.com", "kitchen123", "Kitchen"],
            ].map(([e, p, label]) => (
              <button
                key={label}
                onClick={() => fill(e, p)}
                className="w-full text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg py-2 transition-all"
              >
                Use {label} credentials
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}