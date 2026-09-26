import { getAccessToken } from '../firebase';

export interface NotifyLoginResult {
  success: boolean;
  gmailApiSent: boolean;
  notifiedEmail: string;
  timestamp: string;
}

/**
 * Notifies the user's account in Gmail upon successful sign in or registration.
 * Uses official Google Workspace Gmail API when OAuth access token is active,
 * along with the backend notification relay.
 */
export async function notifyLoginInGmail(user: {
  email: string;
  displayName?: string;
  id?: string;
  role?: string;
}): Promise<NotifyLoginResult> {
  const email = (user.email || '').trim();
  if (!email) {
    return { success: false, gmailApiSent: false, notifiedEmail: '', timestamp: '' };
  }

  const timestamp = new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  });

  const displayName = user.displayName || email.split('@')[0];
  let gmailApiSent = false;

  // 1. Try sending directly using Google Workspace Gmail REST API if OAuth token is available
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const subject = `🔐 Security Alert: Successful Login to Doctorian (${displayName})`;
      const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #02050e; color: #f1f5f9; margin: 0; padding: 20px; }
    .card { background-color: #071326; border: 1px solid #0e7490; border-radius: 16px; padding: 28px; max-width: 560px; margin: 0 auto; box-shadow: 0 25px 50px rgba(0,0,0,0.6); }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #164e63; padding-bottom: 14px; margin-bottom: 20px; }
    .logo-badge { background: linear-gradient(135deg, #06b6d4, #3b82f6); color: #020617; font-weight: 900; font-size: 12px; padding: 5px 12px; border-radius: 6px; letter-spacing: 1.5px; font-family: ui-monospace, monospace; }
    .status-pill { display: inline-block; background-color: rgba(6, 182, 212, 0.15); border: 1px solid #06b6d4; color: #22d3ee; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; margin-bottom: 16px; font-family: ui-monospace, monospace; }
    .title { color: #ffffff; font-size: 20px; font-weight: 800; margin: 0 0 12px; }
    .content { font-size: 14px; line-height: 1.6; color: #94a3b8; }
    .details-box { background-color: #030816; border: 1px solid #155e75; border-radius: 12px; padding: 16px; margin: 18px 0; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 12px; color: #cbd5e1; }
    .detail-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #1e293b; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #38bdf8; font-weight: 600; }
    .detail-value { color: #f8fafc; font-weight: 500; }
    .footer { font-size: 11px; color: #64748b; margin-top: 24px; text-align: center; border-top: 1px solid #1e293b; padding-top: 14px; font-family: ui-monospace, monospace; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="logo-badge">DOCTORIAN MEDICAL AI</span>
      <span style="font-size: 11px; color: #06b6d4; font-family: ui-monospace, monospace;">ENCLAVE::AUTH</span>
    </div>
    <div class="status-pill">● SECURE LOGIN CONFIRMED</div>
    <h2 class="title">New Session Authenticated</h2>
    <p class="content">
      Hello <strong style="color: #ffffff;">${displayName}</strong>,<br><br>
      A successful sign-in was verified for your Doctorian Healthcare AI workstation. Your patient records, diagnostic tools, and telemetry channels are active.
    </p>
    <div class="details-box">
      <div class="detail-row">
        <span class="detail-label">// ACCOUNT:</span>
        <span class="detail-value">${email}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">// TIMESTAMP:</span>
        <span class="detail-value">${timestamp}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">// ROLE:</span>
        <span class="detail-value">${(user.role || 'Patient Node').toUpperCase()}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">// SECURITY PROTOCOL:</span>
        <span class="detail-value">AES-256-GCM QUANTUM CORE</span>
      </div>
    </div>
    <p class="content" style="font-size: 12px;">
      If this was you, you can safely continue your clinical session. If you did not sign in to Doctorian, please reset your password immediately or alert system administration.
    </p>
    <div class="footer">
      Doctorian Health Telemetry Network • Encrypted Clinical Workstation
    </div>
  </div>
</body>
</html>`.trim();

      // Encode into base64url format for Gmail API
      const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
      const rawEmail = [
        `To: ${email}`,
        `Subject: ${utf8Subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8',
        '',
        htmlBody
      ].join('\r\n');

      const encodedMessage = btoa(unescape(encodeURIComponent(rawEmail)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: encodedMessage })
      });

      if (res.ok) {
        gmailApiSent = true;
        console.log(`[GMAIL API] Successfully sent login notification to: ${email}`);
      } else {
        const errJson = await res.json().catch(() => ({}));
        console.warn('[GMAIL API] Gmail API response status:', res.status, errJson);
      }
    }
  } catch (err) {
    console.warn('[GMAIL API] Direct send attempt caught error:', err);
  }

  // 2. Also register notification on the backend server for SMTP delivery, in-app notifications, and audit log
  try {
    const accessToken = await getAccessToken();
    await fetch('/api/notifications/notify-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        displayName,
        id: user.id,
        role: user.role,
        loginTime: timestamp,
        gmailApiSent,
        accessToken: accessToken || undefined
      })
    });
  } catch (backendErr) {
    console.warn('[BACKEND NOTIFY] Backend login notification error:', backendErr);
  }

  return {
    success: true,
    gmailApiSent,
    notifiedEmail: email,
    timestamp
  };
}
