/**
 * Character Types
 * Type definitions for character-related data structures
 */

export interface Character {
	id: number;
	player_id: number;
	class_id: number;
	name: string;
	level: number;
	experience: number;
	experience_to_next_level: number;
	current_hp: number;
	max_hp: number;
	strength: number;
	intelligence: number;
	dexterity: number;
	vitality: number;
	currency: number;
	appearance: CharacterAppearance;
	created_at: number;
	last_played_at: number | null;
}

export interface CharacterAppearance {
	skin_tone: string;
	hair_color: string;
	face: string;
	[key: string]: string;
}

export interface CharacterClass {
	id: number;
	name: string;
	description: string;
	base_stats: BaseStats;
	stat_growth: StatGrowth;
	starting_equipment: number[];
}

export interface BaseStats {
	hp: number;
	strength: number;
	intelligence: number;
	dexterity: number;
	vitality: number;
}

export interface StatGrowth {
	hp_per_level: number;
	strength_per_level: number;
	intelligence_per_level: number;
	dexterity_per_level: number;
	vitality_per_level: number;
}

export interface CreateCharacterRequest {
	player_id: number;
	class_id: number;
	name: string;
	appearance: CharacterAppearance;
}

export interface CharacterStats {
	level: number;
	experience: number;
	experience_to_next_level: number;
	progress_percent: number;
	current_hp: number;
	max_hp: number;
	strength: number;
	intelligence: number;
	dexterity: number;
	vitality: number;
	combat_power: number;
}

export interface LevelUpResult {
	new_level: number;
	stat_increases: {
		hp: number;
		strength: number;
		intelligence: number;
		dexterity: number;
		vitality: number;
	};
	new_abilities?: number[];
}

/**
 * Calculate combat power from character stats
 */
export function calculateCombatPower(character: Character): number {
	return (
		character.strength * 2 +
		character.intelligence * 2 +
		character.dexterity * 1.5 +
		character.vitality * 1.5 +
		character.level * 10
	);
}

/**
 * Calculate XP progress percentage
 */
export function calculateXPProgress(experience: number, experience_to_next_level: number): number {
	return Math.floor((experience / experience_to_next_level) * 100);
}

/**
 * Get character stats summary
 */
export function getCharacterStats(character: Character): CharacterStats {
	return {
		level: character.level,
		experience: character.experience,
		experience_to_next_level: character.experience_to_next_level,
		progress_percent: calculateXPProgress(character.experience, character.experience_to_next_level),
		current_hp: character.current_hp,
		max_hp: character.max_hp,
		strength: character.strength,
		intelligence: character.intelligence,
		dexterity: character.dexterity,
		vitality: character.vitality,
		combat_power: calculateCombatPower(character)
	};
}
