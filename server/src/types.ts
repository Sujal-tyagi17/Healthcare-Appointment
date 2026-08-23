import { Request } from 'express';

export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export interface AuthUserPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: AuthUserPayload;
}

export interface PrescriptionItem {
  medicineName: string;
  dosage: string;
  frequency: string; // e.g. "Once daily", "Twice daily", "Three times daily", "Every 8 hours"
  durationDays: number;
  instructions: string; // e.g. "Take after meals"
  reminderTimes?: string[]; // e.g. ["09:00", "21:00"]
}

export interface PreVisitAnalysisResult {
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  chiefComplaint: string;
  suggestedQuestions: string[];
  rawResponse?: string;
}

export interface PostVisitTranslationResult {
  patientFriendlySummary: string;
  followUpSteps: string;
  medicationSchedule: string;
  rawResponse?: string;
}
