/**
 * Dungeon Manager
 * High-level dungeon operations (enter, fight, loot, descend)
 */

import { getDatabase } from '../../database/connection';
import { DungeonRepository } from '../../database/repositories/dungeon';
import { DungeonFloorRepository } from '../../database/repositories/dungeon-floor';
import { DungeonProgressRepository } from '../../database/repositories/dungeon-progress';
import { MonsterRepository } from '../../database/repositories/monster';
import { CharacterRepository } from '../../database/repositories/character';
import { InventoryItemRepository } from '../../database/repositories/inventory-item';
import { simulateCombat, type CombatResult, type CombatStats } from '../combat/calculator';
import { scaleMonsterToCharacterLevel, getFloorDifficultyMultiplier } from './difficulty-scaler';
import { rollMonsterLoot, rollFloorLoot, mergeLootDrops } from '../loot/drop-system';
import { shouldLevelUp, getXPForLevel } from '../progression/experience';

export interface EnterDungeonResult {
	dungeon_progress_id: number;
	dungeon: {
		id: number;
		name: string;
		description: string;
		max_floors: number;
	};
	current_floor: number;
}

export interface FloorInfo {
	floor_number: number;
	difficulty_multiplier: number;
	monster_count: number;
	recommended_level: number;
}

export interface CombatInitiateResult {
	combat_id: string;
	monster: {
		id: number;
		name: string;
		level: number;
		hp: number;
		strength: number;
		intelligence: number;
		dexterity: number;
	};
	character_hp: number;
}

export interface CombatResolveResult {
	winner: 'character' | 'monster';
	combat_result: CombatResult;
	rewards: {
		xp: number;
		currency: number;
		items: Array<{ item_template_id: number; quantity: number }>;
	};
	character_updates: {
		hp: number;
		experience: number;
		currency: number;
		level?: number;
		leveled_up?: boolean;
	};
}

/**
 * Enter a dungeon and create progress tracking
 */
export function enterDungeon(characterId: number, dungeonId: number): EnterDungeonResult {
	const db = getDatabase();
	const dungeonRepo = new DungeonRepository(db);
	const progressRepo = new DungeonProgressRepository(db);
	const characterRepo = new CharacterRepository(db);

	// Get character
	const character = characterRepo.findById(characterId);
	if (!character) {
		throw new Error('Character not found');
	}

	// Check if character is dead
	if (character.current_hp <= 0) {
		// Revive character with 50% HP for MVP
		const revivedHP = Math.floor(character.max_hp * 0.5);
		characterRepo.update(characterId, { current_hp: revivedHP });
		console.log(`💚 [DungeonManager] Revived character ${characterId} with ${revivedHP} HP`);
	}

	// Check for active dungeon
	const activeProgress = progressRepo.findActive(characterId);
	if (activeProgress) {
		// If character is dead or HP is 0, abandon the old dungeon
		if (character.current_hp <= 0) {
			console.log(`🚪 [DungeonManager] Abandoning old dungeon ${activeProgress.id} (character was dead)`);
			progressRepo.markAbandoned(activeProgress.id);
		} else {
			// Re-enter existing dungeon
			console.log(`🔄 [DungeonManager] Re-entering existing dungeon ${activeProgress.id}`);
			const dungeon = dungeonRepo.findById(activeProgress.dungeon_id);
			if (!dungeon) {
				throw new Error('Dungeon not found');
			}

			return {
				dungeon_progress_id: activeProgress.id,
				dungeon: {
					id: dungeon.id,
					name: dungeon.name,
					description: dungeon.description,
					max_floors: dungeon.max_floors
				},
				current_floor: activeProgress.current_floor
			};
		}
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

	console.log(`✅ [DungeonManager] Created new dungeon progress ${progress.id} for character ${characterId}`);

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
export function getFloorInfo(dungeonProgressId: number): FloorInfo {
	const db = getDatabase();
	const progressRepo = new DungeonProgressRepository(db);
	const floorRepo = new DungeonFloorRepository(db);

	const progress = progressRepo.findById(dungeonProgressId);
	if (!progress) {
		throw new Error('Dungeon progress not found');
	}

	const floor = floorRepo.findByDungeonAndFloor(progress.dungeon_id, progress.current_floor);
	if (!floor) {
		throw new Error('Floor not found');
	}

	const difficulty = getFloorDifficultyMultiplier(progress.current_floor, floor.difficulty_multiplier);

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
export function initiateCombat(characterId: number, dungeonProgressId: number): CombatInitiateResult {
	const db = getDatabase();
	const progressRepo = new DungeonProgressRepository(db);
	const floorRepo = new DungeonFloorRepository(db);
	const monsterRepo = new MonsterRepository(db);
	const characterRepo = new CharacterRepository(db);

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
	const difficulty = getFloorDifficultyMultiplier(progress.current_floor, floor.difficulty_multiplier);
	const scaledMonster = scaleMonsterToCharacterLevel(randomMonster, character.level, difficulty);

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
export function resolveCombat(
	characterId: number,
	dungeonProgressId: number,
	monsterId: number
): CombatResolveResult {
	const db = getDatabase();
	const characterRepo = new CharacterRepository(db);
	const monsterRepo = new MonsterRepository(db);
	const progressRepo = new DungeonProgressRepository(db);
	const floorRepo = new DungeonFloorRepository(db);
	const inventoryRepo = new InventoryItemRepository(db);

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
	const difficulty = getFloorDifficultyMultiplier(progress.current_floor, floor.difficulty_multiplier);
	const scaledMonster = scaleMonsterToCharacterLevel(monster, character.level, difficulty);

	// Build combat stats
	const characterStats: CombatStats = {
		hp: character.current_hp,
		max_hp: character.max_hp,
		strength: character.strength,
		intelligence: character.intelligence,
		dexterity: character.dexterity,
		vitality: character.vitality
	};

	const monsterStats: CombatStats = {
		hp: scaledMonster.hp,
		max_hp: scaledMonster.hp,
		strength: scaledMonster.strength,
		intelligence: scaledMonster.intelligence,
		dexterity: scaledMonster.dexterity,
		vitality: scaledMonster.vitality
	};

	// Simulate combat
	const combatResult = simulateCombat(characterStats, monsterStats);

	// Process rewards if character won
	let rewards = { xp: 0, currency: 0, items: [] as Array<{ item_template_id: number; quantity: number }> };

	if (combatResult.winner === 'character') {
		// XP and currency from monster
		rewards.xp = scaledMonster.xp_reward;
		rewards.currency = scaledMonster.currency_reward;

		// Roll loot
		const monsterLoot = rollMonsterLoot(monster.loot_table);
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

	const updates: {
		current_hp: number;
		experience: number;
		currency: number;
		level?: number;
		max_hp?: number;
		strength?: number;
		intelligence?: number;
		dexterity?: number;
		vitality?: number;
	} = {
		current_hp: newHP,
		experience: newXP,
		currency: newCurrency
	};

	// Check for level up
	let leveledUp = false;
	console.log(`🔍 [DungeonManager] Level up check: currentLevel=${character.level}, newXP=${newXP}, shouldLevelUp=${shouldLevelUp(newXP, character.level)}`);

	if (shouldLevelUp(newXP, character.level)) {
		const newLevel = character.level + 1;
		updates.level = newLevel;
		leveledUp = true;

		console.log(`🎉 [DungeonManager] Level up! ${character.level} -> ${newLevel}`);

		// Apply stat increases (simplified - in production use class growth rates)
		updates.max_hp = character.max_hp + 10;
		updates.strength = character.strength + 2;
		updates.intelligence = character.intelligence + 2;
		updates.dexterity = character.dexterity + 2;
		updates.vitality = character.vitality + 2;
		updates.current_hp = updates.max_hp; // Full heal on level up
	}

	console.log(`💾 [DungeonManager] Updating character with:`, JSON.stringify(updates, null, 2));
	characterRepo.update(characterId, updates);

	// Build complete character_updates response
	const characterUpdates: {
		hp: number;
		experience: number;
		currency: number;
		level?: number;
		leveled_up: boolean;
		maxHp?: number;
		strength?: number;
		intelligence?: number;
		dexterity?: number;
		vitality?: number;
	} = {
		hp: updates.current_hp, // Use the updated HP (may include full heal from level up)
		experience: newXP,
		currency: newCurrency,
		leveled_up: leveledUp
	};

	// Include updated stats if leveled up
	if (leveledUp) {
		characterUpdates.level = updates.level;
		characterUpdates.maxHp = updates.max_hp;
		characterUpdates.strength = updates.strength;
		characterUpdates.intelligence = updates.intelligence;
		characterUpdates.dexterity = updates.dexterity;
		characterUpdates.vitality = updates.vitality;
	}

	return {
		winner: combatResult.winner,
		combat_result: combatResult,
		rewards,
		character_updates: characterUpdates
	};
}

/**
 * Descend to the next floor
 */
export function descendFloor(dungeonProgressId: number): { current_floor: number; max_floors: number } {
	const db = getDatabase();
	const progressRepo = new DungeonProgressRepository(db);
	const dungeonRepo = new DungeonRepository(db);

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
export function exitDungeon(dungeonProgressId: number): void {
	const db = getDatabase();
	const progressRepo = new DungeonProgressRepository(db);

	progressRepo.markAbandoned(dungeonProgressId);
}
