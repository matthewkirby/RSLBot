import * as dotenv from 'dotenv';
dotenv.config();

interface AppConfig {
  clientToken: string,
  clientId: string,
  ootrApiKey: string,
}

const config: AppConfig = {
  clientToken: process.env.CLIENT_TOKEN || '',
  clientId: process.env.CLIENT_ID || '',
  ootrApiKey: process.env.OOTR_API_KEY || ''
}

export default config;