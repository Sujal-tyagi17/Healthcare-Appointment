# 🏥 CarePulse — AI-Powered Healthcare Appointment & Clinical Intelligence Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

A full-stack healthcare appointment management platform engineered with modern dark-mode clinical glassmorphism, animated WebGL GLSL fluid noise shaders, real-time AI symptom triage, post-visit clinical translations, dual calendar synchronization, and automated cron-driven medication reminder dispatchers.

---

## 🖥️ Application Preview

### Patient Portal
![Patient Dashboard](docs/screenshots/patient-dashboard.png)

### Doctor Clinical Station
![Doctor Dashboard](docs/screenshots/doctor-dashboard.png)

### Clinic Administration
![Admin Dashboard](docs/screenshots/admin-dashboard.png)

## 🌐 Live Demo

**Live Application:** [CarePulse](https://carepulse-healthcare.vercel.app)

---

## 📑 Table of Contents
1. [Tech Stack Breakdown](#-tech-stack-breakdown)
2. [Core System Capabilities](#-core-system-capabilities)
3. [Key Architectural Highlights](#-key-architectural-highlights)
4. [Pre-Seeded Testing Credentials](#-pre-seeded-testing-credentials)
5. [Directory Structure](#-directory-structure)
6. [Getting Started & Local Setup](#-getting-started--local-setup)
7. [Environment Variables](#-environment-variables)
8. [API Endpoint Reference](#-api-endpoint-reference)
9. [Production Deployment Guide](#-production-deployment-guide)

---

## 🛠️ Tech Stack Breakdown

### Frontend
- **Framework**: React 18 with Vite build tool.
- **Language**: TypeScript (Strict Mode).
- **Styling**: Tailwind CSS with custom glassmorphism design tokens (`backdrop-blur`, neon cyan/violet glow utilities).
- **Interactive Background**: Custom WebGL canvas and precision clinical ECG pulse flow (`CarePulseBackground.tsx`).
- **Iconography**: Google Material Symbols Outlined & Lucide React.
- **State Management**: React Context API (`AuthContext`) with persistent JWT local authentication.

### Backend & Database
- **Runtime**: Node.js (v18+) with Express.js REST API.
- **Language**: TypeScript (compiled with `tsc`).
- **ORM & Database**: Prisma ORM with SQLite (portable zero-config) and native PostgreSQL support.
- **Security & Validation**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs` password hashing, and `Zod` request body validation.

### Artificial Intelligence & Clinical Intelligence
- **Primary Engines**: Google Gemini API (`@google/genai`) & OpenAI API (`gpt-4o-mini`).
- **Intelligent Heuristic Fallback Engine**: Deterministic clinical rule-based fallback that maintains core triage functionality during AI API rate limits or temporary network failures.

### Background Automation & Communications
- **Cron Jobs**: `node-cron` scheduled workers:
  - Expired slot hold eviction (runs every 60 seconds).
  - Medication reminder alerts (runs every 60 seconds).
  - Conflict resolution worker for doctor leaves.
- **Email Dispatcher**: Nodemailer with rich HTML responsive clinical templates and exponential backoff retry logging.
- **Calendar Integration**: Google Calendar API (OAuth2) + native RFC-5545 iCalendar (`.ics`) file generation.

---

## 🌟 Core System Capabilities

### 1. 👤 Patient Portal
- **Specialist Matrix**: Discover Indian specialists across Cardiology, Dermatology, Neurology, General Medicine, and Pediatrics with consultation fees in INR (`₹`).
- **Instant Slot Booking**: 1-click slot selection with real-time 10-minute temporary lock hold (`slotHold` TTL) and real-time IST elapsed slot protection to prevent double booking.
- **AI Symptom Triage**: Pre-visit questionnaire assessing urgency (`LOW`, `MEDIUM`, `HIGH`) and suggesting diagnostic questions for the physician.
- **Active Consultation Schedule**: Real-time view of upcoming visits with 1-click `.ICS` calendar downloads.
- **Medication Reminders**: Daily prescription schedules with meal instructions and toggleable automated alerts.
- **AI Clinical Insights Hub**: Interactive live symptom checker and platform telemetry modal.

### 2. 🩺 Doctor Clinical Station
- **Live Patient Queue**: Sorted chronological view of daily appointments with patient status pills.
- **AI Pre-Visit Brief**: Patient chief complaint summaries, urgency triage badges, and AI-formulated diagnostic inquiries.
- **Post-Visit Consultation Builder**: Multi-drug prescription builder with dosage, frequencies (e.g. *Twice daily*, *Once daily*), and meal instructions.
- **AI Care Plan Translation**: 1-click translation of complex medical jargon into clear, patient-friendly instructions with automatic reminder alarm creation.

### 3. 👑 Clinic Administration Portal
- **4 Real-Time KPI Cards**: Active doctors, total scheduled visits, patient registrations, and email delivery success rate.
- **Specialist Roster Manager**: Configure doctor consultation fees, room assignments, slot durations (10–120 min), and working hours.
- **Doctor Leave & Conflict Resolution**: Mark doctor leaves, identify conflicting bookings, transition affected appointments to `REQUIRES_RESCHEDULE`, and dispatch rescheduling emails.
- **Outbound Notification Audit Log**: Complete audit trail of all transactional emails sent by the platform.

---

## 🔑 Pre-Seeded Testing Credentials

All credentials below are pre-seeded in the database and ready for immediate testing:

### 👑 Clinic Administration
| Role | Name | Email | Password | Access Level |
|---|---|---|---|---|
| **Admin** | Clinic Administrator | `admin@carepulse.com` | `admin123` | Full clinic management & analytics |

### 🩺 Specialists & Doctor Clinical Station
| Specialist | Field | Email | Password | Fee | Room / Wing |
|---|---|---|---|---|---|
| **Dr. Rajesh Sharma** | **Cardiology** | `dr.rajesh@carepulse.com` | `doctor123` | ₹1,200 | Suite 201 (Cardiology Wing) |
| **Dr. Ananya Iyer** | **Dermatology** | `dr.ananya@carepulse.com` | `doctor123` | ₹800 | Suite 105 (Skin & Cosmetology) |
| **Dr. Vikram Malhotra** | **Neurology** | `dr.vikram@carepulse.com` | `doctor123` | ₹1,500 | Suite 310 (Neurosciences) |
| **Dr. Amit Verma** | **General Medicine** | `dr.amit@carepulse.com` | `doctor123` | ₹500 | Room 102 (OPD Practice) |
| **Dr. Priya Patel** | **Pediatrics** | `dr.priya@carepulse.com` | `doctor123` | ₹700 | Suite 108 (Child Health Wing) |

### 👤 Patient Accounts
| Patient Name | Email | Password | Pre-Seeded History |
|---|---|---|---|
| **Rahul Sharma** | `rahul@example.com` | `password123` | 1 Completed Cardiology Visit + Active Beta-Blocker Medication Alerts |
| **Pooja Verma** | `pooja@example.com` | `password123` | 1 Active Dermatology Consultation in Queue with AI Triage |
| **John Doe** | `john@example.com` | `password123` | Clean Account ready for new test bookings |

---

## 📁 Directory Structure

```
Healthcare/
├── client/                           # React + Vite Frontend
│   ├── src/
│   │   ├── api/                      # Typed REST API Client
│   │   │   └── client.ts
│   │   ├── components/               # Reusable UI & Modal Components
│   │   │   ├── AIInsightsModal.tsx   # Interactive AI Triage & Telemetry Modal
│   │   │   ├── CarePulseBackground.tsx # Clinical ECG Pulse & Dynamic Precision Grid
│   │   │   ├── FluidShaderCanvas.tsx # Background Component Wrapper
│   │   │   ├── PrescriptionModal.tsx # Clinical Consultation & Rx Builder
│   │   │   ├── Sidebar.tsx           # Dark-Themed Side Navigation
│   │   │   ├── SymptomModal.tsx      # Pre-Visit Questionnaire & Hold Timer
│   │   │   └── TopAppBar.tsx         # Universal Header with Search, Bell & AI Trigger
│   │   ├── context/                  # Authentication Context
│   │   │   └── AuthContext.tsx
│   │   ├── pages/                    # Role-Specific Dashboard Pages
│   │   │   ├── AdminDashboard.tsx    # Admin Roster & Leave Manager
│   │   │   ├── AuthPage.tsx          # Split-Screen Login & Registration
│   │   │   ├── DoctorDashboard.tsx   # Doctor Clinical Station & Pre-Visit Brief
│   │   │   └── PatientDashboard.tsx  # Patient Specialist Matrix & Slot Picker
│   │   ├── types/                    # Shared TypeScript Interfaces
│   │   ├── App.tsx                   # Main Router & Authentication Gate
│   │   ├── index.css                 # Design Tokens & Utility Classes
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── server/                           # Express.js REST API Backend
│   ├── prisma/
│   │   └── schema.prisma             # Database Schema (Users, Appointments, Leaves, etc.)
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts    # JWT Authentication & RBAC Guard
│   │   ├── routes/                   # Modular REST API Routes
│   │   │   ├── admin.routes.ts       # Analytics & Leave Management
│   │   │   ├── appointment.routes.ts # Slot Holds, Bookings, Calendar & Triage
│   │   │   ├── auth.routes.ts        # Register, Login & Profile Retrieval
│   │   │   ├── consultation.routes.ts# Post-Visit Care Plans & Med Reminders
│   │   │   ├── doctor.routes.ts      # Doctor List & Live Availability Engine
│   │   │   └── notification.routes.ts# Email Dispatch Logs & Audit Trail
│   │   ├── services/                 # Background & External Integration Services
│   │   │   ├── calendar.service.ts   # Google Calendar & .ICS Generator
│   │   │   ├── email.service.ts      # Nodemailer HTML Templates & Delivery
│   │   │   ├── llm.service.ts        # Gemini/OpenAI API + Resilient Rule Fallback
│   │   │   └── scheduler.service.ts  # Node-Cron Hold Eviction & Medication Alarms
│   │   ├── db.ts                     # Prisma Client Singleton
│   │   ├── index.ts                  # Server Entry Point & Route Mounting
│   │   ├── seed.ts                   # Pre-Seeded Database Initializer
│   │   └── types.ts
│   ├── package.json
│   └── tsconfig.json
├── SYSTEM_DESIGN.md                  # Comprehensive Architectural Design Doc
├── .env.example                      # Documented Configuration Template
├── package.json                      # Root Workspace Scripts
└── README.md                         # Project Documentation
```

---

## 🚀 Getting Started & Local Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Installation
Clone the repository and install all dependencies:
```bash
git clone https://github.com/Sujal-tyagi17/Healthcare-Appointment.git
cd Healthcare-Appointment
npm run install:all
```

### 3. Configure Environment Variables
Copy `.env.example` to `server/.env`:
```bash
# Windows PowerShell:
copy .env.example server\.env

# Linux / macOS:
cp .env.example server/.env
```

### 4. Initialize & Seed Database
```bash
npm run seed
```

### 5. Launch Development Server
```bash
npm run dev
```
- **Patient & Doctor Web UI**: [http://localhost:5173](http://localhost:5173)
- **Backend REST API**: [http://localhost:5000/api](http://localhost:5000/api)

---

## ⚙️ Environment Variables

| Variable | Description | Default / Example | Required |
|---|---|---|---|
| `PORT` | Backend HTTP Port | `5000` | No |
| `NODE_ENV` | Environment Mode | `development` / `production` | No |
| `DATABASE_URL` | Database Connection String | `file:./dev.db` | Yes |
| `JWT_SECRET` | Secret Key for JWT Tokens | `your-secure-jwt-secret` | Yes |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` | Yes |
| `GEMINI_API_KEY` | Google Gemini API Key | `your-gemini-api-key` | Optional (Fallback Active) |
| `OPENAI_API_KEY` | OpenAI API Key | `your-openai-api-key` | Optional (Fallback Active) |
| `SMTP_HOST` | SMTP Email Server Host | `smtp.gmail.com` | Optional |
| `SMTP_PORT` | SMTP Email Server Port | `587` | Optional |
| `SMTP_USER` | SMTP Email Username | `your-email@gmail.com` | Optional |
| `SMTP_PASS` | SMTP App Password | `your-app-password` | Optional |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `your-client-id.apps.googleusercontent.com` | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `your-client-secret` | Optional |
| `GOOGLE_REFRESH_TOKEN` | Google OAuth Refresh Token | `your-refresh-token` | Optional |

---

## 📡 API Endpoint Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new patient or doctor account.
- `POST /api/auth/login` — Authenticate and receive JWT token.
- `GET /api/auth/me` — Retrieve active authenticated user profile.

### Doctors & Availability (`/api/doctors`)
- `GET /api/doctors` — List all specialists with optional search & specialty filters.
- `GET /api/doctors/:id/availability?date=YYYY-MM-DD` — Compute real-time slots and leave status with IST elapsed slot locking.

### Appointments (`/api/appointments`)
- `POST /api/appointments/hold` — Acquire a 10-minute temporary reservation lock.
- `DELETE /api/appointments/hold/:token` — Release a temporary slot lock.
- `POST /api/appointments/book` — Confirm booking with AI symptom triage and calendar sync.
- `GET /api/appointments` — Fetch patient or doctor appointments.
- `DELETE /api/appointments/:id` — Cancel an appointment with cancellation notice email.
- `GET /api/appointments/:id/ics` — Download RFC-5545 universal `.ICS` calendar file.
- `POST /api/appointments/analyze-symptoms` — Real-time AI symptom evaluation endpoint.

### Consultations (`/api/consultations`)
- `POST /api/consultations/:id/post-visit` — Save clinical diagnosis, AI care plan, and prescriptions.
- `GET /api/consultations/medications` — Retrieve active patient medication reminder schedules.
- `PATCH /api/consultations/medications/:id/toggle` — Enable or disable daily medication alerts.

### Administration (`/api/admin`)
- `GET /api/admin/analytics` — Platform KPIs (Doctors, Appointments, Patients, Email Deliveries).
- `POST /api/admin/doctors/:id/leave` — Register doctor leave, transition conflicting bookings to `REQUIRES_RESCHEDULE`, and dispatch priority rescheduling links.
- `GET /api/admin/doctors/:id/leaves` — List all active leave dates for a specialist.
- `DELETE /api/admin/doctors/:id/leaves/:date` — Remove an approved doctor leave.
- `GET /api/notifications` — View outbound email dispatch audit logs.

---

## 🌐 Production Deployment Guide

### Option 1: Monorepo Deployment (Render / Railway)
1. Link your GitHub repository.
2. Set the **Build Command**:
   ```bash
   npm run install:all && npm run build && npm run seed
   ```
3. Set the **Start Command**:
   ```bash
   npm start
   ```
4. Add your **Environment Variables** in the platform dashboard. The Express backend will serve both the REST API and the bundled React frontend from `/client/dist`.

### Option 2: Split Deployment (Vercel + Railway/Render)
1. **Frontend (Vercel)**:
   - Root Directory: `client`
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variable: `VITE_API_URL=https://your-backend-api.up.railway.app/api`
2. **Backend (Railway / Render)**:
   - Root Directory: `server`
   - Build Command: `npm install && npm run build && npx prisma db push && npm run seed`
   - Start Command: `node dist/index.js`
   - Environment Variable: `CLIENT_URL=https://your-frontend.vercel.app`

---

## 📜 License
Distributed under the **MIT License**. Created with precision for modern clinical operations.
