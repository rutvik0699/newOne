import React from 'react';

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
};

const Loading = ({ fullScreen = false, size = 'md' }) => {
  const spinner = (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeMap[size]} rounded-full border-blue-600 border-t-transparent animate-spin`}
      />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default Loading;
