'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import UserStatusBadge from '../UI/UserStatusBadge';
import RoleBadge from '../UI/RoleBadge';
import Button from '../UI/Button';
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

const AdminUserManagement: React.FC<AdminUserManagementProps> = ({ users }) => {
  const { theme } = require('next-themes');
  const isDarkMode = theme?.resolvedTheme === 'dark';
  const currentUser = useSelector((state: any) => state.auth.user);
  const authToken = useSelector((state: any) => state.auth.accessToken);
  const [localUsers, setLocalUsers] = useState(users);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [editStates, setEditStates] = useState<{[userId: string]: {role: string, status: string, editingRole: boolean, editingStatus: boolean}}>({});
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: Role.USER, status: UserStatus.ACTIVE });

  React.useEffect(() => {
    const initial: {[userId: string]: {role: string, status: string, editingRole: boolean, editingStatus: boolean}} = {};
    users.forEach(u => {
      initial[u.id] = {
        role: u.role,
        status: u.status,
        editingRole: false,
        editingStatus: false
      };
    });
    setEditStates(initial);
  }, [users]);

  React.useEffect(() => {
    setLocalUsers(users);
  }, [users]);

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
      setLocalUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    } catch (error) {
      alert('Failed to delete user: ' + (error as Error).message);
    } finally {
      setDeletingUserId(null);
      setShowDeleteConfirm(null);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: UserStatus): Promise<void> => {
    if (!authToken) {
      throw new Error('Authentication required');
    }

    setIsUpdating(userId);
    
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/users/${userId}`;
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update user status: ${response.statusText}`);
      }

      setLocalUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, status: newStatus }
            : user
        )
      );
      
    } catch (error) {
      console.error('❌ Failed to update user status:', error);
      throw error;
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: Role): Promise<void> => {
    if (!authToken) {
      throw new Error('Authentication required');
    }

    setIsUpdating(userId);
    
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/users/${userId}`;
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update user role: ${response.statusText}`);
      }

      setLocalUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, role: newRole }
            : user
        )
      );
      
    } catch (error) {
      console.error('❌ Failed to update user role:', error);
      throw error;
    } finally {
      setIsUpdating(null);
    }
  };

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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">User Management</h2>
          <p className="text-gray-600">
            Manage user account statuses and roles. Only Super Admins can modify user privileges.
          </p>
        </div>
        <button
          className="flex items-center gap-1 bg-blue-600 text-white text-sm px-4 py-1 rounded-full shadow hover:bg-blue-700 transition disabled:opacity-50 min-w-[80px] min-h-[28px] justify-center"
          style={{height: '28px'}}
          onClick={() => setShowAddModal(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add New User</h3>
            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newUser.username}
                  onChange={e => setNewUser(u => ({...u, username: e.target.value}))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newUser.email}
                  onChange={e => setNewUser(u => ({...u, email: e.target.value}))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newUser.password}
                  onChange={e => setNewUser(u => ({...u, password: e.target.value}))}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddModal(false)}
                  disabled={addingUser}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  disabled={addingUser || !newUser.username || !newUser.email || !newUser.password}
                  onClick={async () => {
                    if (!authToken) return alert('Authentication required');
                    setAddingUser(true);
                    try {
                      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/users`;
                      const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${authToken}`,
                        },
                        body: JSON.stringify(newUser),
                      });
                      if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.message || `Failed to add user: ${response.statusText}`);
                      }
                      const created = await response.json();
                      setLocalUsers(prev => [...prev, created]);
                      setShowAddModal(false);
                      setNewUser({ username: '', email: '', password: '', role: Role.USER, status: UserStatus.ACTIVE });
                    } catch (error) {
                      alert('Failed to add user: ' + (error as Error).message);
                    } finally {
                      setAddingUser(false);
                    }
                  }}
                >
                  {addingUser ? 'Adding...' : 'Add User'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className={isDarkMode ? 'bg-gray-900' : ''}> 
          <table className={`min-w-full divide-y rounded-lg shadow-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-black'}`}> 
            <thead className="bg-gray-50">
              <tr className={isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {localUsers.map((user) => (
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
                    <UserStatusBadge status={user.status} size="sm" showIcon={true} />
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.id !== currentUser?.id && (
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                          onClick={() => setShowDeleteConfirm(user.id)}
                          disabled={deletingUserId === user.id}
                        >
                          {deletingUserId === user.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    )}
                    {showDeleteConfirm === user.id && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                          <h3 className="text-lg font-bold mb-2 text-red-700">Confirm Deletion</h3>
                          <p className="mb-4">
                            Are you sure you want to delete <span className="font-semibold">{user.username}</span>? This action cannot be undone.
                          </p>
                          <div className="flex gap-2 justify-end">
                            <button
                              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                              onClick={() => setShowDeleteConfirm(null)}
                              disabled={deletingUserId === user.id}
                            >
                              Cancel
                            </button>
                            <button
                              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={deletingUserId === user.id}
                            >
                              {deletingUserId === user.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;