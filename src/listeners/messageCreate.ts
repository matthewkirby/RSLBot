import { Message } from 'discord.js';
import { FatClient } from 'types/FatClient';

export default (client: FatClient): void => {
  client.on('messageCreate', async (message: Message) => {
    if (message.author.bot) { return; }

    console.log(message);
  });
};

//   // Parse generic message and send button options
//   const row = new ActionRowBuilder()
//       .addComponents(
//           rsl_seasonal_button,
//           new ButtonBuilder()
//               .setCustomId('view_presets')
//               .setLabel('View Presets')
//               .setStyle(ButtonStyle.Secondary)
//       )

//   msg.author.send({
//       content: "Click a button below to see what I can do!",
//       components: [row]
//   });
// }