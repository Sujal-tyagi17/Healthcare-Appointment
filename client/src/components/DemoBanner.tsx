import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, User, Stethoscope, Shield } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { user, switchDemoUser, isLoading } = useAuth();

  return (
    <div className="bg-surface-container-lowest text-on-surface text-xs px-4 py-2 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 shadow-inner">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
        <span className="font-semibold text-white font-heading">Interactive Demo Switcher:</span>
        <span className="text-on-surface-variant hidden md:inline">Instant 1-click preview across portals:</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => switchDemoUser('PATIENT')}
          disabled={isLoading}
          className={`px-3 py-1 rounded-full font-medium transition-all flex items-center gap-1.5 border text-xs ${
            user?.role === 'PATIENT'
              ? 'bg-primary-container text-white border-primary shadow-neon-cyan'
              : 'bg-surface-container-high text-on-surface-variant border-white/10 hover:border-primary/40 hover:text-white'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Patient (John)</span>
        </button>

        <button
          onClick={() => switchDemoUser('DOCTOR')}
          disabled={isLoading}
          className={`px-3 py-1 rounded-full font-medium transition-all flex items-center gap-1.5 border text-xs ${
            user?.role === 'DOCTOR'
              ? 'bg-tertiary-container text-white border-tertiary shadow-sm'
              : 'bg-surface-container-high text-on-surface-variant border-white/10 hover:border-tertiary/40 hover:text-white'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Doctor (Dr. Sarah)</span>
        </button>

        <button
          onClick={() => switchDemoUser('ADMIN')}
          disabled={isLoading}
          className={`px-3 py-1 rounded-full font-medium transition-all flex items-center gap-1.5 border text-xs ${
            user?.role === 'ADMIN'
              ? 'bg-secondary-container text-white border-secondary shadow-neon-ai'
              : 'bg-surface-container-high text-on-surface-variant border-white/10 hover:border-secondary/40 hover:text-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Admin (Clinic)</span>
        </button>
      </div>
    </div>
  );
};

