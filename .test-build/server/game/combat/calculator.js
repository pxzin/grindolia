"use strict";
/**
 * Combat Calculator
 * Core combat mechanics and turn resolution
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateBaseDamage = calculateBaseDamage;
exports.calculateDefenseReduction = calculateDefenseReduction;
exports.calculateCritChance = calculateCritChance;
exports.calculateDodgeChance = calculateDodgeChance;
exports.calculateDamage = calculateDamage;
exports.simulateCombat = simulateCombat;
exports.calculateCombatPower = calculateCombatPower;
/**
 * Calculate base damage output
 */
function calculateBaseDamage(stats) {
    // Damage = (Strength * 2) + (Intelligence * 1.5) + (Dexterity * 0.5)
    return Math.floor(stats.strength * 2 +
        stats.intelligence * 1.5 +
        stats.dexterity * 0.5);
}
/**
 * Calculate defense reduction
 */
function calculateDefenseReduction(stats) {
    // Defense = (Vitality * 1.5) + (Dexterity * 0.3)
    return Math.floor(stats.vitality * 1.5 +
        stats.dexterity * 0.3);
}
/**
 * Calculate critical hit chance (0-1)
 */
function calculateCritChance(dexterity) {
    // Base 5% + 0.5% per dexterity point
    return Math.min(0.5, 0.05 + (dexterity * 0.005));
}
/**
 * Calculate dodge chance (0-1)
 */
function calculateDodgeChance(dexterity) {
    // Base 3% + 0.3% per dexterity point
    return Math.min(0.3, 0.03 + (dexterity * 0.003));
}
/**
 * Calculate actual damage dealt in an attack
 */
function calculateDamage(attackerStats, defenderStats) {
    // Check for dodge
    const dodgeChance = calculateDodgeChance(defenderStats.dexterity);
    const dodgeRoll = Math.random();
    if (dodgeRoll < dodgeChance) {
        return { damage: 0, isCritical: false, isDodged: true };
    }
    // Calculate base damage
    let damage = calculateBaseDamage(attackerStats);
    // Check for critical hit
    const critChance = calculateCritChance(attackerStats.dexterity);
    const critRoll = Math.random();
    const isCritical = critRoll < critChance;
    if (isCritical) {
        damage *= 2;
    }
    // Apply defense reduction
    const defense = calculateDefenseReduction(defenderStats);
    damage = Math.max(1, damage - defense);
    // Add variance (±10%)
    const variance = 0.9 + Math.random() * 0.2;
    damage = Math.floor(damage * variance);
    return { damage, isCritical, isDodged: false };
}
/**
 * Simulate a complete combat encounter
 */
function simulateCombat(characterStats, monsterStats) {
    const startTime = Date.now();
    const turns = [];
    let characterHP = characterStats.hp;
    let monsterHP = monsterStats.hp;
    let turnCount = 0;
    const MAX_TURNS = 100; // Prevent infinite loops
    // Combat loop - alternating turns
    while (characterHP > 0 && monsterHP > 0 && turnCount < MAX_TURNS) {
        turnCount++;
        // Character attacks first (player advantage)
        if (characterHP > 0) {
            const attack = calculateDamage(characterStats, monsterStats);
            monsterHP = Math.max(0, monsterHP - attack.damage);
            turns.push({
                turn: turnCount,
                attacker: 'character',
                damage: attack.damage,
                isCritical: attack.isCritical,
                isDodged: attack.isDodged,
                remainingHP: monsterHP
            });
            if (monsterHP <= 0)
                break;
        }
        // Monster counter-attacks
        if (monsterHP > 0) {
            const attack = calculateDamage(monsterStats, characterStats);
            characterHP = Math.max(0, characterHP - attack.damage);
            turns.push({
                turn: turnCount,
                attacker: 'monster',
                damage: attack.damage,
                isCritical: attack.isCritical,
                isDodged: attack.isDodged,
                remainingHP: characterHP
            });
        }
    }
    const duration_ms = Date.now() - startTime;
    return {
        winner: characterHP > 0 ? 'character' : 'monster',
        turns,
        duration_ms: Math.max(duration_ms, 1000), // Minimum 1 second
        character_hp_start: characterStats.hp,
        character_hp_end: characterHP,
        monster_hp_start: monsterStats.hp,
        monster_hp_end: monsterHP
    };
}
/**
 * Calculate combat power rating for a character
 */
function calculateCombatPower(stats) {
    const damage = calculateBaseDamage(stats);
    const defense = calculateDefenseReduction(stats);
    const hp = stats.hp;
    // Combat Power = (Damage * 2) + Defense + (HP / 10)
    return Math.floor(damage * 2 + defense + hp / 10);
}
