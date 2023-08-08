import { ChatInputCommandInteraction } from 'discord.js';

export interface SlashCommand {
    name: string;
    description: string;
    requiredPermission: number;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}