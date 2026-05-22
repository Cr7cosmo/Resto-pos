import { createContext, useContext, useState, useCallback } from "react";

const ToastCtx = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = "success", duration = 3500) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const icons = { success: "✅", error: "❌", info: "ℹ️", warning: "⚠️" };
  const colors = {
    success: "border-green-500/40 bg-green-950/80",
    error: "border-red-500/40 bg-red-950/80",
    info: "border-blue-500/40 bg-blue-950/80",
    warning: "border-yellow-500/40 bg-yellow-950/80",
  };

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-slide-in border rounded-xl px-4 py-3 flex items-center gap-2 text-sm shadow-xl ${colors[t.type]}`}
          >
            <span>{icons[t.type]}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};

export const useToast = () => useContext(ToastCtx);