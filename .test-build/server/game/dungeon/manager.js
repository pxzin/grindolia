"use strict";
/**
 * Dungeon Manager
 * High-level dungeon operations (enter, fight, loot, descend)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.enterDungeon = enterDungeon;
exports.getFloorInfo = getFloorInfo;
exports.initiateCombat = initiateCombat;
exports.resolveCombat = resolveCombat;
exports.descendFloor = descendFloor;
exports.exitDungeon = exitDungeon;
const connection_1 = require("../../database/connection");
const dungeon_1 = require("../../database/repositories/dungeon");
const dungeon_floor_1 = require("../../database/repositories/dungeon-floor");
const dungeon_progress_1 = require("../../database/repositories/dungeon-progress");
const monster_1 = require("../../database/repositories/monster");
const character_1 = require("../../database/repositories/character");
const inventory_item_1 = require("../../database/repositories/inventory-item");
const calculator_1 = require("../combat/calculator");
const difficulty_scaler_1 = require("./difficulty-scaler");
const drop_system_1 = require("../loot/drop-system");
const experience_1 = require("../progression/experience");
/**
 * Enter a dungeon and create progress tracking
 */
function enterDungeon(characterId, dungeonId) {
    const db = (0, connection_1.getDatabase)();
    const dungeonRepo = new dungeon_1.DungeonRepository(db);
    const progressRepo = new dungeon_progress_1.DungeonProgressRepository(db);
    // Check for active dungeon
    const activeProgress = progressRepo.findActive(characterId);
    if (activeProgress) {
        throw new Error('Character already in a dungeon');
    }
    // Get dungeon
    const dungeon = dungeonRepo.findById(dungeonId);
    if (!dungeon) {
        throw new Error('Dungeon not found');
    }
    // Create progress entry
    const progress = progressRepo.create({
        character_id: characterId,
        dungeon_id: dungeonId
    });
    return {
        dungeon_progress_id: progress.id,
        dungeon: {
            id: dungeon.id,
            name: dungeon.name,
            description: dungeon.description,
            max_floors: dungeon.max_floors
        },
        current_floor: 1
    };
}
/**
 * Get current floor information
 */
function getFloorInfo(dungeonProgressId) {
    const db = (0, connection_1.getDatabase)();
    const progressRepo = new dungeon_progress_1.DungeonProgressRepository(db);
    const floorRepo = new dungeon_floor_1.DungeonFloorRepository(db);
    const progress = progressRepo.findById(dungeonProgressId);
    if (!progress) {
        throw new Error('Dungeon progress not found');
    }
    const floor = floorRepo.findByDungeonAndFloor(progress.dungeon_id, progress.current_floor);
    if (!floor) {
        throw new Error('Floor not found');
    }
    const difficulty = (0, difficulty_scaler_1.getFloorDifficultyMultiplier)(progress.current_floor, floor.difficulty_multiplier);
    return {
        floor_number: floor.floor_number,
        difficulty_multiplier: difficulty,
        monster_count: floor.monster_count,
        recommended_level: Math.floor(progress.current_floor * 1.5)
    };
}
/**
 * Initiate combat with a random monster on the current floor
 */
function initiateCombat(characterId, dungeonProgressId) {
    const db = (0, connection_1.getDatabase)();
    const progressRepo = new dungeon_progress_1.DungeonProgressRepository(db);
    const floorRepo = new dungeon_floor_1.DungeonFloorRepository(db);
    const monsterRepo = new monster_1.MonsterRepository(db);
    const characterRepo = new character_1.CharacterRepository(db);
    const progress = progressRepo.findById(dungeonProgressId);
    if (!progress) {
        throw new Error('Dungeon progress not found');
    }
    const character = characterRepo.findById(characterId);
    if (!character) {
        throw new Error('Character not found');
    }
    const floor = floorRepo.findByDungeonAndFloor(progress.dungeon_id, progress.current_floor);
    if (!floor) {
        throw new Error('Floor not found');
    }
    // Get random monster for this floor level
    const monsters = monsterRepo.findByLevel(progress.current_floor);
    if (monsters.length === 0) {
        throw new Error('No monsters found for this floor');
    }
    const randomMonster = monsters[Math.floor(Math.random() * monsters.length)];
    const difficulty = (0, difficulty_scaler_1.getFloorDifficultyMultiplier)(progress.current_floor, floor.difficulty_multiplier);
    const scaledMonster = (0, difficulty_scaler_1.scaleMonsterToCharacterLevel)(randomMonster, character.level, difficulty);
    // Store combat instance temporarily (in production, use Redis or session)
    const combatId = `combat_${Date.now()}_${characterId}`;
    return {
        combat_id: combatId,
        monster: {
            id: scaledMonster.template_id,
            name: scaledMonster.name,
            level: scaledMonster.level,
            hp: scaledMonster.hp,
            strength: scaledMonster.strength,
            intelligence: scaledMonster.intelligence,
            dexterity: scaledMonster.dexterity
        },
        character_hp: character.current_hp
    };
}
/**
 * Resolve combat and apply rewards
 */
function resolveCombat(characterId, dungeonProgressId, monsterId) {
    const db = (0, connection_1.getDatabase)();
    const characterRepo = new character_1.CharacterRepository(db);
    const monsterRepo = new monster_1.MonsterRepository(db);
    const progressRepo = new dungeon_progress_1.DungeonProgressRepository(db);
    const floorRepo = new dungeon_floor_1.DungeonFloorRepository(db);
    const inventoryRepo = new inventory_item_1.InventoryItemRepository(db);
    const character = characterRepo.findById(characterId);
    if (!character) {
        throw new Error('Character not found');
    }
    const monster = monsterRepo.findById(monsterId);
    if (!monster) {
        throw new Error('Monster not found');
    }
    const progress = progressRepo.findById(dungeonProgressId);
    if (!progress) {
        throw new Error('Dungeon progress not found');
    }
    const floor = floorRepo.findByDungeonAndFloor(progress.dungeon_id, progress.current_floor);
    if (!floor) {
        throw new Error('Floor not found');
    }
    // Get scaled monster stats
    const difficulty = (0, difficulty_scaler_1.getFloorDifficultyMultiplier)(progress.current_floor, floor.difficulty_multiplier);
    const scaledMonster = (0, difficulty_scaler_1.scaleMonsterToCharacterLevel)(monster, character.level, difficulty);
    // Build combat stats
    const characterStats = {
        hp: character.current_hp,
        max_hp: character.max_hp,
        strength: character.strength,
        intelligence: character.intelligence,
        dexterity: character.dexterity,
        vitality: character.vitality
    };
    const monsterStats = {
        hp: scaledMonster.hp,
        max_hp: scaledMonster.hp,
        strength: scaledMonster.strength,
        intelligence: scaledMonster.intelligence,
        dexterity: scaledMonster.dexterity,
        vitality: scaledMonster.vitality
    };
    // Simulate combat
    const combatResult = (0, calculator_1.simulateCombat)(characterStats, monsterStats);
    // Process rewards if character won
    let rewards = { xp: 0, currency: 0, items: [] };
    if (combatResult.winner === 'character') {
        // XP and currency from monster
        rewards.xp = scaledMonster.xp_reward;
        rewards.currency = scaledMonster.currency_reward;
        // Roll loot
        const monsterLoot = (0, drop_system_1.rollMonsterLoot)(monster.loot_table);
        rewards.items = monsterLoot.items;
        rewards.currency += monsterLoot.currency;
        // Add items to inventory
        for (const item of rewards.items) {
            inventoryRepo.create({
                character_id: characterId,
                item_template_id: item.item_template_id,
                quantity: item.quantity,
                equipped: false
            });
        }
    }
    // Update character
    const newHP = combatResult.character_hp_end;
    const newXP = character.experience + rewards.xp;
    const newCurrency = character.currency + rewards.currency;
    const updates = {
        current_hp: newHP,
        experience: newXP,
        currency: newCurrency
    };
    // Check for level up
    let leveledUp = false;
    if ((0, experience_1.shouldLevelUp)(newXP, character.level)) {
        const newLevel = character.level + 1;
        updates.level = newLevel;
        leveledUp = true;
        // Apply stat increases (simplified - in production use class growth rates)
        updates.max_hp = character.max_hp + 10;
        updates.strength = character.strength + 2;
        updates.intelligence = character.intelligence + 2;
        updates.dexterity = character.dexterity + 2;
        updates.vitality = character.vitality + 2;
        updates.current_hp = updates.max_hp; // Full heal on level up
    }
    characterRepo.update(characterId, updates);
    return {
        winner: combatResult.winner,
        combat_result: combatResult,
        rewards,
        character_updates: {
            hp: newHP,
            experience: newXP,
            currency: newCurrency,
            level: updates.level,
            leveled_up: leveledUp
        }
    };
}
/**
 * Descend to the next floor
 */
function descendFloor(dungeonProgressId) {
    const db = (0, connection_1.getDatabase)();
    const progressRepo = new dungeon_progress_1.DungeonProgressRepository(db);
    const dungeonRepo = new dungeon_1.DungeonRepository(db);
    const progress = progressRepo.findById(dungeonProgressId);
    if (!progress) {
        throw new Error('Dungeon progress not found');
    }
    const dungeon = dungeonRepo.findById(progress.dungeon_id);
    if (!dungeon) {
        throw new Error('Dungeon not found');
    }
    if (progress.current_floor >= dungeon.max_floors) {
        throw new Error('Already on the last floor');
    }
    const updatedProgress = progressRepo.descendFloor(dungeonProgressId);
    return {
        current_floor: updatedProgress.current_floor,
        max_floors: dungeon.max_floors
    };
}
/**
 * Exit dungeon
 */
function exitDungeon(dungeonProgressId) {
    const db = (0, connection_1.getDatabase)();
    const progressRepo = new dungeon_progress_1.DungeonProgressRepository(db);
    progressRepo.markAbandoned(dungeonProgressId);
}
