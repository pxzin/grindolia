/**
 * Anti-Cheat Utilities
 * Server-side validation to prevent cheating and exploits
 */

import { logger } from './logger';

/**
 * Track rate limiting for actions
 */
interface RateLimitState {
	count: number;
	firstAttempt: number;
	lastAttempt: number;
}

const rateLimitMap = new Map<string, RateLimitState>();

/**
 * Check rate limit
 * @param key - Unique identifier for the action (e.g., "combat:player:123")
 * @param maxAttempts - Maximum attempts allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if within rate limit, false if exceeded
 */
export function checkRateLimit(key: string, maxAttempts: number, windowMs: number): boolean {
	const now = Date.now();
	const state = rateLimitMap.get(key);

	// First attempt
	if (!state) {
		rateLimitMap.set(key, {
			count: 1,
			firstAttempt: now,
			lastAttempt: now
		});
		return true;
	}

	// Window expired, reset
	if (now - state.firstAttempt > windowMs) {
		rateLimitMap.set(key, {
			count: 1,
			firstAttempt: now,
			lastAttempt: now
		});
		return true;
	}

	// Within window
	state.count++;
	state.lastAttempt = now;

	if (state.count > maxAttempts) {
		logger.warn('Rate limit exceeded', {
			key,
			attempts: state.count,
			maxAttempts,
			windowMs
		});
		return false;
	}

	return true;
}

/**
 * Clear rate limit for a key
 */
export function clearRateLimit(key: string): void {
	rateLimitMap.delete(key);
}

/**
 * Clean up expired rate limit entries (call periodically)
 */
export function cleanupRateLimits(maxAgeMs: number = 3600000): void {
	const now = Date.now();
	let cleaned = 0;

	for (const [key, state] of rateLimitMap.entries()) {
		if (now - state.lastAttempt > maxAgeMs) {
			rateLimitMap.delete(key);
			cleaned++;
		}
	}

	if (cleaned > 0) {
		logger.debug('Cleaned up rate limit entries', { count: cleaned });
	}
}

/**
 * Validate experience gain
 * Checks if XP gain is reasonable based on level and activity
 */
export function validateXPGain(
	currentLevel: number,
	xpGained: number,
	activityType: 'quest' | 'combat' | 'craft'
): boolean {
	// Maximum reasonable XP gains per activity type
	const maxXPByActivity: Record<string, number> = {
		quest: currentLevel * 500,
		combat: currentLevel * 100,
		craft: currentLevel * 50
	};

	const maxAllowed = maxXPByActivity[activityType];

	if (xpGained > maxAllowed) {
		logger.warn('Suspicious XP gain detected', {
			currentLevel,
			xpGained,
			maxAllowed,
			activityType
		});
		return false;
	}

	return true;
}

/**
 * Validate currency transaction
 * Checks if currency amounts are reasonable
 */
export function validateCurrencyAmount(amount: number, maxAllowed: number = 1000000000): boolean {
	if (amount < 0 || amount > maxAllowed || !Number.isInteger(amount)) {
		logger.warn('Invalid currency amount', { amount, maxAllowed });
		return false;
	}

	return true;
}

/**
 * Validate item quantity
 * Checks if item quantities are within stack limits
 */
export function validateItemQuantity(quantity: number, maxStack: number): boolean {
	if (quantity < 1 || quantity > maxStack || !Number.isInteger(quantity)) {
		logger.warn('Invalid item quantity', { quantity, maxStack });
		return false;
	}

	return true;
}

/**
 * Validate stat values
 * Checks if character stats are within expected ranges for level
 */
export function validateCharacterStats(
	level: number,
	stats: {
		strength: number;
		intelligence: number;
		dexterity: number;
		vitality: number;
	}
): boolean {
	// Base stats: 10 at level 1, +2 per level (approximate)
	// With equipment bonuses, allow up to 3x the expected value
	const maxStatPerLevel = 10 + level * 2;
	const maxAllowedWithGear = maxStatPerLevel * 3;

	const allStatsValid = Object.entries(stats).every(([statName, value]) => {
		const isValid = value >= 0 && value <= maxAllowedWithGear && Number.isInteger(value);

		if (!isValid) {
			logger.warn('Invalid character stat', {
				level,
				statName,
				value,
				maxAllowed: maxAllowedWithGear
			});
		}

		return isValid;
	});

	return allStatsValid;
}

/**
 * Validate combat result
 * Checks if combat damage/healing values are reasonable
 */
export function validateCombatAction(
	attackerLevel: number,
	defenderLevel: number,
	damage: number
): boolean {
	// Maximum damage is roughly 10x attacker level
	const maxDamage = attackerLevel * 10;

	if (damage < 0 || damage > maxDamage || !Number.isInteger(damage)) {
		logger.warn('Suspicious combat damage', {
			attackerLevel,
			defenderLevel,
			damage,
			maxDamage
		});
		return false;
	}

	return true;
}

/**
 * Validate timestamp
 * Checks if timestamp is reasonable (not in future, not too old)
 */
export function validateTimestamp(timestamp: number, maxAgeSeconds: number = 3600): boolean {
	const now = Math.floor(Date.now() / 1000);

	// Timestamp is in the future (with 5 second tolerance for clock skew)
	if (timestamp > now + 5) {
		logger.warn('Timestamp in future', { timestamp, now });
		return false;
	}

	// Timestamp is too old
	if (timestamp < now - maxAgeSeconds) {
		logger.warn('Timestamp too old', {
			timestamp,
			now,
			maxAgeSeconds
		});
		return false;
	}

	return true;
}

/**
 * Validate quest completion
 * Checks if quest objectives were actually completed
 */
export function validateQuestObjectives(
	objectives: Array<{ type: string; target: string; required: number; current: number }>
): boolean {
	return objectives.every((objective) => {
		const isValid = objective.current >= objective.required && objective.current >= 0;

		if (!isValid) {
			logger.warn('Invalid quest objective progress', {
				type: objective.type,
				target: objective.target,
				required: objective.required,
				current: objective.current
			});
		}

		return isValid;
	});
}

/**
 * Detect rapid succession actions
 * Checks if actions are happening too fast (potential botting)
 */
interface ActionTimestamp {
	timestamps: number[];
}

const actionTimestamps = new Map<string, ActionTimestamp>();

export function detectRapidActions(
	key: string,
	minIntervalMs: number,
	checkCount: number = 5
): boolean {
	const now = Date.now();
	const state = actionTimestamps.get(key);

	if (!state) {
		actionTimestamps.set(key, { timestamps: [now] });
		return true;
	}

	// Add current timestamp
	state.timestamps.push(now);

	// Keep only recent timestamps
	state.timestamps = state.timestamps.filter((ts) => now - ts < minIntervalMs * checkCount);

	// If we have enough data points, check if they're too close together
	if (state.timestamps.length >= checkCount) {
		const recentTimestamps = state.timestamps.slice(-checkCount);
		const timeDiff = recentTimestamps[recentTimestamps.length - 1] - recentTimestamps[0];
		const avgInterval = timeDiff / (checkCount - 1);

		if (avgInterval < minIntervalMs) {
			logger.warn('Rapid actions detected (potential bot)', {
				key,
				avgInterval,
				minInterval: minIntervalMs,
				checkCount
			});
			return false;
		}
	}

	return true;
}

/**
 * Clear action timestamps
 */
export function clearActionTimestamps(key: string): void {
	actionTimestamps.delete(key);
}

/**
 * Validate level progression
 * Checks if level gain is reasonable based on XP
 */
export function validateLevelUp(currentLevel: number, newLevel: number, currentXP: number): boolean {
	// Can only level up one level at a time
	if (newLevel !== currentLevel + 1) {
		logger.warn('Invalid level jump', { currentLevel, newLevel });
		return false;
	}

	// Check if player has enough XP (exponential formula: level^2 * 100)
	const requiredXP = Math.pow(newLevel, 2) * 100;

	if (currentXP < requiredXP) {
		logger.warn('Insufficient XP for level up', {
			currentLevel,
			newLevel,
			currentXP,
			requiredXP
		});
		return false;
	}

	return true;
}

/**
 * Start cleanup interval for rate limits and action timestamps
 */
export function startAntiCheatCleanup(intervalMs: number = 600000): NodeJS.Timeout {
	return setInterval(() => {
		cleanupRateLimits();
		logger.debug('Anti-cheat cleanup completed');
	}, intervalMs);
}
