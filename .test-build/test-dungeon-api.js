"use strict";
/**
 * Dungeon API Test Script
 * Tests the complete dungeon crawler flow
 */
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("./server/database/connection");
const seed_1 = require("./server/database/seed");
const player_1 = require("./server/database/repositories/player");
const character_1 = require("./server/database/repositories/character");
const character_class_1 = require("./server/database/repositories/character-class");
const manager_1 = require("./server/game/dungeon/manager");
async function testDungeonFlow() {
    console.log('🎮 Starting Dungeon Crawler Test...\n');
    // Initialize database
    console.log('📦 Setting up database...');
    const db = (0, connection_1.getDatabase)();
    (0, seed_1.seedDatabase)();
    console.log('✅ Database seeded\n');
    // Create test player
    console.log('👤 Creating test player...');
    const playerRepo = new player_1.PlayerRepository(db);
    const player = playerRepo.create({
        email: 'test@example.com',
        username: 'TestHero',
        password_hash: 'hashed_password',
        preferred_locale: 'en'
    });
    console.log(`✅ Player created: ${player.username} (ID: ${player.id})\n`);
    // Create test character
    console.log('⚔️  Creating test character...');
    const characterRepo = new character_1.CharacterRepository(db);
    const classRepo = new character_class_1.CharacterClassRepository(db);
    const warriorClass = classRepo.findByName('Warrior');
    if (!warriorClass) {
        throw new Error('Warrior class not found');
    }
    const baseStats = classRepo.parseBaseStats(warriorClass);
    const character = characterRepo.create({
        player_id: player.id,
        class_id: warriorClass.id,
        name: 'BraveHero',
        experience_to_next_level: 100,
        current_hp: baseStats.hp,
        max_hp: baseStats.hp,
        strength: baseStats.strength,
        intelligence: baseStats.intelligence,
        dexterity: baseStats.dexterity,
        vitality: baseStats.vitality,
        appearance: {
            skin_tone: 'fair',
            hair_color: 'brown',
            face: 'heroic'
        }
    });
    console.log(`✅ Character created: ${character.name} (Level ${character.level} ${warriorClass.name})`);
    console.log(`   Stats: HP ${character.max_hp}, STR ${character.strength}, INT ${character.intelligence}, DEX ${character.dexterity}\n`);
    // Enter dungeon
    console.log('🏰 Entering dungeon...');
    const dungeonEntry = (0, manager_1.enterDungeon)(character.id, 1); // Dungeon ID 1 = Dark Caverns
    console.log(`✅ Entered: ${dungeonEntry.dungeon.name}`);
    console.log(`   Current Floor: ${dungeonEntry.current_floor} / ${dungeonEntry.dungeon.max_floors}\n`);
    // Fight 3 monsters
    for (let i = 1; i <= 3; i++) {
        console.log(`⚔️  Combat ${i}/3:`);
        // Initiate combat
        const combat = (0, manager_1.initiateCombat)(character.id, dungeonEntry.dungeon_progress_id);
        console.log(`   Encountered: ${combat.monster.name} (Level ${combat.monster.level})`);
        console.log(`   Monster HP: ${combat.monster.hp}`);
        // Resolve combat
        const result = (0, manager_1.resolveCombat)(character.id, dungeonEntry.dungeon_progress_id, combat.monster.id);
        if (result.winner === 'character') {
            console.log(`   ✅ Victory!`);
            console.log(`   Rewards: ${result.rewards.xp} XP, ${result.rewards.currency} Gold`);
            if (result.rewards.items.length > 0) {
                console.log(`   Loot: ${result.rewards.items.length} item(s)`);
            }
            if (result.character_updates.leveled_up) {
                console.log(`   🎉 LEVEL UP! Now level ${result.character_updates.level}`);
            }
            console.log(`   Character HP: ${result.character_updates.hp}`);
        }
        else {
            console.log(`   ❌ Defeated by ${combat.monster.name}`);
            return;
        }
        console.log();
    }
    // Descend to floor 2
    console.log('⬇️  Descending to next floor...');
    const descended = (0, manager_1.descendFloor)(dungeonEntry.dungeon_progress_id);
    console.log(`✅ Now on Floor ${descended.current_floor}\n`);
    // Get updated character
    const updatedCharacter = characterRepo.findById(character.id);
    if (updatedCharacter) {
        console.log('📊 Final Character Stats:');
        console.log(`   Name: ${updatedCharacter.name}`);
        console.log(`   Level: ${updatedCharacter.level}`);
        console.log(`   XP: ${updatedCharacter.experience}`);
        console.log(`   HP: ${updatedCharacter.current_hp} / ${updatedCharacter.max_hp}`);
        console.log(`   Gold: ${updatedCharacter.currency}`);
        console.log(`   Stats: STR ${updatedCharacter.strength}, INT ${updatedCharacter.intelligence}, DEX ${updatedCharacter.dexterity}, VIT ${updatedCharacter.vitality}`);
    }
    console.log('\n✅ Dungeon crawler test completed successfully!');
}
// Run the test
testDungeonFlow().catch(error => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
});
