'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useAppSelector } from '@/store/useState';

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: 'dark' | 'light';
};

/**
 * Minimal theme provider placeholder. Extend with next-themes or design-system
 * tokens when integrating a full theming solution.
 */
export function ThemeProvider({ children, defaultTheme = 'dark' }: ThemeProviderProps) {
  const { theme } = useAppSelector((state) => state.chatUI);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.dataset.theme = 'dark';
    } else if (theme === 'light') {
      root.classList.remove('dark');
      root.dataset.theme = 'light';
    } else {
      // auto - use system preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
        root.dataset.theme = 'dark';
      } else {
        root.classList.remove('dark');
        root.dataset.theme = 'light';
      }
    }
  }, [theme, mounted]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return children;
}
