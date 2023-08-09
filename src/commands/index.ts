import { basename, join } from 'path';
import { readdirSync } from 'fs';
import { SlashCommand } from 'types/SlashCommand';
import { ChatInputCommandInteraction } from 'discord.js';
import { FatClient } from 'types/FatClient';
import { getUserPermission } from '../utils/dbInteraction';

async function loadSlashCommands(): Promise<SlashCommand[]> {
  const slashCommands: SlashCommand[] = [];

  const fullFileList: string[] = readdirSync(__dirname);
  const fileList: string[] = fullFileList.filter(file => file.endsWith('.ts') && file !== basename(__filename));

  for (const file of fileList) {
    const {default: commandObject} = await import(join(__dirname, file));
    const commandObjectValues = Object.values(commandObject);

    if (commandObjectValues.length > 1) {
      console.log(`WARNING: More than 1 export from ${file}! Skipping...`)
      continue;
    }

    const command = commandObjectValues[0] as SlashCommand;
    if ('name' in command && 'execute' in command) {
      const originalExecute = command.execute;

      // Replace the execute function with one that checks permissions first.
      command.execute = async (interaction: ChatInputCommandInteraction) => {
        const client = interaction.client as FatClient;
        const userPermission = getUserPermission(client.db, interaction.user);
        if (userPermission >= command.requiredPermission) {
          await originalExecute(interaction);
        } else {
          await interaction.reply('You do not have the required permissions to execute this command.');
        }
      };

      slashCommands.push(command as SlashCommand);
    } else {
      console.log(`WARNING command ${file} is missing data or execute property. Skipping...`)
    }

  }

  return slashCommands;
};

export default loadSlashCommands;