import { Interaction, ChatInputCommandInteraction, ButtonInteraction, StringSelectMenuInteraction } from 'discord.js';
import { InteractionButtonData } from 'types/ButtonData';
import { FatClient } from 'types/FatClient';

export default (client: FatClient): void => {
  client.on('interactionCreate', async (interaction: Interaction) => {

    if (interaction.isChatInputCommand()) {
      await handleSlashCommand(interaction);
    } else if (interaction.isButton()) {
      await handleButton(interaction);
    } else if (interaction.isStringSelectMenu()) {
      await handleSelectMenu(interaction);
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

const handleButton = async (interaction: ButtonInteraction): Promise<void> => {
  const client = interaction.client as FatClient;
  const button = client.buttonLibrary.get(interaction.customId) as InteractionButtonData;

  if (button?.execute !== undefined) {
    await button.execute(interaction)
  } else {
    console.error(`No button matching ${interaction.customId} was found.`);
    interaction.update({content: `Button ${interaction.customId} not found.`, components: [] });
  }
};

const handleSelectMenu = async (interaction: StringSelectMenuInteraction): Promise<void> => {
  const client = interaction.client as FatClient;
  const selectMenu = client.selectMenuLibrary.get(interaction.customId);

  if (selectMenu?.execute !== undefined) {
    await selectMenu.execute(interaction)
  } else {
    console.error(`No select menu matching ${interaction.customId} was found.`);
    interaction.update({content: `Select menu ${interaction.customId} not found.`, components: [] });
  }
};