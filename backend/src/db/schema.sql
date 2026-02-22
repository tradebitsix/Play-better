CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY,
  mode TEXT NOT NULL CHECK (mode IN ('digital','live')),
  venue_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tournament_players (
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  slot INT NOT NULL,
  PRIMARY KEY (tournament_id, player_id),
  UNIQUE(tournament_id, slot)
);

CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round INT NOT NULL,
  slot INT NOT NULL,
  player_a UUID REFERENCES players(id),
  player_b UUID REFERENCES players(id),
  winner_player_id UUID REFERENCES players(id),
  table_number INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, round, slot)
);

CREATE TABLE IF NOT EXISTS pings (
  id UUID PRIMARY KEY,
  to_player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  from_player_id UUID REFERENCES players(id),
  sound TEXT NOT NULL DEFAULT 'default',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
