const { PAGINATION } = require('../config/constants');

const generateOrderNumber = () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${Date.now()}-${random}`;
};

const calculateOrderTotal = (items) => {
  return items.reduce((total, item) => {
    const subtotal = item.price * item.quantity;
    return total + subtotal;
  }, 0);
};

const formatResponse = (data, message = 'Success', success = true) => ({
  success,
  message,
  data,
});

const getPagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || PAGINATION.DEFAULT_PAGE, 1);
  const limit = Math.min(
    parseInt(query.limit, 10) || PAGINATION.DEFAULT_LIMIT,
    PAGINATION.MAX_LIMIT
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

module.exports = { generateOrderNumber, calculateOrderTotal, formatResponse, getPagination };
