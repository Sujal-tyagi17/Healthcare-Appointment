import React, { useState } from 'react';
import { Appointment, PrescriptionItem } from '../types';
import { api } from '../api/client';
import { Stethoscope, Plus, Trash2, Sparkles, CheckCircle2, X, FileText, Pill } from 'lucide-react';

interface PrescriptionModalProps {
  appointment: Appointment;
  onClose: () => void;
  onSuccess: () => void;
}

const FREQUENCY_OPTIONS = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Every 8 hours',
  'Every 12 hours',
  'As needed (PRN)'
];

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  appointment,
  onClose,
  onSuccess
}) => {
  const [clinicalNotes, setClinicalNotes] = useState(
    appointment.postVisitSummary?.clinicalNotes || ''
  );
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>(
    appointment.postVisitSummary?.prescription || [
      {
        medicineName: '',
        dosage: '',
        frequency: 'Once daily',
        durationDays: 7,
        instructions: 'Take after meals'
      }
    ]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultSummary, setResultSummary] = useState<any | null>(null);

  const handleAddMedication = () => {
    setPrescriptions(prev => [
      ...prev,
      {
        medicineName: '',
        dosage: '',
        frequency: 'Once daily',
        durationDays: 7,
        instructions: 'Take after meals'
      }
    ]);
  };

  const handleRemoveMedication = (index: number) => {
    setPrescriptions(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateMedication = (index: number, field: keyof PrescriptionItem, value: any) => {
    setPrescriptions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicalNotes.trim()) {
      setError('Please provide clinical notes for this consultation.');
      return;
    }

    const validPrescriptions = prescriptions.filter(p => p.medicineName.trim() !== '');

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.submitPostVisit(appointment.id, {
        clinicalNotes,
        prescriptions: validPrescriptions
      });
      const summary = res?.postVisitSummary || {
        clinicalNotes,
        patientFriendlySummary: `Here is your plain-language care plan: ${clinicalNotes}. Please take prescribed medications as instructed.`,
        followUpSteps: 'Follow the prescribed medication routine and schedule a follow-up if symptoms persist.',
        prescription: validPrescriptions
      };
      setResultSummary(summary);
    } catch (err: any) {
      setError(err.message || 'Failed to submit post-visit consultation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (resultSummary) {
      onSuccess();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-[#dae2fd]">
      <div className="glass-panel rounded-3xl shadow-2xl max-w-2xl w-full border border-white/15 overflow-hidden">
        {/* Header */}
        <div className="ai-gradient-card px-6 py-5 text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-tertiary-container/20 text-tertiary rounded-2xl border border-tertiary/30">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg font-heading">
                {resultSummary ? 'Consultation Completed & Translated' : 'Post-Visit Clinical Notes & Prescriptions'}
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Patient: {appointment.patient?.name} • Visit: {appointment.date} at {appointment.startTime}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-on-surface-variant hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-5">
          {!resultSummary ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Patient Symptoms Reference */}
              <div className="bg-surface-container border border-white/10 rounded-2xl p-4 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-on-surface-variant uppercase tracking-wider text-[10px] font-heading">Patient Reported Symptoms:</span>
                  {appointment.preVisitSummary && (
                    <span className="font-bold text-[10px] px-2.5 py-0.5 rounded-full bg-secondary-container/20 text-secondary border border-secondary/30 font-heading">
                      Urgency: {appointment.preVisitSummary.urgencyLevel}
                    </span>
                  )}
                </div>
                <p className="text-white italic leading-relaxed">"{appointment.symptoms}"</p>
              </div>

              {/* Clinical Notes Input */}
              <div>
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5 font-heading">
                  <FileText className="w-4 h-4 text-primary" />
                  Clinical Diagnosis & Examination Notes *
                </label>
                <textarea
                  rows={4}
                  value={clinicalNotes}
                  onChange={e => setClinicalNotes(e.target.value)}
                  placeholder="E.g., Patient presented with recurrent sinus pressure. Vitals stable. Bilateral maxillary tenderness noted. Prescribing amoxicillin and nasal corticosteroid..."
                  className="w-full text-xs sm:text-sm p-3.5 rounded-2xl bg-surface-container border border-white/10 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
                  required
                />
              </div>

              {/* Prescription Builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-heading">
                    <Pill className="w-4 h-4 text-tertiary" />
                    Prescriptions & Medications (Auto-Schedules Reminders)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddMedication}
                    className="text-xs flex items-center gap-1.5 font-bold text-tertiary bg-tertiary-container/20 hover:bg-tertiary-container hover:text-white border border-tertiary/30 px-3 py-1.5 rounded-xl transition-all font-heading"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Medicine</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {prescriptions.map((rx, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-surface-container border border-white/10 rounded-2xl space-y-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-tertiary font-heading">Medication #{idx + 1}</span>
                        {prescriptions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMedication(idx)}
                            className="text-error hover:text-white p-1.5 rounded-lg hover:bg-error-container/30 transition-colors"
                            title="Remove medication"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-on-surface-variant font-semibold mb-1 font-heading">Drug Name</label>
                          <input
                            type="text"
                            value={rx.medicineName}
                            onChange={e => handleUpdateMedication(idx, 'medicineName', e.target.value)}
                            placeholder="e.g. Amoxicillin"
                            className="w-full p-2.5 bg-surface-container-high border border-white/10 rounded-xl text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-on-surface-variant font-semibold mb-1 font-heading">Dosage</label>
                          <input
                            type="text"
                            value={rx.dosage}
                            onChange={e => handleUpdateMedication(idx, 'dosage', e.target.value)}
                            placeholder="e.g. 500mg"
                            className="w-full p-2.5 bg-surface-container-high border border-white/10 rounded-xl text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-on-surface-variant font-semibold mb-1 font-heading">Frequency</label>
                          <select
                            value={rx.frequency}
                            onChange={e => handleUpdateMedication(idx, 'frequency', e.target.value)}
                            className="w-full p-2.5 bg-surface-container-high border border-white/10 rounded-xl text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none font-medium"
                          >
                            {FREQUENCY_OPTIONS.map(opt => (
                              <option key={opt} value={opt} className="bg-surface-container text-white">{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-on-surface-variant font-semibold mb-1 font-heading">Duration (Days)</label>
                          <input
                            type="number"
                            min="1"
                            max="90"
                            value={rx.durationDays}
                            onChange={e => handleUpdateMedication(idx, 'durationDays', Number(e.target.value))}
                            className="w-full p-2.5 bg-surface-container-high border border-white/10 rounded-xl text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-on-surface-variant font-semibold mb-1 font-heading">Patient Instructions</label>
                        <input
                          type="text"
                          value={rx.instructions}
                          onChange={e => handleUpdateMedication(idx, 'instructions', e.target.value)}
                          placeholder="e.g. Take with food, drink full glass of water"
                          className="w-full p-2.5 bg-surface-container-high border border-white/10 rounded-xl text-white text-xs focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3.5 bg-error-container/20 border border-error/30 rounded-2xl text-xs text-error">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:text-white rounded-xl transition-colors font-heading"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-primary-container to-secondary-container hover:from-primary-container hover:to-secondary-container text-white text-xs font-bold rounded-xl shadow-neon-cyan disabled:opacity-50 transition-all flex items-center gap-2 font-heading"
                >
                  {isSubmitting ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Generating AI Summary & Saving...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Complete & Translate via AI</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Resulting AI Translation Preview */
            <div className="space-y-4 animate-fade-in">
              <div className="text-center py-2">
                <div className="w-14 h-14 bg-tertiary-container/20 border border-tertiary/40 text-tertiary rounded-full flex items-center justify-center mx-auto mb-3 shadow-neon-cyan">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-extrabold text-white text-xl font-heading">Consultation Completed</h4>
                <p className="text-xs text-on-surface-variant mt-1">
                  AI patient-friendly summary and medication reminders generated and dispatched to patient.
                </p>
              </div>

              <div className="glass-card border border-tertiary/30 rounded-2xl p-5 space-y-3.5 text-xs">
                <div>
                  <span className="font-bold text-tertiary uppercase tracking-wider block mb-1.5 font-heading">
                    AI Patient-Friendly Care Plan:
                  </span>
                  <p className="text-white leading-relaxed bg-surface-container p-3.5 rounded-xl border border-white/5">
                    {resultSummary.patientFriendlySummary}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-tertiary uppercase tracking-wider block mb-1.5 font-heading">
                    Follow-Up Instructions & Schedule:
                  </span>
                  <pre className="text-white whitespace-pre-wrap font-sans leading-relaxed bg-surface-container p-3.5 rounded-xl border border-white/5">
                    {resultSummary.followUpSteps}
                  </pre>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-primary-container hover:bg-primary text-white text-xs font-bold rounded-xl transition-all shadow-neon-cyan font-heading"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

