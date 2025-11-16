/**
 * Leaderboard WebSocket Handler
 * Real-time leaderboard updates
 */

import type { WebSocket } from 'ws';
import {
	getLeaderboard,
	getCharacterRank,
	type LeaderboardCategory
} from '../../game/leaderboard/sync.js';
import { logger } from '../../utils/logger.js';

export interface LeaderboardRequestMessage {
	type: 'leaderboard:request';
	category: LeaderboardCategory;
	start?: number;
	count?: number;
	characterId?: number;
}

export interface LeaderboardUpdateMessage {
	type: 'leaderboard:update';
	category: LeaderboardCategory;
	entries: any[];
	playerRank: number | null;
	timestamp: number;
}

/**
 * Handle leaderboard request from client
 */
export async function handleLeaderboardRequest(
	ws: WebSocket,
	message: LeaderboardRequestMessage
): Promise<void> {
	try {
		const { category, start = 0, count = 100, characterId } = message;

		// Validate category
		if (!['level', 'combatPower', 'dungeonFloor'].includes(category)) {
			ws.send(
				JSON.stringify({
					type: 'error',
					message: 'Invalid leaderboard category'
				})
			);
			return;
		}

		// Get leaderboard data
		const entries = await getLeaderboard(category, start, Math.min(count, 100));

		// Get player rank if characterId provided
		let playerRank = null;
		if (characterId) {
			playerRank = await getCharacterRank(characterId, category);
		}

		// Send response
		const response: LeaderboardUpdateMessage = {
			type: 'leaderboard:update',
			category,
			entries,
			playerRank,
			timestamp: Date.now()
		};

		ws.send(JSON.stringify(response));
		logger.debug(`Sent ${category} leaderboard to client (${entries.length} entries)`);
	} catch (error) {
		logger.error('Error handling leaderboard request:', error);
		ws.send(
			JSON.stringify({
				type: 'error',
				message: 'Failed to fetch leaderboard'
			})
		);
	}
}

/**
 * Broadcast leaderboard update to all connected clients
 */
export async function broadcastLeaderboardUpdate(
	wss: any,
	category: LeaderboardCategory
): Promise<void> {
	try {
		const entries = await getLeaderboard(category, 0, 100);

		const update: LeaderboardUpdateMessage = {
			type: 'leaderboard:update',
			category,
			entries,
			playerRank: null,
			timestamp: Date.now()
		};

		const message = JSON.stringify(update);

		// Broadcast to all connected clients
		wss.clients.forEach((client: WebSocket) => {
			if (client.readyState === 1) {
				// OPEN
				client.send(message);
			}
		});

		logger.debug(`Broadcasted ${category} leaderboard update to all clients`);
	} catch (error) {
		logger.error(`Error broadcasting ${category} leaderboard update:`, error);
	}
}
