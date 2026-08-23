import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, Lock, Mail, User, Phone, Sparkles, ArrowRight, ShieldCheck, Stethoscope } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register, switchDemoUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR' | 'ADMIN'>('PATIENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({ name, email, password, role, phone });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1326] flex flex-col justify-center items-center p-4 relative overflow-hidden text-[#dae2fd]">
      {/* Decorative background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] bg-primary-container/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] bg-secondary-container/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-md w-full z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-container to-primary text-on-primary shadow-neon-cyan mb-1">
            <HeartPulse className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
            CarePulse AI
          </h1>
          <p className="text-sm text-on-surface-variant">
            Intelligent Clinic Appointments, AI Triage & Follow-up Manager
          </p>
        </div>

        {/* 1-Click Demo Evaluation Box */}
        <div className="glass-card rounded-2xl p-4 border border-white/10 shadow-glass space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-secondary font-heading">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Fast Evaluation - 1-Click Demo Access:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => switchDemoUser('PATIENT')}
              className="px-2.5 py-2.5 bg-surface-container-high/80 hover:bg-primary-container/30 hover:border-primary/50 rounded-xl text-xs font-semibold text-white border border-white/10 transition-all flex flex-col items-center gap-1 group"
            >
              <User className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
              <span>Patient</span>
            </button>
            <button
              onClick={() => switchDemoUser('DOCTOR')}
              className="px-2.5 py-2.5 bg-surface-container-high/80 hover:bg-tertiary-container/30 hover:border-tertiary/50 rounded-xl text-xs font-semibold text-white border border-white/10 transition-all flex flex-col items-center gap-1 group"
            >
              <Stethoscope className="w-4 h-4 text-tertiary group-hover:scale-110 transition-transform" />
              <span>Doctor</span>
            </button>
            <button
              onClick={() => switchDemoUser('ADMIN')}
              className="px-2.5 py-2.5 bg-surface-container-high/80 hover:bg-secondary-container/30 hover:border-secondary/50 rounded-xl text-xs font-semibold text-white border border-white/10 transition-all flex flex-col items-center gap-1 group"
            >
              <ShieldCheck className="w-4 h-4 text-secondary group-hover:scale-110 transition-transform" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-glass border border-white/10 space-y-6">
          {/* Switch Tab */}
          <div className="flex bg-surface-container-low p-1 rounded-2xl border border-white/5">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all font-heading ${
                isLogin ? 'bg-surface-container-highest text-white shadow-sm border border-white/10' : 'text-on-surface-variant hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all font-heading ${
                !isLogin ? 'bg-surface-container-highest text-white shadow-sm border border-white/10' : 'text-on-surface-variant hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="p-3.5 bg-error-container/20 border border-error/30 rounded-xl text-xs text-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 font-heading">
                    Account Role
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['PATIENT', 'DOCTOR', 'ADMIN'] as const).map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                          role === r
                            ? 'bg-primary-container/20 border-primary text-white ring-1 ring-primary/40 shadow-neon-cyan'
                            : 'border-white/10 bg-surface-container text-on-surface-variant hover:border-white/20 hover:text-white'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 font-heading">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-on-surface-variant" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-surface-container border border-white/10 rounded-xl text-white placeholder-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 font-heading">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-on-surface-variant" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-surface-container border border-white/10 rounded-xl text-white placeholder-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 font-heading">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-on-surface-variant" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-surface-container border border-white/10 rounded-xl text-white placeholder-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 font-heading">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-on-surface-variant" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-surface-container border border-white/10 rounded-xl text-white placeholder-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-primary-container to-secondary-container hover:from-primary-container hover:to-secondary-container text-white text-sm font-bold rounded-xl shadow-neon-cyan hover:shadow-neon-ai transition-all flex items-center justify-center gap-2 disabled:opacity-50 font-heading"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In to Portal' : 'Create My Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

