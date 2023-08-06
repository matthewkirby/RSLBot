import { ActivityType } from 'discord.js';
import { FatClient } from 'src/types/FatClient';
import loadSlashCommands from '../commands';

export default (client: FatClient): void => {
  client.on('ready', async () => {
    if (!client.user || !client.application) {
      return;
    }

    // Set "Now Playing" activity field
    client.user.setActivity({ name: 'DM me for a seed!', type: ActivityType.Playing });

    // Load the list of slash commands
    const slashCommands = await loadSlashCommands();
    for (const command of slashCommands) {
      client.slashCommands.set(command.data.name, command);
    }

    console.log(`${client.user.username} is online`);
  });
};