/**
 * Quest List API Endpoint
 * GET /api/quest - Get available quests for character
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { CharacterRepository } from '$server/database/repositories/character';
import { getQuestTemplatesByLevel } from '$server/database/repositories/quest-template';
import { getActiveQuests } from '$server/database/repositories/character-quest';
import { getDatabase } from '$server/database/connection';

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

		const db = getDatabase();
		const characterRepo = new CharacterRepository(db);

		const character = characterRepo.findById(characterId);

		if (!character) {
			throw error(404, 'Character not found');
		}

		// Verify ownership
		if (character.player_id !== locals.session.userId) {
			throw error(403, 'Access denied');
		}

		// Get available quests for character's level
		const availableQuestTemplates = getQuestTemplatesByLevel(character.level);

		// Get active quests
		const activeQuestList = getActiveQuests(characterId);

		// Filter out quests that are already active
		const activeQuestTemplateIds = new Set(activeQuestList.map((q) => q.quest_template_id));
		const filteredAvailableQuests = availableQuestTemplates.filter(
			(quest) => !activeQuestTemplateIds.has(quest.id)
		);

		return json({
			success: true,
			availableQuests: filteredAvailableQuests.map((quest) => ({
				id: quest.id,
				title: quest.title,
				description: quest.description,
				min_level: quest.min_level,
				max_level: quest.max_level,
				objectives: quest.objectives || [],
				rewards: quest.rewards || { xp: 0, currency: 0 },
				is_repeatable: quest.is_repeatable,
				cooldown_hours: quest.cooldown_hours
			})),
			activeQuests: activeQuestList.map((quest) => ({
				id: quest.id,
				quest_template_id: quest.quest_template_id,
				status: quest.status,
				progress: quest.progress || {},
				started_at: quest.started_at,
				template: quest.template
					? {
							title: quest.template.title,
							description: quest.template.description,
							min_level: quest.template.min_level,
							objectives: quest.template.objectives || [],
							rewards: quest.template.rewards || { xp: 0, currency: 0 }
						}
					: null
			}))
		});
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}

		console.error('Failed to get quests:', err);
		throw error(500, 'Failed to get quests');
	}
};
