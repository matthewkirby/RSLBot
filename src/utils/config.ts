import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { parseIntUndef } from './tools';
dotenv.config();

// Load the RSL and OoTR versions being used
const rslPath = join(__dirname, '../../plando-random-settings/rslversion.py');
if (!existsSync(rslPath)) {
  console.error('RSL script must be cloned in the bot directory.');
}
const rslVersionFileContents = readFileSync(rslPath, 'utf8');
const rslVersion = rslVersionFileContents.split('\n')[0].split('=')[1].trim().slice(1, -1);
const ootrVersion =  rslVersionFileContents.split('\n')[2].split('=')[1].trim().split(' R')[0].slice(1).trim();

interface AppConfig {
  clientToken: string,
  clientId: string,
  databasePath: string,
  ootrApiKey: string,
  season: number,
  rslVersion: string,
  ootrVersion: string,
  admin: string[],
  moderator: string[],
  organizer: string[],
  rankNumbers: number[]
};

export const config: AppConfig = {
  clientToken: process.env.CLIENT_TOKEN || '',
  clientId: process.env.CLIENT_ID || '',
  databasePath: process.env.RSL_DB_PATH || '',
  ootrApiKey: process.env.OOTR_API_KEY || '',
  season: 6,
  rslVersion: rslVersion,
  ootrVersion: ootrVersion,
  admin: ['xopar#0'],
  moderator: ['.cola#0', 'cubsrule21#0', 'emosoda#0', 'kirox#0', 'slyryd#0', 'timmy2405#0', 'trenter_tr#0'],
  organizer: [],
  rankNumbers: [
    parseIntUndef(process.env.RANK_ADMIN) || 4,
    parseIntUndef(process.env.RANK_MODERATOR) || 3,
    parseIntUndef(process.env.RANK_ORGANIZER) || 2,
    parseIntUndef(process.env.RANK_USER) || 1
  ]
};