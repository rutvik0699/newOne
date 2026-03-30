const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

const validatePassword = (password) =>
  typeof password === 'string' && password.length >= 6;

const validatePhone = (phone) =>
  !phone || /^[\d\s\-+().]{7,20}$/.test(phone);

module.exports = { validateEmail, validatePassword, validatePhone };
