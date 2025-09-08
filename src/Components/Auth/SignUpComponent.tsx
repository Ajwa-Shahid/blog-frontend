'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../Constants/context/ThemeContext';

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
  
  const { isDarkMode, toggleTheme } = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      setIsLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      setIsLoading(false);
      return;
    }

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock registration - in real app, this would be an API call
      // Simulate existing account check
      if (formData.email === 'test@example.com') {
        setMessage({ type: 'error', text: 'An account with this email already exists' });
        setIsLoading(false);
        return;
      }
      
      setMessage({ type: 'success', text: 'Account created successfully! Please sign in.' });
      
      // Clear form after successful registration
      setTimeout(() => {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        // In real app, redirect to sign in page
        console.log('Redirecting to sign in...');
      }, 2000);
      
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
      <div className="max-w-md w-full space-y-8 p-8 relative">
        {/* Header */}
        <div className="text-center">
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
            Bijli Coin
          </h2>
        </div>

        {/* Sign Up Form Card */}
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
            {/* Message Display */}
            {message.text && (
              <div className={`p-3 rounded-md text-sm ${
                message.type === 'success' 
                  ? `${isDarkMode ? 'bg-green-900 text-green-100 border-green-700' : 'bg-green-50 text-green-800 border-green-200'} border` 
                  : `${isDarkMode ? 'bg-red-900 text-red-100 border-red-700' : 'bg-red-50 text-red-800 border-red-200'} border`
              }`}>
                {message.text}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-white focus:ring-white' 
                        : 'bg-white border-gray-300 text-black focus:ring-black'
                    }`}
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-white focus:ring-white' 
                        : 'bg-white border-gray-300 text-black focus:ring-black'
                    }`}
                    placeholder="Last name"
                  />
                </div>
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
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white focus:ring-white' 
                      : 'bg-white border-gray-300 text-black focus:ring-black'
                  }`}
                  placeholder="Enter your email"
                />
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
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white focus:ring-white' 
                      : 'bg-white border-gray-300 text-black focus:ring-black'
                  }`}
                  placeholder="Create a password"
                />
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
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white focus:ring-white' 
                      : 'bg-white border-gray-300 text-black focus:ring-black'
                  }`}
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className={`h-4 w-4 text-black focus:ring-black border-gray-300 rounded ${
                  isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white'
                }`}
                required
              />
              <label htmlFor="terms" className={`ml-2 block text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                I agree to the{' '}
                <a href="#" className={`hover:underline ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className={`hover:underline ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Privacy Policy
                </a>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode 
                    ? 'bg-white text-black hover:bg-gray-200 focus:ring-white disabled:hover:bg-white' 
                    : 'bg-black text-white hover:bg-gray-800 focus:ring-black disabled:hover:bg-black'
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
