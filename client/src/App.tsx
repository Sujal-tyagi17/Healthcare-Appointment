import React from 'react';
import { useAuth } from './context/AuthContext';
import { DemoBanner } from './components/DemoBanner';
import { AuthPage } from './pages/AuthPage';
import { PatientDashboard } from './pages/PatientDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

export const App: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b1326] flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-neon-cyan" />
        <p className="text-sm font-semibold tracking-wide text-on-surface-variant font-heading">
          Loading CarePulse Healthcare Platform...
        </p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background text-on-background selection:bg-primary-container selection:text-white">
      {/* Floating Demo Role Switcher at the bottom-right */}
      <div className="fixed bottom-4 right-4 z-50 shadow-2xl rounded-2xl overflow-hidden border border-white/15 backdrop-blur-2xl">
        <DemoBanner />
      </div>

      {user.role === 'PATIENT' && <PatientDashboard />}
      {user.role === 'DOCTOR' && <DoctorDashboard />}
      {user.role === 'ADMIN' && <AdminDashboard />}
    </div>
  );
};
