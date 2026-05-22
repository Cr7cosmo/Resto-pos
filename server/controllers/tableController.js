const Table = require("../models/Table");
const QRCode = require("qrcode");

// @GET /api/tables
const getTables = async (req, res) => {
  try {
    const tables = await Table.find().populate("currentOrder").sort("tableNumber");
    res.json({ success: true, data: tables });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/tables — admin only
const createTable = async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    // Create table first to get ID
    const table = await Table.create({ tableNumber, capacity });

    // Generate QR code pointing to customer menu URL
    const menuUrl = `${clientUrl}/menu/${table._id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(menuUrl, {
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });

    table.qrCode = qrCodeDataUrl;
    await table.save();

    res.status(201).json({ success: true, data: table });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Table number already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/tables/:id — admin only
const deleteTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) return res.status(404).json({ message: "Table not found" });
    res.json({ success: true, message: "Table deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/tables/:id — public (for QR scan)
const getTableById = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ message: "Table not found" });
    res.json({ success: true, data: table });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTables, createTable, deleteTable, getTableById };