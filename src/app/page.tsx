'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering theme-dependent content until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen transition-colors duration-300 bg-white">
        <header className="p-6 border-b transition-colors border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex-1"></div>
            <h1 className="text-2xl font-bold text-black">
              Bijli Coin
            </h1>
            <div className="flex-1 flex items-center justify-end gap-4">
              <button className="p-2 rounded-lg transition-colors bg-gray-100 text-black hover:bg-gray-200">
                🌙
              </button>
              <Link 
                href="/signin"
                className="px-4 py-2 rounded-lg font-medium transition-colors bg-black text-white hover:bg-gray-800"
              >
                Sign In
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto p-6">
          <div className="text-center py-20">
            <h2 className="text-5xl font-bold mb-6 text-black">
              Welcome to Bijli Coin
            </h2>
            <p className="text-xl mb-8 text-gray-600">
              Share your thoughts, ideas, and stories with the world
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/signup"
                className="px-8 py-3 rounded-lg font-medium transition-colors bg-black text-white hover:bg-gray-800"
              >
                Get Started
              </Link>
              <Link 
                href="#"
                className="px-8 py-3 rounded-lg font-medium border transition-colors border-gray-300 text-black hover:bg-gray-100"
              >
                Learn More
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const isDarkMode = theme === 'dark';
  const toggleTheme = () => setTheme(isDarkMode ? 'light' : 'dark');

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
      <header className={`p-6 border-b transition-colors ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex-1"></div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
            Bijli Coin
          </h1>
          <div className="flex-1 flex items-center justify-end gap-4">
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-gray-100 text-black hover:bg-gray-200'
              }`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <Link 
              href="/signin"
              className={`py-3 px-4 border border-transparent text-sm font-medium rounded-lg transition-all duration-200 ${
                isDarkMode 
                  ? 'text-black bg-white hover:bg-gray-200' 
                  : 'text-white bg-black hover:bg-gray-800'
              }`}
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="text-center py-20">
          <h2 className={`text-5xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-black'}`}>
            Welcome to Bijli Coin
          </h2>
          <p className={`text-xl mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Share your thoughts, ideas, and stories with the world
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/signup"
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-white text-black hover:bg-gray-200' 
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              Get Started
            </Link>
            <Link 
              href="#"
              className={`px-8 py-3 rounded-lg font-medium border transition-colors ${
                isDarkMode 
                  ? 'border-gray-700 text-white hover:bg-gray-800' 
                  : 'border-gray-300 text-black hover:bg-gray-100'
              }`}
            >
              Learn More
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}