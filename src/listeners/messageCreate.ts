import { Message } from 'discord.js';
import { FatClient } from 'types/FatClient';

export default (client: FatClient): void => {
  client.on('messageCreate', async (message: Message) => {
    if (message.author.bot) { return; }

    console.log(message);
  });
};