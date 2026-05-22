import { createContext, useContext, useEffect, useState } from "react";
import socket from "../socket/socket";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket.id);
      setConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", reason);
      setConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket error:", err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);