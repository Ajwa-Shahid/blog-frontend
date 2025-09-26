
"use client";
// Types for editStates
type EditState = {
  editingRole?: boolean;
  editingStatus?: boolean;
  role?: Role;
  status?: UserStatus;
};
// State for tracking which user's role/status is being edited
// ...existing code...

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import UserStatusBadge from '../UI/UserStatusBadge';
import UserStatusManager from '../UI/UserStatusManager';
import RoleBadge from '../UI/RoleBadge';
import RoleManager from '../UI/RoleManager';
import Button from '../UI/Button';
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
  // State for Add User modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: Role.USER,
    status: UserStatus.ACTIVE,
  });
  const [addingUser, setAddingUser] = useState(false);
  const { theme } = require('next-themes');
  const isDarkMode = theme?.resolvedTheme === 'dark';
  const currentUser = useSelector((state: any) => state.auth.user);
  const authToken = useSelector((state: any) => state.auth.accessToken);
  const [localUsers, setLocalUsers] = useState(users);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [editStates, setEditStates] = useState<{[userId: string]: {role: string, status: string, editingRole: boolean, editingStatus: boolean}}>({});
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

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
      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAFAFA]">
          <div
            className="rounded-2xl shadow-2xl flex flex-col justify-center items-center"
            style={{
              background: '#fff',
              width: '420px',
              height: '520px',
              padding: '32px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              wordBreak: 'break-word',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
            }}
          >
            <h2 className="text-2xl font-bold text-center mb-4 mt-2">Add New User</h2>
            <form className="flex flex-col justify-center gap-3 w-full flex-grow" style={{maxWidth: 340}} onSubmit={e => e.preventDefault()}>
              <div className="flex flex-col gap-1">
                <label className="font-normal text-sm">Username</label>
                <input
                  type="text"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200 bg-blue-50 text-base font-normal"
                  value={newUser.username}
                  onChange={e => setNewUser(u => ({...u, username: e.target.value}))}
                  placeholder="admin@example.com"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-normal text-sm">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200 text-base font-normal"
                  value={newUser.email}
                  onChange={e => setNewUser(u => ({...u, email: e.target.value}))}
                  placeholder="Email"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-normal text-sm">Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200 bg-blue-50 text-base font-normal"
                  value={newUser.password}
                  onChange={e => setNewUser(u => ({...u, password: e.target.value}))}
                  placeholder="Password"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-normal text-sm">Role</label>
                <select
                  className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200 text-base font-normal"
                  value={newUser.role}
                  onChange={e => setNewUser(u => ({...u, role: e.target.value as Role}))}
                >
                  {Object.values(Role).map(r => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-normal text-sm">Status</label>
                <select
                  className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200 text-base font-normal"
                  value={newUser.status}
                  onChange={e => setNewUser(u => ({...u, status: e.target.value as UserStatus}))}
                >
                  {Object.values(UserStatus).map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                {/* Use shared Button component for modal actions */}
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  className="px-5 py-2 text-base font-medium"
                  onClick={() => setShowAddModal(false)}
                  disabled={addingUser}
                >Cancel</Button>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  className="px-5 py-2 text-base font-semibold"
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
                >Add User</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className={`overflow-x-auto ${isDarkMode ? 'bg-gray-900' : ''}`}> 
          <table className={`min-w-full divide-y rounded-lg shadow-xl border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-black'}`}> 
            <thead className="bg-gray-50">
              <tr className={isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delete</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edit</th>
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
                  <td className="px-6 py-4 whitespace-nowrap relative">
                    {user.id !== currentUser?.id ? (
                      <>
                        <span onClick={() => setEditStates(prev => ({
                          ...prev,
                          [user.id]: {
                            ...prev[user.id],
                            editingRole: true,
                            role: editStates[user.id]?.role || user.role,
                            status: prev[user.id]?.status || user.status,
                            editingStatus: prev[user.id]?.editingStatus || false
                          }
                        }))} style={{cursor: 'pointer'}}>
                          <RoleBadge role={editStates[user.id]?.role || user.role} size="sm" showIcon={true} />
                        </span>
                        {editStates[user.id]?.editingRole && (
                          <div
                            className="bg-white border border-blue-300 rounded-lg shadow p-2 flex flex-col gap-2 absolute z-10"
                            style={{minWidth: 120, top: '100%', left: 0}}
                          >
                            {[Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR, Role.MODERATOR, Role.USER].map(r => (
                              <div
                                key={r}
                                className={
                                  'cursor-pointer mb-1' +
                                  (editStates[user.id]?.role === r ? ' ring-2 ring-blue-400' : '')
                                }
                                onClick={() => setEditStates(prev => ({
                                  ...prev,
                                  [user.id]: {
                                    ...prev[user.id],
                                    role: r,
                                    editingRole: false
                                  }
                                }))}
                              >
                                <RoleBadge role={r} size="sm" showIcon={true} />
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <RoleBadge role={user.role} size="sm" showIcon={true} />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap relative">
                    {user.id !== currentUser?.id ? (
                      <>
                        <span onClick={() => setEditStates(prev => ({
                          ...prev,
                          [user.id]: {
                            ...prev[user.id],
                            editingStatus: true,
                            status: editStates[user.id]?.status || user.status,
                            role: prev[user.id]?.role || user.role,
                            editingRole: prev[user.id]?.editingRole || false
                          }
                        }))} style={{cursor: 'pointer'}}>
                          <UserStatusBadge status={editStates[user.id]?.status || user.status} size="sm" showIcon={true} />
                        </span>
                        {editStates[user.id]?.editingStatus && (
                          <div
                            className="bg-white border border-purple-300 rounded-lg shadow p-2 flex flex-col gap-2 absolute z-10"
                            style={{minWidth: 120, top: '100%', left: 0}}
                          >
                            {[UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BANNED].map(s => (
                              <div
                                key={s}
                                className={
                                  'cursor-pointer mb-1' +
                                  (editStates[user.id]?.status === s ? ' ring-2 ring-purple-400' : '')
                                }
                                onClick={() => setEditStates(prev => ({
                                  ...prev,
                                  [user.id]: {
                                    ...prev[user.id],
                                    status: s,
                                    editingStatus: false
                                  }
                                }))}
                              >
                                <UserStatusBadge status={s} size="sm" showIcon={true} />
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <UserStatusBadge status={user.status} size="sm" showIcon={true} />
                    )}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.created_at ? new Date(user.created_at).toISOString().slice(0, 10) : ''}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.id !== currentUser?.id && (
                      <>
                        <button
                          className="flex items-center gap-1 bg-black text-white text-sm px-3 py-1 rounded-full shadow hover:bg-gray-900 transition disabled:opacity-50 min-w-[80px] min-h-[28px] justify-center"
                          style={{height: '28px'}}
                          disabled={deletingUserId === user.id}
                          onClick={() => setShowDeleteConfirm(user.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a3 3 0 0 1 6 0v2m-9 0h12v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7z" />
                          </svg>
                          Delete
                        </button>
                        {showDeleteConfirm === user.id && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                            <div className="bg-white rounded-lg shadow-lg p-6 min-w-[22rem] max-w-2xl w-full break-words" style={{wordBreak: 'break-word'}}>
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.id !== currentUser?.id && (
                      <button
                        className="flex items-center gap-1 bg-green-100 text-green-700 text-sm px-4 py-1 rounded-full shadow border border-green-200 hover:bg-green-200 transition disabled:opacity-50 min-w-[90px] min-h-[32px] justify-center"
                        style={{height: '32px'}}
                        onClick={async () => {
                          const newRole = editStates[user.id]?.role || user.role;
                          const newStatus = editStates[user.id]?.status || user.status;
                          if (newRole !== user.role) await handleRoleChange(user.id, newRole as Role);
                          if (newStatus !== user.status) await handleStatusChange(user.id, newStatus as UserStatus);
                        }}
                      >
                        Save Changes
                      </button>
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