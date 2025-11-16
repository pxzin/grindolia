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
	 * Get current character (alias for state, but returns null if not loaded)
	 */
	get character(): Readonly<CharacterState> | null {
		return this._state.id !== null ? this._state : null;
	}

	/**
	 * Check if character is loaded
	 */
	get isLoaded(): boolean {
		return this._state.id !== null;
	}

	/**
	 * Get total XP required for next level
	 * Uses cumulative XP formula matching the server
	 */
	get xpToNextLevel(): number {
		// Calculate total XP required for next level (cumulative from level 1)
		let total = 0;
		for (let i = 1; i <= this._state.level; i++) {
			total += i ** 2 * 100;
		}
		return total;
	}

	/**
	 * Get XP progress to next level (0-1)
	 * Uses cumulative XP formula matching the server
	 */
	get xpProgress(): number {
		// Calculate total XP required for current level (where we are now)
		let totalXPForCurrentLevel = 0;
		for (let i = 1; i < this._state.level; i++) {
			totalXPForCurrentLevel += i ** 2 * 100;
		}

		// Calculate total XP required for next level
		const totalXPForNextLevel = this.xpToNextLevel;

		// Calculate progress within current level
		const xpInCurrentLevel = this._state.xp - totalXPForCurrentLevel;
		const xpNeededForLevel = totalXPForNextLevel - totalXPForCurrentLevel;

		return Math.max(0, Math.min(xpInCurrentLevel / xpNeededForLevel, 1));
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
	 * Uses the same formula as the server: total cumulative XP required
	 */
	gainXp(amount: number): { leveledUp: boolean; newLevel?: number } {
		this._state.xp += amount;

		// Calculate total XP required for next level (cumulative from level 1)
		// Formula: sum of (level^2 * 100) for all levels from 1 to target level
		let totalXPForNextLevel = 0;
		for (let i = 1; i < this._state.level + 1; i++) {
			totalXPForNextLevel += i ** 2 * 100;
		}

		if (this._state.xp >= totalXPForNextLevel) {
			this._state.level += 1;
			return { leveledUp: true, newLevel: this._state.level };
		}

		return { leveledUp: false };
	}

	/**
	 * Load character from server
	 */
	async loadCharacter(characterId?: number): Promise<boolean> {
		try {
			const url = characterId ? `/api/character/${characterId}` : '/api/character';
			console.log('📥 [CharacterStore] Loading character from server...', { url, characterId });
			const response = await fetch(url);

			if (!response.ok) {
				if (response.status === 404) {
					console.warn('⚠️  [CharacterStore] No character found (404)');
					return false;
				}
				throw new Error('Failed to load character');
			}

			const data = await response.json();
			console.log('📦 [CharacterStore] Received data:', JSON.stringify(data, null, 2));

			if (data.character) {
				console.log('✅ [CharacterStore] Setting character:', {
					id: data.character.id,
					name: data.character.name,
					class: data.character.class,
					level: data.character.level,
					hp: data.character.hp,
					maxHp: data.character.maxHp
				});
				this.setCharacter(data.character);
				console.log('✅ [CharacterStore] Character loaded successfully');
				console.log('📊 [CharacterStore] Current state:', {
					id: this._state.id,
					name: this._state.name,
					class: this._state.class,
					level: this._state.level,
					hp: this._state.hp,
					maxHp: this._state.maxHp
				});
				return true;
			}

			console.warn('⚠️  [CharacterStore] No character in response');
			return false;
		} catch (error) {
			console.error('❌ [CharacterStore] Failed to load character:', error);
			return false;
		}
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
