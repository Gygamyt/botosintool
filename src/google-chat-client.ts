import { google } from 'googleapis';
import { env } from "./config";

const credentialsJsonString = Buffer.from(env.GOOGLE_CREDENTIALS_B64, 'base64').toString('utf-8');
const credentials = JSON.parse(credentialsJsonString);

const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/chat.bot'],
});

export const chat = google.chat({ version: 'v1', auth });

/**
 * Sends a reply message to the specified chat space, correctly replying in a thread.
 * @param {string} spaceName - The resource name of the space.
 * @param {string} replyText - The text content of the message.
 * @param {string} [threadName] - Optional. The resource name of the thread to reply to.
 */
export async function sendAsyncReply(spaceName: string, replyText: string, threadName?: string) {
    try {
        const requestPayload: any = {
            parent: spaceName,
            requestBody: {
                text: replyText,
            },
        };

        // If a threadName is provided, configure the request to reply in that thread.
        if (threadName) {
            requestPayload.requestBody.thread = { name: threadName };
            // This parameter is the crucial key to making threaded replies work correctly.
            requestPayload.messageReplyOption = 'REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD';
        }

        await chat.spaces.messages.create(requestPayload);

        console.log('Message sent successfully.');
    } catch (error) {
        console.error('Failed to send message:', error);
    }
}
