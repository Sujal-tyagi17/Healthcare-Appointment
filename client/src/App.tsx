import React from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
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
        <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin shadow-neon-cyan" />
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
    <div className="min-h-screen bg-[#0b1326] flex flex-col text-[#dae2fd] relative selection:bg-primary-container selection:text-white">
      {/* Subtle Background Glow Elements */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-secondary-container/15 rounded-full blur-3xl pointer-events-none -z-10" />

      <DemoBanner />
      <Navbar />

      <main className="flex-1 pb-16">
        {user.role === 'PATIENT' && <PatientDashboard />}
        {user.role === 'DOCTOR' && <DoctorDashboard />}
        {user.role === 'ADMIN' && <AdminDashboard />}
      </main>
    </div>
  );
};

