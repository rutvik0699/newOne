const Order = require('../models/Order');
const Item = require('../models/Item');
const { formatResponse, getPagination, calculateOrderTotal } = require('../utils/helpers');
const { ORDER_STATUS } = require('../config/constants');

const createOrder = async (req, res, next) => {
  try {
    const { userId, items: orderItems, notes, deliveryDate } = req.body;

    const itemIds = orderItems.map((i) => i.itemId);
    const dbItems = await Item.find({ _id: { $in: itemIds }, isActive: true });

    if (dbItems.length !== [...new Set(itemIds)].length) {
      return res
        .status(400)
        .json(formatResponse(null, 'One or more items not found or inactive', false));
    }

    const itemMap = Object.fromEntries(dbItems.map((i) => [i._id.toString(), i]));

    const resolvedItems = orderItems.map((entry) => {
      const dbItem = itemMap[entry.itemId.toString()];
      const subtotal = entry.price * entry.quantity;
      return {
        itemId: entry.itemId,
        name: dbItem.name,
        quantity: entry.quantity,
        price: entry.price,
        subtotal,
      };
    });

    const totalAmount = calculateOrderTotal(resolvedItems);

    const order = await Order.create({
      userId,
      items: resolvedItems,
      totalAmount,
      notes,
      deliveryDate,
    });

    return res.status(201).json(formatResponse({ order }, 'Order created successfully'));
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status, userId, startDate, endDate } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.userId = userId;
    if (startDate || endDate) {
      filter.orderDate = {};
      if (startDate) filter.orderDate.$gte = new Date(startDate);
      if (endDate) filter.orderDate.$lte = new Date(endDate);
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    return res.json(
      formatResponse(
        { orders, pagination: { total, page, limit, pages: Math.ceil(total / limit) } },
        'Orders retrieved'
      )
    );
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email phone address')
      .populate('items.itemId', 'name sku image');
    if (!order) {
      return res.status(404).json(formatResponse(null, 'Order not found', false));
    }
    return res.json(formatResponse({ order }, 'Order retrieved'));
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const allowedFields = ['status', 'notes', 'deliveryDate'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const order = await Order.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!order) {
      return res.status(404).json(formatResponse(null, 'Order not found', false));
    }
    return res.json(formatResponse({ order }, 'Order updated successfully'));
  } catch (error) {
    next(error);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json(formatResponse(null, 'Order not found', false));
    }
    return res.json(formatResponse(null, 'Order deleted successfully'));
  } catch (error) {
    next(error);
  }
};

const getOrderAnalytics = async (req, res, next) => {
  try {
    const summary = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totals = summary.reduce(
      (acc, s) => {
        acc.totalOrders += s.count;
        acc.totalRevenue += s.totalRevenue;
        return acc;
      },
      { totalOrders: 0, totalRevenue: 0 }
    );

    const byStatus = Object.fromEntries(
      Object.values(ORDER_STATUS).map((s) => [s, { count: 0, totalRevenue: 0 }])
    );
    summary.forEach((s) => {
      byStatus[s._id] = { count: s.count, totalRevenue: s.totalRevenue };
    });

    return res.json(formatResponse({ ...totals, byStatus }, 'Analytics retrieved'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrderAnalytics,
};
