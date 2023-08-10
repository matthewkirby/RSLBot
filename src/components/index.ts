import { basename, join } from 'path';
import { readdirSync } from 'fs';
import { ButtonBuilder, ButtonInteraction, Collection, StringSelectMenuBuilder, StringSelectMenuInteraction } from 'discord.js';
import { ButtonData } from "types/ButtonData";
import { FatClient } from 'types/FatClient';
import { getUserPermission } from '../utils/dbInteraction';
import { ButtonCollection, SelectMenuCollection } from 'types/commonTypes';
import { SelectMenuData } from 'types/SelectMenuData';

const errorButtonFileName = 'errorButton.ts';
const fileIgnoreList: string[] = [basename(__filename), errorButtonFileName];

// Build the actual button component
const buildButton = (data: ButtonData): ButtonBuilder => {
  const button = new ButtonBuilder()
    .setStyle(data.style)
    .setLabel(data.label);

  if ('url' in data) {
    if (data.url !== undefined)
      button.setURL(data.url);
  } else if ('execute' in data) {
    button.setCustomId(data.name);
  }

  return button;
};

export async function getErrorButton(): Promise<ButtonBuilder> {
  const {default: importObject} = await import(join(__dirname, errorButtonFileName));
  return buildButton(importObject.error);
};

export async function loadButtonLibrary(): Promise<ButtonCollection> {
  const buttonLibrary: ButtonCollection = new Collection();

  const fullFileList: string[] = readdirSync(__dirname);
  const fileList: string[] = fullFileList.filter(file => file.endsWith('.ts') && !fileIgnoreList.includes(file));

  for (const file of fileList) {
    const {default: importObject} = await import(join(__dirname, file));
    if (!("buttons" in importObject)) { continue; }
    const buttons: ButtonData[] = importObject.buttons;

    // For each button, build the message component
    for (const button of buttons) {
      button.button = buildButton(button);
      // If interaction button, inject permissions check into the execute
      if ('execute' in button) {
        const originalExecute = button.execute;
        button.execute = async (interaction: ButtonInteraction) => {
          const client = interaction.client as FatClient;
          const userPermission = getUserPermission(client.db, interaction.user);
          if (userPermission >= button.requiredPermission) {
            await originalExecute(interaction);
          } else {
            await interaction.reply('You do not have the required permissions to execute this command.');
          }
        }
      }
      buttonLibrary.set(button.name, button);
    }
  }

  return buttonLibrary;
};

export async function loadSelectMenus(): Promise<SelectMenuCollection> {
  const selectMenuLibrary: SelectMenuCollection = new Collection();

  const fullFileList: string[] = readdirSync(__dirname);
  const fileList: string[] = fullFileList.filter(file => file.endsWith('.ts') && !fileIgnoreList.includes(file));

  for (const file of fileList) {
    const {default: importObject} = await import(join(__dirname, file));
    if (!("selectMenus" in importObject)) { continue; }
    const selectMenus: SelectMenuData[] = importObject.selectMenus;

    // For each component, build the discord.js object
    for (const selectMenu of selectMenus) {
      selectMenu.componentObject = StringSelectMenuBuilder.from(selectMenu.data);
      const originalExecute = selectMenu.execute;

      selectMenu.execute = async (interaction: StringSelectMenuInteraction) => {
        const client = interaction.client as FatClient;
        const userPermission = getUserPermission(client.db, interaction.user);
        if (userPermission >= selectMenu.requiredPermission) {
          await originalExecute(interaction);
        } else {
          await interaction.reply('You do not have the required permissions to execute this command.');
        }
      }
      selectMenuLibrary.set(selectMenu.data.custom_id, selectMenu);
    }
  }

  return selectMenuLibrary;
};