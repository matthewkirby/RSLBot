import { SlashCommand } from 'types/SlashCommand';

export const reset: SlashCommand = {
  name: 'reset',
  description: 'Restart RSLBot',
  requiredPermission: 4,
  async execute(interaction) {
    await interaction.reply('Restarting...');
    process.exit();
  },
};