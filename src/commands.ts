import { discordRequest } from './util';

// TODO copy interpunct impl

// Wiki command for game lookup
const WIKI_COMMAND = {
    name: 'wiki',
    type: 1,
    description: 'Lookup information in wiki',
    options: [
        {
            type: 3,
            name: 'item',
            description: 'Item to lookup',
            choices: [
                {
                    name: 'Map',
                    value: 'item_map',
                    emoji: ':map:',
                    description: 'A detailed map that reveals hidden paths and secret locations'
                },
            ],
            required: true,
        },
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
};

const ALL_COMMANDS = [
    WIKI_COMMAND,
];

export async function installGlobalCommands(appId: string, commands: object[]) {
    // API endpoint to overwrite global commands
    const endpoint = `applications/${appId}/commands`;

    // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    await discordRequest(endpoint, { method: 'PUT', body: commands });
}
installGlobalCommands(process.env.APP_ID!, ALL_COMMANDS);


