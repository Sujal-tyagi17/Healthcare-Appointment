import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { DoctorListItem, NotificationLogItem } from '../types';
import {
  Shield,
  Users,
  Calendar,
  AlertTriangle,
  Plus,
  Mail,
  CheckCircle,
  RefreshCw,
  Clock,
  Trash2,
  Send
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'DOCTORS' | 'LEAVES' | 'NOTIFICATIONS'>('ANALYTICS');

  // Stats State
  const [stats, setStats] = useState<any>(null);
  const [recentApts, setRecentApts] = useState<any[]>([]);

  // Doctors State
  const [doctors, setDoctors] = useState<DoctorListItem[]>([]);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    email: '',
    password: 'doctor123',
    phone: '',
    specialization: 'General Medicine',
    bio: '',
    slotDurationMinutes: 30,
    workingHoursStart: '09:00',
    workingHoursEnd: '17:00',
    consultationFee: 50,
    roomNumber: 'Room 101'
  });

  // Leave Management State
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [leaveDate, setLeaveDate] = useState<string>('');
  const [leaveReason, setLeaveReason] = useState<string>('Medical Conference & Approved Leave');
  const [leaveResult, setLeaveResult] = useState<any | null>(null);
  const [doctorLeaves, setDoctorLeaves] = useState<any[]>([]);

  // Notification Logs State
  const [notificationLogs, setNotificationLogs] = useState<NotificationLogItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load Admin Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, docRes, notifRes] = await Promise.all([
        api.getAdminAnalytics(),
        api.getDoctors(),
        api.getNotificationLogs()
      ]);
      setStats(analyticsRes.stats);
      setRecentApts(analyticsRes.recentAppointments || []);
      setDoctors(docRes.doctors);
      setNotificationLogs(notifRes.logs || []);

      if (docRes.doctors.length > 0 && !selectedDoctorId) {
        setSelectedDoctorId(docRes.doctors[0].id);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Load leaves when selected doctor changes
  useEffect(() => {
    if (!selectedDoctorId) return;
    async function loadLeaves() {
      try {
        const res = await api.getDoctorLeaves(selectedDoctorId);
        setDoctorLeaves(res.leaves || []);
      } catch (err) {
        console.error('Failed to load leaves:', err);
      }
    }
    loadLeaves();
  }, [selectedDoctorId]);

  // Create Doctor
  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createDoctor(newDoctor);
      setShowAddDoctor(false);
      setNewDoctor({
        name: '',
        email: '',
        password: 'doctor123',
        phone: '',
        specialization: 'General Medicine',
        bio: '',
        slotDurationMinutes: 30,
        workingHoursStart: '09:00',
        workingHoursEnd: '17:00',
        consultationFee: 50,
        roomNumber: 'Room 101'
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create doctor');
    }
  };

  // Mark Doctor on Leave (Conflict Detection & Auto Notification Dispatch)
  const handleMarkLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId || !leaveDate) {
      alert('Please select doctor and leave date.');
      return;
    }

    try {
      const res = await api.markDoctorOnLeave(selectedDoctorId, leaveDate, leaveReason);
      setLeaveResult(res);
      // Reload leaves & logs
      const updatedLeaves = await api.getDoctorLeaves(selectedDoctorId);
      setDoctorLeaves(updatedLeaves.leaves || []);
      const notifs = await api.getNotificationLogs();
      setNotificationLogs(notifs.logs || []);
    } catch (err: any) {
      alert(err.message || 'Failed to mark doctor on leave');
    }
  };

  const handleRemoveLeave = async (date: string) => {
    if (!confirm(`Remove leave for ${date}?`)) return;
    try {
      await api.removeDoctorLeave(selectedDoctorId, date);
      const updatedLeaves = await api.getDoctorLeaves(selectedDoctorId);
      setDoctorLeaves(updatedLeaves.leaves || []);
    } catch (err: any) {
      alert(err.message || 'Failed to remove leave');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#dae2fd]">
      {/* Banner */}
      <div className="ai-gradient-card rounded-3xl p-6 sm:p-8 text-white shadow-glass flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-secondary-container/20 text-secondary text-xs font-semibold backdrop-blur-md border border-secondary/30">
            <Shield className="w-3.5 h-3.5 text-secondary" />
            <span className="font-heading">Clinic Control Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-white">
            Clinic Administrator Portal
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-xl leading-relaxed">
            Manage doctor profiles, orchestrate automated leave conflict resolution with patient alerts, and audit outbound notifications.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap bg-surface-container-lowest/80 p-1.5 rounded-2xl backdrop-blur-xl border border-white/10 z-10 shrink-0 gap-1.5 shadow-glass">
          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all font-heading ${
              activeTab === 'ANALYTICS' ? 'bg-primary-container text-white shadow-neon-cyan' : 'text-on-surface-variant hover:text-white'
            }`}
          >
            System Stats
          </button>
          <button
            onClick={() => setActiveTab('DOCTORS')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all font-heading ${
              activeTab === 'DOCTORS' ? 'bg-primary-container text-white shadow-neon-cyan' : 'text-on-surface-variant hover:text-white'
            }`}
          >
            Doctors ({doctors.length})
          </button>
          <button
            onClick={() => setActiveTab('LEAVES')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all font-heading ${
              activeTab === 'LEAVES' ? 'bg-primary-container text-white shadow-neon-cyan' : 'text-on-surface-variant hover:text-white'
            }`}
          >
            Leave & Conflict Manager
          </button>
          <button
            onClick={() => setActiveTab('NOTIFICATIONS')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all font-heading ${
              activeTab === 'NOTIFICATIONS' ? 'bg-primary-container text-white shadow-neon-cyan' : 'text-on-surface-variant hover:text-white'
            }`}
          >
            Notification Logs
          </button>
        </div>
      </div>

      {/* TAB 1: SYSTEM STATS & ANALYTICS */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/10 shadow-glass space-y-1.5">
              <div className="flex items-center justify-between text-on-surface-variant text-xs font-semibold">
                <span className="font-heading">Active Doctors</span>
                <Users className="w-4 h-4 text-primary" />
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-heading block">{stats?.totalDoctors || 0}</span>
              <span className="text-[11px] text-on-surface-variant">Registered Specialists</span>
            </div>

            <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/10 shadow-glass space-y-1.5">
              <div className="flex items-center justify-between text-on-surface-variant text-xs font-semibold">
                <span className="font-heading">Total Bookings</span>
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-heading block">{stats?.totalAppointments || 0}</span>
              <span className="text-[11px] text-tertiary font-semibold">{stats?.bookedAppointments || 0} active / {stats?.completedAppointments || 0} completed</span>
            </div>

            <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/10 shadow-glass space-y-1.5">
              <div className="flex items-center justify-between text-on-surface-variant text-xs font-semibold">
                <span className="font-heading">Registered Patients</span>
                <Users className="w-4 h-4 text-tertiary" />
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-heading block">{stats?.totalPatients || 0}</span>
              <span className="text-[11px] text-on-surface-variant">Total Patient Accounts</span>
            </div>

            <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/10 shadow-glass space-y-1.5">
              <div className="flex items-center justify-between text-on-surface-variant text-xs font-semibold">
                <span className="font-heading">Notification Delivery</span>
                <Mail className="w-4 h-4 text-secondary" />
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-heading block">{stats?.sentNotifications || 0}</span>
              <span className="text-[11px] text-secondary font-semibold">Auto Emails & Reminders Sent</span>
            </div>
          </div>

          {/* Recent Appointments Overview */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 shadow-glass space-y-4">
            <h3 className="font-extrabold text-white text-base font-heading">Recent Clinic Consultations</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container text-on-surface-variant font-bold uppercase tracking-wider border-y border-white/10 font-heading">
                  <tr>
                    <th className="p-3.5">Patient</th>
                    <th className="p-3.5">Doctor & Specialty</th>
                    <th className="p-3.5">Schedule</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">AI Triage Urgency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentApts.map(apt => (
                    <tr key={apt.id} className="hover:bg-surface-container/60 transition-colors">
                      <td className="p-3.5 font-semibold text-white">
                        {apt.patient?.name}
                        <span className="block text-[11px] text-on-surface-variant font-normal">{apt.patient?.email}</span>
                      </td>
                      <td className="p-3.5 font-semibold text-white">
                        {apt.doctor?.name}
                        <span className="block text-[11px] text-primary font-normal">{apt.doctor?.doctorProfile?.specialization}</span>
                      </td>
                      <td className="p-3.5 text-on-surface-variant font-medium">
                        {apt.date} • {apt.startTime} - {apt.endTime}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 font-extrabold rounded-full text-[10px] font-heading ${
                            apt.status === 'BOOKED'
                              ? 'bg-primary-container/20 text-primary border border-primary/30'
                              : apt.status === 'COMPLETED'
                              ? 'bg-tertiary-container/20 text-tertiary border border-tertiary/30'
                              : 'bg-error-container/20 text-error border border-error/30'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {apt.preVisitSummary ? (
                          <span
                            className={`px-2.5 py-0.5 font-extrabold rounded-full text-[10px] font-heading ${
                              apt.preVisitSummary.urgencyLevel === 'HIGH'
                                ? 'bg-error-container/30 text-error border border-error/40'
                                : apt.preVisitSummary.urgencyLevel === 'MEDIUM'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                                : 'bg-tertiary-container/20 text-tertiary border border-tertiary/40'
                            }`}
                          >
                            {apt.preVisitSummary.urgencyLevel}
                          </span>
                        ) : (
                          <span className="text-on-surface-variant/40">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOCTORS MANAGEMENT */}
      {activeTab === 'DOCTORS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-white text-base font-heading">Clinic Doctors Directory</h3>
            <button
              onClick={() => setShowAddDoctor(!showAddDoctor)}
              className="px-4 py-2.5 bg-gradient-to-r from-primary-container to-secondary-container hover:from-primary-container hover:to-secondary-container text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-neon-cyan font-heading"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddDoctor ? 'Close Form' : 'Add Doctor Profile'}</span>
            </button>
          </div>

          {/* Add Doctor Form */}
          {showAddDoctor && (
            <form onSubmit={handleCreateDoctor} className="glass-panel p-6 rounded-2xl border border-primary/30 shadow-glass space-y-4 animate-fade-in">
              <h4 className="font-bold text-white text-sm font-heading">Create Doctor Account & Profile</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-on-surface-variant mb-1 font-heading">Doctor Name *</label>
                  <input
                    type="text"
                    value={newDoctor.name}
                    onChange={e => setNewDoctor({ ...newDoctor, name: e.target.value })}
                    placeholder="Dr. Gregory House"
                    className="w-full p-2.5 bg-surface-container border border-white/10 rounded-xl text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-on-surface-variant mb-1 font-heading">Email *</label>
                  <input
                    type="email"
                    value={newDoctor.email}
                    onChange={e => setNewDoctor({ ...newDoctor, email: e.target.value })}
                    placeholder="house@carepulse.com"
                    className="w-full p-2.5 bg-surface-container border border-white/10 rounded-xl text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-on-surface-variant mb-1 font-heading">Specialization *</label>
                  <input
                    type="text"
                    value={newDoctor.specialization}
                    onChange={e => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                    placeholder="Diagnostics / Cardiology"
                    className="w-full p-2.5 bg-surface-container border border-white/10 rounded-xl text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-on-surface-variant mb-1 font-heading">Working Start (HH:MM)</label>
                  <input
                    type="text"
                    value={newDoctor.workingHoursStart}
                    onChange={e => setNewDoctor({ ...newDoctor, workingHoursStart: e.target.value })}
                    className="w-full p-2.5 bg-surface-container border border-white/10 rounded-xl text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-on-surface-variant mb-1 font-heading">Working End (HH:MM)</label>
                  <input
                    type="text"
                    value={newDoctor.workingHoursEnd}
                    onChange={e => setNewDoctor({ ...newDoctor, workingHoursEnd: e.target.value })}
                    className="w-full p-2.5 bg-surface-container border border-white/10 rounded-xl text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-on-surface-variant mb-1 font-heading">Slot Duration (Mins)</label>
                  <input
                    type="number"
                    value={newDoctor.slotDurationMinutes}
                    onChange={e => setNewDoctor({ ...newDoctor, slotDurationMinutes: Number(e.target.value) })}
                    className="w-full p-2.5 bg-surface-container border border-white/10 rounded-xl text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDoctor(false)}
                  className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary-container text-white text-xs font-bold rounded-xl hover:bg-primary transition-colors shadow-neon-cyan font-heading"
                >
                  Save Doctor Profile
                </button>
              </div>
            </form>
          )}

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map(doc => (
              <div key={doc.id} className="glass-panel p-5 rounded-2xl border border-white/10 shadow-glass space-y-3.5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 bg-secondary-container/20 text-secondary rounded-full border border-secondary/30 font-heading">
                      {doc.specialization}
                    </span>
                    <h4 className="font-bold text-white text-base mt-2 font-heading">{doc.name}</h4>
                    <p className="text-xs text-on-surface-variant">{doc.email}</p>
                  </div>
                  <span className="text-sm font-bold text-white font-heading">${doc.consultationFee}</span>
                </div>

                <div className="bg-surface-container p-3.5 rounded-xl text-xs space-y-1.5 text-on-surface-variant border border-white/5">
                  <div className="flex justify-between">
                    <span>Working Hours:</span>
                    <span className="font-semibold text-white">{doc.workingHoursStart} - {doc.workingHoursEnd}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Slot Duration:</span>
                    <span className="font-semibold text-white">{doc.slotDurationMinutes} mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-semibold text-white">{doc.roomNumber || 'Room 101'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DOCTOR LEAVE & CONFLICT RESOLUTION */}
      {activeTab === 'LEAVES' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Mark on Leave Form */}
          <div className="lg:col-span-6 space-y-4">
            <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-glass space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-white text-sm font-heading">
                  Register Doctor Leave & Resolve Conflicts
                </h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                When a doctor is placed on leave, any conflicting appointments on that date are automatically marked for priority reschedule and urgent alert emails are dispatched to affected patients.
              </p>

              <form onSubmit={handleMarkLeave} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-on-surface-variant mb-1 font-heading">Select Doctor *</label>
                  <select
                    value={selectedDoctorId}
                    onChange={e => setSelectedDoctorId(e.target.value)}
                    className="w-full p-2.5 bg-surface-container border border-white/10 rounded-xl text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none font-semibold"
                    required
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.id} className="bg-surface-container text-white">
                        {d.name} ({d.specialization})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-on-surface-variant mb-1 font-heading">Leave Date *</label>
                  <input
                    type="date"
                    value={leaveDate}
                    onChange={e => setLeaveDate(e.target.value)}
                    className="w-full p-2.5 bg-surface-container border border-white/10 rounded-xl text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-on-surface-variant mb-1 font-heading">Leave Reason</label>
                  <input
                    type="text"
                    value={leaveReason}
                    onChange={e => setLeaveReason(e.target.value)}
                    placeholder="e.g., Medical Conference or Personal Leave"
                    className="w-full p-2.5 bg-surface-container border border-white/10 rounded-xl text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 font-heading"
                >
                  <Send className="w-4 h-4" />
                  <span>Mark On Leave & Notify Affected Patients</span>
                </button>
              </form>

              {/* Conflict Execution Result Card */}
              {leaveResult && (
                <div className="p-4 bg-tertiary-container/20 border border-tertiary/40 rounded-xl space-y-2 text-xs animate-fade-in">
                  <div className="flex items-center gap-2 text-tertiary font-bold font-heading">
                    <CheckCircle className="w-4 h-4" />
                    <span>Leave Registered & Conflicting Bookings Resolved</span>
                  </div>
                  <p className="text-white">
                    <strong>{leaveResult.affectedAppointmentsCount}</strong> conflicting appointment(s) were cancelled/flagged for reschedule and <strong>{leaveResult.patientsNotifiedCount}</strong> patient notification email(s) dispatched.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Approved Leaves List */}
          <div className="lg:col-span-6 space-y-4">
            <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-glass space-y-4">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2 font-heading">
                <Clock className="w-4 h-4 text-primary" />
                Active Leaves for Selected Doctor
              </h3>

              <div className="space-y-2">
                {doctorLeaves.map((l, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-surface-container border border-white/5 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block font-heading">{l.leaveDate}</span>
                      <span className="text-on-surface-variant">{l.reason || 'Approved Leave'}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveLeave(l.leaveDate)}
                      className="text-error hover:text-white p-1.5 rounded-lg hover:bg-error-container/30 transition-colors"
                      title="Remove leave"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {doctorLeaves.length === 0 && (
                  <div className="text-center py-10 text-on-surface-variant/60 text-xs">
                    No registered leaves found for this doctor.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NOTIFICATION LOGS & AUDIT TRAIL */}
      {activeTab === 'NOTIFICATIONS' && (
        <div className="glass-panel rounded-2xl p-6 border border-white/10 shadow-glass space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-white text-base font-heading">Outbound Notification Logs & Retry Queue</h3>
              <p className="text-xs text-on-surface-variant mt-1">Audit log of all booking confirmations, doctor leave cancellations, and medication reminders.</p>
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="text-xs font-bold text-primary bg-primary-container/20 hover:bg-primary-container hover:text-white border border-primary/30 px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 font-heading"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Queue</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container text-on-surface-variant font-bold uppercase tracking-wider border-y border-white/10 font-heading">
                <tr>
                  <th className="p-3.5">Recipient</th>
                  <th className="p-3.5">Notification Type</th>
                  <th className="p-3.5">Subject / Preview</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Retries</th>
                  <th className="p-3.5">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {notificationLogs.map(log => (
                  <tr key={log.id} className="hover:bg-surface-container/60 transition-colors">
                    <td className="p-3.5 font-semibold text-white">
                      {log.recipientName || 'Patient'}
                      <span className="block text-[11px] text-on-surface-variant font-normal">{log.recipientEmail}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 font-bold rounded-md bg-surface-container-high text-on-surface text-[10px] border border-white/5">
                        {log.type}
                      </span>
                    </td>
                    <td className="p-3.5 text-on-surface-variant max-w-xs truncate">
                      <span className="font-medium block text-white">{log.subject}</span>
                      <span className="text-[11px] text-on-surface-variant">{log.bodyPreview}</span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 font-extrabold rounded-full text-[10px] font-heading ${
                          log.status === 'SENT'
                            ? 'bg-tertiary-container/20 text-tertiary border border-tertiary/30'
                            : log.status === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                            : 'bg-error-container/20 text-error border border-error/30'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-on-surface-variant font-mono font-bold">
                      {log.retryCount}/3
                    </td>
                    <td className="p-3.5 text-on-surface-variant text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}

                {notificationLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-on-surface-variant/60 text-xs">
                      No notification logs recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

