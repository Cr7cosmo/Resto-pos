import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import { useSocket } from "../context/SocketContext";
import MenuItemCard from "../components/MenuItemCard";
import CartDrawer from "../components/CartDrawer";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

const CATEGORIES = ["All", "Starters", "Main Course", "Beverages", "Desserts"];

export default function MenuPage() {
  const { tableId } = useParams();
  const { socket } = useSocket();
  const { setTable, itemCount } = useCart();
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cartOpen, setCartOpen] = useState(false);
  const [tableInfo, setTableInfo] = useState(null);

  useEffect(() => {
    // Join socket room for this table
    if (socket && tableId) {
      socket.emit("joinTable", tableId);
    }
    // Fetch table info
    const fetchTable = async () => {
      try {
        const res = await api.get(`/tables/${tableId}`);
        setTableInfo(res.data.data);
        setTable(tableId, res.data.data.tableNumber);
      } catch {}
    };
    fetchTable();
  }, [socket, tableId]);

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const params = { available: true };
        if (category !== "All") params.category = category;
        if (search) params.search = search;
        const res = await api.get("/menu", { params });
        setMenu(res.data.data);
      } catch {}
      setLoading(false);
    };
    const timer = setTimeout(fetchMenu, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [category, search]);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-5 pt-8 pb-16">
        <p className="text-orange-100 text-sm">Welcome to</p>
        <h1 className="text-3xl font-bold text-white">RestoPOS 🍛</h1>
        {tableInfo && (
          <p className="text-orange-100 text-sm mt-1">Table {tableInfo.tableNumber}</p>
        )}
        {/* Search */}
        <div className="mt-5 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search dishes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/10 backdrop-blur border border-white/20 rounded-2xl pl-10 pr-4 py-3 text-white placeholder-orange-200 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-4 -mt-8 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === cat
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="px-4 pb-28">
        {loading ? (
          <Loader text="Loading menu..." />
        ) : menu.length === 0 ? (
          <EmptyState icon="🍽️" title="No items found" desc="Try a different category or search term" />
        ) : (
          <div className="space-y-3">
            {menu.map((item) => (
              <MenuItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {itemCount > 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center px-5 z-40">
          <button
            onClick={() => setCartOpen(true)}
            className="bg-orange-500 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl shadow-orange-500/40 flex items-center gap-3 w-full max-w-sm"
          >
            <span className="bg-white text-orange-500 rounded-full w-6 h-6 text-xs font-bold flex items-center justify-center">{itemCount}</span>
            <span>View Cart</span>
            <span className="ml-auto">→</span>
          </button>
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}