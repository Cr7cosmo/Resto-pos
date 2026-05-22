import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../components/Toast";
import api from "../services/api";

export default function CartPage() {
  const { cart, tableId, tableNumber, subtotal, tax, total, updateQuantity, removeFromCart, clearCart } = useCart();
  const [instructions, setInstructions] = useState("");
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const placeOrder = async () => {
    if (!tableId) { toast("No table selected. Please scan QR code.", "error"); return; }
    if (cart.length === 0) { toast("Cart is empty!", "error"); return; }

    setPlacing(true);
    try {
      const res = await api.post("/orders/create", {
        tableId,
        items: cart.map((c) => ({ menuItemId: c.menuItemId, quantity: c.quantity })),
        specialInstructions: instructions,
      });
      clearCart();
      toast("Order placed successfully! 🎉", "success");
      navigate(`/track/${res.data.data._id}`);
    } catch (err) {
      toast(err.response?.data?.message || "Failed to place order", "error");
    }
    setPlacing(false);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 gap-4">
        <div className="text-6xl">🛒</div>
        <h2 className="text-xl font-semibold text-white">Your cart is empty</h2>
        <button onClick={() => navigate(-1)} className="btn-primary">← Back to Menu</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-32">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-5 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white">←</button>
        <div>
          <h1 className="font-bold text-white">Order Summary</h1>
          {tableNumber && <p className="text-gray-400 text-xs">Table {tableNumber}</p>}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        {/* Items */}
        <div className="card p-4 space-y-3">
          {cart.map((item) => (
            <div key={item.menuItemId} className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{item.name}</p>
                <p className="text-orange-400 text-xs">₹{item.price} each</p>
              </div>
              <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-1">
                <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} className="w-7 h-7 text-orange-400 font-bold">−</button>
                <span className="text-white text-sm w-4 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} className="w-7 h-7 text-orange-400 font-bold">+</button>
              </div>
              <span className="text-white text-sm w-14 text-right">₹{(item.price * item.quantity).toFixed(0)}</span>
              <button onClick={() => removeFromCart(item.menuItemId)} className="text-red-400">🗑</button>
            </div>
          ))}
        </div>

        {/* Special Instructions */}
        <div className="card p-4">
          <label className="text-gray-400 text-sm mb-2 block">Special Instructions (optional)</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="E.g. less spicy, no onion..."
            className="input resize-none h-20"
          />
        </div>

        {/* Bill Summary */}
        <div className="card p-4 space-y-2">
          <h3 className="font-semibold text-white mb-3">Bill Summary</h3>
          {[
            ["Subtotal", `₹${subtotal.toFixed(2)}`],
            ["GST (5%)", `₹${tax.toFixed(2)}`],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm text-gray-400">
              <span>{k}</span><span>{v}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-white text-lg pt-2 border-t border-gray-700">
            <span>Total</span><span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Place Order Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-950 border-t border-gray-800">
        <div className="max-w-lg mx-auto">
          <button
            onClick={placeOrder}
            disabled={placing}
            className="btn-primary w-full py-4 text-base"
          >
            {placing ? "Placing Order..." : `Place Order · ₹${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}