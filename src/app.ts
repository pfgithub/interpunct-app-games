import { Hono } from "hono";
import { logger } from 'hono/logger';
import * as d from "discord-api-types/v10";
import { verifyKey } from "discord-interactions";
import DemoPanel from "./panels/demo";
import { ButtonCallback, withResponseState } from "./lib/panel";

const common_actions: {[key: string]: ButtonCallback} = {
    "DEMO": (): d.APIInteractionResponse => {
        return {
            type: d.InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: "you clicked me!",
                flags: d.MessageFlags.Ephemeral,
            },
        };
    },
};

function handleInteraction(action: string): d.APIInteractionResponse {
    if(Object.hasOwn(common_actions, action)) {
        return common_actions[action]();
    }else{
        return {
            type: d.InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: `abc!`,
                flags: d.MessageFlags.Ephemeral,
            },
        };
    }
}

async function handle(request: d.APIInteraction): Promise<d.APIInteractionResponse> {
    if (request.type === d.InteractionType.Ping) {
        return { type: d.InteractionResponseType.Pong }
    }
    
    if (request.type === d.InteractionType.ApplicationCommand) {
        const data = request.data;
        const { name } = data;

        // the root of the app will be a router which has callbacks to route handlers
        // to render, we will render the whole command router with the command, and it will return the action.
        if (name === "panel") {
            const data_ = data as d.APIChatInputApplicationCommandInteractionData;

            const id = crypto.randomUUID();
            const rsp = {
                interaction_id: id,
                handlers: {},
                persistent: false,
            };
            const resp = withResponseState(rsp, () => DemoPanel());
            if(rsp.persistent) throw new Error("TODO impl persistence");

            return {
                type: d.InteractionResponseType.ChannelMessageWithSource,
                data: resp,
            };
        }
    }

    // handle button interaction
    if (request.type === d.InteractionType.MessageComponent) {
        const [action, descriminator] = request.data.custom_id.split("|");
        return handleInteraction(action);
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
    const response: d.APIInteractionResponse = await handle(request);
    console.log("req: ", request);
    console.log("-> ", response);

    return c.json(response);
});

const server = Bun.serve({
    fetch: app.fetch,
    port: 59848,
});

console.log("Application running on "+server.url);