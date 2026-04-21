CREATE TABLE IF NOT EXISTS DRI_configs (
  discord_id TEXT PRIMARY KEY,
  include_self BOOLEAN NOT NULL DEFAULT FALSE,
  bounce BOOLEAN NOT NULL DEFAULT FALSE,
  gap_percentage INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS DRI_images (
  discord_id TEXT PRIMARY KEY,
  filename TEXT NOT NULL DEFAULT '',
  inactive TEXT,
  speaking TEXT
);

CREATE TABLE IF NOT EXISTS DRI_overrides (
  broadcaster_discord_id TEXT NOT NULL,
  guest_discord_id TEXT NOT NULL,
  inactive TEXT,
  speaking TEXT,
  PRIMARY KEY (broadcaster_discord_id, guest_discord_id)
);
