/**
 * Leaderboard Store
 * Manages leaderboard state with Svelte 5 runes
 */

export interface LeaderboardEntry {
	characterId: number;
	characterName: string;
	playerUsername: string;
	level: number;
	combatPower: number;
	maxFloorReached: number;
	className: string;
}

export type LeaderboardCategory = 'level' | 'combatPower' | 'dungeonFloor';

interface LeaderboardState {
	entries: LeaderboardEntry[];
	category: LeaderboardCategory;
	playerRank: number | null;
	loading: boolean;
	error: string | null;
	lastUpdate: number;
}

class LeaderboardStore {
	private state = $state<LeaderboardState>({
		entries: [],
		category: 'level',
		playerRank: null,
		loading: false,
		error: null,
		lastUpdate: 0
	});

	// Getters
	get entries() {
		return this.state.entries;
	}

	get category() {
		return this.state.category;
	}

	get playerRank() {
		return this.state.playerRank;
	}

	get loading() {
		return this.state.loading;
	}

	get error() {
		return this.state.error;
	}

	get lastUpdate() {
		return this.state.lastUpdate;
	}

	/**
	 * Fetch leaderboard from API
	 */
	async fetchLeaderboard(
		category: LeaderboardCategory = 'level',
		characterId?: number
	): Promise<void> {
		this.state.loading = true;
		this.state.error = null;

		try {
			const params = new URLSearchParams({
				category,
				start: '0',
				count: '100'
			});

			if (characterId) {
				params.append('characterId', characterId.toString());
			}

			const response = await fetch(`/api/leaderboard?${params}`);

			if (!response.ok) {
				throw new Error('Failed to fetch leaderboard');
			}

			const data = await response.json();

			this.state.entries = data.entries;
			this.state.category = category;
			this.state.playerRank = data.playerRank;
			this.state.lastUpdate = Date.now();
		} catch (err) {
			this.state.error = err instanceof Error ? err.message : 'Unknown error';
			console.error('Error fetching leaderboard:', err);
		} finally {
			this.state.loading = false;
		}
	}

	/**
	 * Update leaderboard from WebSocket message
	 */
	updateFromWebSocket(data: {
		category: LeaderboardCategory;
		entries: LeaderboardEntry[];
		playerRank: number | null;
	}): void {
		// Only update if it's for the current category
		if (data.category === this.state.category) {
			this.state.entries = data.entries;
			this.state.playerRank = data.playerRank;
			this.state.lastUpdate = Date.now();
		}
	}

	/**
	 * Change category
	 */
	setCategory(category: LeaderboardCategory): void {
		if (category !== this.state.category) {
			this.state.category = category;
			this.state.entries = [];
			this.state.playerRank = null;
		}
	}

	/**
	 * Clear leaderboard data
	 */
	clear(): void {
		this.state.entries = [];
		this.state.playerRank = null;
		this.state.error = null;
		this.state.lastUpdate = 0;
	}

	/**
	 * Get rank display (e.g., "1st", "2nd", "3rd", "4th")
	 */
	getRankDisplay(rank: number): string {
		if (rank % 100 >= 11 && rank % 100 <= 13) {
			return `${rank}th`;
		}
		switch (rank % 10) {
			case 1:
				return `${rank}st`;
			case 2:
				return `${rank}nd`;
			case 3:
				return `${rank}rd`;
			default:
				return `${rank}th`;
		}
	}

	/**
	 * Get category display name
	 */
	getCategoryName(category: LeaderboardCategory): string {
		const names = {
			level: 'Level',
			combatPower: 'Combat Power',
			dungeonFloor: 'Dungeon Floor'
		};
		return names[category];
	}
}

export const leaderboardStore = new LeaderboardStore();
