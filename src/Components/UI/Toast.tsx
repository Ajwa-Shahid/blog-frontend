'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

export default function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return isDarkMode
          ? 'bg-green-900/90 text-green-100 border-green-700'
          : 'bg-green-50 text-green-800 border-green-200';
      case 'error':
        return isDarkMode
          ? 'bg-red-900/90 text-red-100 border-red-700'
          : 'bg-red-50 text-red-800 border-red-200';
      case 'info':
        return isDarkMode
          ? 'bg-blue-900/90 text-blue-100 border-blue-700'
          : 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return isDarkMode
          ? 'bg-gray-900/90 text-gray-100 border-gray-700'
          : 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
      <div className={`px-4 py-3 rounded-lg border shadow-lg ${getTypeStyles()}`}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{message}</p>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose?.(), 300);
            }}
            className="ml-3 text-sm opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}