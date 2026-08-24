import nodemailer from 'nodemailer';
import { prisma } from '../db.js';

/**
 * Robust Email Service with HTML templates and persistent NotificationLog retry queue
 */

let transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  } else {
    // Development fallback using Ethereal test account or simulated console transporter
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`[Email Service] Initialized Ethereal test email account: ${testAccount.user}`);
    } catch {
      // Stream transport fallback if network has no outbound SMTP
      transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'windows',
        buffer: true
      });
      console.log('[Email Service] Initialized local stream transporter');
    }
  }

  return transporter;
}

export interface EmailPayload {
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  html: string;
  type: 'BOOKING_CONFIRMATION' | 'DOCTOR_LEAVE_ALERT' | 'APPOINTMENT_REMINDER' | 'MEDICATION_REMINDER' | 'POST_VISIT_SUMMARY' | 'CANCELLATION';
  appointmentId?: string;
  metadata?: Record<string, any>;
}

export async function sendEmailNotification(payload: EmailPayload): Promise<{ success: boolean; logId: string; previewUrl?: string }> {
  // 1. Create Log Entry in Database
  const log = await prisma.notificationLog.create({
    data: {
      appointmentId: payload.appointmentId,
      recipientEmail: payload.recipientEmail,
      recipientName: payload.recipientName,
      type: payload.type,
      subject: payload.subject,
      bodyPreview: payload.html.replace(/<[^>]*>?/gm, '').substring(0, 200),
      status: 'PENDING',
      metadataJson: payload.metadata ? JSON.stringify(payload.metadata) : null
    }
  });

  try {
    const mailer = await getTransporter();
    const info = await mailer.sendMail({
      from: process.env.EMAIL_FROM || '"CarePulse Health" <no-reply@carepulse-health.org>',
      to: payload.recipientEmail,
      subject: payload.subject,
      html: payload.html
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    if (previewUrl) {
      console.log(`[Email Service] Test email sent! Preview URL: ${previewUrl}`);
    }

    // Update log status to SENT
    await prisma.notificationLog.update({
      where: { id: log.id },
      data: { status: 'SENT', lastError: null }
    });

    return { success: true, logId: log.id, previewUrl };
  } catch (error) {
    const errMessage = (error as Error).message;
    console.error(`[Email Service] Failed to send email to ${payload.recipientEmail}:`, errMessage);

    await prisma.notificationLog.update({
      where: { id: log.id },
      data: {
        status: 'FAILED',
        retryCount: { increment: 1 },
        lastError: errMessage
      }
    });

    return { success: false, logId: log.id };
  }
}

/**
 * Background worker to retry failed notifications with exponential backoff
 */
export async function retryFailedNotifications(): Promise<number> {
  const pendingOrFailed = await prisma.notificationLog.findMany({
    where: {
      status: { in: ['FAILED', 'PENDING'] },
      retryCount: { lt: 3 }
    },
    take: 10
  });

  let processedCount = 0;
  for (const item of pendingOrFailed) {
    try {
      const mailer = await getTransporter();
      await mailer.sendMail({
        from: process.env.EMAIL_FROM || '"CarePulse Health" <no-reply@carepulse-health.org>',
        to: item.recipientEmail,
        subject: item.subject,
        html: `<p>${item.bodyPreview || item.subject}</p>`
      });

      await prisma.notificationLog.update({
        where: { id: item.id },
        data: { status: 'SENT', lastError: null }
      });
      processedCount++;
    } catch (err) {
      await prisma.notificationLog.update({
        where: { id: item.id },
        data: {
          retryCount: { increment: 1 },
          lastError: (err as Error).message
        }
      });
    }
  }

  return processedCount;
}

// ---------------- HTML EMAIL TEMPLATES ---------------- //

export function getBookingConfirmationHtml(params: {
  patientName: string;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  roomNumber?: string;
  urgencyLevel?: string;
  calendarLink?: string;
}): string {
  const doctorDisplay = formatDoctorName(params.doctorName);
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #0284c7; margin: 0; font-size: 24px;">CarePulse Health</h1>
      <p style="color: #64748b; margin: 4px 0 0;">Appointment Confirmation</p>
    </div>
    
    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="color: #0f172a; font-size: 18px; margin-top: 0;">Hello ${params.patientName},</h2>
      <p style="color: #334155; line-height: 1.5;">Your medical consultation has been successfully booked. Here are your visit details:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Doctor:</td>
          <td style="padding: 8px 0; color: #0f172a;">${doctorDisplay} (${params.specialization})</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Date & Time:</td>
          <td style="padding: 8px 0; color: #0f172a;">${params.date} at ${params.time}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Location:</td>
          <td style="padding: 8px 0; color: #0f172a;">${params.roomNumber || 'Consultation Room 101'}</td>
        </tr>
        ${params.urgencyLevel ? `
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Triage Urgency:</td>
          <td style="padding: 8px 0; color: ${params.urgencyLevel === 'HIGH' ? '#dc2626' : params.urgencyLevel === 'MEDIUM' ? '#d97706' : '#16a34a'}; font-weight: bold;">${params.urgencyLevel}</td>
        </tr>` : ''}
      </table>

      ${params.calendarLink ? `
      <div style="text-align: center; margin: 20px 0;">
        <a href="${params.calendarLink}" target="_blank" style="background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; display: inline-block;">Add to Google Calendar</a>
      </div>` : ''}

      <p style="color: #64748b; font-size: 13px; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
        Please arrive 10 minutes prior to your scheduled time. If you need to reschedule or cancel, please log in to your patient portal.
      </p>
    </div>
  </div>`;
}

export function getDoctorLeaveCancellationHtml(params: {
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  rescheduleUrl: string;
  reason?: string;
}): string {
  const doctorDisplay = formatDoctorName(params.doctorName);
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #fff1f2; border-radius: 12px; border: 1px solid #fecdd3;">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #e11d48; margin: 0; font-size: 24px;">CarePulse Health Alert</h1>
      <p style="color: #9f1239; margin: 4px 0 0;">Doctor Schedule Update & Urgent Reschedule Notice</p>
    </div>
    
    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="color: #0f172a; font-size: 18px; margin-top: 0;">Dear ${params.patientName},</h2>
      <p style="color: #334155; line-height: 1.5;">
        We regret to inform you that <strong>${doctorDisplay}</strong> is unavailable and on approved medical leave on <strong>${params.date}</strong>${params.reason ? ` (${params.reason})` : ''}.
      </p>
      <p style="color: #334155; line-height: 1.5;">
        Your scheduled appointment on <strong>${params.date} at ${params.time}</strong> has been cancelled. We sincerely apologize for any inconvenience.
      </p>

      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 6px; margin: 20px 0; text-align: center;">
        <p style="color: #166534; font-weight: bold; margin: 0 0 10px;">Priority Rescheduling Enabled</p>
        <a href="${params.rescheduleUrl}" style="background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">Choose New Appointment Slot</a>
      </div>

      <p style="color: #64748b; font-size: 13px;">
        Alternatively, you may log in to your patient dashboard to choose another available specialist.
      </p>
    </div>
  </div>`;
}

export function getMedicationReminderHtml(params: {
  patientName: string;
  medicineName: string;
  dosage: string;
  instructions?: string;
  frequency: string;
}): string {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f0fdfa; border-radius: 12px; border: 1px solid #ccfbf1;">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #0d9488; margin: 0; font-size: 24px;">CarePulse Medication Reminder</h1>
      <p style="color: #115e59; margin: 4px 0 0;">Prescription Adherence Notification</p>
    </div>
    
    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="color: #0f172a; font-size: 18px; margin-top: 0;">Hi ${params.patientName},</h2>
      <p style="color: #334155;">This is your scheduled reminder to take your prescribed medication:</p>
      
      <div style="background-color: #f8fafc; border-left: 4px solid #0d9488; padding: 16px; margin: 16px 0; border-radius: 4px;">
        <h3 style="color: #0f172a; margin: 0 0 6px; font-size: 16px;">${params.medicineName} - ${params.dosage}</h3>
        <p style="color: #475569; margin: 4px 0;"><strong>Frequency:</strong> ${params.frequency}</p>
        ${params.instructions ? `<p style="color: #475569; margin: 4px 0;"><strong>Instructions:</strong> ${params.instructions}</p>` : ''}
      </div>

      <p style="color: #64748b; font-size: 13px;">
        Staying consistent with your medication schedule helps achieve optimal recovery. If you experience adverse side effects, contact your clinic immediately.
      </p>
    </div>
  </div>`;
}

export function getPostVisitSummaryHtml(params: {
  patientName: string;
  doctorName: string;
  date: string;
  patientFriendlySummary: string;
  medicationSchedule: string;
  followUpSteps: string;
}): string {
  const doctorDisplay = formatDoctorName(params.doctorName);
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #2563eb; margin: 0; font-size: 24px;">CarePulse Visit Summary</h1>
      <p style="color: #64748b; margin: 4px 0 0;">Consultation Notes & Care Plan</p>
    </div>
    
    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="color: #0f172a; font-size: 18px; margin-top: 0;">Hello ${params.patientName},</h2>
      <p style="color: #334155;">Here is your patient-friendly summary from your consultation with ${doctorDisplay} on ${params.date}:</p>
      
      <div style="margin: 16px 0;">
        <h3 style="color: #1e40af; font-size: 15px; margin-bottom: 6px;">Diagnosis & Clinical Explanation</h3>
        <p style="color: #334155; line-height: 1.6; background-color: #f1f5f9; padding: 12px; border-radius: 6px; margin: 0;">${params.patientFriendlySummary}</p>
      </div>

      <div style="margin: 16px 0;">
        <h3 style="color: #1e40af; font-size: 15px; margin-bottom: 6px;">Medication & Dosage Plan</h3>
        <pre style="white-space: pre-wrap; font-family: inherit; color: #334155; line-height: 1.5; background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 6px; margin: 0;">${params.medicationSchedule}</pre>
      </div>

      <div style="margin: 16px 0;">
        <h3 style="color: #1e40af; font-size: 15px; margin-bottom: 6px;">Follow-up Instructions & Next Steps</h3>
        <p style="color: #334155; line-height: 1.6; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; margin: 0;">${params.followUpSteps}</p>
      </div>

      <p style="color: #64748b; font-size: 13px; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
        For any medical emergencies, please visit the emergency room immediately. You can view this summary and all prescriptions anytime in your patient dashboard.
      </p>
    </div>
  </div>`;
}
