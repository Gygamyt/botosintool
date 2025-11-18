import { sendAsyncReply } from "../../google-chat-client";

/**
 * Handles an ADDED_TO_SPACE event from Google Chat.
 * @param {any} event - The event payload.
 */
export async function handleAddedToSpace(event: any) {
    const spaceName = event.space.name;
    const welcomeText = "Hello! Thanks for adding me. I'm ready to help you with your requests.";
    await sendAsyncReply(spaceName, welcomeText);
}
