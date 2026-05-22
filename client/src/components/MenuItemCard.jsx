import { useCart } from "../context/CartContext";

export default function MenuItemCard({ item }) {
  const { cart, addToCart, updateQuantity } = useCart();
  const cartItem = cart.find((c) => c.menuItemId === item._id);

  return (
    <div className="card p-4 flex gap-4 hover:border-gray-700 transition-all animate-fade-in">
      <img
        src={item.image || "https://via.placeholder.com/100"}
        alt={item.name}
        className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
        onError={(e) => { e.target.src = "https://via.placeholder.com/100"; }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              {/* Veg/Non-veg indicator */}
              <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center flex-shrink-0 ${item.isVeg ? "border-green-500" : "border-red-500"}`}>
                <div className={`w-2 h-2 rounded-full ${item.isVeg ? "bg-green-500" : "bg-red-500"}`} />
              </div>
              <h3 className="font-semibold text-white text-sm">{item.name}</h3>
            </div>
            <p className="text-gray-400 text-xs mt-1 line-clamp-2">{item.description}</p>
            <p className="text-gray-500 text-xs mt-1">⏱ {item.preparationTime} min</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-orange-400">₹{item.price}</span>

          {!item.availability ? (
            <span className="text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded-lg">Unavailable</span>
          ) : cartItem ? (
            <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-1">
              <button
                onClick={() => updateQuantity(item._id, cartItem.quantity - 1)}
                className="w-7 h-7 flex items-center justify-center text-orange-400 font-bold hover:bg-gray-700 rounded-lg"
              >−</button>
              <span className="text-white font-medium text-sm w-4 text-center">{cartItem.quantity}</span>
              <button
                onClick={() => updateQuantity(item._id, cartItem.quantity + 1)}
                className="w-7 h-7 flex items-center justify-center text-orange-400 font-bold hover:bg-gray-700 rounded-lg"
              >+</button>
            </div>
          ) : (
            <button onClick={() => addToCart(item)} className="btn-primary text-xs py-1.5 px-3">
              + Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}