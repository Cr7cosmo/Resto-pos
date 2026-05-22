const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    image: { type: String, default: "" },
    category: {
      type: String,
      enum: ["Starters", "Main Course", "Beverages", "Desserts"],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    preparationTime: { type: Number, default: 15 }, // in minutes
    availability: { type: Boolean, default: true },
    isVeg: { type: Boolean, default: false },
    rating: { type: Number, default: 4.0, min: 0, max: 5 },
    orderCount: { type: Number, default: 0 }, // track popularity
  },
  { timestamps: true }
);

module.exports = mongoose.model("MenuItem", menuItemSchema);