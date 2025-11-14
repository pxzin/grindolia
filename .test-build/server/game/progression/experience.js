"use strict";
/**
 * Experience System
 * Handles XP calculations, level ups, and progression
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getXPForLevel = getXPForLevel;
exports.getTotalXPForLevel = getTotalXPForLevel;
exports.getLevelFromXP = getLevelFromXP;
exports.getXPProgress = getXPProgress;
exports.shouldLevelUp = shouldLevelUp;
exports.calculateXPReward = calculateXPReward;
exports.applyLevelScaling = applyLevelScaling;
exports.calculateStatGrowth = calculateStatGrowth;
/**
 * Calculate XP required for next level
 * Uses exponential formula: level^2 * 100
 */
function getXPForLevel(level) {
    return Math.pow(level, 2) * 100;
}
/**
 * Calculate total XP required to reach a level
 */
function getTotalXPForLevel(level) {
    let total = 0;
    for (let i = 2; i <= level; i++) {
        total += getXPForLevel(i);
    }
    return total;
}
/**
 * Calculate level from total XP
 */
function getLevelFromXP(totalXP) {
    let level = 1;
    let requiredXP = 0;
    while (requiredXP <= totalXP) {
        level++;
        requiredXP += getXPForLevel(level);
    }
    return level - 1;
}
/**
 * Calculate XP progress to next level (0-1)
 */
function getXPProgress(currentXP, level) {
    const xpForCurrentLevel = getTotalXPForLevel(level);
    const xpForNextLevel = getTotalXPForLevel(level + 1);
    const xpInCurrentLevel = currentXP - xpForCurrentLevel;
    const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
    return Math.max(0, Math.min(1, xpInCurrentLevel / xpNeededForLevel));
}
/**
 * Check if character should level up
 */
function shouldLevelUp(currentXP, currentLevel) {
    const requiredXP = getTotalXPForLevel(currentLevel + 1);
    return currentXP >= requiredXP;
}
/**
 * Calculate XP reward based on activity
 */
function calculateXPReward(activity, difficulty, playerLevel) {
    const baseXP = {
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
function applyLevelScaling(xpReward, contentLevel, playerLevel) {
    const levelDiff = playerLevel - contentLevel;
    if (levelDiff <= 0) {
        // Content at or above player level - full XP
        return xpReward;
    }
    else if (levelDiff <= 3) {
        // Slightly below - reduced XP
        return Math.floor(xpReward * (1 - levelDiff * 0.1));
    }
    else if (levelDiff <= 5) {
        // Significantly below - heavily reduced
        return Math.floor(xpReward * 0.5);
    }
    else {
        // Too far below - minimal XP
        return Math.floor(xpReward * 0.1);
    }
}
/**
 * Calculate stat increases on level up
 */
function calculateStatGrowth(baseStats, statGrowth, newLevel) {
    return {
        hp: baseStats.hp + statGrowth.hp_per_level * (newLevel - 1),
        strength: baseStats.strength + statGrowth.strength_per_level * (newLevel - 1),
        intelligence: baseStats.intelligence + statGrowth.intelligence_per_level * (newLevel - 1),
        dexterity: baseStats.dexterity + statGrowth.dexterity_per_level * (newLevel - 1),
        vitality: baseStats.vitality + statGrowth.vitality_per_level * (newLevel - 1)
    };
}
