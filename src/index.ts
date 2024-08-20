let express = require('express');
import { getGmailAuthUrl, getGmailToken, setGmailCredentials } from './auth/gmail';
//import { getOutlookAuthUrl, getOutlookToken, getOutlookClient } from './auth/outlook';
import { scheduleEmailTask } from './queue';

const app = express();

app.get('/auth/google', (req: any, res: { redirect: (arg0: string) => void; }) => {
  res.redirect(getGmailAuthUrl());
});

app.get('/auth/google/callback', async (req: { query: { code: string; }; }, res: { send: (arg0: string) => void; }) => {
  const code = req.query.code as string;
  const tokens = await getGmailToken(code);
  setGmailCredentials(tokens);
  res.send('Gmail account connected!');
});

// app.get('/auth/outlook', (req, res) => {
//   res.redirect(getOutlookAuthUrl());
// });

// app.get('/auth/outlook/callback', async (req, res) => {
//   const code = req.query.code as string;
//   const tokens = await getOutlookToken(code);
//   const client = getOutlookClient(tokens.access_token);
//   // Save client or tokens for future use
//   res.send('Outlook account connected!');
// });

app.post('/schedule', (req: { body: { type: any; content: any; }; }, res: { send: (arg0: string) => void; }) => {
  const { type, content } = req.body;
  scheduleEmailTask({ type, content });
  res.send('Task scheduled');
});
app.get('/get', (req: { body: { type: any; content: any; }; }, res: { send: (arg0: string) => void; }) => {
  res.send('Task scheduled');
});

app.listen(5001, () => {
  console.log('Server running on http://localhost:5001');
});
