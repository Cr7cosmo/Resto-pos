const MenuItem = require("../models/MenuItem");

// @GET /api/menu — public
const getMenu = async (req, res) => {
  try {
    const { category, search, available } = req.query;
    let query = {};

    if (category) query.category = category;
    if (available === "true") query.availability = true;
    if (search) query.name = { $regex: search, $options: "i" };

    const items = await MenuItem.find(query).sort({ category: 1, name: 1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/menu — admin only
const createMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PATCH /api/menu/:id — admin only
const updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/menu/:id — admin only
const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ success: true, message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMenu, createMenuItem, updateMenuItem, deleteMenuItem };