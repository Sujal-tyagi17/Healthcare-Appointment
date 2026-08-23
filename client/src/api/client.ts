import {
  User,
  DoctorListItem,
  TimeSlot,
  Appointment,
  MedicationReminderItem,
  PrescriptionItem
} from '../types';

const API_BASE = '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('carepulse_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.message || (data.errors ? JSON.stringify(data.errors) : `Request failed with status ${res.status}`);
    throw new Error(errorMsg);
  }
  return data;
}

export const api = {
  // Auth
  async login(email: string, password: string):Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  async register(data: { name: string; email: string; password: string; role?: string; phone?: string }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Doctors & Availability
  async getDoctors(search?: string, specialization?: string): Promise<{ doctors: DoctorListItem[] }> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (specialization) params.append('specialization', specialization);
    const res = await fetch(`${API_BASE}/doctors?${params.toString()}`);
    return handleResponse(res);
  },

  async getSpecializations(): Promise<{ specializations: string[] }> {
    const res = await fetch(`${API_BASE}/doctors/specializations`);
    return handleResponse(res);
  },

  async getDoctorAvailability(doctorId: string, date: string): Promise<{
    isOnLeave: boolean;
    leaveReason?: string;
    slots: TimeSlot[];
    doctor: any;
  }> {
    const res = await fetch(`${API_BASE}/doctors/${doctorId}/availability?date=${date}`);
    return handleResponse(res);
  },

  // Appointments
  async holdSlot(doctorId: string, date: string, startTime: string, endTime: string): Promise<{ holdToken: string; expiresAt: string }> {
    const res = await fetch(`${API_BASE}/appointments/hold`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ doctorId, date, startTime, endTime })
    });
    return handleResponse(res);
  },

  async releaseHold(holdToken: string): Promise<void> {
    await fetch(`${API_BASE}/appointments/hold/${holdToken}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  },

  async bookAppointment(data: {
    doctorId: string;
    date: string;
    startTime: string;
    endTime: string;
    symptoms: string;
    holdToken?: string;
  }): Promise<{ appointment: Appointment }> {
    const res = await fetch(`${API_BASE}/appointments/book`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getAppointments(status?: string, date?: string): Promise<{ appointments: Appointment[] }> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (date) params.append('date', date);
    const res = await fetch(`${API_BASE}/appointments?${params.toString()}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async cancelAppointment(id: string, reason?: string): Promise<void> {
    const res = await fetch(`${API_BASE}/appointments/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({ reason })
    });
    return handleResponse(res);
  },

  // Consultations & Post-Visit
  async submitPostVisit(appointmentId: string, data: { clinicalNotes: string; prescriptions: PrescriptionItem[] }): Promise<any> {
    const res = await fetch(`${API_BASE}/consultations/${appointmentId}/post-visit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getMedicationReminders(): Promise<{ medications: MedicationReminderItem[] }> {
    const res = await fetch(`${API_BASE}/consultations/medications`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async toggleMedicationReminder(id: string): Promise<{ isActive: boolean }> {
    const res = await fetch(`${API_BASE}/consultations/medications/${id}/toggle`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Admin
  async getAdminAnalytics(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/analytics`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createDoctor(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/doctors`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateDoctor(id: string, data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/doctors/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async markDoctorOnLeave(doctorId: string, leaveDate: string, reason?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/doctors/${doctorId}/leave`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ leaveDate, reason })
    });
    return handleResponse(res);
  },

  async getDoctorLeaves(doctorId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/doctors/${doctorId}/leaves`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async removeDoctorLeave(doctorId: string, leaveDate: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/doctors/${doctorId}/leaves/${leaveDate}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Notifications Log
  async getNotificationLogs(): Promise<any> {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};
