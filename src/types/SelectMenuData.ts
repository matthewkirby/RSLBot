import {  APIStringSelectComponent, StringSelectMenuBuilder, StringSelectMenuInteraction } from "discord.js";

export interface SelectMenuData {
  requiredPermission: 1 | 2 | 3 | 4;
  execute: (interaction: StringSelectMenuInteraction) => Promise<void>;
  data: APIStringSelectComponent;
  componentObject?: StringSelectMenuBuilder;
};