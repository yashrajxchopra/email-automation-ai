import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export function getGmailAuthUrl() {
  const scopes = ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send'];
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });
}

export async function getGmailToken(code: string) {
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  return tokens;
}

export function setGmailCredentials(tokens: any) {
  oAuth2Client.setCredentials(tokens);
}

export const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
