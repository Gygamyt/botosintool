import { Request } from 'express';
import { handleMessage } from './event-handlers/message';
import { handleAddedToSpace } from './event-handlers/added-to-space';
import { parseEvent } from './event-parser';
import { NormalizedEvent } from "./event.types";

/**
 * Main dispatcher for incoming events. It's now the "clean" layer.
 * It uses the parser to get a normalized event, then uses a switch statement
 * to route it to the correct business logic.
 * @param {Request} req - The Express request object.
 */
export async function handleEvent(req: Request) {
    const normalizedEvent: NormalizedEvent = parseEvent(req.body);

    switch (normalizedEvent.type) {
        case 'MESSAGE':
            await handleMessage(normalizedEvent.payload);
            break;

        case 'ADDED_TO_SPACE':
            await handleAddedToSpace(normalizedEvent.payload);
            break;

        case 'REMOVED_FROM_SPACE':
            console.log('Bot was removed from space:', normalizedEvent.payload.space.name);
            break;

        case 'UNKNOWN':
            console.log('Received an unhandled event type or format:', normalizedEvent.payload);
            break;
    }
}
