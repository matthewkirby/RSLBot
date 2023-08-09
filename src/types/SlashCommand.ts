import { ChatInputCommandInteraction } from 'discord.js';

export interface SlashCommand {
    name: string;
    description: string;
    requiredPermission: 1 | 2 | 3 | 4;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}