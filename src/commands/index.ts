import { basename, join } from 'path';
import { readdirSync } from 'fs';
import { SlashCommand } from 'src/types/SlashCommand';

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
    if ('data' in command && 'execute' in command) {
      slashCommands.push(command as SlashCommand);
    } else {
      console.log(`WARNING command ${file} is missing data or execute property. Skipping...`)
    }

  }

  return slashCommands;
};

export default loadSlashCommands;