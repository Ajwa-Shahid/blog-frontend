'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    // Validation
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      setIsLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      setIsLoading(false);
      return;
    }

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock password reset - in real app, this would send an email
      setMessage({ 
        type: 'success', 
        text: 'Password reset link has been sent to your email address. Please check your inbox.' 
      });
      
      // Clear email after successful request
      setTimeout(() => {
        setEmail('');
      }, 3000);
      
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className={`max-w-md w-full mx-4 p-8 rounded-lg border transition-colors ${
        darkMode 
          ? 'bg-gray-900 border-gray-800 shadow-lg shadow-gray-900/20' 
          : 'bg-white border-gray-200 shadow-2xl shadow-gray-700/40 drop-shadow-xl'
      }`}>
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
            Bijli Coin
          </h2>
        </div>

        {/* Forgot Password Form */}
        <div className="mb-8">
          <h2 className={`text-2xl font-bold text-center ${darkMode ? 'text-white' : 'text-black'}`}>
            Forgot Password
          </h2>
          <p className={`mt-2 text-center mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Enter your email to reset your password
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Message Display */}
          {message.text && (
            <div className={`p-3 rounded-md text-sm ${
              message.type === 'success' 
                ? darkMode 
                  ? 'bg-green-900 text-green-100 border border-green-700' 
                  : 'bg-green-50 text-green-800 border border-green-200'
                : darkMode 
                  ? 'bg-red-900 text-red-100 border border-red-700' 
                  : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label htmlFor="email" className={`block text-sm font- ${
                darkMode ? 'text-white' : 'text-black'
              }`}>
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 text-white focus:ring-white' 
                    : 'bg-white border-gray-300 text-black'
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
                darkMode 
                  ? 'bg-white text-black hover:bg-gray-200 focus:ring-white disabled:hover:bg-white' 
                  : 'bg-black text-white hover:bg-gray-800 focus:ring-black disabled:hover:bg-black'
              }`}
            >
              {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
            </button>
          </div>

          <div className="text-center space-y-3">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Remember your password?{' '}
              <Link href="/signin" className={`font-medium hover:underline ${
                darkMode ? 'text-white' : 'text-black'
              }`}>
                Sign in
              </Link>
            </p>

          </div>
        </form>            
      </div>
    </div>
  );
}
