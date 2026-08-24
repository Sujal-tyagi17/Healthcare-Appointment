import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-300 ${
        isDark
          ? 'bg-surface-container-high/80 text-amber-300 hover:bg-surface-container-highest border border-white/10 hover:border-amber-300/40 shadow-sm'
          : 'bg-slate-100 text-indigo-600 hover:bg-slate-200 border border-slate-200 shadow-sm'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle Theme"
    >
      <span className="material-symbols-outlined text-lg transition-transform duration-500 ease-out transform hover:rotate-45">
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
      {showLabel && (
        <span className="ml-2 text-xs font-heading font-bold">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};
