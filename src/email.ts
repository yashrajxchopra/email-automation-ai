import { gmail } from './auth/gmail';
import { Client } from '@microsoft/microsoft-graph-client';
import  {openai}  from './openai';

export async function fetchEmailsGmail() {
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: 'is:unread',
  });
  return res.data.messages || [];
}

export async function fetchEmailsOutlook(client: Client) {
  const res = await client.api('/me/messages').filter('isRead eq false').get();
  return res.value || [];
}

export async function categorizeEmail(content: string) {
  const prompt = `Categorize the following email content into one of the categories: Interested, Not Interested, More Information.\n\nEmail: ${content}`;
  const response = await openai.chat.completions.create ({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt}],
    max_tokens: 50,
  });
  return response.data.choices[0].text?.trim();
}
