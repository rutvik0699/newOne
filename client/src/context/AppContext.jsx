import React, { createContext, useState, useCallback } from 'react';

export const AppContext = createContext(null);

let toastId = 0;

export const AppProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const hideToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <AppContext.Provider value={{ toasts, isLoading, setIsLoading, showToast, hideToast }}>
      {children}
    </AppContext.Provider>
  );
};
