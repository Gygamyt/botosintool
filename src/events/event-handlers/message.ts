import { sendAsyncReply } from "../../google-chat-client";

const threadCache = new Map<string, { fullText: string, author: string }>();
const debounceTimers = new Map<string, NodeJS.Timeout>();
const DEBOUNCE_DELAY_MS = 5000;

/**
 * This function contains the final logic that runs after the delay.
 * It sends the combined text to the external API and replies to the thread.
 */
async function processCompleteMessage(spaceName: string, threadName: string) {
    console.log(`Debounce timer expired for thread ${threadName}. Processing full message.`);

    const cachedData = threadCache.get(threadName);
    if (!cachedData) {
        console.error("Cache is empty for the thread, cannot process.");
        return;
    }

    const { fullText } = cachedData;

    const requestId = crypto.randomUUID();
    const timestamp = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Warsaw' });
    const ackMessage = `✅ Request received and sent to the OSINT API.\nID: \`${requestId}\`\nTimestamp: ${timestamp}`;
    await sendAsyncReply(spaceName, ackMessage, threadName);

    //todo unmock
    console.log(`Sending to external API: "${fullText}"`);
    const apiResponse = `(OSINT Response) Request successfully processed with ${fullText.length} characters.`;
    //todo unmock

    await sendAsyncReply(spaceName, apiResponse, threadName);

    threadCache.delete(threadName);
    debounceTimers.delete(threadName);
}

/**
 * Handles the payload of a MESSAGE event.
 * Collects message parts from the same author in a thread and processes them after a delay.
 * @param {any} payload - The clean payload from the event parser.
 */
export async function handleMessage(payload: any) {
    const { user, space, message } = payload;
    const threadName = message.thread?.name;

    const cachedData = threadCache.get(threadName);
    if (cachedData && cachedData.author !== user.name) {
        console.log(`Different user interrupted. Processing message from original author for thread ${threadName}.`);
        if (debounceTimers.has(threadName)) {
            clearTimeout(debounceTimers.get(threadName)!);
        }
        await processCompleteMessage(space.name, threadName);

        // We stop here and don't process the interrupting message to avoid confusion.
        // This could be changed later if needed.
        return;
    }

    const newText = message.text || '';
    const combinedText = cachedData ? `${cachedData.fullText}\n${newText}` : newText;

    threadCache.set(threadName, { fullText: combinedText, author: user.name });
    console.log(`Updated cache for thread ${threadName}. Total length: ${combinedText.length}`);

    if (debounceTimers.has(threadName)) {
        clearTimeout(debounceTimers.get(threadName)!);
    }

    console.log(`Setting ${DEBOUNCE_DELAY_MS / 1000}s timer for thread ${threadName}`);
    const timerId = setTimeout(() => {
        processCompleteMessage(space.name, threadName);
    }, DEBOUNCE_DELAY_MS);

    debounceTimers.set(threadName, timerId);
}
