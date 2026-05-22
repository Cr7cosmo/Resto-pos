const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/create", createOrder); // public
router.get("/", protect, authorize("admin", "kitchen"), getOrders);
router.get("/:id", getOrderById); // public — for tracking
router.patch("/:id/status", protect, authorize("admin", "kitchen"), updateOrderStatus);

module.exports = router;