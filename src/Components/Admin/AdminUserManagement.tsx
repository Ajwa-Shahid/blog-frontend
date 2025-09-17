// Admin User Management Component
'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import UserStatusBadge from '../UI/UserStatusBadge';
import UserStatusManager from '../UI/UserStatusManager';
import { useUserStatusManager } from '../../services/userStatusService';
import { UserStatus } from '../../types/userStatus';

interface AdminUserManagementProps {
  users: Array<{
    id: string;
    username: string;
    email: string;
    status: string;
    role: string;
    created_at: string;
  }>;
}

/**
 * Admin component for managing user statuses
 * Only accessible to users with 'update_user' permission (Super Admin by default)
 */
const AdminUserManagement: React.FC<AdminUserManagementProps> = ({ users }) => {
  const currentUser = useSelector((state: any) => state.auth.user);
  const authToken = useSelector((state: any) => state.auth.accessToken);
  const [localUsers, setLocalUsers] = useState(users);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Update local users when users prop changes
  React.useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  // Custom status change handler with UI updates
  const handleStatusChange = async (userId: string, newStatus: UserStatus): Promise<void> => {
    if (!authToken) {
      throw new Error('Authentication required');
    }

    console.log(`🔄 Starting status update for user ${userId} to ${newStatus}`);
    setIsUpdating(userId);
    
    try {
      // Call the backend API to update status
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/users/${userId}`;
      console.log(`📡 Making PATCH request to: ${apiUrl}`);
      console.log(`📦 Request body:`, { status: newStatus });
      console.log(`🔑 Auth token:`, authToken ? `${authToken.substring(0, 20)}...` : 'None');

      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      console.log(`📥 Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ API Error:`, errorData);
        throw new Error(errorData.message || `Failed to update user status: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log(`✅ API Response:`, responseData);

      // Update the local state to reflect the change immediately
      setLocalUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, status: newStatus }
            : user
        )
      );

      // Show success message
      console.log(`✅ Successfully updated user ${userId} status to ${newStatus} in database`);
      
    } catch (error) {
      console.error('❌ Failed to update user status:', error);
      throw error;
    } finally {
      setIsUpdating(null);
    }
  };

  // Check if current user can manage users (has super_admin role or update_user permission)
  const canManageUsers = currentUser?.role === 'super_admin' || currentUser?.role === 'admin';

  if (!canManageUsers) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>Access Denied: You don't have permission to manage user statuses.</p>
        <p className="text-sm text-gray-500 mt-2">
          Required permission: update_user
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">User Status Management</h2>
        <p className="text-gray-600">
          Manage user account statuses. Only Super Admins can modify user statuses.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {localUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.username}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <UserStatusBadge 
                    status={user.status}
                    size="sm"
                    showIcon={true}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.id !== currentUser?.id && (
                    <div className="relative">
                      <UserStatusManager
                        currentStatus={user.status}
                        userId={user.id}
                        onStatusChange={handleStatusChange}
                        showLabel={false}
                        compact={true}
                        disabled={isUpdating === user.id}
                        key={`${user.id}-${user.status}`}
                      />
                      {isUpdating === user.id && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                          <svg className="w-4 h-4 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )}
                  {user.id === currentUser?.id && (
                    <span className="text-sm text-gray-400">
                      Cannot modify own status
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Status Information:</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <div className="flex items-center gap-2">
            <UserStatusBadge status={UserStatus.ACTIVE} size="sm" />
            <span>User can access all features normally</span>
          </div>
          <div className="flex items-center gap-2">
            <UserStatusBadge status={UserStatus.INACTIVE} size="sm" />
            <span>User account is temporarily disabled</span>
          </div>
          <div className="flex items-center gap-2">
            <UserStatusBadge status={UserStatus.BANNED} size="sm" />
            <span>User account is permanently banned</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;