import { gmail } from './auth/gmail';
import { Client } from '@microsoft/microsoft-graph-client';
import { openai } from './openai';

export async function generateResponse(content: string) {
  const prompt = `Generate an appropriate response to the following email based on the context.\n\nEmail: ${content}`;
  const response = await openai.chat.completions.create({
    model: "text-davinci-003",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 150,
  });
  return response.data.choices[0].text?.trim();
}

export async function sendGmailResponse(to: string, subject: string, body: string) {
  const raw = `To: ${to}\r\nSubject: ${subject}\r\n\r\n${body}`;
  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: Buffer.from(raw).toString('base64'),
    },
  });
}

export async function sendOutlookResponse(client: Client, to: string, subject: string, body: string) {
  await client.api('/me/sendMail').post({
    message: {
      subject: subject,
      body: {
        contentType: 'Text',
        content: body,
      },
      toRecipients: [{ emailAddress: { address: to } }],
    },
  });
}
