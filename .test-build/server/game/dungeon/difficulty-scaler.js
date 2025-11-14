"use strict";
/**
 * Dungeon Difficulty Scaler
 * Scales monster stats based on floor difficulty
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.scaleMonsterStats = scaleMonsterStats;
exports.getFloorDifficultyMultiplier = getFloorDifficultyMultiplier;
exports.scaleMonsterToCharacterLevel = scaleMonsterToCharacterLevel;
exports.applyStatVariance = applyStatVariance;
/**
 * Scale monster stats based on floor difficulty
 */
function scaleMonsterStats(monster, difficultyMultiplier) {
    // Apply difficulty multiplier to all stats
    const scaledHP = Math.floor(monster.base_hp * difficultyMultiplier);
    const scaledStrength = Math.floor(monster.base_strength * difficultyMultiplier);
    const scaledIntelligence = Math.floor(monster.base_intelligence * difficultyMultiplier);
    const scaledDexterity = Math.floor(monster.base_dexterity * difficultyMultiplier);
    // Vitality derived from level
    const scaledVitality = Math.floor(monster.base_level * 0.5 * difficultyMultiplier);
    // Scale rewards
    const scaledXP = Math.floor(monster.xp_reward * difficultyMultiplier);
    const scaledCurrency = Math.floor(monster.currency_reward * difficultyMultiplier);
    return {
        template_id: monster.id,
        name: monster.name,
        level: Math.floor(monster.base_level * difficultyMultiplier),
        hp: scaledHP,
        strength: scaledStrength,
        intelligence: scaledIntelligence,
        dexterity: scaledDexterity,
        vitality: scaledVitality,
        xp_reward: scaledXP,
        currency_reward: scaledCurrency
    };
}
/**
 * Calculate difficulty multiplier for a floor
 */
function getFloorDifficultyMultiplier(floorNumber, baseDifficulty) {
    // Combine base difficulty with floor progression
    // Each floor adds 15% to difficulty
    return baseDifficulty * (1 + (floorNumber - 1) * 0.15);
}
/**
 * Scale monster for character level
 */
function scaleMonsterToCharacterLevel(monster, characterLevel, floorDifficulty) {
    // Calculate level-based scaling
    const levelDifference = characterLevel - monster.base_level;
    let levelScaling = 1.0;
    if (levelDifference > 0) {
        // Monster should be stronger if character is higher level
        levelScaling = 1 + (levelDifference * 0.1);
    }
    else if (levelDifference < -2) {
        // Monster slightly weaker if character is lower level (but not too much)
        levelScaling = Math.max(0.7, 1 + (levelDifference * 0.05));
    }
    // Combine floor difficulty with level scaling
    const totalMultiplier = floorDifficulty * levelScaling;
    return scaleMonsterStats(monster, totalMultiplier);
}
/**
 * Generate random variance for monster stats
 */
function applyStatVariance(monster, variance = 0.1) {
    const roll = () => {
        const v = 1 - variance + Math.random() * (variance * 2);
        return v;
    };
    return {
        ...monster,
        hp: Math.floor(monster.hp * roll()),
        strength: Math.floor(monster.strength * roll()),
        intelligence: Math.floor(monster.intelligence * roll()),
        dexterity: Math.floor(monster.dexterity * roll())
    };
}
