const express = require("express");
const router = express.Router();
const { getAnalytics, getLiveOrders } = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/analytics", protect, authorize("admin"), getAnalytics);
router.get("/live-orders", protect, authorize("admin", "kitchen"), getLiveOrders);

module.exports = router;