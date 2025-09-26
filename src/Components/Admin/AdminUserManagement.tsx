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

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import UserStatusBadge from '../UI/UserStatusBadge';
import UserStatusManager from '../UI/UserStatusManager';
import RoleBadge from '../UI/RoleBadge';
import RoleManager from '../UI/RoleManager';
import Button from '../UI/Button';

import { useUserStatusManager } from '../../services/userStatusService';
import { UserStatus } from '../../types/userStatus';
import { Role } from '../../types/role';
import { useTheme } from 'next-themes';

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
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  // Ref for dropdown popovers
  const statusDropdownRefs = React.useRef<{[userId: string]: HTMLDivElement | null}>({});
  const roleDropdownRefs = React.useRef<{[userId: string]: HTMLDivElement | null}>({});

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      let changed = false;
      setEditStates(prev => {
        const updated = { ...prev };
        Object.keys(prev).forEach(userId => {
          if (prev[userId].editingStatus && statusDropdownRefs.current[userId]) {
            if (!statusDropdownRefs.current[userId]?.contains(event.target as Node)) {
              updated[userId] = { ...updated[userId], editingStatus: false };
              changed = true;
            }
          }
          if (prev[userId].editingRole && roleDropdownRefs.current[userId]) {
            if (!roleDropdownRefs.current[userId]?.contains(event.target as Node)) {
              updated[userId] = { ...updated[userId], editingRole: false };
              changed = true;
            }
          }
        });
        return changed ? updated : prev;
      });
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
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
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isDarkMode = mounted ? theme === 'dark' : false;
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

  // Pagination logic
  const USERS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [goToPageInput, setGoToPageInput] = useState('');
  const filteredUsers = localUsers.filter(user => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      user.username.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  });
  const pageCount = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

  return (
  <div className={`p-6 min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-[#181c23]' : 'bg-[#f8f9fa]'}`}> 
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">User Management</h2>
          <p className="text-gray-600">
            Manage user account statuses and roles. Only Super Admins can modify user privileges.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 items-center">
          <div className="relative flex items-center" style={{minWidth: 240}}>
            <input
              type="text"
              className={`pl-5 pr-12 py-3 rounded-full border-none focus:outline-none w-full transition-colors duration-200 shadow-lg ${isDarkMode ? 'bg-[#232c3d] text-white placeholder-white' : 'bg-white text-base font-normal placeholder-gray-300'}`}
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={!isDarkMode ? { boxShadow: '0 8px 24px #d1d1d1' } : { boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
            />
            <button
              type="button"
              className={`absolute right-0 top-1/2 -translate-y-1/2 rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-colors duration-200 ${isDarkMode ? 'bg-[#232c3d] text-white' : 'bg-gray-900'}`}
              style={!isDarkMode ? { boxShadow: '0 4px 16px 0 #d1d1d1' } : { boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
              tabIndex={-1}
              aria-label="Search"
              disabled
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="white" className="w-6 h-6">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
              </svg>
            </button>
          </div>
          <button
            className="flex items-center gap-1 bg-blue-600 text-white text-sm px-4 py-2 rounded-full shadow hover:bg-blue-700 transition disabled:opacity-50 min-w-[80px] min-h-[44px] justify-center"
            style={{ height: '44px' }}
            onClick={() => setShowAddModal(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        </div>
      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f8f9fa]">
          <div
            className="rounded-2xl shadow-2xl flex flex-col justify-center items-center bg-white"
            style={{
              width: '420px',
              height: '520px',
              padding: '32px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
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
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-[#eaf2fb] text-base font-normal placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={newUser.username}
                  onChange={e => setNewUser(u => ({...u, username: e.target.value}))}
                  placeholder="admin@example.com"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-normal text-sm">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-[#eaf2fb] text-base font-normal placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={newUser.email}
                  onChange={e => setNewUser(u => ({...u, email: e.target.value}))}
                  placeholder="Email"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-normal text-sm">Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-[#eaf2fb] text-base font-normal placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-200"
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

  <div className={`rounded-lg shadow-xl overflow-hidden border transition-colors duration-300 ${isDarkMode ? 'bg-[#23272f] border-[#23272f]' : 'bg-white border-[#e5e7eb]'}`}> 
        <div className="overflow-x-auto"> 
          <table className={`min-w-full divide-y rounded-lg shadow-xl border ${isDarkMode ? 'bg-[#232c3d] border-[#313a4e] text-white' : 'bg-white border-gray-200 text-black'}`}> 
            <thead className={isDarkMode ? 'bg-[#232c3d]' : 'bg-gray-50'}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delete</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edit</th>
              </tr>
            </thead>
            <tbody className={isDarkMode ? 'bg-[#232c3d] divide-gray-700' : 'bg-white divide-gray-200'}>
              {paginatedUsers.map((user, idx) => (
                <tr key={user.id} className={isDarkMode ? 'hover:bg-[#2a3441]' : 'hover:bg-gray-50'}>
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
                            ref={el => { roleDropdownRefs.current[user.id] = el; }}
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
                            ref={el => { statusDropdownRefs.current[user.id] = el; }}
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
                          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background: '#FAFAFA'}}>
                            <div
                              className="rounded-2xl shadow-2xl flex flex-col justify-center items-center"
                              style={{
                                background: '#fff',
                                width: '420px',
                                padding: '32px',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                wordBreak: 'break-word',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                overflow: 'hidden',
                              }}
                            >
                              <div className="flex flex-col items-center w-full">
                                <div className="mb-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="#e11d48" className="w-10 h-10">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a3 3 0 0 1 6 0v2m-9 0h12v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7z" />
                                  </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">Delete User</h3>
                                <p className="text-base text-gray-600 text-center mb-6">Are you sure you want to delete <span className="font-semibold">{user.username}</span>?</p>
                                <div className="flex gap-3 w-full justify-center mt-2">
                                  <Button
                                    type="button"
                                    variant="primary"
                                    size="md"
                                    className="w-1/2 py-3 font-semibold bg-black hover:bg-gray-900 text-white rounded-lg shadow-none border-none"
                                    onClick={() => handleDeleteUser(user.id)}
                                    disabled={deletingUserId === user.id}
                                  >{deletingUserId === user.id ? 'Deleting...' : 'Delete User'}</Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="md"
                                    className="w-1/2 py-3 font-semibold border-blue-500 text-blue-600 hover:bg-blue-50 rounded-lg shadow-none"
                                    onClick={() => setShowDeleteConfirm(null)}
                                    disabled={deletingUserId === user.id}
                                  >Cancel</Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.id !== currentUser?.id && (
                        <Button
                          type="button"
                          variant="primary"
                          size="md"
                          className={`flex items-center gap-1 text-sm px-4 py-1 rounded-full border min-w-[90px] min-h-[32px] justify-center transition-all duration-200
                            ${
                              (editStates[user.id]?.role === user.role || !editStates[user.id]?.role) &&
                              (editStates[user.id]?.status === user.status || !editStates[user.id]?.status)
                                ? 'bg-[#8B929A] text-white cursor-not-allowed' // Disabled: solid gray bg, white text
                                : 'bg-green-500 text-white border-green-600 shadow-lg hover:bg-green-600 hover:scale-[1.04]'
                            }
                          `}
                          style={{height: '32px'}}
                          disabled={
                            (editStates[user.id]?.role === user.role || !editStates[user.id]?.role) &&
                            (editStates[user.id]?.status === user.status || !editStates[user.id]?.status)
                          }
                          onClick={async () => {
                            const newRole = editStates[user.id]?.role || user.role;
                            const newStatus = editStates[user.id]?.status || user.status;
                            if (newRole !== user.role) await handleRoleChange(user.id, newRole as Role);
                            if (newStatus !== user.status) await handleStatusChange(user.id, newStatus as UserStatus);
                          }}
                        >
                          Save Changes
                        </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination controls */}
      <div className="flex justify-center items-center py-6">
        <div className="flex items-center bg-white rounded-full shadow px-6 py-3 gap-2" style={{ minWidth: 420 }}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-8 h-8 flex items-center justify-center rounded-full border border-black bg-[#232c3d] text-white font-bold shadow-md transition disabled:opacity-40"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >&#60;</Button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map(page => (
            (page === 1 || page === pageCount || Math.abs(page - currentPage) <= 2) ? (
              <Button
                key={page}
                type="button"
                variant="outline"
                size="sm"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-black bg-[#232c3d] text-white font-bold shadow-md mx-0.5 transition disabled:opacity-40"
                onClick={() => setCurrentPage(page)}
                disabled={currentPage === page}
              >{page}</Button>
            ) : (
              (page === currentPage - 3 || page === currentPage + 3) && pageCount > 7 ? <span key={page} className="mx-1 text-gray-400">...</span> : null
            )
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-8 h-8 flex items-center justify-center rounded-full border border-black bg-[#232c3d] text-white font-bold shadow-md transition disabled:opacity-40"
            onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))}
            disabled={currentPage === pageCount}
            aria-label="Next page"
          >&#62;</Button>
          <span className="ml-4 text-black font-medium">Go to</span>
          <input
            type="number"
            min={1}
            max={pageCount}
            value={goToPageInput}
            onChange={e => setGoToPageInput(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-16 px-2 py-1 rounded bg-gray-100 border border-gray-300 text-black text-center focus:outline-none focus:ring-2 focus:ring-black font-semibold mx-2"
          />
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#181f2a] text-white font-semibold shadow-md hover:bg-gray-900 transition p-0"
            onClick={() => {
              const pageNum = Number(goToPageInput);
              if (pageNum >= 1 && pageNum <= pageCount) {
                setCurrentPage(pageNum);
              }
            }}
            disabled={!goToPageInput || Number(goToPageInput) < 1 || Number(goToPageInput) > pageCount}
            aria-label="Go to page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="white" className="w-6 h-6">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;