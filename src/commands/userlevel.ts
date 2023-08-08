import { SlashCommand } from 'types/SlashCommand';
import { getUserPermissions } from '../utils/config';
import { getUniqueUserName } from '../utils/tools';

const levelNames = ['user', 'organizer', 'moderator', 'admin'];

export const userlevel: SlashCommand = {
  name: 'userlevel',
  description:'Returns your internal permission level with RSLBot.',
  requiredPermission: 1,
  async execute(interaction) {
    const username = getUniqueUserName(interaction.user);
    const userLevel = getUserPermissions(username);
    await interaction.reply(`You have permission level **${levelNames[userLevel-1]}**.`);
  },
};