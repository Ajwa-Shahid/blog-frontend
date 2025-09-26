'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Layout from '../../../Components/layout/Layout';
import AdminUserManagement from '../../../Components/Admin/AdminUserManagement';
import { selectCurrentUser, selectIsAuthenticated } from '../../../redux/slices/authSlice';

// Mock data - replace with actual API call
const mockUsers = [

  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com', 
    status: 'active',
    role: 'super_admin',
    created_at: '2024-01-01T10:00:00Z'
  }
];

export default function AdminUsersPage() {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authToken = useSelector((state: any) => state.auth.accessToken);
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }

    // Check if user is admin
    if (user?.role !== 'super_admin' && user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    // Fetch users when component mounts
    fetchUsers();
  }, [isAuthenticated, user, router]);

  // Implement actual API call to fetch users
  const fetchUsers = async () => {
    console.log('=== DEBUG INFO ===');
    console.log('Auth Token:', authToken ? `${authToken.substring(0, 20)}...` : 'No token');
    console.log('User:', user);
    console.log('Is Authenticated:', isAuthenticated);
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');
    
    if (!authToken) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response statusText:', response.statusText);

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const userData = await response.json();
      console.log('Fetched users:', userData); // Debug log
      setUsers(userData || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !isAuthenticated || !user) {
    return (
      <Layout showHeader={true}>
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (user.role !== 'super_admin' && user.role !== 'admin') {
    return (
      <Layout showHeader={true}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showHeader={true}>
      <div className="min-h-screen bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading users...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <div className="text-red-600 mb-2">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-red-900 mb-2">Failed to Load Users</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={fetchUsers}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <AdminUserManagement users={users} />
        )}
      </div>
    </Layout>
  );
}