/**
 * Google Calendar & iCal Integration Service
 * Generates direct Google Calendar web links, ICS calendar payloads,
 * and handles OAuth2 Google Calendar API synchronization.
 */

export interface CalendarEventDetails {
  id?: string;
  title: string;
  description: string;
  location: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endDate: string;   // YYYY-MM-DD
  endTime: string;   // HH:MM
  doctorEmail?: string;
  patientEmail?: string;
}

/**
 * Creates a universal Google Calendar web URL that opens directly in user's Google Calendar.
 */
export function generateGoogleCalendarUrl(event: CalendarEventDetails): string {
  const formatDateTime = (dateStr: string, timeStr: string) => {
    const cleanDate = dateStr.replace(/-/g, '');
    const cleanTime = timeStr.replace(/:/g, '') + '00';
    return `${cleanDate}T${cleanTime}`;
  };

  const startUtc = formatDateTime(event.startDate, event.startTime);
  const endUtc = formatDateTime(event.endDate, event.endTime);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startUtc}/${endUtc}`,
    details: event.description,
    location: event.location,
    sf: 'true',
    output: 'xml'
  });

  if (event.doctorEmail && event.patientEmail) {
    params.append('add', `${event.doctorEmail},${event.patientEmail}`);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates an RFC-5545 compliant iCalendar (.ics) file string for universal calendar import.
 */
export function generateIcsContent(event: CalendarEventDetails): string {
  const formatIcsDateTime = (dateStr: string, timeStr: string) => {
    return dateStr.replace(/-/g, '') + 'T' + timeStr.replace(/:/g, '') + '00';
  };

  const dtStart = formatIcsDateTime(event.startDate, event.startTime);
  const dtEnd = formatIcsDateTime(event.endDate, event.endTime);
  const uid = event.id || `apt-${Date.now()}@carepulse-health.org`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CarePulse Health//Appointment Manager//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatIcsDateTime(new Date().toISOString().split('T')[0], '00:00')}Z`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${event.title.replace(/\n/g, '\\n')}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${event.location.replace(/\n/g, '\\n')}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

/**
 * Google Calendar API OAuth2 synchronizer.
 * If credentials are provided in .env, synchronizes via official Google Calendar API.
 */
export async function syncGoogleCalendarEvent(event: CalendarEventDetails): Promise<{ eventId: string; htmlLink: string }> {
  const gClientId = process.env.GOOGLE_CLIENT_ID;
  const gClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const gRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  // Fallback to generated deep-link if OAuth credentials are not configured in current environment
  const directLink = generateGoogleCalendarUrl(event);
  const mockOrGeneratedId = event.id || `gcal-${Date.now()}`;

  if (!gClientId || !gClientSecret || !gRefreshToken) {
    return {
      eventId: mockOrGeneratedId,
      htmlLink: directLink
    };
  }

  try {
    // Dynamic import to keep dependencies clean if not installed
    // @ts-ignore
    const { google } = await import('googleapis');
    const oauth2Client = new google.auth.OAuth2(gClientId, gClientSecret);
    oauth2Client.setCredentials({ refresh_token: gRefreshToken });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const startDateTime = `${event.startDate}T${event.startTime}:00`;
    const endDateTime = `${event.endDate}T${event.endTime}:00`;

    const res = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: event.title,
        description: event.description,
        location: event.location,
        start: { dateTime: new Date(startDateTime).toISOString() },
        end: { dateTime: new Date(endDateTime).toISOString() },
        attendees: [
          ...(event.doctorEmail ? [{ email: event.doctorEmail }] : []),
          ...(event.patientEmail ? [{ email: event.patientEmail }] : [])
        ]
      }
    });

    return {
      eventId: res.data.id || mockOrGeneratedId,
      htmlLink: res.data.htmlLink || directLink
    };
  } catch (err) {
    console.warn('[Calendar Service] Direct Google API sync failed, using link generator:', (err as Error).message);
    return {
      eventId: mockOrGeneratedId,
      htmlLink: directLink
    };
  }
}

export async function deleteGoogleCalendarEvent(calendarEventId: string): Promise<boolean> {
  const gClientId = process.env.GOOGLE_CLIENT_ID;
  const gClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const gRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!gClientId || !gClientSecret || !gRefreshToken || !calendarEventId) {
    return true;
  }

  try {
    // @ts-ignore
    const { google } = await import('googleapis');
    const oauth2Client = new google.auth.OAuth2(gClientId, gClientSecret);
    oauth2Client.setCredentials({ refresh_token: gRefreshToken });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    await calendar.events.delete({ calendarId: 'primary', eventId: calendarEventId });
    return true;
  } catch (err) {
    console.warn('[Calendar Service] Google event deletion failed:', (err as Error).message);
    return false;
  }
}
