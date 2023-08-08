import { FatClient } from './types/FatClient';
import ready from './listeners/ready';
import interactionCreate from './listeners/interactionCreate';
import messageCreate from './listeners/messageCreate';
import { config } from './utils/config';
import { GatewayIntentBits, Partials } from 'discord.js';

const client = new FatClient({
  intents: [GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

ready(client);
interactionCreate(client);
messageCreate(client);

client.login(config.clientToken);