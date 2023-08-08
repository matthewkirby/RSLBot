import { User } from 'discord.js';

export const getUniqueUserName = (user: User): string => {
  return `${user.username}#${user.discriminator}`;
}