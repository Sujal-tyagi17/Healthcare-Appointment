import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  DoctorListItem,
  TimeSlot,
  Appointment,
  MedicationReminderItem
} from '../types';
import { SymptomModal } from '../components/SymptomModal';
import {
  Search,
  Calendar as CalendarIcon,
  Clock,
  Pill,
  History,
  Sparkles,
  AlertCircle,
  Download,
  CheckCircle,
  CalendarCheck,
  ChevronRight
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'BOOK' | 'APPOINTMENTS' | 'MEDICATIONS'>('BOOK');

  // Booking State
  const [doctors, setDoctors] = useState<DoctorListItem[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [selectedSpec, setSelectedSpec] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorListItem | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [availability, setAvailability] = useState<{
    isOnLeave: boolean;
    leaveReason?: string;
    slots: TimeSlot[];
  } | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Modal State
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [holdToken, setHoldToken] = useState<string | undefined>(undefined);
  const [holdingSlot, setHoldingSlot] = useState(false);

  // Appointments & Medications State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medications, setMedications] = useState<MedicationReminderItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Load doctors & specializations
  useEffect(() => {
    async function loadInit() {
      try {
        const [docRes, specRes] = await Promise.all([
          api.getDoctors(),
          api.getSpecializations()
        ]);
        setDoctors(docRes.doctors);
        setSpecializations(specRes.specializations);
        if (docRes.doctors.length > 0) {
          setSelectedDoctor(docRes.doctors[0]);
        }
      } catch (err) {
        console.error('Failed to load doctors:', err);
      }
    }
    loadInit();
  }, []);

  // Filter doctors
  useEffect(() => {
    async function filterDocs() {
      try {
        const res = await api.getDoctors(searchQuery || undefined, selectedSpec);
        setDoctors(res.doctors);
        if (res.doctors.length > 0 && (!selectedDoctor || !res.doctors.find(d => d.id === selectedDoctor.id))) {
          setSelectedDoctor(res.doctors[0]);
        }
      } catch (err) {
        console.error('Failed to filter doctors:', err);
      }
    }
    filterDocs();
  }, [searchQuery, selectedSpec]);

  // Load doctor availability when doctor or date changes
  useEffect(() => {
    if (!selectedDoctor) return;
    async function loadAvailability() {
      setLoadingSlots(true);
      try {
        const res = await api.getDoctorAvailability(selectedDoctor!.id, selectedDate);
        setAvailability(res);
      } catch (err) {
        console.error('Failed to fetch availability:', err);
      } finally {
        setLoadingSlots(false);
      }
    }
    loadAvailability();
  }, [selectedDoctor, selectedDate]);

  // Load Appointments & Medications
  const refreshUserData = async () => {
    setLoadingData(true);
    try {
      const [aptRes, medRes] = await Promise.all([
        api.getAppointments(),
        api.getMedicationReminders()
      ]);
      setAppointments(aptRes.appointments);
      setMedications(medRes.medications);
    } catch (err) {
      console.error('Failed to load user data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'APPOINTMENTS' || activeTab === 'MEDICATIONS') {
      refreshUserData();
    }
  }, [activeTab]);

  // Handle Slot Click -> Hold Slot with Concurrency Lock
  const handleSlotClick = async (slot: TimeSlot) => {
    if (!slot.isAvailable || !selectedDoctor) return;
    setHoldingSlot(true);
    try {
      const res = await api.holdSlot(selectedDoctor.id, selectedDate, slot.startTime, slot.endTime);
      setHoldToken(res.holdToken);
      setSelectedSlot(slot);
    } catch (err: any) {
      alert(err.message || 'Slot could not be held.');
      // Refresh slots
      const updated = await api.getDoctorAvailability(selectedDoctor.id, selectedDate);
      setAvailability(updated);
    } finally {
      setHoldingSlot(false);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.cancelAppointment(id, 'Cancelled by patient');
      refreshUserData();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel appointment');
    }
  };

  const handleToggleMedication = async (id: string) => {
    try {
      await api.toggleMedicationReminder(id);
      setMedications(prev =>
        prev.map(m => (m.id === id ? { ...m, isActive: !m.isActive } : m))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to toggle medication reminder');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#dae2fd]">
      {/* Hero Welcome Banner */}
      <div className="ai-gradient-card rounded-3xl p-6 sm:p-8 text-white shadow-glass flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-secondary-container/30 text-secondary text-xs font-semibold backdrop-blur-md border border-secondary/20">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span className="font-heading">AI-Powered Clinical Precision</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-white">
            Welcome, {user?.name}
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-xl leading-relaxed">
            Discover top clinic specialists, receive real-time AI pre-visit urgency assessments, and review translated care plans with synchronized medication schedules.
          </p>
        </div>

        <div className="flex bg-surface-container-lowest/80 p-1.5 rounded-2xl backdrop-blur-xl border border-white/10 z-10 shrink-0 shadow-glass">
          <button
            onClick={() => setActiveTab('BOOK')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 font-heading ${
              activeTab === 'BOOK' ? 'bg-primary-container text-white shadow-neon-cyan' : 'text-on-surface-variant hover:text-white'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Book Specialist</span>
          </button>
          <button
            onClick={() => setActiveTab('APPOINTMENTS')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 font-heading ${
              activeTab === 'APPOINTMENTS' ? 'bg-primary-container text-white shadow-neon-cyan' : 'text-on-surface-variant hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Visits & Care Plans</span>
          </button>
          <button
            onClick={() => setActiveTab('MEDICATIONS')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 font-heading ${
              activeTab === 'MEDICATIONS' ? 'bg-primary-container text-white shadow-neon-cyan' : 'text-on-surface-variant hover:text-white'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Medication Tracker</span>
          </button>
        </div>
      </div>

      {/* TAB 1: FIND & BOOK DOCTOR */}
      {activeTab === 'BOOK' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Doctor Search & Selection */}
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-panel rounded-2xl p-5 border border-white/10 shadow-glass space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2 font-heading">
                <Search className="w-4 h-4 text-primary" />
                Find Clinic Specialists
              </h3>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-on-surface-variant" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search doctor by name or specialty..."
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-surface-container border border-white/10 rounded-xl text-white placeholder-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                />
              </div>

              {/* Specialization Filter Chips */}
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pt-1">
                <button
                  onClick={() => setSelectedSpec('ALL')}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all border ${
                    selectedSpec === 'ALL'
                      ? 'bg-primary-container text-white border-primary shadow-neon-cyan'
                      : 'bg-surface-container text-on-surface-variant border-white/5 hover:border-white/20 hover:text-white'
                  }`}
                >
                  All Specialties
                </button>
                {specializations.map(spec => (
                  <button
                    key={spec}
                    onClick={() => setSelectedSpec(spec)}
                    className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all border ${
                      selectedSpec === spec
                        ? 'bg-primary-container text-white border-primary shadow-neon-cyan'
                        : 'bg-surface-container text-on-surface-variant border-white/5 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            {/* Doctors List */}
            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {doctors.map(doc => {
                const isSelected = selectedDoctor?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoctor(doc)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer text-left relative ${
                      isSelected
                        ? 'glass-card border-primary ring-1 ring-primary/40 shadow-neon-cyan'
                        : 'glass-panel border-white/10 hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary-container/20 text-primary border border-primary/30 font-heading">
                          {doc.specialization}
                        </span>
                        <h4 className="font-extrabold text-white text-base mt-2 font-heading">
                          {doc.name}
                        </h4>
                        <p className="text-xs text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">{doc.bio}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold text-white font-heading">${doc.consultationFee}</span>
                        <span className="text-[10px] text-on-surface-variant block">/ visit</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-on-surface-variant">
                      <span>{doc.roomNumber || 'Room 101'}</span>
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <span>{doc.slotDurationMinutes} min slot</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}

              {doctors.length === 0 && (
                <div className="text-center py-12 glass-panel rounded-2xl border border-white/10 text-on-surface-variant text-xs">
                  No doctors found matching your filters.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Schedule & Slot Selector */}
          <div className="lg:col-span-7 space-y-4">
            {selectedDoctor ? (
              <div className="glass-panel rounded-2xl p-6 sm:p-7 border border-white/10 shadow-glass space-y-6">
                {/* Doctor Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-extrabold text-white text-xl font-heading">
                        {selectedDoctor.name}
                      </h3>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary-container/20 text-primary border border-primary/30 font-heading">
                        {selectedDoctor.specialization}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1.5">
                      Hours: {selectedDoctor.workingHoursStart} - {selectedDoctor.workingHoursEnd} ({selectedDoctor.slotDurationMinutes} min duration)
                    </p>
                  </div>

                  {/* Date Selector */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-on-surface-variant font-heading">Date:</label>
                    <input
                      type="date"
                      min={todayStr}
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      className="text-xs font-semibold p-2.5 border border-white/10 rounded-xl bg-surface-container text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Availability State */}
                {loadingSlots ? (
                  <div className="py-20 text-center text-on-surface-variant flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-primary-container border-t-transparent rounded-full animate-spin shadow-neon-cyan" />
                    <span className="text-xs font-medium font-heading">Verifying slot availability...</span>
                  </div>
                ) : availability?.isOnLeave ? (
                  <div className="p-6 bg-error-container/20 border border-error/30 rounded-2xl text-center space-y-2">
                    <AlertCircle className="w-8 h-8 text-error mx-auto" />
                    <h4 className="font-bold text-white text-sm font-heading">Doctor is on Leave on this Date</h4>
                    <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                      {availability.leaveReason || 'The doctor is unavailable on this date. Please pick another date.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-heading">
                        <Clock className="w-4 h-4 text-primary" />
                        Available Consultation Slots ({selectedDate})
                      </h4>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="flex items-center gap-1.5 text-on-surface-variant">
                          <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Available
                        </span>
                        <span className="flex items-center gap-1.5 text-on-surface-variant">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Held
                        </span>
                        <span className="flex items-center gap-1.5 text-on-surface-variant">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-600" /> Booked
                        </span>
                      </div>
                    </div>

                    {/* Slots Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
                      {availability?.slots.map((slot, index) => {
                        return (
                          <button
                            key={index}
                            disabled={!slot.isAvailable || holdingSlot}
                            onClick={() => handleSlotClick(slot)}
                            className={`p-3 rounded-xl text-xs font-bold transition-all border text-center font-heading ${
                              slot.status === 'AVAILABLE'
                                ? 'bg-surface-container border-primary/40 text-primary hover:bg-primary-container hover:text-white hover:border-primary hover:shadow-neon-cyan active:scale-95'
                                : slot.status === 'HELD'
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 cursor-not-allowed'
                                : 'bg-surface-container-lowest/50 border-white/5 text-slate-500 cursor-not-allowed line-through'
                            }`}
                          >
                            <span>{slot.startTime}</span>
                            <span className="block text-[10px] font-normal opacity-70 mt-0.5">{slot.endTime}</span>
                          </button>
                        );
                      })}
                    </div>

                    {availability?.slots.length === 0 && (
                      <div className="py-14 text-center text-on-surface-variant text-xs glass-card rounded-2xl border border-white/5">
                        No consultation slots available on this date.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-12 glass-panel rounded-2xl border border-white/10 text-on-surface-variant text-xs">
                Select a doctor to view their schedule and book a slot.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY APPOINTMENTS & MEDICAL HISTORY */}
      {activeTab === 'APPOINTMENTS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-white text-lg flex items-center gap-2 font-heading">
              <CalendarCheck className="w-5 h-5 text-primary" />
              Your Consultation History & Upcoming Visits
            </h3>
            <button
              onClick={refreshUserData}
              disabled={loadingData}
              className="text-xs font-bold text-primary hover:text-white bg-primary-container/20 hover:bg-primary-container px-3.5 py-1.5 rounded-xl border border-primary/30 transition-all font-heading"
            >
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {appointments.map(apt => (
              <div
                key={apt.id}
                className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/10 shadow-glass space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-extrabold text-white text-base font-heading">
                        Dr. {apt.doctor?.name}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary-container/20 text-primary border border-primary/30 font-heading">
                        {apt.doctor?.specialization}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 font-extrabold rounded-full font-heading ${
                          apt.status === 'BOOKED'
                            ? 'bg-primary-container/20 text-primary border border-primary/40'
                            : apt.status === 'COMPLETED'
                            ? 'bg-tertiary-container/20 text-tertiary border border-tertiary/40'
                            : 'bg-error-container/20 text-error border border-error/40'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>

                    <p className="text-xs text-on-surface-variant mt-1.5 flex flex-wrap items-center gap-2">
                      <span>Date: {apt.date}</span>
                      <span>•</span>
                      <span>Time: {apt.startTime} - {apt.endTime}</span>
                      <span>•</span>
                      <span>{apt.doctor?.roomNumber || 'Clinic Room 101'}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`/api/appointments/${apt.id}/ics`}
                      download
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-surface-container hover:bg-surface-container-high rounded-xl border border-white/10 transition-colors font-heading"
                      title="Download Calendar ICS"
                    >
                      <Download className="w-3.5 h-3.5 text-primary" />
                      <span>.ICS</span>
                    </a>
                    {apt.status === 'BOOKED' && (
                      <button
                        onClick={() => handleCancelAppointment(apt.id)}
                        className="px-3 py-1.5 text-xs font-bold text-error bg-error-container/20 hover:bg-error-container/30 border border-error/30 rounded-xl transition-colors font-heading"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Symptoms & AI Pre-visit Urgency Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-surface-container p-4 rounded-xl border border-white/5 space-y-1">
                    <span className="font-bold text-on-surface-variant block uppercase tracking-wider text-[10px] font-heading">Reported Symptoms:</span>
                    <p className="text-white leading-relaxed italic">"{apt.symptoms}"</p>
                  </div>

                  {apt.preVisitSummary && (
                    <div className="ai-gradient-card p-4 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-secondary flex items-center gap-1.5 font-heading text-xs">
                          <Sparkles className="w-3.5 h-3.5 text-secondary animate-pulse" />
                          AI Pre-Visit Triage
                        </span>
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full font-heading ${
                            apt.preVisitSummary.urgencyLevel === 'HIGH'
                              ? 'bg-error-container/30 text-error border border-error/40'
                              : apt.preVisitSummary.urgencyLevel === 'MEDIUM'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                              : 'bg-tertiary-container/20 text-tertiary border border-tertiary/40'
                          }`}
                        >
                          Urgency: {apt.preVisitSummary.urgencyLevel}
                        </span>
                      </div>
                      <p className="text-white text-xs">{apt.preVisitSummary.chiefComplaint}</p>
                    </div>
                  )}
                </div>

                {/* Post-Visit Clinical Summary & Care Plan (If Completed) */}
                {apt.postVisitSummary && (
                  <div className="mt-4 p-5 glass-card border border-tertiary/30 rounded-2xl space-y-3 text-xs">
                    <span className="font-bold text-tertiary flex items-center gap-2 text-sm font-heading">
                      <CheckCircle className="w-4 h-4 text-tertiary" />
                      Doctor's Care Plan & AI Translated Summary
                    </span>
                    <p className="text-white leading-relaxed bg-surface-container p-3.5 rounded-xl border border-white/5">
                      {apt.postVisitSummary.patientFriendlySummary}
                    </p>
                    {apt.postVisitSummary.followUpSteps && (
                      <div className="text-on-surface-variant whitespace-pre-wrap bg-surface-container p-3.5 rounded-xl border border-white/5">
                        <strong className="text-tertiary block mb-1 font-heading">Follow-up Instructions:</strong>
                        {apt.postVisitSummary.followUpSteps}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {appointments.length === 0 && (
              <div className="text-center py-14 glass-panel rounded-2xl border border-white/10 text-on-surface-variant text-xs">
                You have no booked or past appointments yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MEDICATION REMINDERS */}
      {activeTab === 'MEDICATIONS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-white text-lg flex items-center gap-2 font-heading">
                <Pill className="w-5 h-5 text-tertiary" />
                Active Medication Schedules & Alerts
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Automated email alerts are dispatched based on your prescribed dosage times.
              </p>
            </div>
            <button
              onClick={refreshUserData}
              disabled={loadingData}
              className="text-xs font-bold text-tertiary hover:text-white bg-tertiary-container/20 hover:bg-tertiary-container px-3.5 py-1.5 rounded-xl border border-tertiary/30 transition-all font-heading"
            >
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medications.map(med => (
              <div
                key={med.id}
                className={`glass-panel rounded-2xl p-5 border transition-all space-y-3.5 ${
                  med.isActive ? 'border-tertiary/40 shadow-sm' : 'border-white/5 opacity-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-tertiary px-2.5 py-0.5 bg-tertiary-container/20 rounded-full border border-tertiary/30 font-heading">
                      {med.dosage} • {med.frequency}
                    </span>
                    <h4 className="font-extrabold text-white text-base mt-2 font-heading">
                      {med.medicineName}
                    </h4>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Prescribed by Dr. {med.doctorName} ({med.specialization})
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleMedication(med.id)}
                    className={`px-3 py-1 text-xs font-bold rounded-xl transition-all font-heading ${
                      med.isActive
                        ? 'bg-tertiary-container text-white shadow-sm'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {med.isActive ? 'Active' : 'Paused'}
                  </button>
                </div>

                <div className="bg-surface-container p-3.5 rounded-xl text-xs space-y-2 border border-white/5">
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span className="font-semibold">Daily Alert Times:</span>
                    <span className="font-mono font-bold text-tertiary">
                      {med.reminderTimes?.join(', ') || '09:00'}
                    </span>
                  </div>
                  {med.instructions && (
                    <div className="text-on-surface-variant pt-1.5 border-t border-white/5">
                      <span className="font-semibold text-white">Instructions: </span>
                      {med.instructions}
                    </div>
                  )}
                  <div className="text-[11px] text-on-surface-variant/70 pt-1.5 flex justify-between">
                    <span>From: {med.startDate}</span>
                    <span>Until: {med.endDate}</span>
                  </div>
                </div>
              </div>
            ))}

            {medications.length === 0 && (
              <div className="col-span-2 text-center py-14 glass-panel rounded-2xl border border-white/10 text-on-surface-variant text-xs">
                No active medication reminders found. When your doctor prescribes medication, schedules appear here automatically.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Symptom Questionnaire & Booking Modal */}
      {selectedDoctor && selectedSlot && (
        <SymptomModal
          doctor={selectedDoctor}
          date={selectedDate}
          slot={selectedSlot}
          holdToken={holdToken}
          onClose={() => {
            setSelectedSlot(null);
            setHoldToken(undefined);
          }}
          onSuccess={() => {
            setSelectedSlot(null);
            setHoldToken(undefined);
            setActiveTab('APPOINTMENTS');
            refreshUserData();
          }}
        />
      )}
    </div>
  );
};

