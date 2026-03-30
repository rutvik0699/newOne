import { useState, useCallback } from 'react';

const useForm = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const setFieldError = useCallback((field, message) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const handleSubmit = useCallback((onSubmit, validate) => (e) => {
    e.preventDefault();
    if (validate) {
      const validationErrors = validate(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }
    onSubmit(values);
  }, [values]);

  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
  }, [initialValues]);

  const setFormValues = useCallback((newValues) => {
    setValues(newValues);
  }, []);

  return { values, errors, handleChange, handleSubmit, setFieldError, reset, setValues: setFormValues };
};

export default useForm;
