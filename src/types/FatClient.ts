import { Client, ClientOptions, Collection } from 'discord.js';
import { Database as DatabaseType } from 'better-sqlite3';
import { ActionRowCollection, ButtonCollection, SelectMenuCollection, SlashCommandCollection } from './commonTypes';


export class FatClient extends Client {
  public slashCommands: SlashCommandCollection;
  public buttonLibrary: ButtonCollection;
  public selectMenuLibrary: SelectMenuCollection;
  public actionRows: ActionRowCollection;
  private _db: DatabaseType | undefined;

  constructor(options: ClientOptions) {
    super(options);
    this.slashCommands = new Collection();
    this.buttonLibrary = new Collection();
    this.selectMenuLibrary = new Collection();
    this.actionRows = new Collection();
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