import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const toastStyles = {
  success: 'bg-green-50 border-green-400 text-green-800',
  error: 'bg-red-50 border-red-400 text-red-800',
  warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
  info: 'bg-blue-50 border-blue-400 text-blue-800',
};

const toastIcons = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const Toast = () => {
  const { toasts, removeToast } = useContext(AppContext);

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-lg border shadow-md animate-fade-in ${toastStyles[toast.type]}`}
        >
          <span className="font-bold text-lg leading-5">{toastIcons[toast.type]}</span>
          <p className="flex-1 text-sm">{toast.message}</p>
          <button onClick={() => removeToast(toast.id)} className="text-current opacity-60 hover:opacity-100 text-lg leading-5">
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
