import { Queue, Worker } from 'bullmq';
import MockRedis from 'ioredis-mock'; // Mock Redis for in-memory operations
import { sendGmailResponse } from './response';
import { categorizeEmail } from './email';
import { gmail } from './auth/gmail';

const redisMock = new MockRedis();

const emailQueue = new Queue('emailQueue', { connection: redisMock });

export async function scheduleEmailTask(data: { type: string; content: any }) {
  await emailQueue.add('processEmail', data);
}

const emailWorker = new Worker('emailQueue', async job => {
  const { type, content } = job.data;

  if (type === 'Gmail') {
     // Fetch unread emails
     const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread', // Fetch unread emails
    });

    const messages = response.data.messages || [];

    for (const message of messages) {
      // Fetch the full message
      const msg = await gmail.users.messages.get({
        userId: 'me',
        id: message.id!,
      });

      const emailData = msg.data;

      // Extract email content
      const emailBody = emailData.payload?.parts?.[0]?.body?.data;

      if (emailBody) {
        const emailText = Buffer.from(emailBody, 'base64').toString('utf-8');

        // Categorize the email
        const category = await categorizeEmail(emailText); // Implement categorizeEmail

        // Respond based on category
        if (category === 'Interested') {
          await sendGmailResponse(emailData.to, emailData.subject, 'Thank you for your interest. Would you like to schedule a demo call?');
        } else if (category === 'Not Interested') {
          await sendGmailResponse(emailData.to, emailData.subject, 'Thank you for your response.');
        } else if (category === 'More Information') {
          await sendGmailResponse(emailData.to, emailData.subject, 'We can provide more information. What specific details are you interested in?');
        }
      }
    }
  
  } else if (type === 'Outlook') {
    // Fetch, categorize, and respond to Outlook emails
  } else {
    throw new Error(`Unknown email type: ${type}`);
  }
}, { connection: redisMock });

emailWorker.on('completed', job => {
  console.log(`Job completed with result: ${job.returnvalue}`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`Job failed with error: ${err.message}`);
});
