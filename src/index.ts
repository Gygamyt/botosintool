import express from 'express';
import { verifyChatToken } from "./middleware/auth";
import { env } from "./config";
import { handleEvent } from "./events/event-handler";

const app = express();
app.use(express.json());

app.post('/', verifyChatToken, (req, res) => {
    // --- DEBUGGING START ---
    // console.log('================================================');
    // console.log('EVENT RECEIVED AT:', new Date().toISOString());
    // console.log('--- HEADERS ---');
    // console.log(JSON.stringify(req.headers, null, 2));
    // console.log('--- BODY ---');
    // console.log(JSON.stringify(req.body, null, 2));
    // console.log('================================================');
    // --- DEBUGGING END ---

    res.status(200).send();

    try {
        handleEvent(req);
    } catch (error) {
        console.error("CRITICAL: Error thrown while calling handleEvent:", error);
    }
});

app.listen(env.PORT, () => {
    console.log(`🤖 Bot server is running on port ${env.PORT}`);
});
