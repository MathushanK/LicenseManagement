'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void } | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  useEffect(() => {
    const saved = localStorage.getItem('leco-theme') as Theme | null;
    const next = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(next); document.documentElement.dataset.theme = next;
  }, []);
  const toggleTheme = () => setTheme(current => { const next = current === 'light' ? 'dark' : 'light'; localStorage.setItem('leco-theme', next); document.documentElement.dataset.theme = next; return next; });
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}
export function useTheme() { const context = useContext(ThemeContext); if (!context) throw new Error('useTheme must be used within ThemeProvider'); return context; }
