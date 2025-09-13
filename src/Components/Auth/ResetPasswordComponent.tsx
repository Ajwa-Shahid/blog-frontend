'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useResetPasswordMutation } from '../../redux/api/authApi';

export default function ResetPasswordComponent() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    if (!token) {
      setMessage({ 
        type: 'error', 
        text: 'Invalid or missing reset token. Please request a new password reset link.' 
      });
    }
  }, [token]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!token) {
      setMessage({ 
        type: 'error', 
        text: 'Invalid or missing reset token. Please request a new password reset link.' 
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      const result = await resetPassword({
        token,
        password: formData.password
      }).unwrap();

      setMessage({ 
        type: 'success', 
        text: result.message || 'Password has been reset successfully. You can now sign in with your new password.'
      });

      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        router.push('/signin');
      }, 3000);

    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Something went wrong. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors ${
      isDarkMode ? 'bg-black' : 'bg-white'
    }`}>
      <div className={`max-w-md w-full mx-4 p-8 rounded-lg shadow-2xl border transition-colors ${
        isDarkMode 
          ? 'bg-slate-800 border-slate-700' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
            Reset Password
          </h2>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Enter your new password below
          </p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Password Field */}
            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${
                isDarkMode ? 'text-white' : 'text-black'
              }`}>
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-black placeholder-gray-500'
                }`}
                placeholder="Enter your new password"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className={`block text-sm font-medium ${
                isDarkMode ? 'text-white' : 'text-black'
              }`}>
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-black placeholder-gray-500'
                }`}
                placeholder="Confirm your new password"
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !token}
              className={`w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${
                isDarkMode 
                  ? 'bg-white text-black hover:bg-gray-200' 
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </div>

          <div className="text-center">
            <Link 
              href="/signin" 
              className={`text-sm transition-colors ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-white' 
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}