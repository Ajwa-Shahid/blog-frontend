export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  EDITOR = 'editor',
  MODERATOR = 'moderator',
  USER = 'user',
}

export interface RoleData {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export const getRoleConfig = (role: Role | string, isDarkMode: boolean = false) => {
  const normalizedRole = typeof role === 'string' ? role.toLowerCase() : role;
  
  switch (normalizedRole) {
    case Role.SUPER_ADMIN:
    case 'super_admin':
      return {
        label: 'Super Admin',
        color: isDarkMode ? 'text-red-300' : 'text-red-800',
        bgColor: isDarkMode ? 'bg-red-900' : 'bg-red-100',
        borderColor: isDarkMode ? 'border-red-700' : 'border-red-200',
        description: 'Full system access and management'
      };
    case Role.ADMIN:
    case 'admin':
      return {
        label: 'Admin',
        color: isDarkMode ? 'text-purple-300' : 'text-purple-800',
        bgColor: isDarkMode ? 'bg-purple-900' : 'bg-purple-100',
        borderColor: isDarkMode ? 'border-purple-700' : 'border-purple-200',
        description: 'Administrative privileges'
      };
    case Role.MODERATOR:
    case 'moderator':
      return {
        label: 'Moderator',
        color: isDarkMode ? 'text-blue-300' : 'text-blue-800',
        bgColor: isDarkMode ? 'bg-blue-900' : 'bg-blue-100',
        borderColor: isDarkMode ? 'border-blue-700' : 'border-blue-200',
        description: 'Content moderation privileges'
      };
    case Role.EDITOR:
    case 'editor':
      return {
        label: 'Editor',
        color: isDarkMode ? 'text-green-300' : 'text-green-800',
        bgColor: isDarkMode ? 'bg-green-900' : 'bg-green-100',
        borderColor: isDarkMode ? 'border-green-700' : 'border-green-200',
        description: 'Content creation and editing privileges'
      };
    case Role.USER:
    case 'user':
    default:
      return {
        label: 'User',
        color: isDarkMode ? 'text-gray-300' : 'text-gray-800',
        bgColor: isDarkMode ? 'bg-gray-700' : 'bg-gray-100',
        borderColor: isDarkMode ? 'border-gray-600' : 'border-gray-200',
        description: 'Standard user access'
      };
  }
};

export const isValidRole = (role: any): role is Role => {
  return Object.values(Role).includes(role);
};

export const normalizeRole = (role: string): Role => {
  const normalized = role.toLowerCase().trim();
  switch (normalized) {
    case 'super_admin':
    case 'superadmin':
      return Role.SUPER_ADMIN;
    case 'admin':
      return Role.ADMIN;
    case 'editor':
      return Role.EDITOR;
    case 'moderator':
    case 'mod':
      return Role.MODERATOR;
    case 'user':
    default:
      return Role.USER;
  }
};