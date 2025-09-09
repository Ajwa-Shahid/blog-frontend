'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    if (!email || !password) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      setIsLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      setIsLoading(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (email.includes('@') && password.length >= 6) {
        setMessage({ type: 'success', text: 'Sign in successful! Redirecting...' });
        setTimeout(() => {
          console.log('Redirecting to dashboard...');
        }, 1000);
      } else if (password.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      } else {
        setMessage({ type: 'error', text: 'Invalid email or password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center transition-colors duration-300 bg-white dark:bg-black">
      <div className="max-w-md w-full mx-4 space-y-8 relative">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-black dark:text-white">
            Bijli Coin
          </h2>
        </div>

        <div className="p-8 rounded-lg border transition-colors bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xl shadow-black/20 dark:shadow-gray-900/30 drop-shadow-2xl">


          <div>
            <h2 className="text-2xl font-bold text-center text-black dark:text-white">
              Sign In
            </h2>
            <p className="mt-1 text-center text-gray-600 dark:text-gray-400">
              Welcome to your Blogging space
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {message.text && (
              <div className={`p-3 rounded-md text-sm ${
                message.type === 'success' 
                  ? 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-100 border border-green-200 dark:border-green-700' 
                  : 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-100 border border-red-200 dark:border-red-700'
              }`}>
                {message.text}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-black dark:text-white">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-1.5 border rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-black dark:text-white"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-black dark:text-white">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-1.5 border rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-black dark:text-white"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 dark:text-gray-400">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium hover:underline text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 focus:ring-black dark:focus:ring-white disabled:hover:bg-black dark:disabled:hover:bg-white"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
              
              <p className="text-center text-sm mt-3 text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link href="/signup" className="font-medium hover:underline text-black dark:text-white">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}