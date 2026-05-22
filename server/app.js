const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: "Too many requests, please try again later.",
});
app.use("/api", limiter);

// ─── Body Parser ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/menu", require("./routes/menuRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/tables", require("./routes/tableRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => res.json({ status: "OK", timestamp: new Date() }));

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;