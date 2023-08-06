import { FatClient } from './types/FatClient';
import ready from './listeners/ready';
import interactionCreate from './listeners/interactionCreate';
import config from './utils/config';

const client = new FatClient({
  intents: []
});

ready(client);
interactionCreate(client);

client.login(config.clientToken);