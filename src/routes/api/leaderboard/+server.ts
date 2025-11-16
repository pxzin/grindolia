/**
 * Leaderboard API Endpoint
 * GET /api/leaderboard?category=level&start=0&count=100
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getLeaderboard,
	getCharacterRank,
	type LeaderboardCategory
} from '../../../../server/game/leaderboard/sync.js';

export const GET: RequestHandler = async ({ url, locals }) => {
	try {
		const category = (url.searchParams.get('category') || 'level') as LeaderboardCategory;
		const start = parseInt(url.searchParams.get('start') || '0', 10);
		const count = Math.min(parseInt(url.searchParams.get('count') || '100', 10), 100); // Max 100
		const characterId = url.searchParams.get('characterId');

		// Validate category
		if (!['level', 'combatPower', 'dungeonFloor'].includes(category)) {
			return json({ error: 'Invalid category' }, { status: 400 });
		}

		// Get leaderboard entries
		const entries = await getLeaderboard(category, start, count);

		// If characterId is provided, get their rank
		let playerRank = null;
		if (characterId) {
			const charId = parseInt(characterId, 10);
			if (!isNaN(charId)) {
				playerRank = await getCharacterRank(charId, category);
			}
		}

		return json({
			category,
			entries,
			playerRank,
			start,
			count: entries.length,
			timestamp: Date.now()
		});
	} catch (error) {
		console.error('Error fetching leaderboard:', error);
		return json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
	}
};
