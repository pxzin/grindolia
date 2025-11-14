/**
 * Character Store
 * Manages character state using Svelte 5 runes
 */

import type { CharacterStats } from '$lib/types/character';

export interface CharacterState {
	id: number | null;
	name: string;
	class: string;
	level: number;
	xp: number;
	hp: number;
	maxHp: number;
	stats: CharacterStats;
	currency: number;
	position: {
		x: number;
		y: number;
		z: number;
	};
	zoneId: number | null;
	status: 'alive' | 'dead';
}

class CharacterStore {
	private _state = $state<CharacterState>({
		id: null,
		name: '',
		class: '',
		level: 1,
		xp: 0,
		hp: 100,
		maxHp: 100,
		stats: {
			hp: 100,
			strength: 10,
			intelligence: 10,
			dexterity: 10,
			vitality: 10
		},
		currency: 0,
		position: { x: 0, y: 0, z: 0 },
		zoneId: null,
		status: 'alive'
	});

	/**
	 * Get current character state (readonly)
	 */
	get state(): Readonly<CharacterState> {
		return this._state;
	}

	/**
	 * Check if character is loaded
	 */
	get isLoaded(): boolean {
		return this._state.id !== null;
	}

	/**
	 * Get XP progress to next level (0-1)
	 */
	get xpProgress(): number {
		const xpForNextLevel = this._state.level ** 2 * 100;
		const currentLevelXP = (this._state.level - 1) ** 2 * 100;
		const xpInCurrentLevel = this._state.xp - currentLevelXP;
		const xpNeededForLevel = xpForNextLevel - currentLevelXP;
		return Math.min(xpInCurrentLevel / xpNeededForLevel, 1);
	}

	/**
	 * Get HP percentage (0-1)
	 */
	get hpPercentage(): number {
		return this._state.maxHp > 0 ? this._state.hp / this._state.maxHp : 0;
	}

	/**
	 * Set character data
	 */
	setCharacter(data: Partial<CharacterState>): void {
		this._state = { ...this._state, ...data };
	}

	/**
	 * Update character stats
	 */
	updateStats(stats: Partial<CharacterStats>): void {
		this._state.stats = { ...this._state.stats, ...stats };
	}

	/**
	 * Update position
	 */
	updatePosition(x: number, y: number, z: number, zoneId?: number | null): void {
		this._state.position = { x, y, z };
		if (zoneId !== undefined) {
			this._state.zoneId = zoneId;
		}
	}

	/**
	 * Update HP
	 */
	updateHp(hp: number): void {
		this._state.hp = Math.max(0, Math.min(hp, this._state.maxHp));
		if (this._state.hp === 0) {
			this._state.status = 'dead';
		}
	}

	/**
	 * Heal character
	 */
	heal(amount: number): void {
		this.updateHp(this._state.hp + amount);
	}

	/**
	 * Take damage
	 */
	takeDamage(amount: number): void {
		this.updateHp(this._state.hp - amount);
	}

	/**
	 * Update currency
	 */
	updateCurrency(currency: number): void {
		this._state.currency = Math.max(0, currency);
	}

	/**
	 * Add currency
	 */
	addCurrency(amount: number): void {
		this.updateCurrency(this._state.currency + amount);
	}

	/**
	 * Spend currency
	 */
	spendCurrency(amount: number): boolean {
		if (this._state.currency >= amount) {
			this.updateCurrency(this._state.currency - amount);
			return true;
		}
		return false;
	}

	/**
	 * Gain XP and check for level up
	 */
	gainXp(amount: number): { leveledUp: boolean; newLevel?: number } {
		this._state.xp += amount;

		const xpForNextLevel = this._state.level ** 2 * 100;

		if (this._state.xp >= xpForNextLevel) {
			this._state.level += 1;
			return { leveledUp: true, newLevel: this._state.level };
		}

		return { leveledUp: false };
	}

	/**
	 * Reset character state
	 */
	reset(): void {
		this._state = {
			id: null,
			name: '',
			class: '',
			level: 1,
			xp: 0,
			hp: 100,
			maxHp: 100,
			stats: {
				hp: 100,
				strength: 10,
				intelligence: 10,
				dexterity: 10,
				vitality: 10
			},
			currency: 0,
			position: { x: 0, y: 0, z: 0 },
			zoneId: null,
			status: 'alive'
		};
	}
}

// Export singleton instance
export const characterStore = new CharacterStore();
