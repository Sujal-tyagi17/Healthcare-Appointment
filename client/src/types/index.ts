export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  doctorProfile?: DoctorProfile;
}

export interface DoctorProfile {
  id: string;
  specialization: string;
  bio?: string;
  slotDurationMinutes: number;
  workingHoursStart: string;
  workingHoursEnd: string;
  consultationFee: number;
  roomNumber?: string;
}

export interface DoctorListItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialization: string;
  bio?: string;
  slotDurationMinutes: number;
  workingHoursStart: string;
  workingHoursEnd: string;
  consultationFee: number;
  roomNumber?: string;
  leaves?: string[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isHeld: boolean;
  isPast?: boolean;
  status: 'AVAILABLE' | 'HELD' | 'BOOKED' | 'PAST';
}

export interface PreVisitSummary {
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  chiefComplaint: string;
  suggestedQuestions: string[];
}

export interface PrescriptionItem {
  medicineName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructions: string;
  reminderTimes?: string[];
}

export interface PostVisitSummary {
  clinicalNotes: string;
  prescription: PrescriptionItem[];
  patientFriendlySummary: string;
  followUpSteps: string;
}

export interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'BOOKED' | 'CANCELLED' | 'COMPLETED' | 'REQUIRES_RESCHEDULE';
  symptoms: string;
  cancelReason?: string;
  patient?: { id: string; name: string; email: string; phone?: string };
  doctor?: {
    id: string;
    name: string;
    specialization?: string;
    roomNumber?: string;
    consultationFee?: number;
  };
  preVisitSummary?: PreVisitSummary | null;
  postVisitSummary?: PostVisitSummary | null;
  medicationRemindersCount?: number;
}

export interface MedicationReminderItem {
  id: string;
  appointmentId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  reminderTimes: string[];
  instructions?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  lastSentAt?: string;
  doctorName?: string;
  specialization?: string;
}

export interface NotificationLogItem {
  id: string;
  recipientEmail: string;
  recipientName?: string;
  type: string;
  subject: string;
  bodyPreview?: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  retryCount: number;
  lastError?: string;
  createdAt: string;
}
