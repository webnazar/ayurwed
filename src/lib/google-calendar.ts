import { google } from 'googleapis';

/**
 * Returns true if all three Google credentials are present in env.
 */
export function hasGoogleCreds(): boolean {
  return !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN
  );
}

/**
 * Creates an OAuth2 client pre-authenticated with the system account's
 * refresh token (ayurwed.com@gmail.com).
 * The redirect URI must match the one used when the refresh token was generated.
 */
function getOAuth2Client() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/api/auth/callback/google' // must match token-generation redirect URI
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return oauth2Client;
}

export interface MeetEventInput {
  appointmentId: number;
  doctorName: string;
  doctorEmail: string;
  patientName: string;
  patientEmail: string;
  scheduledAt: Date;
  durationMinutes?: number;
  concern?: string;
}

export interface MeetEventResult {
  meetLink: string;
  calendarEventId: string;
  htmlLink: string;
}

/**
 * Creates a Google Calendar event with a Google Meet conference link.
 * Uses the system Gmail account (ayurwed.com@gmail.com) as the organizer.
 * Both doctor and patient are added as attendees and receive email invites automatically.
 */
export async function createMeetEvent(input: MeetEventInput): Promise<MeetEventResult> {
  const {
    appointmentId,
    doctorName,
    doctorEmail,
    patientName,
    patientEmail,
    scheduledAt,
    durationMinutes = 30,
    concern = '',
  } = input;

  const auth = getOAuth2Client();
  const calendar = google.calendar({ version: 'v3', auth });

  const endTime = new Date(scheduledAt.getTime() + durationMinutes * 60 * 1000);

  const event = await calendar.events.insert({
    calendarId: 'primary', // ayurwed.com@gmail.com primary calendar
    conferenceDataVersion: 1, // required to auto-generate a Meet link
    sendUpdates: 'all', // send email invites to all attendees
    requestBody: {
      summary: `Ayurwed Consultation — ${doctorName} × ${patientName}`,
      description: `Appointment #${appointmentId} on Ayurwed platform.\n\nPatient Concern:\n${concern}\n\n--\nAyurwed Ancient Intelligence • Modern Wellness\nhttps://www.ayurwed.com`,
      start: {
        dateTime: scheduledAt.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      attendees: [
        { email: doctorEmail, displayName: doctorName },
        { email: patientEmail, displayName: patientName },
      ],
      conferenceData: {
        createRequest: {
          requestId: `ayurwed-appt-${appointmentId}-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 15 },       // 15 min before
        ],
      },
    },
  });

  const eventData = event.data;
  const meetLink = eventData.conferenceData?.entryPoints?.find(
    (ep: any) => ep.entryPointType === 'video'
  )?.uri;

  if (!meetLink) {
    throw new Error('Google Calendar event created but no Meet link was returned.');
  }

  return {
    meetLink,
    calendarEventId: eventData.id || '',
    htmlLink: eventData.htmlLink || '',
  };
}
