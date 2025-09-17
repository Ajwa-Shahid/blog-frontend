// User Status Types and Enums
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

export interface UserStatusInfo {
  status: UserStatus;
  label: string;
  color: string;
  bgColor: string;
  borderColor?: string;
  description: string;
}

export const USER_STATUS_CONFIG: Record<UserStatus, UserStatusInfo> = {
  [UserStatus.ACTIVE]: {
    status: UserStatus.ACTIVE,
    label: 'Active',
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    description: 'User account is active and can access all features'
  },
  [UserStatus.INACTIVE]: {
    status: UserStatus.INACTIVE,
    label: 'Inactive',
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    description: 'User account is temporarily inactive'
  },
  [UserStatus.BANNED]: {
    status: UserStatus.BANNED,
    label: 'Banned',
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    description: 'User account has been banned and cannot access the system'
  }
};

// Dark mode colors
export const USER_STATUS_CONFIG_DARK: Record<UserStatus, UserStatusInfo> = {
  [UserStatus.ACTIVE]: {
    status: UserStatus.ACTIVE,
    label: 'Active',
    color: 'text-green-200',
    bgColor: 'bg-green-900',
    description: 'User account is active and can access all features'
  },
  [UserStatus.INACTIVE]: {
    status: UserStatus.INACTIVE,
    label: 'Inactive',
    color: 'text-yellow-200',
    bgColor: 'bg-yellow-900',
    description: 'User account is temporarily inactive'
  },
  [UserStatus.BANNED]: {
    status: UserStatus.BANNED,
    label: 'Banned',
    color: 'text-red-200',
    bgColor: 'bg-red-900',
    description: 'User account has been banned and cannot access the system'
  }
};

export const getStatusConfig = (status: UserStatus, isDarkMode: boolean = false): UserStatusInfo => {
  // Provide fallback for invalid status
  const validStatus = Object.values(UserStatus).includes(status) ? status : UserStatus.ACTIVE;
  return isDarkMode ? USER_STATUS_CONFIG_DARK[validStatus] : USER_STATUS_CONFIG[validStatus];
};

/**
 * Check if a status value is valid
 */
export function isValidUserStatus(status: any): status is UserStatus {
  return Object.values(UserStatus).includes(status);
}

/**
 * Convert backend status string to UserStatus enum
 */
export function normalizeUserStatus(status: string | undefined | null): UserStatus {
  if (!status) return UserStatus.ACTIVE;
  
  const lowercaseStatus = status.toLowerCase();
  switch (lowercaseStatus) {
    case 'active':
      return UserStatus.ACTIVE;
    case 'inactive':
      return UserStatus.INACTIVE;
    case 'banned':
      return UserStatus.BANNED;
    default:
      return UserStatus.ACTIVE; // Default fallback
  }
}