import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FluidShaderCanvas } from '../components/FluidShaderCanvas';

export const AuthPage: React.FC = () => {
  const { login, register, switchDemoUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR' | 'ADMIN'>('PATIENT');
  const [activeFeatureTab, setActiveFeatureTab] = useState<'triage' | 'slots' | 'care'>('triage');

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
    <div className="min-h-screen flex flex-col lg:flex-row selection:bg-primary/30 selection:text-primary bg-background text-on-surface relative overflow-x-hidden">
      {/* Background Fluid Shader */}
      <FluidShaderCanvas />

      {/* Left Split Screen: Interactive Clinical Intelligence Showcase */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-12 relative z-10">
        {/* Brand Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary via-primary-container to-secondary flex items-center justify-center text-white shadow-neon-cyan border border-white/20">
            <span className="material-symbols-outlined text-2xl font-bold">vital_signs</span>
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-white tracking-tight flex items-center gap-2">
              CarePulse
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                Clinical OS
              </span>
            </h1>
            <p className="text-xs text-on-surface-variant font-medium">Next-Generation Healthcare Intelligence &amp; Scheduling</p>
          </div>
        </div>

        {/* Hero Value Statement */}
        <div className="my-auto py-4 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container border border-white/10 text-xs font-heading font-bold text-secondary shadow-sm">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              <span>Intelligent Healthcare Infrastructure</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-4xl text-white leading-tight">
              Clinical Scheduling, <br className="hidden sm:inline" />
              <span className="ai-gradient-text">AI Symptom Triage</span> &amp; Care Continuity.
            </h2>
            <p className="text-sm text-on-surface-variant max-w-lg leading-relaxed">
              An all-in-one clinical management suite featuring real-time 10-minute reservation locks, automated patient triage, and post-visit care plan translation.
            </p>
          </div>

          {/* Interactive Feature Preview Tabs */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <button
                type="button"
                onClick={() => setActiveFeatureTab('triage')}
                className={`text-xs font-heading font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeFeatureTab === 'triage'
                    ? 'bg-secondary/20 text-secondary border border-secondary/40 shadow-sm'
                    : 'text-on-surface-variant hover:text-white hover:bg-surface-container/40'
                }`}
              >
                <span className="material-symbols-outlined text-sm">psychiatry</span>
                <span>AI Symptom Triage</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFeatureTab('slots')}
                className={`text-xs font-heading font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeFeatureTab === 'slots'
                    ? 'bg-primary/20 text-primary border border-primary/40 shadow-sm'
                    : 'text-on-surface-variant hover:text-white hover:bg-surface-container/40'
                }`}
              >
                <span className="material-symbols-outlined text-sm">lock_clock</span>
                <span>10-Min Hold Engine</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFeatureTab('care')}
                className={`text-xs font-heading font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeFeatureTab === 'care'
                    ? 'bg-tertiary/20 text-tertiary border border-tertiary/40 shadow-sm'
                    : 'text-on-surface-variant hover:text-white hover:bg-surface-container/40'
                }`}
              >
                <span className="material-symbols-outlined text-sm">alarm</span>
                <span>Medication Alarms</span>
              </button>
            </div>

            {/* Feature Cards based on active tab */}
            <div className="glass-card rounded-2xl p-4.5 border border-white/10 shadow-glass transition-all">
              {activeFeatureTab === 'triage' && (
                <div className="space-y-2.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-xs text-white flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-secondary text-sm">auto_awesome</span>
                      Real-Time AI Intake &amp; Urgency Stratification
                    </span>
                    <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full text-[10px] font-heading font-bold">
                      MEDIUM URGENCY
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant bg-surface-container/70 p-3 rounded-xl border border-white/5 italic">
                    "Patient reports recurring rash with mild inflammation since 3 days."
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-white pt-1">
                    <span className="text-secondary font-semibold">Specialty: Dermatology</span>
                    <span className="text-tertiary font-semibold">3 Diagnostic Questions Prepared</span>
                  </div>
                </div>
              )}

              {activeFeatureTab === 'slots' && (
                <div className="space-y-2.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-xs text-white flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary text-sm">hourglass_top</span>
                      Anti-Collision Slot Reservation
                    </span>
                    <span className="px-2.5 py-0.5 bg-primary/20 text-primary border border-primary/30 rounded-full text-[10px] font-heading font-bold">
                      TEMPORARY LOCK
                    </span>
                  </div>
                  <div className="p-3 bg-surface-container/70 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Dr. Rajesh Sharma (Cardiology)</p>
                      <p className="text-[11px] text-on-surface-variant">Slot: 11:00 AM • Suite 201</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-primary">09:42</span>
                      <p className="text-[9px] text-on-surface-variant uppercase">Hold Remaining</p>
                    </div>
                  </div>
                </div>
              )}

              {activeFeatureTab === 'care' && (
                <div className="space-y-2.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-xs text-white flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-tertiary text-sm">medication</span>
                      Automated Prescription Reminders
                    </span>
                    <span className="px-2.5 py-0.5 bg-tertiary/20 text-tertiary border border-tertiary/30 rounded-full text-[10px] font-heading font-bold">
                      ACTIVE ALARM
                    </span>
                  </div>
                  <div className="p-3 bg-surface-container/70 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Metoprolol 25mg — Beta Blocker</p>
                      <p className="text-[11px] text-on-surface-variant">Twice daily with meals (08:00 AM, 08:00 PM)</p>
                    </div>
                    <span className="material-symbols-outlined text-tertiary text-xl">notifications_active</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Genuine Technical Capabilities Badges */}
          <div className="flex flex-wrap gap-2.5 pt-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-high/60 border border-white/10 text-xs">
              <span className="material-symbols-outlined text-primary text-sm">sync</span>
              <span className="text-white font-heading font-semibold text-[11px]">Dual Google &amp; .ICS Calendar Sync</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-high/60 border border-white/10 text-xs">
              <span className="material-symbols-outlined text-secondary text-sm">shield</span>
              <span className="text-white font-heading font-semibold text-[11px]">JWT Auth &amp; Role-Based Access</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-high/60 border border-white/10 text-xs">
              <span className="material-symbols-outlined text-tertiary text-sm">schedule</span>
              <span className="text-white font-heading font-semibold text-[11px]">Automated Cron Workers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Split Screen: Authentication & Quick Test Station */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-10 relative z-10">
        <div className="w-full max-w-md">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-white/10">
            {/* AI Accent Glow Top Line */}
            <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-80 blur-[1px]"></div>

            {/* Auth Tabs */}
            <div className="flex gap-6 mb-6 border-b border-white/10 pb-3">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError(null);
                }}
                className={`font-heading text-base font-bold pb-2 transition-all ${
                  isLogin
                    ? 'text-primary border-b-2 border-primary -mb-[14px]'
                    : 'text-on-surface-variant hover:text-white'
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
                className={`font-heading text-base font-bold pb-2 transition-all ${
                  !isLogin
                    ? 'text-primary border-b-2 border-primary -mb-[14px]'
                    : 'text-on-surface-variant hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Role Selector */}
            <div className="mb-5">
              <p className="text-[11px] font-heading font-bold text-on-surface-variant mb-2 uppercase tracking-wider">
                Select Portal Role
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('PATIENT')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl border text-xs font-semibold transition-all ${
                    role === 'PATIENT'
                      ? 'bg-primary/20 text-primary border-primary shadow-neon-cyan font-bold'
                      : 'border-white/10 text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">person</span>
                  Patient
                </button>
                <button
                  type="button"
                  onClick={() => setRole('DOCTOR')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl border text-xs font-semibold transition-all ${
                    role === 'DOCTOR'
                      ? 'bg-secondary/20 text-secondary border-secondary shadow-neon-ai font-bold'
                      : 'border-white/10 text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">stethoscope</span>
                  Doctor
                </button>
                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl border text-xs font-semibold transition-all ${
                    role === 'ADMIN'
                      ? 'bg-tertiary/20 text-tertiary border-tertiary shadow-sm font-bold'
                      : 'border-white/10 text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                  Admin
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
            <form onSubmit={handleSubmit} className="space-y-3.5">
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
                className="w-full mt-4 bg-gradient-to-r from-primary to-primary-container hover:brightness-110 text-on-primary font-heading font-extrabold text-xs py-3.5 rounded-xl shadow-neon-cyan hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : isLogin ? 'Sign In to Portal' : 'Create Account'}</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </form>

            {/* Quick Test Accounts Section */}
            <div className="flex items-center gap-3 my-5">
              <div className="h-px bg-white/10 flex-1"></div>
              <span className="text-[10px] font-heading font-bold text-on-surface-variant uppercase tracking-widest">
                Quick Test Accounts
              </span>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => switchDemoUser('PATIENT')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-surface-container-low hover:bg-surface-container hover:border-primary/40 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-base">person</span>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white group-hover:text-primary transition-colors font-heading">
                      Patient Portal
                    </p>
                    <p className="text-[10px] text-on-surface-variant">Rahul Sharma &bull; rahul@example.com</p>
                  </div>
                </div>
                <span className="text-xs font-heading font-bold text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  Sign In <span className="material-symbols-outlined text-sm">chevron_right</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => switchDemoUser('DOCTOR')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-surface-container-low hover:bg-surface-container hover:border-secondary/40 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary border border-secondary/20 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-base">stethoscope</span>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white group-hover:text-secondary transition-colors font-heading">
                      Doctor Clinical Station
                    </p>
                    <p className="text-[10px] text-on-surface-variant">Dr. Rajesh Sharma &bull; dr.rajesh@carepulse.com</p>
                  </div>
                </div>
                <span className="text-xs font-heading font-bold text-secondary group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  Sign In <span className="material-symbols-outlined text-sm">chevron_right</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => switchDemoUser('ADMIN')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-surface-container-low hover:bg-surface-container hover:border-tertiary/40 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-tertiary/15 flex items-center justify-center text-tertiary border border-tertiary/20 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white group-hover:text-tertiary transition-colors font-heading">
                      Clinic Admin Portal
                    </p>
                    <p className="text-[10px] text-on-surface-variant">Admin Master &bull; admin@carepulse.com</p>
                  </div>
                </div>
                <span className="text-xs font-heading font-bold text-tertiary group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  Sign In <span className="material-symbols-outlined text-sm">chevron_right</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
