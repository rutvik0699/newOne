const Order = require('../models/Order');
const Item = require('../models/Item');
const ApiResponse = require('../utils/apiResponse');
const { getPaginationOptions, buildPaginationMeta } = require('../utils/helpers');
const { HTTP_STATUS, USER_ROLES } = require('../config/constants');

/**
 * POST /api/orders - Create order
 */
const createOrder = async (req, res, next) => {
  try {
    const { items, notes, deliveryDate } = req.body;

    // Validate items and compute prices from DB
    const enrichedItems = [];
    for (const orderItem of items) {
      const dbItem = await Item.findById(orderItem.itemId);
      if (!dbItem) {
        return ApiResponse.error(res, `Item ${orderItem.itemId} not found`, HTTP_STATUS.NOT_FOUND);
      }
      if (dbItem.quantity < orderItem.quantity) {
        return ApiResponse.error(res, `Insufficient stock for ${dbItem.name}`, HTTP_STATUS.BAD_REQUEST);
      }
      enrichedItems.push({ itemId: dbItem._id, quantity: orderItem.quantity, price: dbItem.price });
    }

    const order = new Order({
      userId: req.user._id,
      items: enrichedItems,
      notes,
      deliveryDate,
    });
    order.calculateTotal();
    await order.save();

    const populated = await Order.findById(order._id).populate('userId', 'name email').populate('items.itemId', 'name price');
    return ApiResponse.created(res, populated, 'Order created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders - List orders with filters and pagination
 */
const getOrders = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { status, startDate, endDate, search } = req.query;

    const filter = {};
    // Non-admin users see only their own orders
    if (req.user.role !== USER_ROLES.ADMIN) {
      filter.userId = req.user._id;
    }
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.orderDate = {};
      if (startDate) filter.orderDate.$gte = new Date(startDate);
      if (endDate) filter.orderDate.$lte = new Date(endDate);
    }
    if (search) {
      filter.orderNumber = { $regex: search, $options: 'i' };
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('userId', 'name email')
        .populate('items.itemId', 'name price')
        .skip(skip)
        .limit(limit)
        .sort({ orderDate: -1 }),
      Order.countDocuments(filter),
    ]);

    return ApiResponse.paginated(res, orders, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:id - Get single order
 */
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('items.itemId', 'name price description');

    if (!order) return ApiResponse.error(res, 'Order not found', HTTP_STATUS.NOT_FOUND);

    // Non-admin can only view their own orders
    if (req.user.role !== USER_ROLES.ADMIN && order.userId._id.toString() !== req.user._id.toString()) {
      return ApiResponse.error(res, 'Access denied', HTTP_STATUS.FORBIDDEN);
    }

    return ApiResponse.success(res, order);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/orders/:id - Update order
 */
const updateOrder = async (req, res, next) => {
  try {
    const { status, notes, deliveryDate, items } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return ApiResponse.error(res, 'Order not found', HTTP_STATUS.NOT_FOUND);

    if (req.user.role !== USER_ROLES.ADMIN && order.userId.toString() !== req.user._id.toString()) {
      return ApiResponse.error(res, 'Access denied', HTTP_STATUS.FORBIDDEN);
    }

    if (status) order.status = status;
    if (notes !== undefined) order.notes = notes;
    if (deliveryDate) order.deliveryDate = deliveryDate;

    if (items && items.length > 0) {
      const enrichedItems = [];
      for (const orderItem of items) {
        const dbItem = await Item.findById(orderItem.itemId);
        if (!dbItem) return ApiResponse.error(res, `Item ${orderItem.itemId} not found`, HTTP_STATUS.NOT_FOUND);
        enrichedItems.push({ itemId: dbItem._id, quantity: orderItem.quantity, price: dbItem.price });
      }
      order.items = enrichedItems;
      order.calculateTotal();
    }

    await order.save();
    const populated = await Order.findById(order._id).populate('userId', 'name email').populate('items.itemId', 'name price');
    return ApiResponse.success(res, populated, 'Order updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/orders/:id - Delete order
 */
const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return ApiResponse.error(res, 'Order not found', HTTP_STATUS.NOT_FOUND);

    if (req.user.role !== USER_ROLES.ADMIN && order.userId.toString() !== req.user._id.toString()) {
      return ApiResponse.error(res, 'Access denied', HTTP_STATUS.FORBIDDEN);
    }

    await order.deleteOne();
    return ApiResponse.success(res, null, 'Order deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/filter/by-date - Filter orders by date range
 */
const filterByDate = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return ApiResponse.error(res, 'startDate and endDate are required', HTTP_STATUS.BAD_REQUEST);
    }

    const filter = {
      orderDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
    };
    if (req.user.role !== USER_ROLES.ADMIN) {
      filter.userId = req.user._id;
    }

    const orders = await Order.find(filter)
      .populate('userId', 'name email')
      .populate('items.itemId', 'name price')
      .sort({ orderDate: -1 });

    return ApiResponse.success(res, orders);
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getOrders, getOrder, updateOrder, deleteOrder, filterByDate };
