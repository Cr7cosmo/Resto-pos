import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

const TAX_RATE = 0.05; // 5% GST

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });
  const [tableId, setTableId] = useState(() => localStorage.getItem("tableId") || null);
  const [tableNumber, setTableNumber] = useState(() => localStorage.getItem("tableNumber") || null);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item._id);
      if (existing) {
        return prev.map((c) =>
          c.menuItemId === item._id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { menuItemId: item._id, name: item.name, price: item.price, isVeg: item.isVeg, image: item.image, quantity: 1 }];
    });
  };

  const removeFromCart = (menuItemId) => {
    setCart((prev) => prev.filter((c) => c.menuItemId !== menuItemId));
  };

  const updateQuantity = (menuItemId, qty) => {
    if (qty <= 0) { removeFromCart(menuItemId); return; }
    setCart((prev) => prev.map((c) => c.menuItemId === menuItemId ? { ...c, quantity: qty } : c));
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
  const total = parseFloat((subtotal + tax).toFixed(2));
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  const setTable = (id, number) => {
    setTableId(id);
    setTableNumber(number);
    localStorage.setItem("tableId", id);
    localStorage.setItem("tableNumber", number);
  };

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      subtotal, tax, total, itemCount, tableId, tableNumber, setTable,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);