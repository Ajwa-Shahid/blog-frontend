'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { UserStatus, getStatusConfig, isValidUserStatus, normalizeUserStatus } from '../../types/userStatus';

interface UserStatusManagerProps {
  userIndex?: number;
  totalUsers?: number;
  currentStatus: UserStatus | string;
  userId: string;
  onStatusChange: (userId: string, newStatus: UserStatus) => Promise<void>;
  disabled?: boolean;
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
}

const UserStatusManager: React.FC<UserStatusManagerProps> = ({
  currentStatus,
  userId,
  onStatusChange,
  disabled = false,
  className = '',
  showLabel = true,
  compact = false,
  userIndex,
  totalUsers
}) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate dropdown position when it opens
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      // If last two users, show upwards
      if (typeof userIndex === 'number' && typeof totalUsers === 'number' && userIndex >= totalUsers - 2) {
        setDropdownPosition('top');
        return;
      }
      // Otherwise, always show below
      setDropdownPosition('bottom');
    }
  }, [isOpen]);

  const isDarkMode = mounted ? theme === 'dark' : false;

  // Normalize and validate current status
  const normalizedCurrentStatus = typeof currentStatus === 'string' 
    ? normalizeUserStatus(currentStatus)
    : currentStatus || UserStatus.ACTIVE;
  
  const validCurrentStatus = isValidUserStatus(normalizedCurrentStatus) 
    ? normalizedCurrentStatus 
    : UserStatus.ACTIVE;

  console.log('=== UserStatusManager Debug ===');
  console.log('Raw currentStatus prop:', currentStatus);
  console.log('Normalized currentStatus:', normalizedCurrentStatus);
  console.log('Valid currentStatus:', validCurrentStatus);
  console.log('================================');

  const handleStatusChange = async (newStatus: UserStatus) => {
    if (newStatus === validCurrentStatus || isLoading || disabled) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await onStatusChange(userId, newStatus);
      setIsOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user status';
      setError(errorMessage);
      console.error('Failed to update user status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get current config - make sure to use the most up-to-date status
  const currentConfig = getStatusConfig(validCurrentStatus, isDarkMode);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700' 
            : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Change user status"
      >
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${currentConfig.color} ${currentConfig.bgColor}`}>
          {currentConfig.label}
        </span>
        {!disabled && !isLoading && (
          <svg 
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
        {isLoading && (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
      </button>

      {/* Dropdown with dynamic positioning */}
      {isOpen && !disabled && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className={`absolute left-0 w-40 rounded-md border shadow-lg z-50 max-h-48 overflow-y-auto ${
            dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
          } ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-600' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="py-1">
              {Object.values(UserStatus).map((status) => {
                const config = getStatusConfig(status, isDarkMode);
                const isCurrentStatus = status === validCurrentStatus;
                
                console.log(`Option: ${status} | Current: ${validCurrentStatus} | Match: ${isCurrentStatus}`);
                
                return (
                  <div key={status} className="block">
                    <button
                      onClick={() => handleStatusChange(status)}
                      disabled={isCurrentStatus || isLoading}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between ${
                        isCurrentStatus 
                          ? isDarkMode
                            ? 'bg-gray-700 text-gray-300 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : isDarkMode 
                            ? 'hover:bg-gray-700 text-white' 
                            : 'hover:bg-gray-50 text-gray-900'
                      }`}
                    >
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color} ${config.bgColor}`}>
                        {config.label}
                      </span>
                      {isCurrentStatus && (
                        <svg className="w-4 h-4 text-green-500 ml-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserStatusManager;