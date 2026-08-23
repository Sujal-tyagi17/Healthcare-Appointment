import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

interface AIInsightsModalProps {
  onClose: () => void;
}

export const AIInsightsModal: React.FC<AIInsightsModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [symptomInput, setSymptomInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    chiefComplaint: string;
    suggestedQuestions: string[];
    recommendedSpecialty?: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'assistant' | 'overview' | 'tips'>('assistant');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomInput.trim()) return;

    setAnalyzing(true);
    try {
      const res = await api.analyzeSymptoms(symptomInput);
      setAnalysisResult(res.analysis);
    } catch (err: any) {
      alert(err.message || 'AI analysis could not be completed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const samplePrompts = [
    'I have frequent dull headaches in the temple area after looking at screens for 6 hours.',
    'Experiencing occasional chest tightness and shortness of breath when walking up steps.',
    'Persistent itchy red patches on my inner elbows for 2 weeks.'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-on-surface">
      <div className="glass-panel rounded-3xl shadow-2xl max-w-2xl w-full border border-white/15 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-secondary-container/40 via-surface-container to-primary-container/30 px-6 py-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-secondary to-primary flex items-center justify-center text-white shadow-neon-ai">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-white leading-tight">
                CarePulse Clinical AI Intelligence
              </h3>
              <p className="text-xs text-on-surface-variant font-medium">
                Predictive Symptom Triage, Care Guidance &amp; Diagnostic Insights
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-on-surface-variant hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 pb-2 border-b border-outline-variant/20 bg-surface-container-lowest/50">
          <button
            onClick={() => setActiveTab('assistant')}
            className={`font-heading text-xs font-bold px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'assistant'
                ? 'bg-primary/20 text-primary border border-primary/40 shadow-neon-cyan'
                : 'text-on-surface-variant hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">psychiatry</span>
            <span>AI Symptom Checker</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`font-heading text-xs font-bold px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-secondary/20 text-secondary border border-secondary/40 shadow-neon-ai'
                : 'text-on-surface-variant hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">insights</span>
            <span>Platform Intelligence</span>
          </button>

          <button
            onClick={() => setActiveTab('tips')}
            className={`font-heading text-xs font-bold px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'tips'
                ? 'bg-tertiary/20 text-tertiary border border-tertiary/40'
                : 'text-on-surface-variant hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">health_and_safety</span>
            <span>Clinical Wellness</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {activeTab === 'assistant' && (
            <div className="space-y-4">
              <div className="bg-surface-container/60 p-4 rounded-2xl border border-white/5 space-y-2">
                <p className="text-white font-heading font-semibold">
                  Describe symptoms, health queries, or physical discomfort:
                </p>
                <p className="text-on-surface-variant leading-relaxed">
                  CarePulse AI evaluates clinical urgency, synthesizes chief complaints, and generates pertinent diagnostic inquiries for specialist review.
                </p>

                <form onSubmit={handleAnalyze} className="space-y-3 pt-2">
                  <textarea
                    rows={3}
                    value={symptomInput}
                    onChange={e => setSymptomInput(e.target.value)}
                    placeholder="e.g. Mild shortness of breath and chest flutter after climbing stairs..."
                    className="w-full bg-surface-container-high/80 border border-outline-variant/40 rounded-xl p-3 text-white text-xs placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none transition-all resize-none"
                    required
                  />

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {samplePrompts.map((prompt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSymptomInput(prompt)}
                          className="text-[10px] bg-surface-container hover:bg-surface-container-highest text-on-surface-variant hover:text-white px-2.5 py-1 rounded-lg border border-white/5 transition-colors text-left truncate max-w-[200px]"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={analyzing || !symptomInput.trim()}
                      className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary hover:brightness-110 text-white font-heading font-bold rounded-xl shadow-neon-cyan flex items-center gap-1.5 disabled:opacity-40 transition-all"
                    >
                      <span className="material-symbols-outlined text-base">
                        {analyzing ? 'sync' : 'neurology'}
                      </span>
                      <span>{analyzing ? 'Analyzing...' : 'Run Clinical Triage'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Analysis Result Card */}
              {analysisResult && (
                <div className="glass-card p-5 rounded-2xl border border-secondary/40 ai-gradient-border space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-lg">verified</span>
                      <span className="font-heading font-extrabold text-sm text-white">
                        AI Clinical Urgency Assessment
                      </span>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full font-heading font-bold text-xs flex items-center gap-1 border ${
                        analysisResult.urgencyLevel === 'HIGH'
                          ? 'bg-error/15 text-error border-error/30'
                          : analysisResult.urgencyLevel === 'MEDIUM'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-400/30'
                          : 'bg-tertiary/15 text-tertiary border-tertiary/30'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">warning</span>
                      Urgency: {analysisResult.urgencyLevel}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block font-heading">
                      Structured Chief Complaint:
                    </span>
                    <p className="text-xs text-white bg-surface-container p-3 rounded-xl border border-white/5 leading-relaxed">
                      {analysisResult.chiefComplaint}
                    </p>
                  </div>

                  {analysisResult.suggestedQuestions && analysisResult.suggestedQuestions.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block font-heading flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-secondary">help_center</span>
                        Suggested Diagnostic Inquiries for Doctor:
                      </span>
                      <div className="space-y-1.5">
                        {analysisResult.suggestedQuestions.map((q, idx) => (
                          <div
                            key={idx}
                            className="bg-surface-container p-2.5 rounded-xl border border-white/5 text-xs text-white flex items-start gap-2"
                          >
                            <span className="text-secondary font-bold font-heading">{idx + 1}.</span>
                            <span className="leading-relaxed">{q}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-1.5">
                  <div className="flex items-center gap-2 text-primary font-heading font-bold">
                    <span className="material-symbols-outlined text-base">timer</span>
                    <span>Hold Token Lock Engine</span>
                  </div>
                  <p className="text-on-surface-variant leading-relaxed">
                    Protects slots with 10-minute pessimistic cache holds to guarantee 100% conflict-free scheduling across concurrent patients.
                  </p>
                </div>

                <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-1.5">
                  <div className="flex items-center gap-2 text-secondary font-heading font-bold">
                    <span className="material-symbols-outlined text-base">translate</span>
                    <span>Care Plan Translation</span>
                  </div>
                  <p className="text-on-surface-variant leading-relaxed">
                    Converts dense clinical prescription notes into clear, jargon-free instructions and automatically sets automated medication alarms.
                  </p>
                </div>

                <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-1.5">
                  <div className="flex items-center gap-2 text-tertiary font-heading font-bold">
                    <span className="material-symbols-outlined text-base">event_repeat</span>
                    <span>Automated Rescheduling</span>
                  </div>
                  <p className="text-on-surface-variant leading-relaxed">
                    When a specialist is marked on leave, the background queue instantly moves affected appointments to priority reschedule status.
                  </p>
                </div>

                <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 font-heading font-bold">
                    <span className="material-symbols-outlined text-base">sync</span>
                    <span>Google Calendar Sync</span>
                  </div>
                  <p className="text-on-surface-variant leading-relaxed">
                    One-click direct calendar export and downloadable `.ICS` files ensure patients never miss consultations.
                  </p>
                </div>
              </div>

              <div className="bg-surface-container p-4 rounded-2xl border border-white/5 text-xs text-on-surface-variant">
                Logged in as <strong className="text-white">{user?.name}</strong> ({user?.role}) • Clinical AI Version 2.4 Active.
              </div>
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="space-y-3">
              <div className="bg-surface-container/60 p-4 rounded-2xl border border-white/5 space-y-2">
                <h4 className="font-heading font-bold text-white text-sm flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-tertiary text-base">verified</span>
                  General Health &amp; Preventative Guidelines
                </h4>
                <ul className="space-y-2 text-on-surface-variant leading-relaxed pl-1">
                  <li className="flex items-start gap-2">
                    <span className="text-tertiary font-bold">•</span>
                    <span><strong>Hydration &amp; Nutrition:</strong> Maintain 2.5 - 3 Litres of clean water daily, especially during warm weather.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-tertiary font-bold">•</span>
                    <span><strong>Medication Adherence:</strong> Take prescribed doses at consistent daily hours as indicated in your Care Plan.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-tertiary font-bold">•</span>
                    <span><strong>Pre-Visit Preparation:</strong> Note down the duration, frequency, and severity of symptoms before your specialist consultation.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-container-lowest border-t border-outline-variant/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-primary hover:bg-primary-container text-on-primary font-heading font-bold text-xs rounded-xl shadow-neon-cyan transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
