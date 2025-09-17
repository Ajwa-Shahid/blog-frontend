// User API integration for status management
import { UserStatus } from '../types/userStatus';

/**
 * Example API service for updating user status
 * This should be integrated with your main API service
 */
export class UserStatusService {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  /**
   * Update user status via backend API
   * Calls PATCH /users/:id with status in the body
   */
  static async updateUserStatus(userId: string, status: UserStatus, authToken: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update user status: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get user details including status
   */
  static async getUser(userId: string, authToken: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/users/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }

    return response.json();
  }
}

/**
 * React Hook for managing user status updates
 * Example usage in components
 */
export function useUserStatusManager(authToken: string | null) {
  const handleStatusChange = async (userId: string, newStatus: UserStatus): Promise<void> => {
    if (!authToken) {
      throw new Error('Authentication required');
    }

    try {
      await UserStatusService.updateUserStatus(userId, newStatus, authToken);
      // You might want to trigger a refetch of user data here
      // or update your global state/cache
    } catch (error) {
      console.error('Failed to update user status:', error);
      throw error;
    }
  };

  return { handleStatusChange };
}