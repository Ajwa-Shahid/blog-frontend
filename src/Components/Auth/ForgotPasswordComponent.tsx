'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { authService } from '../../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  const darkMode = theme === 'dark';

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
      const result = await authService.forgotPassword({ email });
      
      setMessage({ 
        type: 'success', 
        text: result.message || 'Password reset link has been sent to your email address. Please check your inbox.'
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
  <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="max-w-md w-full mx-4 p-8 rounded-lg bg-slate-800 border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">
            Bijli Coin
          </h2>
        </div>

        {/* Forgot Password Form */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-center text-white">
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-gray-300">
            Enter your email to reset your password
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Message Display */}
          {message.text && (
            <div className={`p-3 rounded-md text-sm ${
              message.type === 'success' 
                ? 'bg-green-900 text-green-100 border border-green-700'
                : 'bg-red-900 text-red-100 border border-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border bg-slate-700 border-slate-600 text-white rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your email address"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md bg-white text-black hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
            >
              {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
            </button>
          </div>

          <div className="text-center space-y-3">
            <p className="text-sm text-gray-400">
              Remember your password?{' '}
              <Link href="/signin" className="font-medium text-white hover:underline">
                Sign in
              </Link>
            </p>
            
          </div>
        </form>
      </div>
    </div>
  );
}