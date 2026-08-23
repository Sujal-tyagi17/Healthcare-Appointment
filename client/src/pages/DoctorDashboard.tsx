import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Appointment } from '../types';
import { PrescriptionModal } from '../components/PrescriptionModal';
import {
  Stethoscope,
  Clock,
  Sparkles,
  Calendar,
  AlertTriangle,
  User,
  Phone,
  FileCheck
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Active consultation modal
  const [activeConsultationApt, setActiveConsultationApt] = useState<Appointment | null>(null);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAppointments(selectedStatus, selectedDate || undefined);
      setAppointments(res.appointments);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedStatus, selectedDate]);

  const bookedCount = appointments.filter(a => a.status === 'BOOKED').length;
  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;
  const highUrgencyCount = appointments.filter(a => a.preVisitSummary?.urgencyLevel === 'HIGH').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#dae2fd]">
      {/* Header Banner */}
      <div className="ai-gradient-card rounded-3xl p-6 sm:p-8 text-white shadow-glass flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-tertiary-container/20 text-tertiary text-xs font-semibold backdrop-blur-md border border-tertiary/30">
            <Stethoscope className="w-3.5 h-3.5 text-tertiary" />
            <span className="font-heading">Doctor Clinical Station</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-white">
            Dr. {user?.name}
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-xl leading-relaxed">
            {user?.doctorProfile?.specialization || 'Clinical Specialist'} • {user?.doctorProfile?.roomNumber || 'Room 101'} • Consult Duration: {user?.doctorProfile?.slotDurationMinutes || 30} mins
          </p>
        </div>

        {/* Quick Stats Chips */}
        <div className="grid grid-cols-3 gap-3 z-10 shrink-0 w-full sm:w-auto">
          <div className="bg-surface-container-lowest/80 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl text-center shadow-sm">
            <span className="text-xl sm:text-2xl font-extrabold text-primary font-heading block">{bookedCount}</span>
            <span className="text-[11px] text-on-surface-variant font-medium">Pending Visits</span>
          </div>
          <div className="bg-surface-container-lowest/80 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl text-center shadow-sm">
            <span className="text-xl sm:text-2xl font-extrabold text-tertiary font-heading block">{completedCount}</span>
            <span className="text-[11px] text-on-surface-variant font-medium">Completed</span>
          </div>
          <div className="bg-error-container/20 backdrop-blur-md border border-error/30 px-4 py-3 rounded-2xl text-center shadow-sm">
            <span className="text-xl sm:text-2xl font-extrabold text-error font-heading block">{highUrgencyCount}</span>
            <span className="text-[11px] text-error font-bold">High Urgency</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-white/10 shadow-glass flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border font-heading ${
              selectedStatus === 'ALL'
                ? 'bg-primary-container text-white border-primary shadow-neon-cyan'
                : 'bg-surface-container text-on-surface-variant border-white/5 hover:border-white/20 hover:text-white'
            }`}
          >
            All Visits
          </button>
          <button
            onClick={() => setSelectedStatus('BOOKED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border font-heading ${
              selectedStatus === 'BOOKED'
                ? 'bg-primary-container text-white border-primary shadow-neon-cyan'
                : 'bg-surface-container text-on-surface-variant border-white/5 hover:border-white/20 hover:text-white'
            }`}
          >
            Upcoming / In-Queue
          </button>
          <button
            onClick={() => setSelectedStatus('COMPLETED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border font-heading ${
              selectedStatus === 'COMPLETED'
                ? 'bg-primary-container text-white border-primary shadow-neon-cyan'
                : 'bg-surface-container text-on-surface-variant border-white/5 hover:border-white/20 hover:text-white'
            }`}
          >
            Completed
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-on-surface-variant" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="text-xs font-semibold p-2 border border-white/10 rounded-xl bg-surface-container text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="text-xs text-on-surface-variant hover:text-white underline font-heading"
              >
                Clear
              </button>
            )}
          </div>

          <button
            onClick={fetchAppointments}
            className="text-xs font-bold text-primary bg-primary-container/20 hover:bg-primary-container hover:text-white border border-primary/30 px-3.5 py-2 rounded-xl transition-all font-heading"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Patient Queue Cards */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-20 text-on-surface-variant flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-primary-container border-t-transparent rounded-full animate-spin shadow-neon-cyan" />
            <span className="text-xs font-medium font-heading">Loading clinical schedule...</span>
          </div>
        ) : (
          appointments.map(apt => {
            const urgency = apt.preVisitSummary?.urgencyLevel || 'LOW';
            return (
              <div
                key={apt.id}
                className={`glass-panel rounded-2xl p-5 sm:p-6 border transition-all shadow-glass space-y-4 ${
                  urgency === 'HIGH'
                    ? 'border-error/40 ring-1 ring-error/30'
                    : 'border-white/10 hover:border-primary/40'
                }`}
              >
                {/* Top Row: Patient Info & Status */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-surface-container text-primary flex items-center justify-center font-bold text-xs border border-white/10">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-white text-base font-heading">
                          {apt.patient?.name}
                        </h4>
                        <p className="text-xs text-on-surface-variant flex items-center gap-3">
                          <span>{apt.patient?.email}</span>
                          {apt.patient?.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-primary" /> {apt.patient?.phone}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white font-heading">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>{apt.date} • {apt.startTime} - {apt.endTime}</span>
                      </div>
                      <span
                        className={`inline-block mt-1 text-[11px] px-2.5 py-0.5 font-extrabold rounded-full font-heading ${
                          apt.status === 'BOOKED'
                            ? 'bg-primary-container/20 text-primary border border-primary/30'
                            : apt.status === 'COMPLETED'
                            ? 'bg-tertiary-container/20 text-tertiary border border-tertiary/30'
                            : 'bg-error-container/20 text-error border border-error/30'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>

                    {apt.status === 'BOOKED' && (
                      <button
                        onClick={() => setActiveConsultationApt(apt)}
                        className="px-4 py-2.5 bg-gradient-to-r from-primary-container to-secondary-container hover:from-primary-container hover:to-secondary-container text-white text-xs font-bold rounded-xl shadow-neon-cyan transition-all flex items-center gap-2 font-heading"
                      >
                        <Stethoscope className="w-4 h-4" />
                        <span>Conduct Consultation</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* AI Pre-Visit Triage & Symptoms Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                  {/* Raw Symptoms */}
                  <div className="lg:col-span-4 bg-surface-container p-4 rounded-xl border border-white/5 space-y-1">
                    <span className="font-bold text-on-surface-variant block uppercase tracking-wider text-[10px] font-heading">Patient Reported Symptoms:</span>
                    <p className="text-white italic leading-relaxed">"{apt.symptoms}"</p>
                  </div>

                  {/* AI Triage Card */}
                  {apt.preVisitSummary && (
                    <div className="lg:col-span-8 ai-gradient-card p-4 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-secondary font-heading text-xs">
                          <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
                          <span>AI Pre-Visit Clinical Assessment</span>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 font-extrabold rounded-full text-xs flex items-center gap-1 font-heading ${
                            apt.preVisitSummary.urgencyLevel === 'HIGH'
                              ? 'bg-error-container/30 text-error border border-error/40'
                              : apt.preVisitSummary.urgencyLevel === 'MEDIUM'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                              : 'bg-tertiary-container/20 text-tertiary border border-tertiary/40'
                          }`}
                        >
                          {apt.preVisitSummary.urgencyLevel === 'HIGH' && (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          )}
                          Urgency Level: {apt.preVisitSummary.urgencyLevel}
                        </span>
                      </div>

                      <div>
                        <span className="text-on-surface-variant font-semibold">Chief Complaint: </span>
                        <span className="text-white font-medium">{apt.preVisitSummary.chiefComplaint}</span>
                      </div>

                      {apt.preVisitSummary.suggestedQuestions?.length > 0 && (
                        <div className="pt-2 border-t border-white/10">
                          <span className="font-bold text-secondary block mb-1 font-heading">
                            Suggested Diagnostic Inquiries for Doctor:
                          </span>
                          <ul className="list-disc list-inside text-on-surface-variant space-y-1">
                            {apt.preVisitSummary.suggestedQuestions.map((q, idx) => (
                              <li key={idx} className="leading-relaxed text-white/90">{q}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Completed Visit Clinical Notes & Translation View */}
                {apt.postVisitSummary && (
                  <div className="p-4 bg-surface-container border border-tertiary/30 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-tertiary flex items-center gap-1.5 font-heading">
                        <FileCheck className="w-4 h-4 text-tertiary" />
                        Clinical Records & Prescription Summary
                      </span>
                      <button
                        onClick={() => setActiveConsultationApt(apt)}
                        className="text-xs font-bold text-primary hover:underline font-heading"
                      >
                        Edit Notes
                      </button>
                    </div>

                    <div className="bg-surface-container-high p-3.5 rounded-lg border border-white/5">
                      <strong className="text-on-surface-variant block mb-1 font-heading">Doctor's Clinical Notes:</strong>
                      <p className="text-white">{apt.postVisitSummary.clinicalNotes}</p>
                    </div>

                    {apt.postVisitSummary.patientFriendlySummary && (
                      <div className="bg-tertiary-container/10 p-3.5 rounded-lg border border-tertiary/20">
                        <strong className="text-tertiary block mb-1 font-heading">AI Patient-Friendly Care Plan:</strong>
                        <p className="text-white">{apt.postVisitSummary.patientFriendlySummary}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {appointments.length === 0 && !isLoading && (
          <div className="text-center py-16 glass-panel rounded-2xl border border-white/10 text-on-surface-variant text-xs">
            No appointments scheduled matching the selected filters.
          </div>
        )}
      </div>

      {/* Post-Visit Clinical Consultation Modal */}
      {activeConsultationApt && (
        <PrescriptionModal
          appointment={activeConsultationApt}
          onClose={() => setActiveConsultationApt(null)}
          onSuccess={() => {
            setActiveConsultationApt(null);
            fetchAppointments();
          }}
        />
      )}
    </div>
  );
};

