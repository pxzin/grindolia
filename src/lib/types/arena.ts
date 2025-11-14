/**
 * Arena Types
 * Type definitions for arena combat-related data structures
 */

export interface ArenaRecord {
	id: number;
	character_id: number;
	wins: number;
	losses: number;
	current_rating: number;
	best_rating: number;
	win_streak: number;
	best_win_streak: number;
	last_combat_at: number | null;
}

export interface CombatInstance {
	id: number;
	attacker_id: number;
	defender_id: number;
	winner_id: number;
	combat_log: CombatAction[];
	rewards: CombatRewards;
	rating_change_attacker: number;
	rating_change_defender: number;
	created_at: number;
	duration_ms: number;
}

export interface CombatAction {
	action: string;
	actor: 'attacker' | 'defender';
	damage?: number;
	heal?: number;
	timestamp: number;
}

export interface CombatRewards {
	xp: number;
	currency: number;
}

export interface InitiateCombatRequest {
	character_id: number;
}

export interface CombatMatchup {
	combat_id: number;
	attacker: CombatParticipant;
	defender: CombatParticipant;
}

export interface CombatParticipant {
	character_id: number;
	name: string;
	level: number;
	combat_power: number;
	current_rating: number;
}

export interface CombatResult {
	combat_id: number;
	winner: CombatParticipant;
	loser: CombatParticipant;
	combat_log: CombatAction[];
	rewards: {
		winner: CombatRewards;
		loser: CombatRewards;
	};
	rating_changes: {
		winner: number;
		loser: number;
	};
	duration_ms: number;
}

export interface ArenaStats {
	record: ArenaRecord;
	win_rate: number;
	total_matches: number;
	rank: number | null;
}

/**
 * Calculate win rate percentage
 */
export function calculateWinRate(wins: number, losses: number): number {
	const total = wins + losses;
	if (total === 0) return 0;
	return Math.round((wins / total) * 100);
}

/**
 * Calculate ELO rating change
 */
export function calculateEloChange(
	winnerRating: number,
	loserRating: number,
	kFactor: number = 32
): { winner: number; loser: number } {
	const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
	const expectedLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));

	const winnerChange = Math.round(kFactor * (1 - expectedWinner));
	const loserChange = Math.round(kFactor * (0 - expectedLoser));

	return {
		winner: winnerChange,
		loser: loserChange
	};
}

/**
 * Format combat log entry for display
 */
export function formatCombatAction(action: CombatAction): string {
	const actorName = action.actor === 'attacker' ? 'Attacker' : 'Defender';

	if (action.damage) {
		return `${actorName} ${action.action} for ${action.damage} damage`;
	}

	if (action.heal) {
		return `${actorName} ${action.action} and heals ${action.heal} HP`;
	}

	return `${actorName} ${action.action}`;
}

/**
 * Get rating tier name
 */
export function getRatingTier(rating: number): string {
	if (rating >= 2000) return 'Legendary';
	if (rating >= 1800) return 'Master';
	if (rating >= 1600) return 'Diamond';
	if (rating >= 1400) return 'Platinum';
	if (rating >= 1200) return 'Gold';
	if (rating >= 1000) return 'Silver';
	return 'Bronze';
}

/**
 * Get rating tier color
 */
export function getRatingTierColor(rating: number): string {
	if (rating >= 2000) return 'text-amber-11';
	if (rating >= 1800) return 'text-purple-11';
	if (rating >= 1600) return 'text-blue-11';
	if (rating >= 1400) return 'text-teal-11';
	if (rating >= 1200) return 'text-yellow-11';
	if (rating >= 1000) return 'text-gray-11';
	return 'text-brown-11';
}
