import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function CartDrawer({ open, onClose }) {
  const { cart, updateQuantity, removeFromCart, subtotal, tax, total, itemCount } = useCart();
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-sm bg-gray-900 h-full flex flex-col animate-slide-in border-l border-gray-800 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div>
            <h2 className="font-bold text-lg text-white">Your Cart</h2>
            <p className="text-gray-400 text-xs">{itemCount} items</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="text-5xl mb-3">🛒</div>
              <p>Your cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.menuItemId} className="flex items-center gap-3 bg-gray-800 rounded-xl p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{item.name}</p>
                  <p className="text-orange-400 text-xs font-semibold">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-2 bg-gray-700 rounded-lg px-1">
                  <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} className="w-6 h-6 text-orange-400 font-bold">−</button>
                  <span className="text-white text-sm w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} className="w-6 h-6 text-orange-400 font-bold">+</button>
                </div>
                <span className="text-white text-sm font-medium w-14 text-right">₹{(item.price * item.quantity).toFixed(0)}</span>
                <button onClick={() => removeFromCart(item.menuItemId)} className="text-red-400 hover:text-red-300 ml-1 text-sm">🗑</button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-gray-800 p-5 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>GST (5%)</span><span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-white text-base pt-2 border-t border-gray-700">
                <span>Total</span><span>₹{total.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={() => { onClose(); navigate("/cart"); }}
              className="btn-primary w-full py-3 text-center"
            >
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}