/**
 * Experience System
 * Handles XP calculations, level ups, and progression
 */

/**
 * Calculate XP required for next level
 * Uses exponential formula: level^2 * 100
 */
export function getXPForLevel(level: number): number {
	return Math.pow(level, 2) * 100;
}

/**
 * Calculate total XP required to reach a level from level 1
 * This is cumulative XP across all levels
 */
export function getTotalXPForLevel(level: number): number {
	let total = 0;
	for (let i = 1; i < level; i++) {
		total += getXPForLevel(i);
	}
	return total;
}

/**
 * Calculate level from total XP
 */
export function getLevelFromXP(totalXP: number): number {
	let level = 1;

	while (getTotalXPForLevel(level + 1) <= totalXP) {
		level++;
	}

	return level;
}

/**
 * Calculate XP progress to next level (0-1)
 */
export function getXPProgress(currentXP: number, level: number): number {
	const xpForCurrentLevel = getTotalXPForLevel(level);
	const xpForNextLevel = getTotalXPForLevel(level + 1);
	const xpInCurrentLevel = currentXP - xpForCurrentLevel;
	const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;

	return Math.max(0, Math.min(1, xpInCurrentLevel / xpNeededForLevel));
}

/**
 * Check if character should level up
 */
export function shouldLevelUp(currentXP: number, currentLevel: number): boolean {
	const requiredXP = getTotalXPForLevel(currentLevel + 1);
	return currentXP >= requiredXP;
}

/**
 * Calculate XP reward based on activity
 */
export function calculateXPReward(
	activity: 'quest' | 'combat' | 'craft',
	difficulty: number,
	playerLevel: number
): number {
	const baseXP: Record<typeof activity, number> = {
		quest: 100,
		combat: 25,
		craft: 15
	};

	// Base XP * difficulty multiplier * level scaling
	const xp = baseXP[activity] * difficulty * (1 + playerLevel * 0.1);

	return Math.floor(xp);
}

/**
 * Apply level scaling to XP rewards
 * Reduces XP for content below player level
 */
export function applyLevelScaling(
	xpReward: number,
	contentLevel: number,
	playerLevel: number
): number {
	const levelDiff = playerLevel - contentLevel;

	if (levelDiff <= 0) {
		// Content at or above player level - full XP
		return xpReward;
	} else if (levelDiff <= 3) {
		// Slightly below - reduced XP
		return Math.floor(xpReward * (1 - levelDiff * 0.1));
	} else if (levelDiff <= 5) {
		// Significantly below - heavily reduced
		return Math.floor(xpReward * 0.5);
	} else {
		// Too far below - minimal XP
		return Math.floor(xpReward * 0.1);
	}
}

/**
 * Calculate stat increases on level up
 */
export function calculateStatGrowth(
	baseStats: {
		hp: number;
		strength: number;
		intelligence: number;
		dexterity: number;
		vitality: number;
	},
	statGrowth: {
		hp_per_level: number;
		strength_per_level: number;
		intelligence_per_level: number;
		dexterity_per_level: number;
		vitality_per_level: number;
	},
	newLevel: number
): typeof baseStats {
	return {
		hp: baseStats.hp + statGrowth.hp_per_level * (newLevel - 1),
		strength: baseStats.strength + statGrowth.strength_per_level * (newLevel - 1),
		intelligence: baseStats.intelligence + statGrowth.intelligence_per_level * (newLevel - 1),
		dexterity: baseStats.dexterity + statGrowth.dexterity_per_level * (newLevel - 1),
		vitality: baseStats.vitality + statGrowth.vitality_per_level * (newLevel - 1)
	};
}
