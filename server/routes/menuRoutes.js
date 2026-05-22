const express = require("express");
const router = express.Router();
const {
  getMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require("../controllers/menuController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", getMenu); // public
router.post("/", protect, authorize("admin"), createMenuItem);
router.patch("/:id", protect, authorize("admin"), updateMenuItem);
router.delete("/:id", protect, authorize("admin"), deleteMenuItem);

module.exports = router;