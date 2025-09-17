'use client';

import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '../../redux/slices/authSlice';
import Layout from '../../Components/layout/Layout';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTheme } from 'next-themes';

export default function Dashboard() {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const router = useRouter();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

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
              Blog System
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
                You have successfully registered and logged in to your blog system.
              </p>
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
                  <span className={`capitalize px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === 'active' 
                      ? isDarkMode 
                        ? 'bg-green-900 text-green-200 border border-green-700' 
                        : 'bg-green-100 text-green-800 border border-green-200'
                      : isDarkMode 
                        ? 'bg-yellow-900 text-yellow-200 border border-yellow-700' 
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  }`}>
                    {user.status}
                  </span>
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
                Start Blogging
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