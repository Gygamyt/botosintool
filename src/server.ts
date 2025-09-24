import express from 'express';
import { OAuth2Client } from 'google-auth-library';

const PORT = process.env.PORT || 3000;
const SERVICE_ACCOUNT_EMAIL = process.env.SERVICE_ACCOUNT;

const app = express();
app.use(express.json());
const authClient = new OAuth2Client();

app.post('/', async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        const token = authHeader?.split(' ')[1];

        if (!token) {
            console.warn('Request without authorization token.');
            return res.status(401).send('Unauthorized');
        }

        const audience = `https://${req.get('host')}`;

        const ticket = await authClient.verifyIdToken({
            idToken: token,
            audience: audience,
        });

        const payload = ticket.getPayload();
        if (payload?.email !== SERVICE_ACCOUNT_EMAIL) {
            throw new Error('Token was issued for a different service account.');
        }

        const event = req.body;
        let replyText: string;

        const messagePayload = event.chat?.messagePayload;
        const user = event.chat?.user;

        if (messagePayload && user && messagePayload.message) {
            const receivedText = messagePayload.message.text || '';
            const userName = user.displayName;
            console.log(`Received message from ${userName}: "${receivedText}"`);

            replyText = `Hello, ${userName}! I received your message: "${receivedText}"`;
        } else {
            console.log("Received a system event, not a message.");
            replyText = `Hello, ${user?.displayName || 'user'}! Event processed.`;
        }

        console.log(`Sending reply: "${replyText}"`);
        return res.json({
            text: replyText,
        });

    } catch (error) {
        console.error('An error occurred:', error);
        return res.status(403).send('Forbidden');
    }
});

app.listen(PORT, () => {
    console.log(`🤖 Bot server is running on port ${PORT}`);
});
