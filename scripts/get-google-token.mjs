/**
 * One-time script to generate a Google OAuth2 refresh token.
 *
 * HOW TO USE:
 * 1. Stop the Next.js dev server (it uses port 3000)
 * 2. Run: node scripts/get-google-token.mjs
 * 3. Open the printed URL in your browser
 * 4. Sign in as ayurwed.com@gmail.com and authorize Calendar access
 * 5. The refresh token is printed automatically — copy it to .env.local
 *
 * This is a ONE-TIME setup. The refresh token never expires unless revoked.
 */

import http from 'http';
import { google } from 'googleapis';

const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI  = 'http://localhost:3000/api/auth/callback/google';
const SCOPES        = ['https://www.googleapis.com/auth/calendar'];

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Error: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables must be set.');
  console.log('Run this script as: GOOGLE_CLIENT_ID=your_id GOOGLE_CLIENT_SECRET=your_secret node scripts/get-google-token.mjs');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent', // always returns refresh_token
});

console.log('\n─────────────────────────────────────────────');
console.log('  Ayurwed × Google Calendar — Token Setup');
console.log('─────────────────────────────────────────────\n');
console.log('✅ Temporary server started on http://localhost:3000');
console.log('   (Make sure your Next.js dev server is stopped)\n');
console.log('👉 Open this URL in your browser:\n');
console.log(authUrl);
console.log('\n⏳ Waiting for Google to redirect back...\n');

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:3000');

  // Only handle the callback path
  if (!url.pathname.startsWith('/api/auth/callback/google')) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Waiting for Google OAuth callback...');
    return;
  }

  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<h2>❌ Error: ${error}</h2><p>You can close this tab.</p>`);
    console.error('\n❌ OAuth error:', error);
    server.close();
    return;
  }

  if (!code) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('No code received.');
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    // Success — show in browser
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html><body style="font-family:sans-serif;padding:2rem;background:#f0fdf4">
        <h2 style="color:#166534">✅ Google Meet integration authorised!</h2>
        <p>Copy the token below into your <strong>.env.local</strong> file, then close this tab and restart your dev server.</p>
        <pre style="background:#dcfce7;padding:1rem;border-radius:8px;font-size:13px">GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"</pre>
      </body></html>
    `);

    // Print to terminal
    console.log('\n✅ SUCCESS! Add this to your .env.local:\n');
    console.log(`GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"\n`);
    console.log('Restart your dev server and Google Meet links will auto-generate.\n');

  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(`<h2>❌ Error: ${err.message}</h2>`);
    console.error('\n❌ Token exchange failed:', err.message);
  }

  server.close();
});

server.listen(3000, () => {});
