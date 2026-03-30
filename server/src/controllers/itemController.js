const Item = require('../models/Item');
const { formatResponse, getPagination } = require('../utils/helpers');

const createItem = async (req, res, next) => {
  try {
    const item = await Item.create(req.body);
    return res.status(201).json(formatResponse({ item }, 'Item created successfully'));
  } catch (error) {
    next(error);
  }
};

const getAllItems = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, category, isActive } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const [items, total] = await Promise.all([
      Item.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Item.countDocuments(filter),
    ]);

    return res.json(
      formatResponse(
        { items, pagination: { total, page, limit, pages: Math.ceil(total / limit) } },
        'Items retrieved'
      )
    );
  } catch (error) {
    next(error);
  }
};

const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json(formatResponse(null, 'Item not found', false));
    }
    return res.json(formatResponse({ item }, 'Item retrieved'));
  } catch (error) {
    next(error);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return res.status(404).json(formatResponse(null, 'Item not found', false));
    }
    return res.json(formatResponse({ item }, 'Item updated successfully'));
  } catch (error) {
    next(error);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    const { hard } = req.query;

    if (hard === 'true') {
      const item = await Item.findByIdAndDelete(req.params.id);
      if (!item) {
        return res.status(404).json(formatResponse(null, 'Item not found', false));
      }
      return res.json(formatResponse(null, 'Item permanently deleted'));
    }

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!item) {
      return res.status(404).json(formatResponse(null, 'Item not found', false));
    }
    return res.json(formatResponse({ item }, 'Item deactivated successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = { createItem, getAllItems, getItemById, updateItem, deleteItem };
