/**
 * Socket.IO Handler
 * Manages all real-time communication between customer, kitchen, and admin
 */

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ─── CUSTOMER: Join table room ───────────────────────────────────────────
    socket.on("joinTable", (room) => {
  socket.join(room);

  console.log(`🪑 Socket ${socket.id} joined ${room}`);

  socket.emit("joinedTable", {
    room,
    socketId: socket.id,
  });
});

    // ─── KITCHEN: Join kitchen room ──────────────────────────────────────────
    socket.on("joinKitchen", () => {
      socket.join("kitchen");
      console.log(`👨‍🍳 Kitchen joined: ${socket.id}`);
      socket.emit("joinedKitchen", { socketId: socket.id });
    });

    // ─── ADMIN: Join admin room ──────────────────────────────────────────────
    socket.on("joinAdmin", () => {
      socket.join("admin");
      console.log(`👑 Admin joined: ${socket.id}`);
      socket.emit("joinedAdmin", { socketId: socket.id });
    });

    // ─── KITCHEN: Kitchen manually emits status changes ──────────────────────
    // (Status updates are mostly done via REST API which emits for us)
    socket.on("kitchenStatusUpdate", ({ orderId, status, tableId }) => {
      io.to(`table_${tableId}`).emit("orderUpdated", { orderId, status });
      io.to("admin").emit("orderUpdated", { orderId, status });
    });

    // ─── DISCONNECT ──────────────────────────────────────────────────────────
    socket.on("disconnect", (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id} — ${reason}`);
    });

    // ─── ERROR ───────────────────────────────────────────────────────────────
    socket.on("error", (error) => {
      console.error(`❌ Socket error: ${error}`);
    });
  });
};

module.exports = socketHandler;