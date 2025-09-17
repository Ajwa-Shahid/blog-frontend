'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validation
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    if (!email.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage({ 
        type: 'success', 
        text: 'Password reset link has been sent to your email address. Please check your inbox.'
      });
      
      // Clear email after successful request
      setTimeout(() => {
        setEmail('');
      }, 3000);
      
    } catch (error: any) {
      const errorMessage = error.message || 'Something went wrong. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
      <div className="max-w-md w-full space-y-8 p-8 relative">
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
              Forgot Password
            </h2>
            <p className={`mt-1 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Enter your email to reset your password
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
              <div>
                <label htmlFor="email" className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white focus:ring-white' 
                      : 'bg-white border-gray-300 text-black focus:ring-black'
                  }`}
                  placeholder="Enter your email address"
                />
              </div>
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
                {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
              </button>
            </div>

            <div className="text-center">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Remember your password?{' '}
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