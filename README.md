# CarePulse — Healthcare Appointment & Follow-Up Manager

A full-stack, enterprise-ready healthcare appointment platform featuring dedicated portals for **Patients**, **Doctors**, and **Clinic Administrators**. Powered by AI for pre-visit symptom triage, post-visit clinical translations, conflict-free scheduling, automated medication reminders, and dual calendar synchronization.

---

## 🌟 Key Features

### 1. Patient Portal
- **Specialist Discovery**: Search doctors by name or filter dynamically by medical specialty (Cardiology, Dermatology, Neurology, General Medicine, Pediatrics).
- **Conflict-Free Booking & Slot Hold**: Select available slots with a 10-minute temporary lock (`TTL`) ensuring no double-bookings occur while typing symptoms.
- **AI Pre-Visit Symptom Questionnaire**: Submit symptoms and receive an immediate AI clinical triage assessment with urgency levels (`LOW`, `MEDIUM`, `HIGH`) and doctor inquiry previews.
- **Dual Calendar Sync**: 1-click **Add to Google Calendar** direct link and universal **`.ICS` file download** for Apple Calendar and Outlook.
- **Medical History & Post-Visit Summaries**: Review doctor clinical diagnoses translated into patient-friendly explanations.
- **Medication Reminders**: View daily dosage times, meal instructions, and toggle alerts.

### 2. Doctor Clinical Station
- **Today's Queue & Daily Agenda**: Real-time view of booked and in-progress patient visits.
- **AI Clinical Pre-Visit Summary**:
  - Triage Urgency Badge (`LOW`, `MEDIUM`, `HIGH`).
  - Chief complaint extraction.
  - 3 AI-suggested diagnostic questions tailored to the reported symptoms.
- **Consultation & Prescription Builder**: Enter clinical findings and add multi-drug prescriptions with customizable frequencies (Once daily, Twice daily, Every 8 hours, etc.).
- **1-Click AI Translation**: Automatically translates clinical notes into patient-friendly instructions and generates scheduled medication reminder jobs.

### 3. Clinic Administrator Portal
- **Doctor Profile Management**: Create and configure doctor specialties, consultation fees, room assignments, slot duration (10–120 mins), and working hours.
- **Doctor Leave & Automated Conflict Resolution**: Mark a doctor on leave for any date. The system automatically:
  1. Identifies all conflicting bookings on that date.
  2. Updates their status to `REQUIRES_RESCHEDULE`.
  3. Dispatches urgent apology emails to all affected patients with direct priority reschedule links.
- **Platform Analytics**: Live stats on active specialists, booked visits, patient growth, and email delivery rates.
- **Notification Logs & Retry Queue**: Audit trail for all emails with delivery status and automated retry capability.

---

## 🛠️ Architecture & Tech Stack

```
Healthcare-Platform/
├── client/                     # Frontend (React 18, Vite, Tailwind CSS, Lucide Icons)
│   ├── src/
│   │   ├── api/                # API client with auth & error handling
│   │   ├── components/         # Navbar, DemoBanner, SymptomModal, PrescriptionModal
│   │   ├── context/            # AuthContext with 1-click demo switcher
│   │   ├── pages/              # PatientDashboard, DoctorDashboard, AdminDashboard, AuthPage
│   │   └── types/              # Unified TypeScript definitions
│   └── tailwind.config.js
├── server/                     # Backend API & Background Jobs (Node.js, Express, TypeScript)
│   ├── prisma/                 # Prisma ORM Schema & SQLite / PostgreSQL driver
│   ├── src/
│   │   ├── middleware/         # JWT Auth and Role-Based Access Control (RBAC)
│   │   ├── routes/             # Auth, Doctor, Appointment, Consultation, Admin, Notification
│   │   ├── services/           # LLM Service (Gemini/OpenAI + Fallback), Email, Calendar, Cron Schedulers
│   │   ├── seed.ts             # Pre-seeded demo database
│   │   └── index.ts            # Server entry point
│   └── test/                   # Concurrency and double-booking automated tests
├── SYSTEM_DESIGN.md            # System design write-up (Concurrency, Holds, Leaves, Notifications)
├── .env.example                # Documented configuration template
└── package.json                # Root orchestration scripts
```

- **Backend**: Node.js, Express, TypeScript, Prisma ORM, SQLite (zero-config, portable).
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Glassmorphism design tokens.
- **AI / LLM Service**: Google Gemini & OpenAI API integration with an **Intelligent Clinical Rule-Based Fallback Engine** that guarantees zero crashes if API keys are unset or rate-limited.
- **Calendar**: Google Calendar API OAuth2 + Direct Web Render Links + RFC-5545 iCalendar (`.ics`).
- **Email Service**: Nodemailer with HTML templates, Ethereal test mailer support, and exponential backoff retry worker.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### 1. Install Dependencies
Run from the root directory:
```bash
npm run install:all
```
*(Or navigate into `server` and `client` and run `npm install` in each).*

### 2. Setup Environment Variables
Copy `.env.example` to `server/.env`:
```bash
# In Windows PowerShell:
copy .env.example server\.env

# In Linux/macOS:
cp .env.example server/.env
```
*(The defaults in `.env.example` work immediately with SQLite and local mailers without requiring any external cloud setup!)*

### 3. Initialize & Seed Database
```bash
npm run seed
```
*(This generates the Prisma client, pushes the SQLite schema, and creates demo doctors, patients, appointments, and admin accounts).*

### 4. Run Locally in Development Mode
```bash
npm run dev
```
- **Frontend UI**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)

---

## 🔑 Pre-Seeded Demo Credentials

The app includes an **Interactive Demo Bar** at the top for 1-click role switching, or you can log in manually:

| Role | Name | Email | Password |
|---|---|---|---|
| **Patient** | John Doe | `john@example.com` | `password123` |
| **Patient** | Alice Smith | `alice@example.com` | `password123` |
| **Doctor** (Cardiology) | Dr. Sarah Jenkins | `dr.sarah@carepulse.com` | `doctor123` |
| **Doctor** (Dermatology) | Dr. Marcus Chen | `dr.marcus@carepulse.com` | `doctor123` |
| **Doctor** (Neurology) | Dr. Emily Rodriguez | `dr.emily@carepulse.com` | `doctor123` |
| **Admin** | Clinic Administrator | `admin@carepulse.com` | `admin123` |

---

## 🧪 Automated Concurrency & Double-Booking Test

To verify that simultaneous requests cannot book the same slot:
```bash
npm run test
```
This test spawns parallel transactional queries attempting to book the exact same slot and asserts that only one succeeds with `201 Created` while the other is rejected with `409 Conflict`.

---

## 🤖 LLM Prompt Engineering & Resilience

### 1. Pre-Visit Triage Prompt
```text
You are an expert clinical triage assistant.
Analyse these symptoms and return a JSON object with:
- urgencyLevel: exactly one of "Low", "Medium", or "High"
- chiefComplaint: a clear, concise 1-sentence summary of the main health concern
- suggestedQuestions: an array of exactly 3 relevant diagnostic questions the doctor should ask the patient

Symptoms: <symptoms>
```

### 2. Post-Visit Clinical Translation Prompt
```text
You are a compassionate healthcare communication specialist.
Convert these clinical notes and prescription details into a patient-friendly summary with clear medication schedules and follow-up steps.

Clinical Notes: <clinicalNotes>
Prescriptions: <prescriptionsJson>
```

### 3. Resilient Fallback Strategy
If OpenAI or Gemini API keys are omitted or third-party APIs encounter 429/500 errors, the backend seamlessly switches to an internal heuristic triage engine analyzing keyword severity, generating structured diagnostic questions, and translating prescriptions without failing the user request.

---

## 📅 Google Calendar API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and enable the **Google Calendar API**.
3. Under **Credentials**, create an **OAuth 2.0 Client ID** (Web application).
4. Add authorized redirect URIs and obtain your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
5. Obtain a `GOOGLE_REFRESH_TOKEN` via OAuth playground or consent flow.
6. Populate the values in `server/.env`:
   ```env
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   GOOGLE_REFRESH_TOKEN="your-refresh-token"
   ```
*Note: If OAuth variables are not provided, the platform automatically generates deep web links and `.ics` files that open natively in Google Calendar on any device.*

---

## 📡 API Reference Overview

| Method | Endpoint | Description | Role |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Login and obtain JWT token | Public |
| `GET` | `/api/auth/me` | Get current user profile | Authenticated |
| `GET` | `/api/doctors` | List doctors with specialty filter | Public |
| `GET` | `/api/doctors/:id/availability?date=YYYY-MM-DD` | Get slots and leave status | Public |
| `POST` | `/api/appointments/hold` | Hold slot with 10-min TTL | Patient |
| `DELETE`| `/api/appointments/hold/:token` | Release temporary slot hold | Patient |
| `POST` | `/api/appointments/book` | Book slot with AI triage & email | Patient |
| `GET` | `/api/appointments` | Get user/doctor appointments | Authenticated |
| `DELETE`| `/api/appointments/:id` | Cancel an appointment | Authenticated |
| `GET` | `/api/appointments/:id/ics` | Download .ICS calendar file | Authenticated |
| `POST` | `/api/consultations/:id/post-visit` | Save notes & AI care plan | Doctor / Admin |
| `GET` | `/api/consultations/medications` | Get medication reminders | Patient |
| `PATCH`| `/api/consultations/medications/:id/toggle` | Toggle medication reminder | Patient |
| `POST` | `/api/admin/doctors/:id/leave` | Register leave & resolve conflicts | Admin |
| `GET` | `/api/admin/analytics` | View system performance metrics | Admin |
| `GET` | `/api/notifications` | View outbound notification logs | Admin |

---

## 🌐 Production Deployment Guide

### Single-Command Production Build:
```bash
npm run build
npm start
```
The Express backend automatically serves the production-bundled React frontend from `/client/dist` on port 5000 (or `process.env.PORT`).

- **Render / Railway**: Connect the repository, specify Build Command: `npm run install:all && npm run build && npm run seed` and Start Command: `npm start`.
- **Vercel**: Deploy the `/client` directory with Vite preset and point `VITE_API_URL` to your backend instance.
