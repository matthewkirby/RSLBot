import { SlashCommand } from 'types/SlashCommand';
import { getUserPermission } from '../utils/dbInteraction';
import { FatClient } from 'types/FatClient';
import { bold } from 'discord.js';

const levelNames = ['user', 'organizer', 'moderator', 'admin'];

export const userlevel: SlashCommand = {
  name: 'userlevel',
  description:'Returns your internal permission level with RSLBot.',
  requiredPermission: 1,
  async execute(interaction) {
    const client = interaction.client as FatClient;
    const permissions = getUserPermission(client.db, interaction.user);
    await interaction.reply(`You have permission level ${bold(levelNames[permissions-1])}.`);
  },
};