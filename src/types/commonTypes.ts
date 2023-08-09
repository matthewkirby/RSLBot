import { Collection } from "discord.js";
import { ButtonData } from "./ButtonData";
import { SlashCommand } from "./SlashCommand";

export type ButtonCollection = Collection<string, ButtonData>;
export type SlashCommandCollection = Collection<string, SlashCommand>
export type presets = 'seasonal' | 'beginner' | 'intermediate' | 'bingo' | 'ddr';
