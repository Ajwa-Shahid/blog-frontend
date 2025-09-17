'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser, selectRefreshToken, logout } from '../../redux/slices/authSlice';
import { useLogoutMutation } from '../../redux/api/authApi';
import { useToast } from '../UI/ToastProvider';

interface HeaderProps {
  showAuthButtons?: boolean;
}

export default function Header({ showAuthButtons = true }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const refreshToken = useSelector(selectRefreshToken);
  const [logoutMutation] = useLogoutMutation();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const isDarkMode = theme === 'dark';
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

  return (
    <header className={`p-6 border-b transition-colors ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex-1">
          <Link href="/" className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
            Blog System
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
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Welcome, {user?.username}
                  </span>
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