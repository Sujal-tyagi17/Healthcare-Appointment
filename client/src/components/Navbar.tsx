import React from 'react';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, LogOut, User as UserIcon, Shield, Stethoscope } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 bg-[#0b1326]/85 backdrop-blur-xl border-b border-white/10 shadow-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-container to-primary flex items-center justify-center text-on-primary shadow-neon-cyan">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white font-heading">
                CarePulse
              </span>
              <span className="text-[11px] px-2.5 py-0.5 font-semibold rounded-full bg-primary-container/15 text-primary border border-primary/30">
                AI Precision
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant hidden sm:block">Intelligent Appointments & Clinical Continuity</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-surface-container border border-white/10">
            <div className="w-7 h-7 rounded-full bg-surface-container-highest text-primary flex items-center justify-center font-bold text-xs">
              {user.role === 'ADMIN' && <Shield className="w-4 h-4 text-secondary" />}
              {user.role === 'DOCTOR' && <Stethoscope className="w-4 h-4 text-tertiary" />}
              {user.role === 'PATIENT' && <UserIcon className="w-4 h-4 text-primary" />}
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-white leading-tight font-heading">{user.name}</p>
              <p className="text-[10px] font-medium text-on-surface-variant capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-xl transition-all border border-transparent hover:border-error/30"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

