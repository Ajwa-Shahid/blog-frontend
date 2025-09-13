'use client';

import { useTheme } from 'next-themes';
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
  const isDarkMode = theme === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
      {showHeader && <Header showAuthButtons={showAuthButtons} />}
      <main className={showHeader ? 'pt-0' : ''}>
        {children}
      </main>
    </div>
  );
}