import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from 'src/types/SlashCommand';

const hello: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('hello')
    .setDescription('Returns a greeting'),
  async execute(interaction) {
    await interaction.reply('Hello there!');
  },
};

export { hello };