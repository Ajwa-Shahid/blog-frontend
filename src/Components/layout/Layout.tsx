'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showAuthButtons?: boolean;
}

export default function Layout({ 
  children, 
  showHeader = false,
  showAuthButtons = true 
}: LayoutProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted ? theme === 'dark' : false;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
      {showHeader && <Header showAuthButtons={showAuthButtons} />}
      <main className={showHeader ? 'pt-0' : ''}>
        {children}
      </main>
    </div>
  );
}