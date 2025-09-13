'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser, logout } from '../../redux/slices/authSlice';
import { useLogoutMutation } from '../../redux/api/authApi';

interface HeaderProps {
  showAuthButtons?: boolean;
}

export default function Header({ showAuthButtons = true }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const [logoutMutation] = useLogoutMutation();
  const dispatch = useDispatch();

  const isDarkMode = theme === 'dark';
  const toggleTheme = () => setTheme(isDarkMode ? 'light' : 'dark');

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      console.error('Logout failed:', error);
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
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isDarkMode 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 text-white hover:bg-gray-600' 
                        : 'bg-gray-200 text-black hover:bg-gray-300'
                    }`}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/signin"
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isDarkMode 
                        ? 'bg-white text-black hover:bg-gray-200' 
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/signup"
                    className={`px-4 py-2 rounded-lg font-medium border transition-colors ${
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