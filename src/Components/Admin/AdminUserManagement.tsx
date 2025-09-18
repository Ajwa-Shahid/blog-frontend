// Admin User Management Component
'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import UserStatusBadge from '../UI/UserStatusBadge';
import UserStatusManager from '../UI/UserStatusManager';
import RoleBadge from '../UI/RoleBadge';
import RoleManager from '../UI/RoleManager';
import { useUserStatusManager } from '../../services/userStatusService';
import { UserStatus } from '../../types/userStatus';
import { Role } from '../../types/role';

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
  const { theme } = require('next-themes');
  const isDarkMode = theme?.resolvedTheme === 'dark';
  const currentUser = useSelector((state: any) => state.auth.user);
  const authToken = useSelector((state: any) => state.auth.accessToken);
  const [localUsers, setLocalUsers] = useState(users);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Update local users when users prop changes
  // Delete user handler
  const handleDeleteUser = async (userId: string) => {
    if (!authToken) {
      throw new Error('Authentication required');
    }
    setDeletingUserId(userId);
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/users/${userId}`;
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete user: ${response.statusText}`);
      }
      // Remove user from local state
      setLocalUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    } catch (error) {
      alert('Failed to delete user: ' + (error as Error).message);
    } finally {
      setDeletingUserId(null);
      setShowDeleteConfirm(null);
    }
  };
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

  // Custom role change handler with UI updates
  const handleRoleChange = async (userId: string, newRole: Role): Promise<void> => {
    if (!authToken) {
      throw new Error('Authentication required');
    }

    console.log(`🔄 Starting role update for user ${userId} to ${newRole}`);
    setIsUpdating(userId);
    
    try {
      // Call the backend API to update role
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/users/${userId}`;
      console.log(`📡 Making PATCH request to: ${apiUrl}`);
      console.log(`📦 Request body:`, { role: newRole });
      console.log(`🔑 Auth token:`, authToken ? `${authToken.substring(0, 20)}...` : 'None');

      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      console.log(`📥 Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ API Error:`, errorData);
        throw new Error(errorData.message || `Failed to update user role: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log(`✅ API Response:`, responseData);

      // Update the local state to reflect the change immediately
      setLocalUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, role: newRole }
            : user
        )
      );

      // Show success message
      console.log(`✅ Successfully updated user ${userId} role to ${newRole} in database`);
      
    } catch (error) {
      console.error('❌ Failed to update user role:', error);
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
  <div className={`p-6 min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}> 
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">User Management</h2>
        <p className="text-gray-600">
          Manage user account statuses and roles. Only Super Admins can modify user privileges.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className={`overflow-x-auto ${isDarkMode ? 'bg-gray-900' : ''}`}> 
          <table className={`min-w-full divide-y rounded-lg shadow-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-black'}`}> 
            <thead className="bg-gray-50">
              <tr className={isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Actions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Actions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delete</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {localUsers.map((user, idx) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.username}</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <RoleBadge role={user.role} size="sm" showIcon={true} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.id !== currentUser?.id && (
                      <div className="relative">
                        <RoleManager
                          currentRole={user.role}
                          userId={user.id}
                          onRoleChange={handleRoleChange}
                          showLabel={false}
                          compact={true}
                          disabled={isUpdating === user.id}
                          key={`role-${user.id}-${user.role}`}
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
                      <span className="text-sm text-gray-400">Cannot modify own role</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <UserStatusBadge status={user.status} size="sm" showIcon={true} />
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
                          key={`status-${user.id}-${user.status}`}
                          userIndex={idx}
                          totalUsers={localUsers.length}
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
                      <span className="text-sm text-gray-400">Cannot modify own status</span>
                    )}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{typeof window !== 'undefined' ? new Date(user.created_at).toLocaleDateString() : ''}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.id !== currentUser?.id && (
                      <>
                        <button
                          className="text-red-600 hover:text-red-800 font-semibold px-2 py-1 border border-red-200 rounded transition disabled:opacity-50"
                          disabled={deletingUserId === user.id}
                          onClick={() => setShowDeleteConfirm(user.id)}
                        >
                          Delete
                        </button>
                        {showDeleteConfirm === user.id && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30" style={{overflow: 'visible'}}>
                            <div className="bg-white rounded-lg shadow-lg p-6 min-w-[22rem] max-w-2xl w-full break-words" style={{overflow: 'visible', wordBreak: 'break-word'}}>
                              <h3 className="text-lg font-bold mb-2 text-red-700">Confirm Deletion</h3>
                              <p className="mb-4" style={{wordBreak: 'break-word'}}>
                                Are you sure you want to delete <span className="font-semibold">{user.username}</span>? This action cannot be undone.
                              </p>
                              <div className="flex gap-2 justify-end">
                                <button
                                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                  onClick={() => setShowDeleteConfirm(null)}
                                  disabled={deletingUserId === user.id}
                                >Cancel</button>
                                <button
                                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold"
                                  onClick={() => handleDeleteUser(user.id)}
                                  disabled={deletingUserId === user.id}
                                >{deletingUserId === user.id ? 'Deleting...' : 'Delete'}</button>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-blue-50 rounded-lg">
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
        
        <div className="p-4 bg-purple-50 rounded-lg">
          <h3 className="font-medium text-purple-900 mb-2">Role Information:</h3>
          <div className="text-sm text-purple-800 space-y-1">
            <div className="flex items-center gap-2">
              <RoleBadge role={Role.SUPER_ADMIN} size="sm" />
              <span>Full system access and management</span>
            </div>
            <div className="flex items-center gap-2">
              <RoleBadge role={Role.ADMIN} size="sm" />
              <span>Administrative privileges</span>
            </div>
            <div className="flex items-center gap-2">
              <RoleBadge role={Role.EDITOR} size="sm" />
              <span>Content creation and editing privileges</span>
            </div>
            <div className="flex items-center gap-2">
              <RoleBadge role={Role.MODERATOR} size="sm" />
              <span>Content moderation privileges</span>
            </div>
            <div className="flex items-center gap-2">
              <RoleBadge role={Role.USER} size="sm" />
              <span>Standard user access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;