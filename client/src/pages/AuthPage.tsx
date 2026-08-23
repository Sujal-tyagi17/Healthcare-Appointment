import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FluidShaderCanvas } from '../components/FluidShaderCanvas';

export const AuthPage: React.FC = () => {
  const { login, register, switchDemoUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR' | 'ADMIN'>('PATIENT');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('General Medicine');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({
          name,
          email,
          password,
          role,
          phone: phone || undefined,
          ...(role === 'DOCTOR' ? { specialization } : {})
        } as any);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden selection:bg-primary-container selection:text-white bg-background text-on-surface">
      {/* Left Split Screen: Branding & Illustration */}
      <div className="hidden lg:flex w-1/2 flex-col p-12 bg-background relative overflow-hidden">
        <FluidShaderCanvas />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3 mb-auto">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white shadow-neon-cyan">
            <span className="material-symbols-outlined text-2xl font-bold">vital_signs</span>
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-primary leading-tight">CarePulse</h1>
            <p className="text-xs text-on-surface-variant font-medium">Clinical Intelligence</p>
          </div>
        </div>

        {/* Hero Narrative */}
        <div className="relative z-10 max-w-xl mt-auto mb-12 space-y-6">
          <h2 className="font-heading font-extrabold text-3xl xl:text-4xl text-white leading-tight">
            Intelligent Clinical Scheduling,<br />
            AI Symptom Triage &amp; Seamless Care Continuity.
          </h2>
          <p className="text-base text-blue-100/80 leading-relaxed">
            Empowering patients, specialists, and clinic administrators with real-time predictive clinical intelligence and conflict-free booking.
          </p>

          <div className="flex gap-4 items-center pt-2">
            <div className="flex items-center gap-2 glass-panel px-4 py-2 rounded-full border border-white/10 text-xs font-semibold">
              <span className="material-symbols-outlined text-tertiary text-lg">verified_user</span>
              <span className="text-white font-heading">HIPAA COMPLIANT</span>
            </div>
            <div className="flex items-center gap-2 glass-panel px-4 py-2 rounded-full border border-white/10 text-xs font-semibold">
              <span className="material-symbols-outlined text-primary text-lg">domain</span>
              <span className="text-white font-heading">TRUSTED BY 500+ CLINICS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Split Screen: Authentication Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-surface overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white shadow-neon-cyan">
              <span className="material-symbols-outlined text-xl">vital_signs</span>
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-xl text-primary leading-tight">CarePulse</h1>
              <p className="text-[11px] text-on-surface-variant font-medium">Clinical Intelligence</p>
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-6 sm:p-8 shadow-2xl relative border border-white/10">
            {/* AI Accent Glow Top Line */}
            <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-60 blur-[1px]"></div>

            {/* Auth Tabs */}
            <div className="flex gap-6 mb-7 border-b border-white/10 pb-3">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError(null);
                }}
                className={`font-heading text-lg font-bold pb-2 transition-all ${
                  isLogin
                    ? 'text-primary border-b-2 border-primary -mb-[14px]'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError(null);
                }}
                className={`font-heading text-lg font-bold pb-2 transition-all ${
                  !isLogin
                    ? 'text-primary border-b-2 border-primary -mb-[14px]'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Register
              </button>
            </div>

            {/* Role Selector */}
            <div className="mb-6">
              <p className="text-[11px] font-heading font-bold text-on-surface-variant mb-2.5 uppercase tracking-wider">
                Select Portal Role
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setRole('PATIENT')}
                  className={`role-pill flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-semibold transition-all ${
                    role === 'PATIENT'
                      ? 'active bg-primary/15 text-primary border-primary shadow-neon-cyan'
                      : 'border-white/10 text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">person</span>
                  Patient
                </button>
                <button
                  type="button"
                  onClick={() => setRole('DOCTOR')}
                  className={`role-pill flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-semibold transition-all ${
                    role === 'DOCTOR'
                      ? 'active bg-secondary/15 text-secondary border-secondary shadow-neon-ai'
                      : 'border-white/10 text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">stethoscope</span>
                  Doctor
                </button>
                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={`role-pill flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-semibold transition-all ${
                    role === 'ADMIN'
                      ? 'active bg-tertiary/15 text-tertiary border-tertiary shadow-sm'
                      : 'border-white/10 text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                  Clinic Admin
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-error-container/20 border border-error/30 text-error rounded-xl text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="floating-input">
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder=" "
                      required
                      className="w-full bg-surface-container border border-outline-variant/60 rounded-xl text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    />
                    <label htmlFor="name" className="text-xs">Full Name</label>
                  </div>

                  <div className="floating-input">
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder=" "
                      className="w-full bg-surface-container border border-outline-variant/60 rounded-xl text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    />
                    <label htmlFor="phone" className="text-xs">Phone Number (Optional)</label>
                  </div>

                  {role === 'DOCTOR' && (
                    <div className="floating-input">
                      <input
                        id="specialization"
                        type="text"
                        value={specialization}
                        onChange={e => setSpecialization(e.target.value)}
                        placeholder=" "
                        required
                        className="w-full bg-surface-container border border-outline-variant/60 rounded-xl text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                      />
                      <label htmlFor="specialization" className="text-xs">Clinical Specialization</label>
                    </div>
                  )}
                </>
              )}

              <div className="floating-input">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder=" "
                  required
                  className="w-full bg-surface-container border border-outline-variant/60 rounded-xl text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                />
                <label htmlFor="email" className="text-xs">Email Address</label>
              </div>

              <div className="floating-input">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder=" "
                  required
                  className="w-full bg-surface-container border border-outline-variant/60 rounded-xl text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                />
                <label htmlFor="password" className="text-xs">Password</label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-5 bg-gradient-to-r from-primary-container to-blue-600 hover:from-primary hover:to-blue-500 text-white font-heading font-bold text-sm py-3.5 rounded-xl shadow-neon-cyan hover:-translate-y-0.5 transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Create Account'}</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="h-px bg-white/10 flex-1"></div>
              <span className="text-[10px] font-heading text-on-surface-variant uppercase tracking-widest">
                or try instantly
              </span>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>

            {/* One-Click Instant Demo Accounts */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => switchDemoUser('PATIENT')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-white/5 bg-surface-container-low hover:bg-surface-container hover:border-primary/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface-variant flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-lg">person</span>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors font-heading">
                      Patient Portal
                    </p>
                    <p className="text-[11px] text-on-surface-variant">Rahul Sharma (Patient Demo)</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity text-base">
                  login
                </span>
              </button>

              <button
                type="button"
                onClick={() => switchDemoUser('DOCTOR')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-white/5 bg-surface-container-low hover:bg-surface-container hover:border-secondary/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface-variant flex items-center justify-center text-secondary group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-lg">stethoscope</span>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-on-surface group-hover:text-secondary transition-colors font-heading">
                      Doctor Clinical Station
                    </p>
                    <p className="text-[11px] text-on-surface-variant">Dr. Rajesh Sharma — Cardiology</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity text-base">
                  login
                </span>
              </button>

              <button
                type="button"
                onClick={() => switchDemoUser('ADMIN')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-white/5 bg-surface-container-low hover:bg-surface-container hover:border-tertiary/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface-variant flex items-center justify-center text-tertiary group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-on-surface group-hover:text-tertiary transition-colors font-heading">
                      Clinic Admin Portal
                    </p>
                    <p className="text-[11px] text-on-surface-variant">CarePulse Clinic Master</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity text-base">
                  login
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
