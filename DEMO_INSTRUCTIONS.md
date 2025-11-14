# 🎮 Fantasy RPG Dungeon Crawler - Demo Instructions

## Quick Start

1. **Start the development server**:
   ```bash
   pnpm dev
   ```

2. **Open your browser** to `http://localhost:5173`

## Test Flow

### Step 1: Create Account
1. Navigate to `/auth/register` (or click "Register" if there's a link)
2. Fill in:
   - Email: `hero@example.com`
   - Username: `BraveHero`
   - Password: `password123`
3. Click **Register**

### Step 2: Login
1. Navigate to `/auth/login`
2. Use the credentials from Step 1
3. Click **Login**

### Step 3: Create Character
1. Navigate to `/character/create`
2. Choose a character class:
   - **Warrior**: High HP and Strength (tank/melee)
   - **Mage**: High Intelligence (magic damage)
   - **Rogue**: High Dexterity (crits and dodges)
3. Enter character name (e.g., "Aragorn")
4. Click **Create Character**

### Step 4: Enter Dungeon
1. Navigate to `/dungeon`
2. You should see your character sheet on the left
3. You should see "Dark Caverns" dungeon (5 floors, Level 1+)
4. Click **Enter** on the dungeon

### Step 5: Fight Monsters
1. You're now on Floor 1
2. Click **Encounter Monster**
3. A random monster will appear (Slime or Goblin Scout for Floor 1)
4. Click **Fight!**
5. Combat will resolve instantly
6. If you win:
   - You'll see XP and Gold rewards
   - If you leveled up, you'll see the notification
   - Click **Continue**

### Step 6: Descend
1. After defeating a monster, the "Descend to Floor 2" button appears
2. Click to go to the next floor
3. Monsters get stronger on each floor
4. Repeat Steps 5-6 until you reach Floor 5

### Step 7: Complete Dungeon
1. Floor 5 has the Dungeon Overlord boss
2. Defeat the boss to complete the dungeon
3. Click **Exit Dungeon** to return to dungeon selection

## Game Features

### Character Progression
- **XP System**: Gain XP from defeating monsters
- **Level Up**: Every 100 XP (level² × 100 formula)
- **Stat Growth**: Stats increase automatically on level up
- **HP**: Regenerates to full on level up

### Combat System
- **Turn-based**: Character attacks first, then monster counter-attacks
- **Damage**: Based on STR, INT, DEX stats
- **Defense**: Based on VIT and DEX
- **Critical Hits**: Chance based on DEX (5% + 0.5% per DEX point)
- **Dodge**: Chance to avoid damage based on DEX (3% + 0.3% per DEX point)

### Dungeon System
- **5 Floors**: Increasing difficulty multipliers
- **Floor 1**: 1.0x difficulty (Slimes, Goblins)
- **Floor 2**: 1.3x difficulty
- **Floor 3**: 1.6x difficulty
- **Floor 4**: 2.0x difficulty
- **Floor 5**: 2.5x difficulty (Boss floor)

### Loot System
- **Monsters drop**:
  - Health Potions (common)
  - Weapons (rare)
  - Armor (rare)
- **Currency**: Gold from each victory
- **Better loot** on deeper floors

## Character Classes

### Warrior
- **Base HP**: 120
- **Base Stats**: STR 15, INT 5, DEX 8, VIT 12
- **Growth**: +15 HP, +3 STR, +1 INT, +1 DEX, +2 VIT per level
- **Playstyle**: Tank, high HP, strong physical attacks

### Mage
- **Base HP**: 80
- **Base Stats**: STR 5, INT 18, DEX 7, VIT 6
- **Growth**: +8 HP, +1 STR, +4 INT, +1 DEX, +1 VIT per level
- **Playstyle**: Glass cannon, high magic damage

### Rogue
- **Base HP**: 100
- **Base Stats**: STR 10, INT 8, DEX 16, VIT 9
- **Growth**: +12 HP, +2 STR, +1 INT, +3 DEX, +1 VIT per level
- **Playstyle**: Critical hits, high dodge chance

## Monsters

### Floor 1-2
- **Slime** (Level 1): 30 HP, weak stats
- **Goblin Scout** (Level 2): 40 HP, higher DEX

### Floor 2-3
- **Cave Bat** (Level 3): 35 HP, very high DEX
- **Skeleton Warrior** (Level 4): 60 HP, decent all-around

### Floor 4-5
- **Dark Mage** (Level 5): 50 HP, high INT
- **Stone Golem** (Level 6): 100 HP, high STR
- **Dungeon Overlord** (Level 7, Boss): 150 HP, high all stats

## Known Limitations (MVP)

These features are deferred for future iterations:

1. **Real-time WebSockets**: Combat resolves instantly (no turn-by-turn animation)
2. **Inventory Management**: Items are collected but can't be equipped/used yet
3. **Character HP Persistence**: HP resets on page reload (needs DB save)
4. **Combat Log**: No detailed turn-by-turn log
5. **Level Up Modal**: Level ups show in console, no fancy modal

## Troubleshooting

### Database not initialized?
If you see errors about missing tables, the database should auto-initialize on first run. If not, check that `server/database/game.db` exists.

### Compilation errors?
Run `pnpm check` to see TypeScript errors. Some are expected (legacy code).

### Monster not appearing?
Make sure the seed data ran properly. Check console for seed messages.

### Combat not working?
- Check browser console for errors
- Make sure character has HP > 0
- Ensure you're in a dungeon

## Next Steps (Post-MVP)

1. **HP Persistence**: Save character HP to database after each combat
2. **Inventory UI**: Add equip/unequip functionality
3. **Combat Animation**: Turn-by-turn display with delays
4. **Level Up Modal**: Show stat increases visually
5. **Multiple Dungeons**: Add more dungeons beyond Dark Caverns
6. **Quest System**: Integrate the existing quest system
7. **Leaderboards**: Show top players by level/power

---

**Enjoy the dungeon crawler! ⚔️**
