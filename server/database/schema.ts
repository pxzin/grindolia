/**
 * SQLite Database Schema Definition
 * Based on data-model.md specifications
 */

export const createTablesSQL = `
-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Enable WAL mode for concurrent reads
PRAGMA journal_mode = WAL;

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  last_login_at INTEGER,
  is_active INTEGER NOT NULL DEFAULT 1,
  preferred_locale TEXT NOT NULL DEFAULT 'en'
);

-- Character classes
CREATE TABLE IF NOT EXISTS character_classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  base_stats TEXT NOT NULL,
  stat_growth TEXT NOT NULL,
  starting_equipment TEXT NOT NULL
);

-- Characters
CREATE TABLE IF NOT EXISTS characters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL,
  class_id INTEGER NOT NULL,
  name TEXT NOT NULL UNIQUE,
  level INTEGER NOT NULL DEFAULT 1,
  experience INTEGER NOT NULL DEFAULT 0,
  experience_to_next_level INTEGER NOT NULL,
  current_hp INTEGER NOT NULL,
  max_hp INTEGER NOT NULL,
  strength INTEGER NOT NULL,
  intelligence INTEGER NOT NULL,
  dexterity INTEGER NOT NULL,
  vitality INTEGER NOT NULL,
  currency INTEGER NOT NULL DEFAULT 0,
  appearance TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  last_played_at INTEGER,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES character_classes(id)
);

-- Zones
CREATE TABLE IF NOT EXISTS zones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  min_level INTEGER NOT NULL DEFAULT 1,
  max_level INTEGER NOT NULL,
  theme TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Quest templates
CREATE TABLE IF NOT EXISTS quest_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  min_level INTEGER NOT NULL DEFAULT 1,
  max_level INTEGER,
  objectives TEXT NOT NULL,
  rewards TEXT NOT NULL,
  zone_id INTEGER NOT NULL,
  prerequisite_quest_id INTEGER,
  is_repeatable INTEGER NOT NULL DEFAULT 0,
  cooldown_hours INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (zone_id) REFERENCES zones(id),
  FOREIGN KEY (prerequisite_quest_id) REFERENCES quest_templates(id)
);

-- Character quests
CREATE TABLE IF NOT EXISTS character_quests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id INTEGER NOT NULL,
  quest_template_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  progress TEXT NOT NULL,
  started_at INTEGER NOT NULL DEFAULT (unixepoch()),
  completed_at INTEGER,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
  FOREIGN KEY (quest_template_id) REFERENCES quest_templates(id)
);

-- Item templates
CREATE TABLE IF NOT EXISTS item_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  rarity TEXT NOT NULL,
  level_requirement INTEGER NOT NULL DEFAULT 1,
  stats TEXT,
  effects TEXT,
  max_stack INTEGER NOT NULL DEFAULT 1,
  icon_path TEXT
);

-- Inventory items
CREATE TABLE IF NOT EXISTS inventory_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id INTEGER NOT NULL,
  item_template_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  equipped INTEGER NOT NULL DEFAULT 0,
  acquired_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
  FOREIGN KEY (item_template_id) REFERENCES item_templates(id)
);

-- Arena records
CREATE TABLE IF NOT EXISTS arena_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id INTEGER NOT NULL UNIQUE,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  current_rating INTEGER NOT NULL DEFAULT 1000,
  best_rating INTEGER NOT NULL DEFAULT 1000,
  win_streak INTEGER NOT NULL DEFAULT 0,
  best_win_streak INTEGER NOT NULL DEFAULT 0,
  last_combat_at INTEGER,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

-- Combat instances
CREATE TABLE IF NOT EXISTS combat_instances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attacker_id INTEGER NOT NULL,
  defender_id INTEGER NOT NULL,
  winner_id INTEGER NOT NULL,
  combat_log TEXT NOT NULL,
  rewards TEXT NOT NULL,
  rating_change_attacker INTEGER NOT NULL,
  rating_change_defender INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  duration_ms INTEGER NOT NULL,
  FOREIGN KEY (attacker_id) REFERENCES characters(id),
  FOREIGN KEY (defender_id) REFERENCES characters(id),
  FOREIGN KEY (winner_id) REFERENCES characters(id)
);

-- Auction listings
CREATE TABLE IF NOT EXISTS auction_listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seller_id INTEGER NOT NULL,
  item_template_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_per_unit INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  buyer_id INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  expires_at INTEGER NOT NULL,
  sold_at INTEGER,
  FOREIGN KEY (seller_id) REFERENCES characters(id) ON DELETE CASCADE,
  FOREIGN KEY (item_template_id) REFERENCES item_templates(id),
  FOREIGN KEY (buyer_id) REFERENCES characters(id)
);

-- Abilities
CREATE TABLE IF NOT EXISTS abilities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  class_id INTEGER NOT NULL,
  level_requirement INTEGER NOT NULL DEFAULT 1,
  effects TEXT NOT NULL,
  icon_path TEXT,
  FOREIGN KEY (class_id) REFERENCES character_classes(id)
);

-- Character abilities
CREATE TABLE IF NOT EXISTS character_abilities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id INTEGER NOT NULL,
  ability_id INTEGER NOT NULL,
  unlocked_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
  FOREIGN KEY (ability_id) REFERENCES abilities(id)
);

-- Dungeons
CREATE TABLE IF NOT EXISTS dungeons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  min_level INTEGER NOT NULL DEFAULT 1,
  max_floors INTEGER NOT NULL,
  theme TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Dungeon floors
CREATE TABLE IF NOT EXISTS dungeon_floors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dungeon_id INTEGER NOT NULL,
  floor_number INTEGER NOT NULL,
  difficulty_multiplier REAL NOT NULL DEFAULT 1.0,
  monster_count INTEGER NOT NULL DEFAULT 3,
  boss_monster_id INTEGER,
  loot_table TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (dungeon_id) REFERENCES dungeons(id) ON DELETE CASCADE,
  UNIQUE(dungeon_id, floor_number)
);

-- Monsters
CREATE TABLE IF NOT EXISTS monsters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  base_level INTEGER NOT NULL DEFAULT 1,
  base_hp INTEGER NOT NULL,
  base_strength INTEGER NOT NULL,
  base_intelligence INTEGER NOT NULL,
  base_dexterity INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL,
  currency_reward INTEGER NOT NULL,
  loot_table TEXT,
  monster_type TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Dungeon progress (character's current dungeon run)
CREATE TABLE IF NOT EXISTS dungeon_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id INTEGER NOT NULL,
  dungeon_id INTEGER NOT NULL,
  current_floor INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  monsters_defeated INTEGER NOT NULL DEFAULT 0,
  loot_collected TEXT NOT NULL,
  started_at INTEGER NOT NULL DEFAULT (unixepoch()),
  completed_at INTEGER,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
  FOREIGN KEY (dungeon_id) REFERENCES dungeons(id)
);

-- Dungeon combat instances
CREATE TABLE IF NOT EXISTS dungeon_combat_instances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id INTEGER NOT NULL,
  monster_id INTEGER NOT NULL,
  dungeon_progress_id INTEGER NOT NULL,
  floor_number INTEGER NOT NULL,
  character_hp_before INTEGER NOT NULL,
  character_hp_after INTEGER NOT NULL,
  monster_level INTEGER NOT NULL,
  monster_hp INTEGER NOT NULL,
  winner TEXT NOT NULL,
  combat_log TEXT NOT NULL,
  rewards TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  duration_ms INTEGER NOT NULL,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
  FOREIGN KEY (monster_id) REFERENCES monsters(id),
  FOREIGN KEY (dungeon_progress_id) REFERENCES dungeon_progress(id) ON DELETE CASCADE
);
`;

export const createIndexesSQL = `
-- Players indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_players_email ON players(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_players_username ON players(username);

-- Characters indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_characters_name ON characters(name);
CREATE INDEX IF NOT EXISTS idx_characters_player_id ON characters(player_id);
CREATE INDEX IF NOT EXISTS idx_characters_level ON characters(level);

-- Quest templates indexes
CREATE INDEX IF NOT EXISTS idx_quest_templates_zone_id ON quest_templates(zone_id);
CREATE INDEX IF NOT EXISTS idx_quest_templates_min_level ON quest_templates(min_level);

-- Character quests indexes
CREATE INDEX IF NOT EXISTS idx_character_quests_character_id ON character_quests(character_id);
CREATE INDEX IF NOT EXISTS idx_character_quests_status ON character_quests(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_character_quests_unique_active
  ON character_quests(character_id, quest_template_id)
  WHERE status = 'active';

-- Item templates indexes
CREATE INDEX IF NOT EXISTS idx_item_templates_type ON item_templates(type);
CREATE INDEX IF NOT EXISTS idx_item_templates_rarity ON item_templates(rarity);

-- Inventory items indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_character_id ON inventory_items(character_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_equipped ON inventory_items(character_id, equipped);

-- Arena records indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_arena_records_character_id ON arena_records(character_id);
CREATE INDEX IF NOT EXISTS idx_arena_records_rating ON arena_records(current_rating DESC);

-- Combat instances indexes
CREATE INDEX IF NOT EXISTS idx_combat_instances_attacker_id ON combat_instances(attacker_id);
CREATE INDEX IF NOT EXISTS idx_combat_instances_defender_id ON combat_instances(defender_id);
CREATE INDEX IF NOT EXISTS idx_combat_instances_created_at ON combat_instances(created_at DESC);

-- Auction listings indexes
CREATE INDEX IF NOT EXISTS idx_auction_listings_status ON auction_listings(status);
CREATE INDEX IF NOT EXISTS idx_auction_listings_item_template_id ON auction_listings(item_template_id);
CREATE INDEX IF NOT EXISTS idx_auction_listings_expires_at ON auction_listings(expires_at);
CREATE INDEX IF NOT EXISTS idx_auction_listings_seller_id ON auction_listings(seller_id);

-- Abilities indexes
CREATE INDEX IF NOT EXISTS idx_abilities_class_id ON abilities(class_id);
CREATE INDEX IF NOT EXISTS idx_abilities_level_requirement ON abilities(level_requirement);

-- Character abilities indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_character_abilities_unique
  ON character_abilities(character_id, ability_id);

-- Dungeon indexes
CREATE INDEX IF NOT EXISTS idx_dungeons_min_level ON dungeons(min_level);

-- Dungeon floors indexes
CREATE INDEX IF NOT EXISTS idx_dungeon_floors_dungeon_id ON dungeon_floors(dungeon_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_dungeon_floors_unique ON dungeon_floors(dungeon_id, floor_number);

-- Monsters indexes
CREATE INDEX IF NOT EXISTS idx_monsters_type ON monsters(monster_type);
CREATE INDEX IF NOT EXISTS idx_monsters_level ON monsters(base_level);

-- Dungeon progress indexes
CREATE INDEX IF NOT EXISTS idx_dungeon_progress_character_id ON dungeon_progress(character_id);
CREATE INDEX IF NOT EXISTS idx_dungeon_progress_status ON dungeon_progress(status);
CREATE INDEX IF NOT EXISTS idx_dungeon_progress_active
  ON dungeon_progress(character_id, status)
  WHERE status = 'active';

-- Dungeon combat instances indexes
CREATE INDEX IF NOT EXISTS idx_dungeon_combat_character_id ON dungeon_combat_instances(character_id);
CREATE INDEX IF NOT EXISTS idx_dungeon_combat_progress_id ON dungeon_combat_instances(dungeon_progress_id);
CREATE INDEX IF NOT EXISTS idx_dungeon_combat_created_at ON dungeon_combat_instances(created_at DESC);
`;
