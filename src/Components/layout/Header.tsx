'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { selectIsAuthenticated, selectCurrentUser, selectRefreshToken, logout } from '../../redux/slices/authSlice';
import { useLogoutMutation } from '../../redux/api/authApi';
import { useToast } from '../UI/ToastProvider';

interface HeaderProps {
  showAuthButtons?: boolean;
}

export default function Header({ showAuthButtons = true }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const refreshToken = useSelector(selectRefreshToken);
  const [logoutMutation] = useLogoutMutation();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted ? theme === 'dark' : false;
  const toggleTheme = () => setTheme(isDarkMode ? 'light' : 'dark');

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        const result = await logoutMutation({ refreshToken }).unwrap();
        showToast(result.message || 'Logged out successfully', 'success');
      } else {
        showToast('Logged out successfully', 'success');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      showToast('Logout failed, but you have been signed out locally', 'error');
    } finally {
      dispatch(logout());
    }
  };

  // Prevent hydration mismatch by using default styles until mounted
  if (!mounted) {
    return (
      <header className="p-6 border-b transition-colors border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-black">
            Bijli Coin
          </Link>
          <div className="flex items-center gap-4">
            {/* Placeholder theme toggle */}
            <button className="p-2 rounded-lg bg-gray-100 text-gray-900">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            </button>
            {showAuthButtons && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Loading...</span>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={`p-6 border-b transition-colors ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex-1">
          <Link href="/" className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
            Bijli Coin
          </Link>
        </div>
        
        <div className="flex-1 flex items-center justify-end gap-4">
          {/* Theme Toggle - Always visible */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'bg-gray-800 text-white hover:bg-gray-700' 
                : 'bg-gray-100 text-black hover:bg-gray-200'
            }`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          {/* Authentication-based navigation */}
          {showAuthButtons && (
            <>
              {isAuthenticated ? (
                <>
                  {/* Admin link - only show for admin users */}
                  {(user?.role === 'super_admin' || user?.role === 'admin') && (
                    <Link 
                      href="/admin"
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isDarkMode 
                          ? 'text-yellow-300 bg-yellow-900 hover:bg-yellow-800' 
                          : 'text-yellow-800 bg-yellow-100 hover:bg-yellow-200'
                      }`}
                    >
                      Admin
                    </Link>
                  )}
                  
                  <Link 
                    href="/dashboard"
                    className={`py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isDarkMode 
                        ? 'text-black bg-white hover:bg-gray-200' 
                        : 'text-white bg-black hover:bg-gray-800'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`py-3 px-4 rounded-lg text-sm font-medium border border-transparent transition-all duration-200 ${
                      isDarkMode 
                        ? 'text-white bg-gray-800 hover:bg-gray-700' 
                        : 'text-black bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/signin"
                    className={`py-3 px-4 border border-transparent text-sm font-medium rounded-lg transition-all duration-200 ${
                      isDarkMode 
                        ? 'text-black bg-white hover:bg-gray-200' 
                        : 'text-white bg-black hover:bg-gray-800'
                    }`}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/signup"
                    className={`py-3 px-4 rounded-lg text-sm font-medium border transition-all duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 text-white hover:bg-gray-800' 
                        : 'border-gray-300 text-black hover:bg-gray-100'
                    }`}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}