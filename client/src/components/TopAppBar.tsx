import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';

interface TopAppBarProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  title?: string;
  onOpenAIInsights?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  searchQuery = '',
  onSearchChange,
  title = 'CarePulse',
  onOpenAIInsights
}) => {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 flex justify-between items-center px-6 h-16 z-30 bg-surface/75 backdrop-blur-xl border-b border-outline-variant/30 shadow-md">
      {/* Search Input on Left */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md hidden sm:block focus-within:ring-2 focus-within:ring-primary/50 transition-all rounded-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search patients, records, doctors..."
            className="w-full bg-surface-container-high/60 border border-white/5 rounded-full py-1.5 pl-10 pr-4 text-xs text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:bg-surface-container-high transition-all"
          />
        </div>
        <span className="font-heading font-extrabold text-sm text-white sm:hidden">{title}</span>
      </div>

      {/* Trailing Icon Actions & User Profile */}
      <div className="flex items-center gap-2">
        {/* Dark/Light Theme Toggle */}
        <ThemeToggle />

        <button
          className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all relative"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-lg">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border border-surface"></span>
        </button>

        <button
          onClick={onOpenAIInsights}
          className="w-9 h-9 rounded-full flex items-center justify-center text-secondary hover:text-white hover:bg-white/5 transition-all"
          title="AI Assistant"
        >
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
            auto_awesome
          </span>
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2.5 ml-2 pl-2 border-l border-outline-variant/30">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-heading font-extrabold text-xs shadow-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-white font-heading leading-tight truncate max-w-[120px]">{user?.name}</p>
            <p className="text-[10px] text-on-surface-variant capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
