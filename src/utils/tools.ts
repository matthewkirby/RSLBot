import { User } from 'discord.js';

export const getUniqueUserName = (user: User): string => {
  return `${user.username}#${user.discriminator}`;
};

export const parseIntUndef = (str: string | undefined): number | undefined => {
  return str === undefined ? undefined : parseInt(str);
};