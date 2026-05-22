import { useState, useEffect } from "react";
import api from "../services/api";
import { useToast } from "../components/Toast";
import StatusBadge from "../components/StatusBadge";
import Loader from "../components/Loader";

export default function TableManagement() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ tableNumber: "", capacity: 4 });
  const [qrModal, setQrModal] = useState(null);
  const { toast } = useToast();

  const fetchTables = async () => {
    setLoading(true);
    try {
      const res = await api.get("/tables");
      setTables(res.data.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchTables(); }, []);

  const addTable = async (e) => {
    e.preventDefault();
    try {
      await api.post("/tables", form);
      toast("Table added with QR code", "success");
      setForm({ tableNumber: "", capacity: 4 });
      fetchTables();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to add table", "error");
    }
  };

  const deleteTable = async (id) => {
    if (!confirm("Delete this table?")) return;
    try {
      await api.delete(`/tables/${id}`);
      toast("Table deleted", "success");
      fetchTables();
    } catch { toast("Failed to delete", "error"); }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">🪑 Table Management</h1>

      {/* Add Table Form */}
      <div className="card p-5 mb-6">
        <h2 className="font-semibold text-white mb-4">Add New Table</h2>
        <form onSubmit={addTable} className="flex gap-3 flex-wrap">
          <div>
            <label className="text-gray-400 text-sm">Table Number</label>
            <input type="number" className="input mt-1 w-36" value={form.tableNumber} onChange={(e) => setForm((f) => ({ ...f, tableNumber: e.target.value }))} required min="1" />
          </div>
          <div>
            <label className="text-gray-400 text-sm">Capacity</label>
            <select className="input mt-1 w-28" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))}>
              {[2, 4, 6, 8, 10].map((n) => <option key={n} value={n}>{n} seats</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary">Generate Table + QR</button>
          </div>
        </form>
      </div>

      {/* QR Code Modal */}
      {qrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setQrModal(null)}>
          <div className="card p-8 text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-white text-xl mb-4">Table {qrModal.tableNumber} QR Code</h3>
            <img src={qrModal.qrCode} alt="QR Code" className="w-64 h-64 mx-auto bg-white p-2 rounded-xl" />
            <p className="text-gray-400 text-xs mt-3">Scan to access menu</p>
            <p className="text-gray-600 text-xs mt-1 break-all">/menu/{qrModal._id}</p>
            <button onClick={() => setQrModal(null)} className="btn-ghost mt-4">Close</button>
          </div>
        </div>
      )}

      {/* Tables Grid */}
      {loading ? <Loader /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map((table) => (
            <div key={table._id} className="card p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">Table {table.tableNumber}</h3>
                  <p className="text-gray-400 text-xs">{table.capacity} seats</p>
                </div>
                <StatusBadge status={table.status} />
              </div>
              <div className="flex gap-2 flex-wrap">
                {table.qrCode && (
                  <button onClick={() => setQrModal(table)} className="btn-ghost text-xs px-3 py-1.5">📱 View QR</button>
                )}
                <button onClick={() => deleteTable(table._id)} className="text-red-400 hover:text-red-300 text-xs px-2">🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}