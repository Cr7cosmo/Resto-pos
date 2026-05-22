import { useState, useEffect } from "react";
import api from "../services/api";
import { useToast } from "../components/Toast";
import Loader from "../components/Loader";
import StatusBadge from "../components/StatusBadge";

const EMPTY = { name: "", description: "", category: "Starters", price: "", preparationTime: 15, isVeg: false, availability: true, image: "" };
const CATEGORIES = ["Starters", "Main Course", "Beverages", "Desserts"];

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get("/menu");
      setItems(res.data.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.patch(`/menu/${editing}`, form);
        toast("Item updated", "success");
      } else {
        await api.post("/menu", form);
        toast("Item added", "success");
      }
      setForm(EMPTY); setEditing(null); setShowForm(false);
      fetchItems();
    } catch (err) {
      toast(err.response?.data?.message || "Error saving", "error");
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await api.patch(`/menu/${item._id}`, { availability: !item.availability });
      fetchItems();
    } catch { toast("Failed to update", "error"); }
  };

  const deleteItem = async (id) => {
    if (!confirm("Delete this item?")) return;
    try {
      await api.delete(`/menu/${id}`);
      toast("Item deleted", "success");
      fetchItems();
    } catch { toast("Failed to delete", "error"); }
  };

  const startEdit = (item) => {
    setForm({ name: item.name, description: item.description, category: item.category, price: item.price, preparationTime: item.preparationTime, isVeg: item.isVeg, availability: item.availability, image: item.image });
    setEditing(item._id);
    setShowForm(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">🍽️ Menu Management</h1>
        <button onClick={() => { setForm(EMPTY); setEditing(null); setShowForm(true); }} className="btn-primary">+ Add Item</button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h2 className="font-bold text-white">{editing ? "Edit Item" : "Add New Item"}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              {[
                ["Name", "name", "text"],
                ["Price (₹)", "price", "number"],
                ["Prep Time (min)", "preparationTime", "number"],
                ["Image URL", "image", "url"],
              ].map(([label, key, type]) => (
                <div key={key}>
                  <label className="text-gray-400 text-sm">{label}</label>
                  <input type={type} className="input mt-1" value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} required={key !== "image"} />
                </div>
              ))}
              <div>
                <label className="text-gray-400 text-sm">Description</label>
                <textarea className="input mt-1 resize-none h-20" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Category</label>
                <select className="input mt-1" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-6">
                {[["isVeg", "Vegetarian"], ["availability", "Available"]].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input type="checkbox" checked={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))} className="accent-orange-500" />
                    {label}
                  </label>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">{editing ? "Update" : "Add Item"}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <Loader /> : (
        <div className="space-y-2">
          {CATEGORIES.map((cat) => {
            const catItems = items.filter((i) => i.category === cat);
            if (!catItems.length) return null;
            return (
              <div key={cat}>
                <h2 className="text-gray-400 text-sm font-semibold mb-2 mt-4">{cat}</h2>
                <div className="space-y-2">
                  {catItems.map((item) => (
                    <div key={item._id} className="card p-4 flex items-center gap-4">
                      <img src={item.image || "https://via.placeholder.com/60"} alt={item.name} className="w-14 h-14 rounded-xl object-cover" onError={(e) => { e.target.src = "https://via.placeholder.com/60"; }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">{item.name}</p>
                          <span className={`text-xs ${item.isVeg ? "text-green-400" : "text-red-400"}`}>{item.isVeg ? "🟢 Veg" : "🔴 Non-veg"}</span>
                        </div>
                        <p className="text-orange-400 text-sm">₹{item.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleAvailability(item)} className={`text-xs px-3 py-1.5 rounded-lg font-medium ${item.availability ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                          {item.availability ? "Available" : "Unavailable"}
                        </button>
                        <button onClick={() => startEdit(item)} className="btn-ghost text-sm px-3 py-1.5">Edit</button>
                        <button onClick={() => deleteItem(item._id)} className="text-red-400 hover:text-red-300 px-2">🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}