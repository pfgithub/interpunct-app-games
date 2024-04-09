import { Hono } from "hono";
import { logger } from 'hono/logger'
import { APIApplicationCommand, APIApplicationCommandInteraction, APIChatInputApplicationCommandInteractionData, APIInteraction, APIInteractionResponse, InteractionResponseType, InteractionType } from "discord-api-types/v10";
import { verifyKey } from "discord-interactions";

async function handle(request: APIInteraction): Promise<APIInteractionResponse> {
    if (request.type === InteractionType.Ping) {
        return { type: InteractionResponseType.Pong }
    }
    
    if (request.type === InteractionType.ApplicationCommand) {
        const data = request.data;
        const { name } = data;

        // "wiki" command
        if (name === 'wiki') {
            const data_ = data as APIChatInputApplicationCommandInteractionData;
            const option = data_.options![0];
            // Send a message into the channel where command was triggered from
            return {
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: `abc!`,
                },
            };
        }
    }

    // handle button interaction
    if (request.type === InteractionType.MessageComponent) {
        return {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: `abc!`,
            },
        };
    }

    console.log("TODO "+request.type);
    throw new Error("TODO");
}

const app = new Hono();
app.use(logger());
app.post("/interactions", async (c) => {
    const body_buf = await Bun.readableStreamToArrayBuffer(c.req.raw.body!);

    const signature = c.req.header('X-Signature-Ed25519');
    const timestamp = c.req.header('X-Signature-Timestamp');
    const isValidRequest = verifyKey(body_buf, signature!, timestamp!, process.env.PUBLIC_KEY!);

    if (!isValidRequest) {
        c.status(400);
        return c.text("Not authorized.");
    }

    const request = JSON.parse(new TextDecoder().decode(new Uint8Array(body_buf)));
    const response: APIInteractionResponse = await handle(request);
    console.log("req: ", request);
    console.log("-> ", response);

    return c.json(response);
});

const server = Bun.serve({
    fetch: app.fetch,
    port: 59848,
});

console.log("Application running on "+server.url);