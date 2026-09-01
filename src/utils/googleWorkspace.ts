// Google Workspace EHR & Calendar Synchronization Helper
// Implements client-side OAuth token retrieval and real API integration with Calendar and Sheets.

const CLIENT_ID = "112622754067-1f1n90jn7qtdb48b0sunnmrietioucfl.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/spreadsheets";

export interface CalendarEventPayload {
  summary: string;
  description: string;
  dateStr: string; // e.g. "Aug 20, 2026"
  timeStr: string; // e.g. "10:30 AM"
  type: 'virtual' | 'physical';
}

export interface SoapSheetRow {
  patientCode: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  timestamp: string;
}

// Global cached token & callback references for GSI
let tokenClient: any = null;
let currentToken: string | null = sessionStorage.getItem("google_workspace_token");

/**
 * Initializes the GSI OAuth Token client if not already loaded.
 */
function getOrInitTokenClient(onTokenSuccess: (token: string) => void, onTokenError?: (err: any) => void): any {
  if (typeof window === 'undefined' || !(window as any).google?.accounts?.oauth2) {
    if (onTokenError) onTokenError(new Error("Google Identity Services script not loaded. Please wait or refresh."));
    return null;
  }

  return (window as any).google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (tokenResponse: any) => {
      if (tokenResponse.error_description) {
        if (onTokenError) onTokenError(tokenResponse);
        return;
      }
      if (tokenResponse.access_token) {
        currentToken = tokenResponse.access_token;
        sessionStorage.setItem("google_workspace_token", tokenResponse.access_token);
        onTokenSuccess(tokenResponse.access_token);
      }
    },
  });
}

/**
 * Retrieves a valid OAuth Access Token, prompting the user via GSI popup if none is cached.
 */
export async function getAccessToken(): Promise<string> {
  if (currentToken) {
    return currentToken;
  }

  return new Promise((resolve, reject) => {
    try {
      const client = getOrInitTokenClient(
        (token) => resolve(token),
        (err) => reject(err)
      );
      if (client) {
        client.requestAccessToken({ prompt: 'consent' });
      } else {
        reject(new Error("OAuth client could not be initialized."));
      }
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Synchronizes an appointment with Google Calendar.
 */
export async function syncAppointmentToCalendar(event: CalendarEventPayload): Promise<any> {
  const token = await getAccessToken();

  // Parse Date and Time (e.g. "Aug 20, 2026" & "10:30 AM")
  const dateTimeObj = parseDateTime(event.dateStr, event.timeStr);
  const startISO = dateTimeObj.toISOString();
  
  // End date is 1 hour later by default
  const endISO = new Date(dateTimeObj.getTime() + 60 * 60 * 1000).toISOString();

  const body = {
    summary: event.summary,
    description: `${event.description}\n\nType: ${event.type.toUpperCase()} CONSULTATION\nCreated securely via Doctorian Medical Co-Pilot.`,
    start: {
      dateTime: startISO,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    },
    end: {
      dateTime: endISO,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    },
    conferenceData: event.type === 'virtual' ? {
      createRequest: {
        requestId: `doctorian-${Date.now()}`,
        conferenceSolutionKey: {
          type: 'hangoutsMeet'
        }
      }
    } : undefined
  };

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Calendar API Error: ${errText}`);
  }

  return await response.json();
}

/**
 * Helper to parse a combined Date ("Aug 20, 2026") and Time ("10:30 AM") string.
 */
function parseDateTime(dateStr: string, timeStr: string): Date {
  try {
    // Standardize month maps
    const monthMap: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };

    // DateStr looks like "Aug 20, 2026" or "08/20/2026"
    if (dateStr.includes(',')) {
      const parts = dateStr.replace(',', '').split(' '); // ["Aug", "20", "2026"]
      const month = monthMap[parts[0].toLowerCase().slice(0, 3)] ?? 0;
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);

      const d = new Date(year, month, day);
      applyTimeStringToDate(d, timeStr);
      return d;
    } else {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        const fallback = new Date();
        applyTimeStringToDate(fallback, timeStr);
        return fallback;
      }
      applyTimeStringToDate(d, timeStr);
      return d;
    }
  } catch (e) {
    console.error("Error parsing date time:", e);
    return new Date();
  }
}

function applyTimeStringToDate(date: Date, timeStr: string) {
  // e.g. "10:30 AM"
  const clean = timeStr.trim().toUpperCase();
  const isPM = clean.includes('PM');
  const [hourMin] = clean.replace('AM', '').replace('PM', '').trim().split(':');
  const parts = hourMin.split(':');
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1] ? parseInt(parts[1], 10) : 0;

  if (isPM && hours < 12) hours += 12;
  if (!isPM && hours === 12) hours = 0;

  date.setHours(hours, minutes, 0, 0);
}

/**
 * Searches or creates a default Doctorian Spreadsheet and appends clinical SOAP entries.
 */
export async function appendSoapNoteToSheets(row: SoapSheetRow): Promise<string> {
  const token = await getAccessToken();

  // Step 1: Create a brand new spreadsheet or look up cached spreadsheet ID
  let spreadsheetId = localStorage.getItem("doctorian_spreadsheet_id");

  if (!spreadsheetId) {
    const createBody = {
      properties: {
        title: "Doctorian Clinical SOAP Ledger"
      },
      sheets: [
        {
          properties: {
            title: "SOAP Archives",
            gridProperties: {
              frozenRowCount: 1
            }
          },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: [
                {
                  values: [
                    { userEnteredValue: { stringValue: "Timestamp" } },
                    { userEnteredValue: { stringValue: "Patient ID / Code" } },
                    { userEnteredValue: { stringValue: "Subjective" } },
                    { userEnteredValue: { stringValue: "Objective" } },
                    { userEnteredValue: { stringValue: "Assessment" } },
                    { userEnteredValue: { stringValue: "Plan" } }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };

    const createResp = await fetch(`https://sheets.googleapis.com/v1/spreadsheets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createBody)
    });

    if (!createResp.ok) {
      throw new Error(`Failed to create spreadsheet: ${await createResp.text()}`);
    }

    const sheetData = await createResp.json();
    spreadsheetId = sheetData.spreadsheetId;
    if (spreadsheetId) {
      localStorage.setItem("doctorian_spreadsheet_id", spreadsheetId);
    }
  }

  // Step 2: Append row
  const appendBody = {
    range: "SOAP Archives!A:F",
    majorDimension: "ROWS",
    values: [
      [
        row.timestamp,
        row.patientCode,
        row.subjective,
        row.objective,
        row.assessment,
        row.plan
      ]
    ]
  };

  const appendResp = await fetch(
    `https://sheets.googleapis.com/v1/spreadsheets/${spreadsheetId}/values/SOAP Archives!A:F:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(appendBody)
    }
  );

  if (!appendResp.ok) {
    throw new Error(`Failed to append spreadsheet data: ${await appendResp.text()}`);
  }

  return spreadsheetId || "";
}
