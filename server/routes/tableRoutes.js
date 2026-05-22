const express = require("express");
const router = express.Router();
const {
  getTables,
  createTable,
  deleteTable,
  getTableById,
} = require("../controllers/tableController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", protect, authorize("admin", "waiter"), getTables);
router.get("/:id", getTableById); // public — for QR scan
router.post("/", protect, authorize("admin"), createTable);
router.delete("/:id", protect, authorize("admin"), deleteTable);

module.exports = router;