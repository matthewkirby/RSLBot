CREATE TABLE IF NOT EXISTS discord (
  userid TEXT PRIMARY KEY,        -- Snowflake user id
  username TEXT,                  -- user name
  discriminator TEXT,             -- discriminator
  permissions INTEGER DEFAULT 1,  -- permission level for RSLBot commands
  racetimeuserid TEXT            -- racetime.gg user id
);

CREATE TABLE IF NOT EXISTS seedlog (
  seedid TEXT PRIMARY KEY,      -- seed id returned by ootrandomizer.com api
  unlocked INTEGER DEFAULT 0,   -- 0 if log is locked, 1 if unlocked. Logs are locked unless specifically unlocked
  preset TEXT,                  -- RSL preset used to generate the seed
  rslversion TEXT,              -- Version of the RSL script used to generate the seed
  ootrversion TEXT,             -- Version of the randomizer used to generate the seed
  userid TEXT,                  -- Discord user who rolled the seed
  time DATETIME,                -- UTC ISO8601 datetime for when the seed was rolled
  status INTEGER,               -- Generation status for the seed
  FOREIGN KEY (userid) REFERENCES discord (userid)  -- Foreign key constraint
);