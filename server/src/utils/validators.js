const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().optional().allow(''),
  address: Joi.string().optional().allow(''),
  role: Joi.string().valid('Admin', 'User').optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

const itemSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  description: Joi.string().optional().allow(''),
  price: Joi.number().min(0).required(),
  quantity: Joi.number().integer().min(0).optional(),
  category: Joi.string().optional().allow(''),
  sku: Joi.string().optional().allow(''),
  image: Joi.string().uri().optional().allow(''),
  isActive: Joi.boolean().optional(),
});

const orderSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
  items: Joi.array()
    .items(
      Joi.object({
        itemId: Joi.string().hex().length(24).required(),
        name: Joi.string().optional().allow(''),
        quantity: Joi.number().integer().min(1).required(),
        price: Joi.number().min(0).required(),
      })
    )
    .min(1)
    .required(),
  notes: Joi.string().optional().allow(''),
  deliveryDate: Joi.date().optional(),
});

const validate = (schema) => (data) => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    const messages = error.details.map((d) => d.message).join(', ');
    return { valid: false, messages, value: null };
  }
  return { valid: true, messages: null, value };
};

module.exports = {
  validateRegisterData: validate(registerSchema),
  validateLoginData: validate(loginSchema),
  validateItemData: validate(itemSchema),
  validateOrderData: validate(orderSchema),
};
