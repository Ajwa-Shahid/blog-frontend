'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';

export default function Home() {
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const toggleTheme = () => setTheme(isDarkMode ? 'light' : 'dark');

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
      {/* Header */}
      <header className={`p-6 border-b transition-colors ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex-1"></div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
            Bijli Coin
          </h1>
          <div className="flex-1 flex items-center justify-end gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-gray-100 text-black hover:bg-gray-200'
              }`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <Link 
              href="/signin"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-white text-black hover:bg-gray-200' 
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
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
