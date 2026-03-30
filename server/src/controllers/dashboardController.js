const Order = require('../models/Order');
const Item = require('../models/Item');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const { ORDER_STATUS } = require('../config/constants');

/**
 * GET /api/dashboard/stats
 */
const getStats = async (req, res, next) => {
  try {
    const [totalOrders, totalItems, totalUsers, revenueResult] = await Promise.all([
      Order.countDocuments(),
      Item.countDocuments(),
      User.countDocuments(),
      Order.aggregate([
        { $match: { status: ORDER_STATUS.COMPLETED } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    return ApiResponse.success(res, { totalOrders, totalItems, totalUsers, totalRevenue });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/recent-orders
 */
const getRecentOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('items.itemId', 'name price')
      .sort({ orderDate: -1 })
      .limit(10);
    return ApiResponse.success(res, orders);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/monthly-revenue
 */
const getMonthlyRevenue = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();

    const data = await Order.aggregate([
      {
        $match: {
          status: ORDER_STATUS.COMPLETED,
          orderDate: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$orderDate' } },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    // Fill missing months with 0
    const monthly = Array.from({ length: 12 }, (_, i) => {
      const found = data.find((d) => d._id.month === i + 1);
      return { month: i + 1, revenue: found?.revenue || 0, count: found?.count || 0 };
    });

    return ApiResponse.success(res, monthly);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/order-status
 */
const getOrderStatus = async (req, res, next) => {
  try {
    const data = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statusCounts = Object.values(ORDER_STATUS).reduce((acc, s) => {
      const found = data.find((d) => d._id === s);
      acc[s] = found?.count || 0;
      return acc;
    }, {});

    return ApiResponse.success(res, statusCounts);
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getRecentOrders, getMonthlyRevenue, getOrderStatus };
