import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const typeStyles = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
};

const typeIcons = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

const Toast = () => {
  const { toasts, hideToast } = useContext(AppContext);

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${typeStyles[toast.type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[280px] max-w-sm animate-fade-in`}
        >
          <span className="text-lg font-bold">{typeIcons[toast.type]}</span>
          <span className="flex-1 text-sm">{toast.message}</span>
          <button
            onClick={() => hideToast(toast.id)}
            className="text-white hover:text-gray-200 focus:outline-none text-lg leading-none"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
