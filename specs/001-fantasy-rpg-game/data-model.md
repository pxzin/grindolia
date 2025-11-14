# Data Model: Fantasy RPG Multiplayer Game

**Feature**: Fantasy RPG Multiplayer Game
**Branch**: `001-fantasy-rpg-game`
**Date**: 2025-11-13
**Purpose**: Define the data entities, relationships, validation rules, and state transitions for the game

## Overview

This document defines the data model for a web-based multiplayer RPG game. The model supports:
- Player accounts and multiple characters per player
- Character progression (levels, stats, abilities)
- Quest system with narrative progression
- Inventory and equipment management
- Idle arena combat with rankings
- Player-to-player auction house
- Real-time leaderboards across multiple metrics

**Storage**: SQLite (primary persistence) + Redis (WebSocket sessions, leaderboards cache)

## Entity Relationship Diagram

```
┌─────────┐          ┌─────────────┐         ┌──────────┐
│ Player  │ 1 ────▶ n│  Character  │ 1 ────▶ n│ Quest    │
│         │          │             │          │ Progress │
└─────────┘          └─────────────┘          └──────────┘
                            │                       │
                            │ 1                     │ n
                            │                       │
                            ▼ n                     ▼ 1
                      ┌──────────┐            ┌──────────┐
                      │ Inventory│            │  Quest   │
                      │   Item   │            │ Template │
                      └──────────┘            └──────────┘
                            │ n
                            │
                            ▼ 1
                      ┌──────────┐
                      │   Item   │
                      │ Template │
                      └──────────┘

┌─────────────┐ 1 ────▶ 1 ┌──────────────┐
│  Character  │           │ Arena Record │
│             │           │              │
└─────────────┘           └──────────────┘
       │ seller                   │ 1
       │ 1                        │
       ▼ n                        ▼ n
┌─────────────┐           ┌──────────────┐
│   Auction   │           │    Combat    │
│   Listing   │           │   Instance   │
└─────────────┘           └──────────────┘
       │ buyer n
       └──────────▶ Character
```

## Entities

### 1. Player (User Account)

Represents a user account that can own multiple characters.

**Table**: `players`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique player identifier |
| `email` | TEXT | NOT NULL, UNIQUE | Player's email address (for login) |
| `password_hash` | TEXT | NOT NULL | Bcrypt hashed password |
| `username` | TEXT | NOT NULL, UNIQUE | Display name |
| `created_at` | INTEGER | NOT NULL, DEFAULT (unixepoch()) | Account creation timestamp (Unix epoch) |
| `last_login_at` | INTEGER | NULL | Last login timestamp |
| `is_active` | INTEGER | NOT NULL, DEFAULT 1 | Account status (1 = active, 0 = banned) |
| `preferred_locale` | TEXT | NOT NULL, DEFAULT 'en' | User's preferred language (en, pt-BR, es, ru, zh, ja, ko) |

**Validation Rules**:
- Email: Valid email format, max 255 characters
- Password: Min 8 characters, must contain uppercase, lowercase, number
- Username: 3-20 characters, alphanumeric + underscore
- Preferred locale: Must be one of: 'en', 'pt-BR', 'es', 'ru', 'zh', 'ja', 'ko'

**Indexes**:
```sql
CREATE UNIQUE INDEX idx_players_email ON players(email);
CREATE UNIQUE INDEX idx_players_username ON players(username);
```

---

### 2. Character Class

Defines character archetypes with unique abilities and stat growth.

**Table**: `character_classes`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique class identifier |
| `name` | TEXT | NOT NULL, UNIQUE | Class name (e.g., "Warrior", "Mage", "Rogue") |
| `description` | TEXT | NOT NULL | Class lore and gameplay style |
| `base_stats` | TEXT | NOT NULL | JSON: `{ hp: 100, strength: 10, intelligence: 5, ... }` |
| `stat_growth` | TEXT | NOT NULL | JSON: `{ hp_per_level: 10, strength_per_level: 2, ... }` |
| `starting_equipment` | TEXT | NOT NULL | JSON array of item template IDs |

**Validation Rules**:
- Name: 3-30 characters, unique
- base_stats/stat_growth: Valid JSON with required fields (hp, strength, intelligence, dexterity, vitality)

**Seed Data**:
- Warrior: High HP/strength, low intelligence
- Mage: High intelligence, low HP/strength
- Rogue: High dexterity, moderate stats

---

### 3. Character

Represents a player's in-game avatar.

**Table**: `characters`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique character identifier |
| `player_id` | INTEGER | NOT NULL, FOREIGN KEY → players(id) ON DELETE CASCADE | Owner |
| `class_id` | INTEGER | NOT NULL, FOREIGN KEY → character_classes(id) | Character class |
| `name` | TEXT | NOT NULL, UNIQUE | Character name (unique across all players) |
| `level` | INTEGER | NOT NULL, DEFAULT 1 | Current level (1-20+) |
| `experience` | INTEGER | NOT NULL, DEFAULT 0 | Current XP |
| `experience_to_next_level` | INTEGER | NOT NULL | XP needed for next level |
| `current_hp` | INTEGER | NOT NULL | Current hit points |
| `max_hp` | INTEGER | NOT NULL | Maximum hit points |
| `strength` | INTEGER | NOT NULL | Strength stat |
| `intelligence` | INTEGER | NOT NULL | Intelligence stat |
| `dexterity` | INTEGER | NOT NULL | Dexterity stat |
| `vitality` | INTEGER | NOT NULL | Vitality stat |
| `currency` | INTEGER | NOT NULL, DEFAULT 0 | In-game gold |
| `appearance` | TEXT | NOT NULL | JSON: `{ skin_tone, hair_color, face, ... }` |
| `created_at` | INTEGER | NOT NULL, DEFAULT (unixepoch()) | Character creation timestamp |
| `last_played_at` | INTEGER | NULL | Last activity timestamp |

**Validation Rules**:
- Name: 3-20 characters, alphanumeric + spaces, unique globally
- Level: 1-999
- Experience: >= 0
- Stats: >= 1
- Currency: >= 0
- Appearance: Valid JSON

**Computed Fields** (application-level, not stored):
- `combat_power`: Calculated from stats + equipped items
- `next_level_progress`: `(experience / experience_to_next_level) * 100`

**Indexes**:
```sql
CREATE UNIQUE INDEX idx_characters_name ON characters(name);
CREATE INDEX idx_characters_player_id ON characters(player_id);
CREATE INDEX idx_characters_level ON characters(level);
```

**State Transitions**:
```
CREATED → ACTIVE (after first quest)
ACTIVE → ACTIVE (normal gameplay loop)
ACTIVE → DELETED (soft delete, player request)
```

---

### 4. Quest Template

Defines reusable quest blueprints.

**Table**: `quest_templates`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique quest template identifier |
| `title` | TEXT | NOT NULL | Quest title |
| `description` | TEXT | NOT NULL | Quest narrative text (humorous isekai-style) |
| `min_level` | INTEGER | NOT NULL, DEFAULT 1 | Minimum character level required |
| `max_level` | INTEGER | NULL | Recommended max level (for scaling) |
| `objectives` | TEXT | NOT NULL | JSON array: `[{ type: "kill", target: "goblin", count: 5 }, ...]` |
| `rewards` | TEXT | NOT NULL | JSON: `{ xp: 100, currency: 50, items: [itemId1, itemId2] }` |
| `zone_id` | INTEGER | NOT NULL | Zone where quest is available |
| `prerequisite_quest_id` | INTEGER | NULL, FOREIGN KEY → quest_templates(id) | Required previous quest |

**Validation Rules**:
- Title: 5-100 characters
- Min level: 1-999
- Objectives: Valid JSON array with at least one objective
- Rewards: Valid JSON with xp and currency fields

**Indexes**:
```sql
CREATE INDEX idx_quest_templates_zone_id ON quest_templates(zone_id);
CREATE INDEX idx_quest_templates_min_level ON quest_templates(min_level);
```

---

### 5. Quest Progress (Character-specific instance)

Tracks a character's progress on a quest.

**Table**: `character_quests`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique progress identifier |
| `character_id` | INTEGER | NOT NULL, FOREIGN KEY → characters(id) ON DELETE CASCADE | Character |
| `quest_template_id` | INTEGER | NOT NULL, FOREIGN KEY → quest_templates(id) | Quest being tracked |
| `status` | TEXT | NOT NULL, DEFAULT 'active' | 'active', 'completed', 'failed' |
| `progress` | TEXT | NOT NULL | JSON: `{ "kill_goblin": 3, ... }` (objective progress) |
| `started_at` | INTEGER | NOT NULL, DEFAULT (unixepoch()) | Quest start timestamp |
| `completed_at` | INTEGER | NULL | Quest completion timestamp |

**Validation Rules**:
- Character can only have one active instance of each quest template
- Progress keys must match quest template objectives

**Indexes**:
```sql
CREATE INDEX idx_character_quests_character_id ON character_quests(character_id);
CREATE INDEX idx_character_quests_status ON character_quests(status);
CREATE UNIQUE INDEX idx_character_quests_unique_active
  ON character_quests(character_id, quest_template_id)
  WHERE status = 'active';
```

**State Transitions**:
```
active → completed (objectives met, rewards claimed)
active → failed (abandoned by player or timeout)
```

---

### 6. Item Template

Defines reusable item blueprints.

**Table**: `item_templates`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique item template identifier |
| `name` | TEXT | NOT NULL | Item name |
| `description` | TEXT | NOT NULL | Item flavor text |
| `type` | TEXT | NOT NULL | 'weapon', 'armor', 'accessory', 'consumable', 'material' |
| `rarity` | TEXT | NOT NULL | 'common', 'uncommon', 'rare', 'epic', 'legendary' |
| `level_requirement` | INTEGER | NOT NULL, DEFAULT 1 | Minimum level to equip/use |
| `stats` | TEXT | NULL | JSON: `{ strength: +5, hp: +20, ... }` (equipment only) |
| `effects` | TEXT | NULL | JSON: consumable effects (e.g., `{ heal_hp: 50 }`) |
| `max_stack` | INTEGER | NOT NULL, DEFAULT 1 | Max stack size (1 for equipment, 99 for consumables) |
| `icon_path` | TEXT | NULL | Path to item icon image |

**Validation Rules**:
- Name: 3-50 characters
- Type: Must be one of defined types
- Rarity: Must be one of defined rarities
- Level requirement: 1-999
- Stats/effects: Valid JSON if present

**Indexes**:
```sql
CREATE INDEX idx_item_templates_type ON item_templates(type);
CREATE INDEX idx_item_templates_rarity ON item_templates(rarity);
```

---

### 7. Inventory Item (Character-specific instance)

Character's inventory item instance.

**Table**: `inventory_items`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique inventory item identifier |
| `character_id` | INTEGER | NOT NULL, FOREIGN KEY → characters(id) ON DELETE CASCADE | Owner |
| `item_template_id` | INTEGER | NOT NULL, FOREIGN KEY → item_templates(id) | Item type |
| `quantity` | INTEGER | NOT NULL, DEFAULT 1 | Stack size |
| `equipped` | INTEGER | NOT NULL, DEFAULT 0 | Is equipped (1 = yes, 0 = no) |
| `acquired_at` | INTEGER | NOT NULL, DEFAULT (unixepoch()) | Acquisition timestamp |

**Validation Rules**:
- Quantity: 1 to item_template.max_stack
- Character can only equip one item per equipment slot (enforced in application logic)

**Indexes**:
```sql
CREATE INDEX idx_inventory_items_character_id ON inventory_items(character_id);
CREATE INDEX idx_inventory_items_equipped ON inventory_items(character_id, equipped);
```

---

### 8. Arena Record

Tracks a character's arena combat statistics.

**Table**: `arena_records`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique record identifier |
| `character_id` | INTEGER | NOT NULL, UNIQUE, FOREIGN KEY → characters(id) ON DELETE CASCADE | Character |
| `wins` | INTEGER | NOT NULL, DEFAULT 0 | Total arena wins |
| `losses` | INTEGER | NOT NULL, DEFAULT 0 | Total arena losses |
| `current_rating` | INTEGER | NOT NULL, DEFAULT 1000 | ELO-style rating |
| `best_rating` | INTEGER | NOT NULL, DEFAULT 1000 | All-time best rating |
| `win_streak` | INTEGER | NOT NULL, DEFAULT 0 | Current win streak |
| `best_win_streak` | INTEGER | NOT NULL, DEFAULT 0 | Best win streak |
| `last_combat_at` | INTEGER | NULL | Last arena combat timestamp |

**Validation Rules**:
- Wins, losses: >= 0
- Rating: 0-9999
- Win streak: >= 0

**Indexes**:
```sql
CREATE UNIQUE INDEX idx_arena_records_character_id ON arena_records(character_id);
CREATE INDEX idx_arena_records_rating ON arena_records(current_rating DESC);
```

---

### 9. Combat Instance

Records a single arena battle.

**Table**: `combat_instances`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique combat identifier |
| `attacker_id` | INTEGER | NOT NULL, FOREIGN KEY → characters(id) | Initiating character |
| `defender_id` | INTEGER | NOT NULL, FOREIGN KEY → characters(id) | Opponent character |
| `winner_id` | INTEGER | NOT NULL, FOREIGN KEY → characters(id) | Winner |
| `combat_log` | TEXT | NOT NULL | JSON array of combat actions |
| `rewards` | TEXT | NOT NULL | JSON: `{ xp: 50, currency: 25 }` |
| `rating_change_attacker` | INTEGER | NOT NULL | ELO change for attacker |
| `rating_change_defender` | INTEGER | NOT NULL | ELO change for defender |
| `created_at` | INTEGER | NOT NULL, DEFAULT (unixepoch()) | Combat timestamp |
| `duration_ms` | INTEGER | NOT NULL | Combat duration in milliseconds |

**Validation Rules**:
- Attacker and defender must be different characters
- Winner must be either attacker or defender
- Duration: 1-120000 ms (1-120 seconds)

**Indexes**:
```sql
CREATE INDEX idx_combat_instances_attacker_id ON combat_instances(attacker_id);
CREATE INDEX idx_combat_instances_defender_id ON combat_instances(defender_id);
CREATE INDEX idx_combat_instances_created_at ON combat_instances(created_at DESC);
```

---

### 10. Auction Listing

Player-to-player item marketplace.

**Table**: `auction_listings`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique listing identifier |
| `seller_id` | INTEGER | NOT NULL, FOREIGN KEY → characters(id) ON DELETE CASCADE | Seller character |
| `item_template_id` | INTEGER | NOT NULL, FOREIGN KEY → item_templates(id) | Item being sold |
| `quantity` | INTEGER | NOT NULL, DEFAULT 1 | Number of items |
| `price_per_unit` | INTEGER | NOT NULL | Price per item in gold |
| `status` | TEXT | NOT NULL, DEFAULT 'active' | 'active', 'sold', 'expired', 'cancelled' |
| `buyer_id` | INTEGER | NULL, FOREIGN KEY → characters(id) | Buyer (if sold) |
| `created_at` | INTEGER | NOT NULL, DEFAULT (unixepoch()) | Listing creation timestamp |
| `expires_at` | INTEGER | NOT NULL | Expiration timestamp |
| `sold_at` | INTEGER | NULL | Sale timestamp |

**Validation Rules**:
- Price per unit: > 0
- Quantity: 1 to item_template.max_stack
- Expires_at: Must be in future when created
- Seller must own inventory items being listed (checked in application)

**Indexes**:
```sql
CREATE INDEX idx_auction_listings_status ON auction_listings(status);
CREATE INDEX idx_auction_listings_item_template_id ON auction_listings(item_template_id);
CREATE INDEX idx_auction_listings_expires_at ON auction_listings(expires_at);
CREATE INDEX idx_auction_listings_seller_id ON auction_listings(seller_id);
```

**State Transitions**:
```
active → sold (buyer purchases)
active → expired (expires_at reached, no buyer)
active → cancelled (seller cancels before expiration)
```

---

### 11. Leaderboard (Redis Cache)

**Note**: Leaderboards are cached in Redis for real-time access, periodically synced from SQLite.

**Redis Data Structures**:

1. **Level Leaderboard**:
   - Type: Sorted Set
   - Key: `leaderboard:level`
   - Value: Character ID
   - Score: Character level (higher = better rank)
   - Command: `ZADD leaderboard:level {character.level} {character.id}`

2. **Combat Power Leaderboard**:
   - Type: Sorted Set
   - Key: `leaderboard:combat_power`
   - Value: Character ID
   - Score: Computed combat power
   - Updated: When character equips/unequips items, levels up

3. **Arena Wins Leaderboard**:
   - Type: Sorted Set
   - Key: `leaderboard:arena_wins`
   - Value: Character ID
   - Score: Arena wins
   - Updated: After each arena combat

4. **Wealth Leaderboard**:
   - Type: Sorted Set
   - Key: `leaderboard:wealth`
   - Value: Character ID
   - Score: Character currency
   - Updated: When currency changes

**TTL**: 5 minutes (refresh from database periodically)

---

### 12. Zone

Geographic areas containing quests and enemies.

**Table**: `zones`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique zone identifier |
| `name` | TEXT | NOT NULL | Zone name |
| `description` | TEXT | NOT NULL | Zone lore |
| `min_level` | INTEGER | NOT NULL, DEFAULT 1 | Recommended minimum level |
| `max_level` | INTEGER | NOT NULL | Recommended maximum level |
| `theme` | TEXT | NOT NULL | Visual theme (e.g., 'forest', 'dungeon', 'castle') |

**Seed Data**:
- Starter Village (levels 1-5)
- Dark Forest (levels 5-10)
- Goblin Caves (levels 10-15)
- Undead Crypt (levels 15-20)

---

### 13. Ability

Character abilities unlocked through progression.

**Table**: `abilities`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique ability identifier |
| `name` | TEXT | NOT NULL | Ability name |
| `description` | TEXT | NOT NULL | Ability effects description |
| `class_id` | INTEGER | NOT NULL, FOREIGN KEY → character_classes(id) | Class that can use this ability |
| `level_requirement` | INTEGER | NOT NULL, DEFAULT 1 | Level required to unlock |
| `effects` | TEXT | NOT NULL | JSON: `{ damage_multiplier: 1.5, cooldown: 10 }` |
| `icon_path` | TEXT | NULL | Path to ability icon |

**Indexes**:
```sql
CREATE INDEX idx_abilities_class_id ON abilities(class_id);
CREATE INDEX idx_abilities_level_requirement ON abilities(level_requirement);
```

---

### 14. Character Ability (Unlocked abilities)

**Table**: `character_abilities`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique record identifier |
| `character_id` | INTEGER | NOT NULL, FOREIGN KEY → characters(id) ON DELETE CASCADE | Character |
| `ability_id` | INTEGER | NOT NULL, FOREIGN KEY → abilities(id) | Ability |
| `unlocked_at` | INTEGER | NOT NULL, DEFAULT (unixepoch()) | Unlock timestamp |

**Validation Rules**:
- Character can only unlock each ability once
- Character must meet level and class requirements (checked in application)

**Indexes**:
```sql
CREATE UNIQUE INDEX idx_character_abilities_unique
  ON character_abilities(character_id, ability_id);
```

---

## Database Schema SQL

Complete SQLite schema (generated from above entities):

```sql
-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Enable WAL mode for concurrent reads
PRAGMA journal_mode = WAL;

-- Players table
CREATE TABLE players (
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
CREATE TABLE character_classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  base_stats TEXT NOT NULL,
  stat_growth TEXT NOT NULL,
  starting_equipment TEXT NOT NULL
);

-- Characters
CREATE TABLE characters (
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
CREATE TABLE zones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  min_level INTEGER NOT NULL DEFAULT 1,
  max_level INTEGER NOT NULL,
  theme TEXT NOT NULL
);

-- Quest templates
CREATE TABLE quest_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  min_level INTEGER NOT NULL DEFAULT 1,
  max_level INTEGER,
  objectives TEXT NOT NULL,
  rewards TEXT NOT NULL,
  zone_id INTEGER NOT NULL,
  prerequisite_quest_id INTEGER,
  FOREIGN KEY (zone_id) REFERENCES zones(id),
  FOREIGN KEY (prerequisite_quest_id) REFERENCES quest_templates(id)
);

-- Character quests
CREATE TABLE character_quests (
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
CREATE TABLE item_templates (
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
CREATE TABLE inventory_items (
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
CREATE TABLE arena_records (
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
CREATE TABLE combat_instances (
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
CREATE TABLE auction_listings (
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
CREATE TABLE abilities (
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
CREATE TABLE character_abilities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id INTEGER NOT NULL,
  ability_id INTEGER NOT NULL,
  unlocked_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
  FOREIGN KEY (ability_id) REFERENCES abilities(id)
);

-- Indexes (see individual entity sections for index definitions)
-- ... (indexes from each entity section above)
```

---

## Validation Summary

| Entity | Key Validations |
|--------|----------------|
| Player | Email format, unique email/username, password strength |
| Character | Unique name globally, level 1-999, positive stats/currency |
| Quest Progress | One active quest per template per character |
| Inventory | Quantity within max_stack, equipped validation per slot |
| Auction | Price > 0, expires_at in future, seller owns items |
| Arena | Attacker ≠ defender, winner in {attacker, defender} |

---

## State Transition Summary

| Entity | States | Transitions |
|--------|--------|-------------|
| Character Quest | active, completed, failed | active → completed (objectives met), active → failed (abandoned) |
| Auction Listing | active, sold, expired, cancelled | active → sold (purchased), active → expired (timeout), active → cancelled (seller action) |
| Character | created, active, deleted | created → active (first quest), active → deleted (player request) |

---

**Next**: API Contracts (REST endpoints + WebSocket messages)
