import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { env } from "../config";

const authClient = new OAuth2Client();

/**
 * Express middleware to verify the Google Chat bearer token.
 * @param {Request} req The Express request object.
 * @param {Response} res The Express response object.
 * @param {NextFunction} next The next middleware function.
 */
export async function verifyChatToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.header('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        console.warn('Authentication failed: Missing token.');
        return res.status(401).send('Unauthorized');
    }

    try {
        const audience = `https://${req.get('host')}`;
        const ticket = await authClient.verifyIdToken({ idToken: token, audience });
        const payload = ticket.getPayload();
        if (payload?.email !== env.SERVICE_ACCOUNT_EMAIL) {
            console.warn('Authentication failed: Invalid token recipient.');
            return res.status(403).send('Forbidden');
        }

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(403).send('Forbidden');
    }
}
