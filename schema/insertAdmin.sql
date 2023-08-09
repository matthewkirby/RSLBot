-- Insert myself as an admin into the table
INSERT OR REPLACE INTO discord (userid, username, discriminator, permissions)
  VALUES ('187048694539878401', 'xopar', '0', ?);