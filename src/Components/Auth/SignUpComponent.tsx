'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
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
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Mock registration - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push('/signin');
    } catch (err: any) {
      console.error('Registration failed:', err);
      setErrors({ general: 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
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
              Start your blogging journey
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-100 p-3 rounded-md text-sm">
                {errors.general}
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

              <div>
                <label htmlFor="confirmPassword" className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-white border-gray-300 text-black'
                  }`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${
                  isDarkMode 
                    ? 'bg-white text-black hover:bg-gray-200' 
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
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