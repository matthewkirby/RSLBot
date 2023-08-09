import { ActivityType } from 'discord.js';
import { FatClient } from 'types/FatClient';
import loadSlashCommands from '../commands';
import { openDbConnection } from '../utils/dbInteraction';
import { Database as DatabaseType } from 'better-sqlite3';

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
      client.slashCommands.set(command.name, command);
    }

    // Open the database connection
    client.db = openDbConnection() as DatabaseType;

    client.application.fetch();
    console.log(`${client.user.username} is online`);
  });
};