import { Client, ClientOptions, Collection } from 'discord.js';
import { SlashCommand } from './SlashCommand';
import { Database as DatabaseType } from 'better-sqlite3';


export class FatClient extends Client {
  public slashCommands: Collection<string, SlashCommand>;
  private _db: DatabaseType | undefined;

  constructor(options: ClientOptions) {
    super(options);
    this.slashCommands = new Collection();
  };

  get db(): DatabaseType {
    if (this._db === undefined)
      console.error('Attempting to access db without initializing it.');
    return this._db as DatabaseType;
  }

  set db(newDb: DatabaseType) {
    this._db = newDb;
  }
}