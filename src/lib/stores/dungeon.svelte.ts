/**
 * Dungeon Store
 * Manages dungeon exploration state using Svelte 5 runes
 */

import { characterStore } from './character.svelte';

export interface DungeonState {
	dungeonProgressId: number | null;
	dungeonId: number | null;
	dungeonName: string;
	dungeonDescription: string;
	currentFloor: number;
	maxFloors: number;
	floorDifficulty: number;
	monstersDefeated: number;
	isInDungeon: boolean;
	canDescend: boolean;
}

class DungeonStore {
	private _state = $state<DungeonState>({
		dungeonProgressId: null,
		dungeonId: null,
		dungeonName: '',
		dungeonDescription: '',
		currentFloor: 1,
		maxFloors: 5,
		floorDifficulty: 1.0,
		monstersDefeated: 0,
		isInDungeon: false,
		canDescend: false
	});

	/**
	 * Get current dungeon state (readonly)
	 */
	get state(): Readonly<DungeonState> {
		return this._state;
	}

	/**
	 * Check if character is in a dungeon
	 */
	get isInDungeon(): boolean {
		return this._state.isInDungeon;
	}

	/**
	 * Get current floor number
	 */
	get currentFloor(): number {
		return this._state.currentFloor;
	}

	/**
	 * Get floor progress percentage (0-100)
	 */
	get floorProgress(): number {
		return (this._state.currentFloor / this._state.maxFloors) * 100;
	}

	/**
	 * Check if on last floor
	 */
	get isLastFloor(): boolean {
		return this._state.currentFloor >= this._state.maxFloors;
	}

	/**
	 * Enter a dungeon
	 */
	async enterDungeon(characterId: number, dungeonId: number): Promise<void> {
		try {
			console.log('🚪 [DungeonStore] Entering dungeon...', { characterId, dungeonId });

			const response = await fetch('/api/dungeon/enter', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ characterId, dungeonId })
			});

			console.log('📡 [DungeonStore] Response status:', response.status);

			if (!response.ok) {
				const error = await response.json();
				console.error('❌ [DungeonStore] Failed to enter dungeon:', error);
				throw new Error(error.message || 'Failed to enter dungeon');
			}

			const data = await response.json();
			console.log('📦 [DungeonStore] Received data:', data);

			this._state.dungeonProgressId = data.dungeon_progress_id;
			this._state.dungeonId = data.dungeon.id;
			this._state.dungeonName = data.dungeon.name;
			this._state.dungeonDescription = data.dungeon.description;
			this._state.currentFloor = data.current_floor;
			this._state.maxFloors = data.dungeon.max_floors;
			this._state.monstersDefeated = 0;
			this._state.isInDungeon = true;
			this._state.canDescend = false;

			console.log('✅ [DungeonStore] Entered dungeon successfully:', {
				name: this._state.dungeonName,
				floor: this._state.currentFloor,
				maxFloors: this._state.maxFloors
			});

			// Reload character to get updated HP (in case of revival)
			console.log('🔄 [DungeonStore] Reloading character after dungeon entry...');
			await characterStore.loadCharacter(characterId);
		} catch (error) {
			console.error('❌ [DungeonStore] Failed to enter dungeon:', error);
			throw error;
		}
	}

	/**
	 * Get floor information
	 */
	async getFloorInfo(): Promise<void> {
		if (!this._state.dungeonProgressId) {
			throw new Error('Not in a dungeon');
		}

		try {
			const response = await fetch(`/api/dungeon/floor/${this._state.dungeonProgressId}`);

			if (!response.ok) {
				throw new Error('Failed to get floor info');
			}

			const data = await response.json();

			this._state.floorDifficulty = data.floor.difficulty_multiplier;
		} catch (error) {
			console.error('Failed to get floor info:', error);
			throw error;
		}
	}

	/**
	 * Descend to next floor
	 */
	async descendFloor(): Promise<void> {
		if (!this._state.dungeonProgressId) {
			throw new Error('Not in a dungeon');
		}

		if (!this._state.canDescend) {
			throw new Error('Cannot descend yet');
		}

		try {
			const response = await fetch('/api/dungeon/descend', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ dungeonProgressId: this._state.dungeonProgressId })
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to descend');
			}

			const data = await response.json();

			this._state.currentFloor = data.current_floor;
			this._state.maxFloors = data.max_floors;
			this._state.monstersDefeated = 0;
			this._state.canDescend = false;
		} catch (error) {
			console.error('Failed to descend floor:', error);
			throw error;
		}
	}

	/**
	 * Mark monster as defeated
	 */
	monsterDefeated(): void {
		this._state.monstersDefeated++;
		// Allow descent after defeating at least 1 monster (simplified for MVP)
		this._state.canDescend = true;
	}

	/**
	 * Exit dungeon
	 */
	exitDungeon(): void {
		this._state = {
			dungeonProgressId: null,
			dungeonId: null,
			dungeonName: '',
			dungeonDescription: '',
			currentFloor: 1,
			maxFloors: 5,
			floorDifficulty: 1.0,
			monstersDefeated: 0,
			isInDungeon: false,
			canDescend: false
		};
	}

	/**
	 * Reset store state
	 */
	reset(): void {
		this.exitDungeon();
	}
}

// Export singleton instance
export const dungeonStore = new DungeonStore();
