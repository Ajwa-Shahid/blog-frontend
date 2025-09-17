'use client';

import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '../../redux/slices/authSlice';
import Layout from '../../Components/layout/Layout';
import UserStatusBadge from '../../Components/UI/UserStatusBadge';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';

export default function Dashboard() {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted ? theme === 'dark' : false;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return (
      <Layout showHeader={true}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showHeader={true}>
      <div className="h-screen flex items-center justify-center p-4 overflow-hidden">
        <div className="max-w-2xl w-full space-y-6">
          {/* Main Title */}
          <div className="text-center">
            <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Bijli Coin
            </h1>
          </div>

          {/* Dashboard Content */}
          <div className={`p-6 rounded-2xl shadow-xl border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-900 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="text-center mb-6">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Welcome to your Dashboard, {user.username}!
              </h2>
              <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                You have successfully registered and logged in to Bijli Coin.
              </p>
              
              {/* Admin button - only show for admin users */}
              {(user?.role === 'super_admin' || user?.role === 'admin') && (
                <div className="mt-4">
                  <Link 
                    href="/admin"
                    className={`inline-block py-3 px-6 border border-transparent text-sm font-medium rounded-lg transition-all duration-200 ${
                      isDarkMode 
                        ? 'text-black bg-white hover:bg-gray-200' 
                        : 'text-white bg-black hover:bg-gray-800'
                    }`}
                  >
                    Admin Dashboard
                  </Link>
                </div>
              )}
            </div>
            
            {/* Profile Card */}
            <div className={`p-4 rounded-xl border transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-3 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Your Profile
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Username:
                  </span>
                  <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {user.username}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email:
                  </span>
                  <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {user.email}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Role:
                  </span>
                  <span className={`capitalize ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {user.role}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status:
                  </span>
                  <UserStatusBadge 
                    status={user.status}
                    size="sm"
                    showIcon={true}
                    showTooltip={true}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-center space-x-4">
              <button
                className={`py-3 px-4 border border-transparent text-sm font-medium rounded-lg transition-all duration-200 ${
                  isDarkMode 
                    ? 'text-black bg-white hover:bg-gray-200' 
                    : 'text-white bg-black hover:bg-gray-800'
                }`}
              >
                Start Creating
              </button>
              <button
                className={`py-3 px-4 rounded-lg text-sm font-medium border transition-all duration-200 ${
                  isDarkMode 
                    ? 'border-gray-600 text-white hover:bg-gray-800' 
                    : 'border-gray-300 text-black hover:bg-gray-100'
                }`}
              >
                View Posts
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}