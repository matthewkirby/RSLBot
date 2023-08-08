import { Interaction, ChatInputCommandInteraction } from 'discord.js';
import { FatClient } from 'types/FatClient';

export default (client: FatClient): void => {
  client.on('interactionCreate', async (interaction: Interaction) => {
    // console.log(interaction);

    if (interaction.isChatInputCommand()) {
      await handleSlashCommand(interaction);
    // } else if (interaction.isButton()) {
    //   await handleButton(client, interaction);
    }

    return;
  });
};

const handleSlashCommand = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  const client = interaction.client as FatClient;
  const slashCommand = client.slashCommands.get(interaction.commandName);

  if (!slashCommand) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    interaction.reply(`Command ${interaction.commandName} not found.`);
    return;
  }

  await slashCommand.execute(interaction);
};