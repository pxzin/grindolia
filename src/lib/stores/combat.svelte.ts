/**
 * Combat Store
 * Manages combat state using Svelte 5 runes
 */

import { characterStore } from './character.svelte';

export interface CombatTurn {
	turn: number;
	attacker: 'character' | 'monster';
	damage: number;
	isCritical: boolean;
	isDodged: boolean;
	remainingHP: number;
}

export interface Monster {
	id: number;
	name: string;
	level: number;
	hp: number;
	maxHp: number;
	strength: number;
	intelligence: number;
	dexterity: number;
}

export interface CombatState {
	isInCombat: boolean;
	combatId: string | null;
	monster: Monster | null;
	characterHPStart: number;
	characterHPCurrent: number;
	monsterHPStart: number;
	monsterHPCurrent: number;
	turns: CombatTurn[];
	currentTurn: number;
	winner: 'character' | 'monster' | null;
	rewards: {
		xp: number;
		currency: number;
		items: Array<{ item_template_id: number; quantity: number }>;
	} | null;
}

class CombatStore {
	private _state = $state<CombatState>({
		isInCombat: false,
		combatId: null,
		monster: null,
		characterHPStart: 0,
		characterHPCurrent: 0,
		monsterHPStart: 0,
		monsterHPCurrent: 0,
		turns: [],
		currentTurn: 0,
		winner: null,
		rewards: null
	});

	/**
	 * Get current combat state (readonly)
	 */
	get state(): Readonly<CombatState> {
		return this._state;
	}

	/**
	 * Check if in combat
	 */
	get isInCombat(): boolean {
		return this._state.isInCombat;
	}

	/**
	 * Get character HP percentage
	 */
	get characterHPPercentage(): number {
		if (this._state.characterHPStart === 0) return 0;
		return (this._state.characterHPCurrent / this._state.characterHPStart) * 100;
	}

	/**
	 * Get monster HP percentage
	 */
	get monsterHPPercentage(): number {
		if (this._state.monsterHPStart === 0) return 0;
		return (this._state.monsterHPCurrent / this._state.monsterHPStart) * 100;
	}

	/**
	 * Check if combat is finished
	 */
	get isFinished(): boolean {
		return this._state.winner !== null;
	}

	/**
	 * Check if character won
	 */
	get characterWon(): boolean {
		return this._state.winner === 'character';
	}

	/**
	 * Initiate combat with a monster
	 */
	async initiateCombat(characterId: number, dungeonProgressId: number): Promise<void> {
		try {
			const response = await fetch('/api/combat/initiate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ characterId, dungeonProgressId })
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to initiate combat');
			}

			const data = await response.json();

			this._state.isInCombat = true;
			this._state.combatId = data.combat_id;
			this._state.monster = {
				id: data.monster.id,
				name: data.monster.name,
				level: data.monster.level,
				hp: data.monster.hp,
				maxHp: data.monster.hp,
				strength: data.monster.strength,
				intelligence: data.monster.intelligence,
				dexterity: data.monster.dexterity
			};
			this._state.characterHPStart = data.character_hp;
			this._state.characterHPCurrent = data.character_hp;
			this._state.monsterHPStart = data.monster.hp;
			this._state.monsterHPCurrent = data.monster.hp;
			this._state.turns = [];
			this._state.currentTurn = 0;
			this._state.winner = null;
			this._state.rewards = null;
		} catch (error) {
			console.error('Failed to initiate combat:', error);
			throw error;
		}
	}

	/**
	 * Resolve combat and get results
	 */
	async resolveCombat(characterId: number, dungeonProgressId: number): Promise<void> {
		if (!this._state.monster) {
			throw new Error('No active combat');
		}

		try {
			const response = await fetch('/api/combat/resolve', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					characterId,
					dungeonProgressId,
					monsterId: this._state.monster.id
				})
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to resolve combat');
			}

			const data = await response.json();

			console.log('⚔️ [CombatStore] Combat resolved:', data);

			// Update combat result
			this._state.winner = data.winner;
			this._state.turns = data.combat_result.turns;
			this._state.characterHPCurrent = data.combat_result.character_hp_end;
			this._state.monsterHPCurrent = data.combat_result.monster_hp_end;
			this._state.rewards = data.rewards;

			// Update character store with new stats
			if (data.character_updates) {
				console.log('📊 [CombatStore] Updating character store with:', data.character_updates);

				// Update HP
				characterStore.updateHp(data.character_updates.hp);

				// Update XP and check for level up
				if (data.rewards?.xp) {
					const result = characterStore.gainXp(data.rewards.xp);
					if (result.leveledUp) {
						console.log('🎉 [CombatStore] Character leveled up to', result.newLevel);
					}
				}

				// Update currency
				if (data.rewards?.currency) {
					characterStore.addCurrency(data.rewards.currency);
					console.log('💰 [CombatStore] Added', data.rewards.currency, 'gold');
				}

				// If leveled up, update all stats from server
				if (data.character_updates.leveled_up) {
					console.log('⬆️ [CombatStore] Character leveled up! Updating all stats...');

					const updates: any = {};
					if (data.character_updates.level !== undefined) updates.level = data.character_updates.level;
					if (data.character_updates.maxHp !== undefined) updates.maxHp = data.character_updates.maxHp;
					if (data.character_updates.hp !== undefined) updates.hp = data.character_updates.hp;

					// Update stats if provided
					if (data.character_updates.strength !== undefined ||
					    data.character_updates.intelligence !== undefined ||
					    data.character_updates.dexterity !== undefined ||
					    data.character_updates.vitality !== undefined) {
						updates.stats = {
							...characterStore.state.stats,
							...(data.character_updates.strength !== undefined && { strength: data.character_updates.strength }),
							...(data.character_updates.intelligence !== undefined && { intelligence: data.character_updates.intelligence }),
							...(data.character_updates.dexterity !== undefined && { dexterity: data.character_updates.dexterity }),
							...(data.character_updates.vitality !== undefined && { vitality: data.character_updates.vitality })
						};
					}

					characterStore.setCharacter(updates);
					console.log('✅ [CombatStore] Stats updated:', updates);
				}
			}
		} catch (error) {
			console.error('Failed to resolve combat:', error);
			throw error;
		}
	}

	/**
	 * End combat and clear state
	 */
	endCombat(): void {
		this._state = {
			isInCombat: false,
			combatId: null,
			monster: null,
			characterHPStart: 0,
			characterHPCurrent: 0,
			monsterHPStart: 0,
			monsterHPCurrent: 0,
			turns: [],
			currentTurn: 0,
			winner: null,
			rewards: null
		};
	}

	/**
	 * Play next turn (for animation)
	 */
	playNextTurn(): boolean {
		if (this._state.currentTurn >= this._state.turns.length) {
			return false;
		}

		const turn = this._state.turns[this._state.currentTurn];

		// Update HP based on turn
		if (turn.attacker === 'character') {
			this._state.monsterHPCurrent = turn.remainingHP;
		} else {
			this._state.characterHPCurrent = turn.remainingHP;
		}

		this._state.currentTurn++;
		return true;
	}

	/**
	 * Reset store state
	 */
	reset(): void {
		this.endCombat();
	}
}

// Export singleton instance
export const combatStore = new CombatStore();
