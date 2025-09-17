'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { UserStatus, getStatusConfig, isValidUserStatus, normalizeUserStatus } from '../../types/userStatus';

interface UserStatusBadgeProps {
  status?: UserStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
  showTooltip?: boolean;
}

const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ 
  status, 
  size = 'md', 
  showIcon = true, 
  className = '',
  showTooltip = true
}) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted ? theme === 'dark' : false;
  
  // Normalize and validate status
  const normalizedStatus = typeof status === 'string' 
    ? normalizeUserStatus(status)
    : status || UserStatus.ACTIVE;
  
  const validStatus = isValidUserStatus(normalizedStatus) ? normalizedStatus : UserStatus.ACTIVE;
  const statusConfig = getStatusConfig(validStatus, isDarkMode);
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const getStatusIcon = () => {
    switch (validStatus) {
      case UserStatus.ACTIVE:
        return (
          <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case UserStatus.INACTIVE:
        return (
          <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        );
      case UserStatus.BANNED:
        return (
          <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 008.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <span 
      className={`inline-flex items-center gap-1 rounded-full font-medium transition-colors ${sizeClasses[size]} ${statusConfig.color} ${statusConfig.bgColor} ${statusConfig.borderColor || (isDarkMode ? 'border-gray-600' : 'border-gray-200')} ${className}`}
      title={showTooltip ? statusConfig.description : undefined}
      role="status"
      aria-label={`User status: ${statusConfig.label}`}
    >
      {showIcon && getStatusIcon()}
      {statusConfig.label}
    </span>
  );
};

export default UserStatusBadge;