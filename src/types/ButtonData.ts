import { ButtonBuilder, ButtonInteraction, ButtonStyle } from 'discord.js';

export interface BaseButtonData {
    name: string;
    label: string;
    style: ButtonStyle;
    button?: ButtonBuilder;
};

export interface InteractionButtonData extends BaseButtonData {
    requiredPermission: 1 | 2 | 3 | 4;
    execute: (interaction: ButtonInteraction) => Promise<void>;
};

export interface LinkButtonData extends BaseButtonData {
    url?: string;
};

export type ButtonData = InteractionButtonData | LinkButtonData;