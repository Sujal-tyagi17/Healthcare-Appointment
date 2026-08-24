import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FluidShaderCanvas } from '../components/FluidShaderCanvas';
import { ThemeToggle } from '../components/ThemeToggle';

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
    <div className="min-h-screen flex flex-col lg:flex-row selection:bg-primary/30 selection:text-primary text-on-surface relative overflow-x-hidden">
      {/* Background Fluid Shader */}
      <FluidShaderCanvas />

      {/* Left Split Screen: Interactive Clinical Intelligence Showcase */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-12 relative z-10">
        {/* Brand Header with Theme Toggle */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary via-primary-container to-secondary flex items-center justify-center text-white shadow-neon-cyan border border-white/20">
              <span className="material-symbols-outlined text-2xl font-bold">vital_signs</span>
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-2xl text-on-surface tracking-tight">
                CarePulse
              </h1>
              <p className="text-xs text-on-surface-variant font-medium">Next-Generation Healthcare Intelligence &amp; Scheduling</p>
            </div>
          </div>
          <ThemeToggle showLabel />
        </div>

        {/* Hero Value Statement */}
        <div className="my-auto py-4 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container border border-outline-variant text-xs font-heading font-bold text-secondary shadow-sm">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              <span>Intelligent Healthcare Infrastructure</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-4xl text-on-surface leading-tight">
              Clinical Scheduling, <br className="hidden sm:inline" />
              <span className="ai-gradient-text">AI Symptom Triage</span> &amp; Care Continuity.
            </h2>
            <p className="text-sm text-on-surface-variant max-w-lg leading-relaxed font-medium">
              An all-in-one clinical management suite featuring real-time 10-minute reservation locks, automated patient triage, and post-visit care plan translation.
            </p>
          </div>

          {/* Interactive Feature Preview Tabs */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 border-b border-outline-variant pb-2">
              <button
                type="button"
                onClick={() => setActiveFeatureTab('triage')}
                className={`text-xs font-heading font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeFeatureTab === 'triage'
                    ? 'bg-secondary/20 text-secondary border border-secondary/40 shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
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
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
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
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-sm">alarm</span>
                <span>Medication Alarms</span>
              </button>
            </div>

            {/* Feature Cards based on active tab */}
            <div className="glass-card rounded-2xl p-5 border border-outline-variant shadow-glass transition-all">
              {/* Tab 1: AI Symptom Triage */}
              {activeFeatureTab === 'triage' && (
                <div className="space-y-3.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-xs text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-secondary text-base">psychiatry</span>
                      AI Intake &amp; Urgency Stratification
                    </span>
                    <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-500 dark:text-amber-300 border border-amber-400/40 rounded-full text-[10px] font-heading font-bold">
                      MODERATE URGENCY
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-surface-container p-3 rounded-xl border border-outline-variant space-y-1.5 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-secondary font-heading flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">record_voice_over</span>
                          Patient Symptoms
                        </span>
                        <p className="text-xs text-on-surface italic mt-1 leading-relaxed">
                          "Recurring skin rash with mild inflammation for 3 days."
                        </p>
                      </div>
                      <span className="text-[10px] text-on-surface-variant font-mono">Status: Analyzed by LLM</span>
                    </div>

                    <div className="bg-surface-container p-3 rounded-xl border border-outline-variant space-y-1.5 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-tertiary font-heading flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">clinical_notes</span>
                          Doctor Briefing
                        </span>
                        <p className="text-xs text-on-surface mt-1 leading-relaxed">
                          Synthesized chief complaint and 3 pre-visit diagnostic inquiries.
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-on-surface-variant font-mono pt-1 border-t border-outline-variant">
                        <span>Confidence: 94%</span>
                        <span className="text-tertiary font-bold">Ready</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: 10-Min Hold Engine */}
              {activeFeatureTab === 'slots' && (
                <div className="space-y-3.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-xs text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary text-base">lock_clock</span>
                      Anti-Collision Slot Reservation
                    </span>
                    <span className="px-2.5 py-0.5 bg-primary/20 text-primary border border-primary/40 rounded-full text-[10px] font-heading font-bold">
                      ACTIVE LOCK
                    </span>
                  </div>

                  <div className="bg-surface-container p-3.5 rounded-xl border border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary text-sm">stethoscope</span>
                        Dr. Rajesh Sharma (Cardiology)
                      </p>
                      <p className="text-[11px] text-on-surface-variant font-medium">Slot: 11:00 AM • Room 201 • Mutex Lock Active</p>
                    </div>

                    <div className="flex items-center sm:flex-col sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-outline-variant">
                      <span className="text-sm font-mono font-extrabold text-primary tracking-wider">09:42</span>
                      <p className="text-[9px] text-on-surface-variant uppercase tracking-wider font-semibold">Hold Remaining</p>
                    </div>
                  </div>

                  {/* Visual countdown progress bar */}
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-primary to-secondary h-full rounded-full w-[85%] animate-pulse"></div>
                  </div>
                </div>
              )}

              {/* Tab 3: Medication Alarms */}
              {activeFeatureTab === 'care' && (
                <div className="space-y-3.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-xs text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-tertiary text-base">notifications_active</span>
                      Automated Prescription Alarms
                    </span>
                    <span className="px-2.5 py-0.5 bg-tertiary/20 text-tertiary border border-tertiary/40 rounded-full text-[10px] font-heading font-bold">
                      ACTIVE ALARM
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="p-3 bg-surface-container rounded-xl border border-outline-variant flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-on-surface">Metoprolol 25mg</p>
                        <p className="text-[10px] text-on-surface-variant font-medium">08:00 AM, 08:00 PM (Twice daily)</p>
                      </div>
                      <span className="material-symbols-outlined text-tertiary text-lg animate-pulse">alarm_on</span>
                    </div>

                    <div className="p-3 bg-surface-container rounded-xl border border-outline-variant flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-on-surface">CoQ10 100mg</p>
                        <p className="text-[10px] text-on-surface-variant font-medium">01:00 PM (After meals)</p>
                      </div>
                      <span className="material-symbols-outlined text-tertiary text-lg">alarm_on</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Genuine Technical Capabilities Badges */}
          <div className="flex flex-wrap gap-2.5 pt-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container border border-outline-variant text-xs shadow-sm">
              <span className="material-symbols-outlined text-primary text-sm">sync</span>
              <span className="text-on-surface font-heading font-semibold text-[11px]">Dual Google &amp; .ICS Calendar Sync</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container border border-outline-variant text-xs shadow-sm">
              <span className="material-symbols-outlined text-secondary text-sm">shield</span>
              <span className="text-on-surface font-heading font-semibold text-[11px]">JWT Auth &amp; Role-Based Access</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container border border-outline-variant text-xs shadow-sm">
              <span className="material-symbols-outlined text-tertiary text-sm">schedule</span>
              <span className="text-on-surface font-heading font-semibold text-[11px]">Automated Cron Workers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Split Screen: Authentication & Quick Test Station */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-10 relative z-10">
        <div className="w-full max-w-md">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-outline-variant">
            {/* AI Accent Glow Top Line */}
            <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-80 blur-[1px]"></div>

            {/* Auth Tabs */}
            <div className="flex gap-6 mb-6 border-b border-outline-variant pb-3">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError(null);
                }}
                className={`font-heading text-base font-bold pb-2 transition-all ${
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
                className={`font-heading text-base font-bold pb-2 transition-all ${
                  !isLogin
                    ? 'text-primary border-b-2 border-primary -mb-[14px]'
                    : 'text-on-surface-variant hover:text-on-surface'
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
                      : 'border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
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
                      : 'border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
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
                      : 'border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
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
                      className="w-full bg-surface-container border border-outline-variant rounded-xl text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all font-medium"
                    />
                    <label htmlFor="name" className="text-xs font-medium">Full Name</label>
                  </div>

                  <div className="floating-input">
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder=" "
                      className="w-full bg-surface-container border border-outline-variant rounded-xl text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all font-medium"
                    />
                    <label htmlFor="phone" className="text-xs font-medium">Phone Number (Optional)</label>
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
                        className="w-full bg-surface-container border border-outline-variant rounded-xl text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all font-medium"
                      />
                      <label htmlFor="specialization" className="text-xs font-medium">Clinical Specialization</label>
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
                  className="w-full bg-surface-container border border-outline-variant rounded-xl text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all font-medium"
                />
                <label htmlFor="email" className="text-xs font-medium">Email Address</label>
              </div>

              <div className="floating-input">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder=" "
                  required
                  className="w-full bg-surface-container border border-outline-variant rounded-xl text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all font-medium"
                />
                <label htmlFor="password" className="text-xs font-medium">Password</label>
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
              <div className="h-px bg-outline-variant flex-1"></div>
              <span className="text-[10px] font-heading font-bold text-on-surface-variant uppercase tracking-widest">
                Quick Test Accounts
              </span>
              <div className="h-px bg-outline-variant flex-1"></div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => switchDemoUser('PATIENT')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-outline-variant bg-surface-container hover:bg-surface-container-high hover:border-primary/40 transition-all group shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-base">person</span>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors font-heading">
                      Patient Portal
                    </p>
                    <p className="text-[10px] text-on-surface-variant font-medium">Rahul Sharma &bull; rahul@example.com</p>
                  </div>
                </div>
                <span className="text-xs font-heading font-bold text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  Sign In <span className="material-symbols-outlined text-sm">chevron_right</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => switchDemoUser('DOCTOR')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-outline-variant bg-surface-container hover:bg-surface-container-high hover:border-secondary/40 transition-all group shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary border border-secondary/20 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-base">stethoscope</span>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-on-surface group-hover:text-secondary transition-colors font-heading">
                      Doctor Clinical Station
                    </p>
                    <p className="text-[10px] text-on-surface-variant font-medium">Dr. Rajesh Sharma &bull; dr.rajesh@carepulse.com</p>
                  </div>
                </div>
                <span className="text-xs font-heading font-bold text-secondary group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  Sign In <span className="material-symbols-outlined text-sm">chevron_right</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => switchDemoUser('ADMIN')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-outline-variant bg-surface-container hover:bg-surface-container-high hover:border-tertiary/40 transition-all group shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-tertiary/15 flex items-center justify-center text-tertiary border border-tertiary/20 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-on-surface group-hover:text-tertiary transition-colors font-heading">
                      Clinic Admin Portal
                    </p>
                    <p className="text-[10px] text-on-surface-variant font-medium">Admin Master &bull; admin@carepulse.com</p>
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
