const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const Table = require("../models/Table");

// @GET /api/admin/analytics
const getAnalytics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Today's orders
    const todayOrders = await Order.find({
      createdAt: { $gte: today, $lte: todayEnd },
    });

    const totalOrdersToday = todayOrders.length;
    const revenueToday = todayOrders.reduce((sum, o) => sum + o.totalPrice, 0);

    // Active tables
    const activeTables = await Table.countDocuments({ status: "occupied" });
    const totalTables = await Table.countDocuments();

    // Popular items
    const popularItems = await MenuItem.find()
      .sort({ orderCount: -1 })
      .limit(5)
      .select("name orderCount price category");

    // Last 7 days revenue
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const dayOrders = await Order.find({
        createdAt: { $gte: dayStart, $lte: dayEnd },
      });

      last7Days.push({
        date: dayStart.toLocaleDateString("en-US", { weekday: "short" }),
        revenue: dayOrders.reduce((sum, o) => sum + o.totalPrice, 0),
        orders: dayOrders.length,
      });
    }

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        totalOrdersToday,
        revenueToday: parseFloat(revenueToday.toFixed(2)),
        activeTables,
        totalTables,
        popularItems,
        last7Days,
        ordersByStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/admin/live-orders
const getLiveOrders = async (req, res) => {
  try {
    const liveOrders = await Order.find({
      orderStatus: { $in: ["pending", "accepted", "preparing", "ready"] },
    })
      .populate("tableId", "tableNumber")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: liveOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAnalytics, getLiveOrders };