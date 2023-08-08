import { FatClient } from './types/FatClient';
import { ready, interactionCreate, messageCreate } from './listeners';
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