import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from 'src/types/SlashCommand';

const goodbye: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('goodbye')
    .setDescription('Says goodbye'),
  async execute(interaction) {
    await interaction.reply('Good bye <3');
  },
};

export { goodbye };