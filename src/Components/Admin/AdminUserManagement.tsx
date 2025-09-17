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
  const { handleStatusChange } = useUserStatusManager(authToken);

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
            {users.map((user) => (
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
                    <UserStatusManager
                      currentStatus={user.status}
                      userId={user.id}
                      onStatusChange={handleStatusChange}
                      showLabel={false}
                      compact={true}
                    />
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