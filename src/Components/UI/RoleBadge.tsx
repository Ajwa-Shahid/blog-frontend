'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Role, getRoleConfig, isValidRole, normalizeRole } from '../../types/role';

interface RoleBadgeProps {
  role?: Role | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
  showTooltip?: boolean;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ 
  role, 
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
  
  // Normalize and validate role
  const normalizedRole = typeof role === 'string' 
    ? normalizeRole(role)
    : role || Role.USER;
  
  const validRole = isValidRole(normalizedRole) ? normalizedRole : Role.USER;
  const roleConfig = getRoleConfig(validRole, isDarkMode);
  
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

  const getRoleIcon = () => {
    switch (validRole) {
      case Role.SUPER_ADMIN:
        return (
          <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.719,17.073l-6.562-6.51c-0.27-0.268-0.27-0.701,0-0.969l1.329-1.32c0.27-0.268,0.701-0.268,0.969,0l4.248,4.214l10.312-10.217c0.27-0.268,0.701-0.268,0.969,0l1.329,1.32c0.27,0.268,0.27,0.701,0,0.969l-12.625,12.493C10.42,17.341,9.989,17.341,9.719,17.073z" clipRule="evenodd" />
          </svg>
        );
      case Role.ADMIN:
        return (
          <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2L3 7v3c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-7-5z" clipRule="evenodd" />
          </svg>
        );
      case Role.MODERATOR:
        return (
          <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case Role.EDITOR:
        return (
          <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        );
      case Role.USER:
      default:
        return (
          <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <span 
      className={`inline-flex items-center gap-1 rounded-full font-medium transition-colors ${sizeClasses[size]} ${roleConfig.color} ${roleConfig.bgColor} ${roleConfig.borderColor || (isDarkMode ? 'border-gray-600' : 'border-gray-200')} ${className}`}
      title={showTooltip ? roleConfig.description : undefined}
      role="status"
      aria-label={`User role: ${roleConfig.label}`}
    >
      {showIcon && getRoleIcon()}
      {roleConfig.label}
    </span>
  );
};

export default RoleBadge;