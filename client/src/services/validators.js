export const validateEmail = (email) =>
  /^\S+@\S+\.\S+$/.test(email) ? '' : 'Valid email is required';

export const validatePassword = (password) =>
  password && password.length >= 6 ? '' : 'Password must be at least 6 characters';

export const validateRequired = (value, label = 'This field') =>
  value && String(value).trim() ? '' : `${label} is required`;

export const validatePositiveNumber = (value, label = 'Value') =>
  value > 0 ? '' : `${label} must be greater than 0`;

export const validateNonNegativeNumber = (value, label = 'Value') =>
  value >= 0 ? '' : `${label} cannot be negative`;
