const Order = require('../models/Order');
const Item = require('../models/Item');
const User = require('../models/User');
const { formatResponse } = require('../utils/helpers');

const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalOrders,
      totalItems,
      totalUsers,
      revenueResult,
      monthOrders,
      monthRevenueResult,
      lastMonthOrders,
      lastMonthRevenueResult,
    ] = await Promise.all([
      Order.countDocuments(),
      Item.countDocuments({ isActive: true }),
      User.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.countDocuments({ orderDate: { $gte: startOfMonth } }),
      Order.aggregate([
        { $match: { orderDate: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.countDocuments({ orderDate: { $gte: startOfLastMonth, $lt: startOfMonth } }),
      Order.aggregate([
        { $match: { orderDate: { $gte: startOfLastMonth, $lt: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    const monthRevenue = monthRevenueResult[0]?.total || 0;
    const lastMonthRevenue = lastMonthRevenueResult[0]?.total || 0;

    const revenueGrowth =
      lastMonthRevenue > 0
        ? (((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(2)
        : null;

    const ordersGrowth =
      lastMonthOrders > 0
        ? (((monthOrders - lastMonthOrders) / lastMonthOrders) * 100).toFixed(2)
        : null;

    return res.json(
      formatResponse(
        {
          totalOrders,
          totalRevenue,
          totalItems,
          totalUsers,
          currentMonth: {
            orders: monthOrders,
            revenue: monthRevenue,
            revenueGrowth: revenueGrowth !== null ? parseFloat(revenueGrowth) : null,
            ordersGrowth: ordersGrowth !== null ? parseFloat(ordersGrowth) : null,
          },
        },
        'Dashboard stats retrieved'
      )
    );
  } catch (error) {
    next(error);
  }
};

const getRecentOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);
    return res.json(formatResponse({ orders }, 'Recent orders retrieved'));
  } catch (error) {
    next(error);
  }
};

const getMonthlySales = async (req, res, next) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlySales = await Order.aggregate([
      { $match: { orderDate: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$orderDate' },
            month: { $month: '$orderDate' },
          },
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          totalRevenue: 1,
          totalOrders: 1,
        },
      },
    ]);

    return res.json(formatResponse({ monthlySales }, 'Monthly sales retrieved'));
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getRecentOrders, getMonthlySales };
