require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const app = require("./app");
const socketHandler = require("./sockets/socketHandler");

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ─── HTTP + Socket Server ─────────────────────────────────────────────────────
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Attach io to app so controllers can emit events
app.set("io", io);

// Initialize socket handlers
socketHandler(io);

// ─── Start Server ─────────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🌍 Accepting connections from ${CLIENT_URL}`);
  });
};

start();