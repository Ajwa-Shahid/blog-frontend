'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useSelector, useDispatch } from 'react-redux';
import { authService } from '../../services/authService';
import { selectAuthLoading, selectAuthError, selectAuthSuccess, clearSuccessMessage } from '../../redux/slices/authSlice';

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const isLoading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);
  const successMessage = useSelector(selectAuthSuccess);
  
  const router = useRouter();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Handle success message and redirect
  useEffect(() => {
    if (successMessage) {
      // Show success message for 3 seconds then redirect to sign-in
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
        router.push('/signin');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
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
    
    if (!validateForm()) {
      return;
    }

    try {
      // Call the register API endpoint to save user to PostgreSQL database
      await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      // Success is now handled by useEffect hook
    } catch (err: any) {
      console.error('Registration failed:', err);
      
      // Set form error if not handled by auth service
      setErrors({ submit: err.message || 'Registration failed. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
            Bijli Coin
          </h2>
        </div>

        <div className={`rounded-lg shadow-xl p-6 transition-colors border ${
          isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div>
            <h2 className={`text-2xl font-bold text-center ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Create Account
            </h2>
            <p className={`mt-1 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Start your journey with Bijli Coin
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {successMessage && (
              <div className="bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-100 p-3 rounded-md text-sm">
                {successMessage}
              </div>
            )}
            
            {(errors.general || errors.submit || authError) && (
              <div className="bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-100 p-3 rounded-md text-sm">
                {errors.general || errors.submit || authError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="username" className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-white border-gray-300 text-black'
                  }`}
                  placeholder="Enter your username"
                />
                {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
              </div>

              <div>
                <label htmlFor="email" className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-white border-gray-300 text-black'
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-white border-gray-300 text-black'
                  }`}
                  placeholder="Create a password"
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || !!successMessage}
                className={`w-full py-3 px-4 border border-transparent text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 ${
                  isDarkMode 
                    ? 'text-black bg-white hover:bg-gray-200' 
                    : 'text-white bg-black hover:bg-gray-800'
                }`}
              >
                {successMessage 
                  ? 'Redirecting to sign in...' 
                  : isLoading 
                    ? 'Creating Account...' 
                    : 'Create Account'
                }
              </button>
            </div>

            <div className="text-center">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Already have an account?{' '}
                <Link href="/signin" className={`font-medium hover:underline ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}