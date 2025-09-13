'use client';

import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '../../redux/slices/authSlice';
import Layout from '../../Components/layout/Layout';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return (
      <Layout showHeader={true}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showHeader={true}>
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-20">
          <h1 className="text-4xl font-bold mb-6 text-black dark:text-white">
            Welcome to your Dashboard, {user.username}!
          </h1>
          <p className="text-xl mb-8 text-gray-600 dark:text-gray-400">
            You have successfully registered and logged in to your blog system.
          </p>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
              Your Profile
            </h2>
            <div className="space-y-2 text-left">
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Username:</span> {user.username}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Role:</span> {user.role}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Status:</span> {user.status}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}