import { google } from 'googleapis';
import { env } from "./config";

const SPACE_NAME = env.SPACE_NAME;
const THREAD_NAME = env.THREAD_NAME;

async function sendDirectReply() {
    console.log('Authenticating...');
    const credentialsJsonString = Buffer.from(env.GOOGLE_CREDENTIALS_B64, 'base64').toString('utf-8');
    const credentials = JSON.parse(credentialsJsonString);
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/chat.bot'],
    });
    const chat = google.chat({ version: 'v1', auth });

    const threadKey = THREAD_NAME.split('/').pop();
    const requestPayload = {
        parent: SPACE_NAME,
        requestBody: {
            text: 'This is a direct API call test reply.',
            thread: {
                threadKey: threadKey,
            },
        },
    };

    try {
        console.log('Attempting to send a reply with this payload:');
        console.log(JSON.stringify(requestPayload, null, 2));

        await chat.spaces.messages.create(requestPayload);

        console.log('\n✅ Success! The message was sent. Please check the chat.');
    } catch (error) {
        console.error('\n❌ Error sending message:', error);
    }
}

sendDirectReply();
