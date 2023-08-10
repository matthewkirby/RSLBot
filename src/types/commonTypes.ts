import { ActionRowBuilder, ButtonBuilder, Collection, StringSelectMenuBuilder } from "discord.js";
import { ButtonData } from "./ButtonData";
import { SlashCommand } from "./SlashCommand";
import { SelectMenuData } from "./SelectMenuData";

export type Component = ButtonData; // | SelectMenuData;
export type ButtonCollection = Collection<string, ButtonData>;
export type SelectMenuCollection = Collection<string, SelectMenuData>;
export type ComponentCollection = Collection<string, Component>;

export type ComponentBuilders = ButtonBuilder | StringSelectMenuBuilder;
export type ActionRowCollection = Collection<string, ActionRowBuilder<ComponentBuilders>>;

export type SlashCommandCollection = Collection<string, SlashCommand>;
export type presets = 'seasonal' | 'beginner' | 'intermediate' | 'bingo' | 'ddr';
