import React from 'react';

interface MessageBarProps {
  children: React.ReactNode;
  type: 'info' | 'error' | 'success';
  onClose: () => void;
}

export const MessageBar: React.FC<MessageBarProps> = ({ children, type, onClose }) => {
  const bgColor = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  }[type];

  return (
    <div className={`px-4 py-2 ${bgColor} border-l-4 flex items-center justify-between`}>
      <div>{children}</div>
      <button 
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};