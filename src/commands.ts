import * as d from "discord-api-types/v10";
import { discordRequest } from './util';

// TODO copy interpunct impl

// https://github.com/discordjs/discord-api-types/pull/921
// once that is merged we can delete this stuff
// and that is waiting on discord api clarification
enum ApplicationIntegrationType {
    GuildInstall = 0,
    UserInstall = 1,
}
export enum InteractionContextType {
	Guild = 0,
	BotDM = 1,
	PrivateChannel = 2,
}

// Wiki command for game lookup
const WIKI_COMMAND: (d.RESTPostAPIChatInputApplicationCommandsJSONBody & {
    integration_types: ApplicationIntegrationType[],
    contexts: InteractionContextType[] | null;
}) = {
    name: 'panel',
    type: 1,
    description: 'sample panel',
    integration_types: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
    contexts: [InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel],
};

const ALL_COMMANDS: d.RESTPostAPIApplicationCommandsJSONBody[] = [
    WIKI_COMMAND,
];

export async function installGlobalCommands(appId: string, commands: object[]) {
    // API endpoint to overwrite global commands
    const endpoint = `applications/${appId}/commands`;

    // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    await discordRequest(endpoint, { method: 'PUT', body: commands });
}
installGlobalCommands(process.env.APP_ID!, ALL_COMMANDS);


