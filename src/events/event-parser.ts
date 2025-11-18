import { NormalizedEvent } from "./event.types";

/**
 * Parses the raw event body from Google Chat into a normalized format.
 * This is the "dirty" layer that deals with inconsistent JSON structures.
 * @param {any} rawEvent - The raw request body from the webhook.
 * @returns {NormalizedEvent} - A clean, standardized event object.
 */
export function parseEvent(rawEvent: any): NormalizedEvent {
    if (rawEvent.message) {
        return {
            type: 'MESSAGE',
            payload: {
                user: rawEvent.user,
                space: rawEvent.space,
                message: rawEvent.message,
            },
        };
    }

    if (rawEvent.message || rawEvent.chat?.messagePayload?.message) {
        const messagePayload = rawEvent.message ? rawEvent : rawEvent.chat.messagePayload;
        return {
            type: 'MESSAGE',
            payload: {
                user: rawEvent.user || rawEvent.chat.user,
                space: rawEvent.space || messagePayload.space,
                message: rawEvent.message || messagePayload.message,
            },
        };
    }

    if (rawEvent.chat?.removedFromSpacePayload) {
        return {
            type: 'REMOVED_FROM_SPACE',
            payload: rawEvent.chat.removedFromSpacePayload,
        };
    }

    if (rawEvent.type === 'ADDED_TO_SPACE' || rawEvent.chat?.addedToSpacePayload) {
        const addedToSpacePayload = rawEvent.type ? rawEvent : rawEvent.chat.addedToSpacePayload;
        return {
            type: 'ADDED_TO_SPACE',
            payload: {
                space: addedToSpacePayload.space,
            },
        };
    }

    return {
        type: 'UNKNOWN',
        payload: rawEvent,
    };
}
