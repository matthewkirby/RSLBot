import { readFileSync } from 'fs';
import Database, { Database as DatabaseType } from 'better-sqlite3';
import { config } from './config';
import { User } from 'discord.js';

const initializeDatabase = (db: DatabaseType) => {
  // Create the tables if they don't already exist
  const schemaContent = readFileSync('schema/createDiscord.sql', 'utf8');
  db.exec(schemaContent);

  // Insert admin into the table
  const queryContent = readFileSync('schema/insertAdmin.sql', 'utf8');
  const addAdmin = db.prepare(queryContent);
  addAdmin.run(config.rankNumbers[0]);
};

export const openDbConnection = (): DatabaseType => {
  const db = new Database(config.databasePath);
  initializeDatabase(db);
  return db;
};

export const getUserPermission = (db: DatabaseType, user: User): number => {
  const selectQuery = db.prepare('SELECT userid, permissions FROM discord WHERE userid=?');
  const res = selectQuery.get(user.id) as {userid: string, permissions: number};
  return res.permissions;
};