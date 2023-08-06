import { REST, Routes, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import loadSlashCommands from './commands'
import config from './utils/config';

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(config.clientToken);

// Deploy
(async () => {
  const slashCommands = await loadSlashCommands();

  const jsonCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
  for (const command of slashCommands) {
    console.log(command);
    jsonCommands.push(command.data.toJSON())
  }

  console.log(`Started refreshing ${jsonCommands.length} application slash commands.`);

  // The put method is used to fully refresh all commands in the guild with the current set
  await rest.put(
    Routes.applicationCommands(config.clientId),
    { body: jsonCommands },
  );
})();
