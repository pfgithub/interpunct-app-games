import * as d from "discord-api-types/v10";

export function withResponseState<T>(rs: RsPersistence, cb: () => T): T {
    response_state = {persistence: rs, cid_idx: 0};
    const res = cb();
    response_state = null;
    return res;
}
export type RsPersistence = {
    interaction_id: string,
    handlers: {[key: string]: ButtonCallback},
    persistent: boolean,
};
type response_state = {
    persistence: RsPersistence,
    cid_idx: number,
};
let response_state: response_state | null;
let run_uuid = crypto.randomUUID(); // changes on restart. have to click buttons twice after restart, once to update and twice to run.
export function usePersistentCallback(handler: ButtonCallback) {
    if(!response_state) throw new Error("useCustomId() outside of withResponseState()");
    response_state.cid_idx += 1;
    const res = `${response_state.persistence.interaction_id}|${response_state.cid_idx}.${run_uuid}`;
    response_state.persistence.persistent = true;
    response_state.persistence.handlers[res] = handler;
    return res;
}
export function useCommonAction(common_action: string) {
    if(!response_state) throw new Error("useCommonAction() outside of withResponseState()");
    response_state.cid_idx += 1;
    const res = `${common_action}|${response_state!.cid_idx}`;
    return res;
}

export function MessageActionRow(components: d.APIMessageActionRowComponent[]): d.APIActionRowComponent<d.APIMessageActionRowComponent> {
    return {
        type: d.ComponentType.ActionRow,
        components,
    };
}
export type ButtonCallback = () => d.APIInteractionResponse;
type BaseButtonOpts = {
    label?: string,
    style?: d.ButtonStyle.Danger | d.ButtonStyle.Primary | d.ButtonStyle.Secondary | d.ButtonStyle.Success,
    emoji?: d.APIMessageComponentEmoji,
    disabled?: boolean,
};
export function LinkButton(opts: BaseButtonOpts & {url: string}): d.APIButtonComponentWithURL {
    return {
        type: d.ComponentType.Button,
        style: d.ButtonStyle.Link,
        label: opts.label,
        url: opts.url,
        emoji: opts.emoji,
        disabled: opts.disabled,
    };
}
export function Button(opts: BaseButtonOpts & {custom_id: string}): d.APIButtonComponentWithCustomId {
    // not every button needs a custom id, TODO!
    return {
        type: d.ComponentType.Button,
        style: opts.style ?? d.ButtonStyle.Secondary,
        label: opts.label,
        emoji: opts.emoji,
        disabled: opts.disabled,
        custom_id: opts.custom_id,
    };
}