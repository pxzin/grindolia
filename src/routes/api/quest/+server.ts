/**
 * Quest List API Endpoint
 * GET /api/quest - Get available quests for character
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCharacterById } from '$server/database/repositories/character';
import { getQuestTemplatesByLevel } from '$server/database/repositories/quest-template';
import { getActiveQuests } from '$server/database/repositories/character-quest';

/**
 * GET /api/quest?characterId=123
 * Get available quests for a character
 */
export const GET: RequestHandler = async ({ url, locals }) => {
	// Check authentication
	if (!locals.session?.userId) {
		throw error(401, 'Authentication required');
	}

	try {
		const characterIdParam = url.searchParams.get('characterId');

		if (!characterIdParam) {
			throw error(400, 'Character ID is required');
		}

		const characterId = parseInt(characterIdParam, 10);

		if (isNaN(characterId)) {
			throw error(400, 'Invalid character ID');
		}

		const character = getCharacterById(characterId);

		if (!character) {
			throw error(404, 'Character not found');
		}

		// Verify ownership
		if (character.user_id !== locals.session.userId) {
			throw error(403, 'Access denied');
		}

		// Get available quests for character's level
		const availableQuests = getQuestTemplatesByLevel(character.level);

		// Get active quests
		const activeQuests = getActiveQuests(characterId);

		return json({
			success: true,
			quests: {
				available: availableQuests.map(quest => ({
					id: quest.id,
					title: quest.title,
					description: quest.description,
					minLevel: quest.min_level,
					maxLevel: quest.max_level,
					objectives: quest.objectives.map(obj => ({
						type: obj.type,
						description: obj.description,
						required: obj.required
					})),
					rewards: quest.rewards,
					isRepeatable: quest.is_repeatable,
					cooldownHours: quest.cooldown_hours
				})),
				active: activeQuests.map(quest => ({
					id: quest.id,
					questTemplateId: quest.quest_template_id,
					status: quest.status,
					progress: quest.progress,
					startedAt: quest.started_at
				}))
			}
		});
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}

		console.error('Failed to get quests:', err);
		throw error(500, 'Failed to get quests');
	}
};
