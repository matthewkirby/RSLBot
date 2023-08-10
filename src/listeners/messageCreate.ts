import { ChannelType, Message } from 'discord.js';
import { FatClient } from 'types/FatClient';

export default (client: FatClient): void => {
  client.on('messageCreate', async (message: Message) => {
    if (message.author.bot) { return; }
    if (message.channel.type !== ChannelType.DM) { return; }

    const client = message.client as FatClient;
    const row = client.actionRows.get('messageCreate');

    if (row !== undefined) {
      message.author.send({ components: [row] });
    }

  });
};