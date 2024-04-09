import * as d from "discord-api-types/v10";
import { Button, MessageActionRow, useCommonAction } from "../lib/panel";

export default function DemoPanel(): d.APIInteractionResponseCallbackData {
    return {
        content: "abc",
        components: [
            MessageActionRow([
                Button({
                    label: "click me!",
                    custom_id: useCommonAction("DEMO"),
                }),
            ]),
        ],
    };
}