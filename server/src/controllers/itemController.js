const Item = require('../models/Item');
const ApiResponse = require('../utils/apiResponse');
const { getPaginationOptions, buildPaginationMeta } = require('../utils/helpers');
const { HTTP_STATUS } = require('../config/constants');

/**
 * POST /api/items - Create item (Admin)
 */
const createItem = async (req, res, next) => {
  try {
    const item = await Item.create(req.body);
    return ApiResponse.created(res, item, 'Item created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/items - List items with pagination, search, category filter
 */
const getItems = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { search, category } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter.category = category;

    const [items, total] = await Promise.all([
      Item.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Item.countDocuments(filter),
    ]);

    return ApiResponse.paginated(res, items, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/items/:id - Get single item
 */
const getItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return ApiResponse.error(res, 'Item not found', HTTP_STATUS.NOT_FOUND);
    return ApiResponse.success(res, item);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/items/:id - Update item (Admin)
 */
const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return ApiResponse.error(res, 'Item not found', HTTP_STATUS.NOT_FOUND);
    return ApiResponse.success(res, item, 'Item updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/items/:id - Delete item (Admin)
 */
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return ApiResponse.error(res, 'Item not found', HTTP_STATUS.NOT_FOUND);
    return ApiResponse.success(res, null, 'Item deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { createItem, getItems, getItem, updateItem, deleteItem };
