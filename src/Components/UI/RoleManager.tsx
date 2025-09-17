'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Role, getRoleConfig, isValidRole, normalizeRole } from '../../types/role';

interface RoleManagerProps {
  currentRole: Role | string;
  userId: string;
  onRoleChange: (userId: string, newRole: Role) => Promise<void>;
  disabled?: boolean;
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
}

const RoleManager: React.FC<RoleManagerProps> = ({
  currentRole,
  userId,
  onRoleChange,
  disabled = false,
  className = '',
  showLabel = true,
  compact = false
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
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = 160; // Approximate height of dropdown with 4 options
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      
      // More aggressive threshold - show upward if we're in bottom 40% of viewport
      // This will catch more users near the bottom
      const bottomThreshold = viewportHeight * 0.6; // 60% from top means 40% from bottom
      const isInBottomArea = buttonRect.bottom > bottomThreshold;
      
      // Show upward if:
      // 1. Not enough space below (with padding), OR
      // 2. We're in the bottom 40% of the viewport AND there's any reasonable space above
      if (spaceBelow < (dropdownHeight + 20) || 
          (isInBottomArea && spaceAbove > 60)) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
  }, [isOpen]);

  const isDarkMode = mounted ? theme === 'dark' : false;

  // Normalize and validate current role
  const normalizedCurrentRole = typeof currentRole === 'string' 
    ? normalizeRole(currentRole)
    : currentRole || Role.USER;
  
  const validCurrentRole = isValidRole(normalizedCurrentRole) 
    ? normalizedCurrentRole 
    : Role.USER;

  const handleRoleChange = async (newRole: Role) => {
    if (newRole === validCurrentRole || isLoading || disabled) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await onRoleChange(userId, newRole);
      setIsOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user role';
      setError(errorMessage);
      console.error('Failed to update user role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get current config
  const currentConfig = getRoleConfig(validCurrentRole, isDarkMode);

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
        aria-label="Change user role"
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
          <div className={`absolute left-0 w-48 rounded-md border shadow-lg z-50 max-h-48 overflow-y-auto ${
            dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
          } ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-600' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="py-1">
              {Object.values(Role).map((role) => {
                const config = getRoleConfig(role, isDarkMode);
                const isCurrentRole = role === validCurrentRole;
                
                return (
                  <div key={role} className="block">
                    <button
                      onClick={() => handleRoleChange(role)}
                      disabled={isCurrentRole || isLoading}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between ${
                        isCurrentRole 
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
                      {isCurrentRole && (
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

export default RoleManager;