const Order = require("../models/Order");
const Table = require("../models/Table");
const MenuItem = require("../models/MenuItem");

// @POST /api/orders/create — public (customer)
const createOrder = async (req, res) => {
  try {
    const { tableId, items, specialInstructions } = req.body;

    // Validate table
    const table = await Table.findById(tableId);
    if (!table) return res.status(404).json({ message: "Table not found" });

    // Build order items & calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) continue;

      const lineTotal = menuItem.price * item.quantity;
      subtotal += lineTotal;

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        isVeg: menuItem.isVeg,
      });

      // Increment order count for analytics
      await MenuItem.findByIdAndUpdate(menuItem._id, { $inc: { orderCount: 1 } });
    }

    const tax = parseFloat((subtotal * 0.05).toFixed(2)); // 5% GST
    const totalPrice = parseFloat((subtotal + tax).toFixed(2));

    const estimatedTime = Math.max(...orderItems.map((i) => 15), 15);

    const order = await Order.create({
      tableId,
      tableNumber: table.tableNumber,
      items: orderItems,
      subtotal,
      tax,
      totalPrice,
      specialInstructions,
      estimatedTime,
      statusHistory: [{ status: "pending", timestamp: new Date() }],
    });

    // Mark table as occupied
    await Table.findByIdAndUpdate(tableId, {
      status: "occupied",
      currentOrder: order._id,
    });

    // Emit socket event (injected via req.app)
    const io = req.app.get("io");
    if (io) {
      const populatedOrder = await Order.findById(order._id).populate("tableId");
      io.to("kitchen").emit("newOrder", populatedOrder);
      io.to("admin").emit("newOrder", populatedOrder);
      io.to(`table_${tableId}`).emit("orderConfirmed", populatedOrder);
    }

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/orders — kitchen/admin
const getOrders = async (req, res) => {
  try {
    const { status, date } = req.query;
    let query = {};

    if (status) query.orderStatus = status;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: start, $lte: end };
    }

    const orders = await Order.find(query)
      .populate("tableId", "tableNumber")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/orders/:id — public (for tracking)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "tableId",
      "tableNumber"
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PATCH /api/orders/:id/status — kitchen/admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.orderStatus = status;
    order.statusHistory.push({ status, timestamp: new Date() });

    // Auto-complete table when order is served/completed
    if (status === "completed" || status === "served") {
      await Table.findByIdAndUpdate(order.tableId, {
        status: "available",
        currentOrder: null,
      });
    }

    await order.save();

    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      const updatedOrder = await Order.findById(order._id).populate("tableId");
      io.to("kitchen").emit("orderUpdated", updatedOrder);
      io.to("admin").emit("orderUpdated", updatedOrder);
      io.to(`table_${order.tableId}`).emit("orderUpdated", updatedOrder);

      if (status === "ready") {
        io.to(`table_${order.tableId}`).emit("orderReady", updatedOrder);
      }
      if (status === "served") {
        io.to(`table_${order.tableId}`).emit("orderServed", updatedOrder);
      }
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus };