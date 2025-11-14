/**
 * Quest List Page Server
 * Load available and active quests
 */

import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { CharacterRepository } from '$server/database/repositories/character';
import { getQuestTemplatesByLevel } from '$server/database/repositories/quest-template';
import { getActiveQuests } from '$server/database/repositories/character-quest';
import { getDatabase } from '$server/database/connection';

export const load: PageServerLoad = async ({ url, locals }) => {
	// Check authentication
	if (!locals.session?.userId) {
		throw error(401, 'Authentication required');
	}

	try {
		// Get character ID from query params or session
		let characterId: number | null = null;
		const characterIdParam = url.searchParams.get('characterId');

		if (characterIdParam) {
			characterId = parseInt(characterIdParam, 10);
			if (isNaN(characterId)) {
				throw error(400, 'Invalid character ID');
			}
		} else if (locals.session?.characterId) {
			characterId = locals.session.characterId;
		}

		// If no character ID found, try to get the first character for this user
		if (!characterId) {
			const db = getDatabase();
			const characterRepo = new CharacterRepository(db);
			const characters = characterRepo.findByPlayerId(locals.session.userId);

			if (characters.length === 0) {
				throw error(404, 'No character found. Please create a character first.');
			}

			characterId = characters[0].id;
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
		const availableQuests = getQuestTemplatesByLevel(character.level);

		// Get active quests
		const activeQuests = getActiveQuests(characterId);

		return {
			character: {
				id: character.id,
				name: character.name,
				level: character.level
			},
			quests: {
				available: availableQuests.map((quest) => ({
					id: quest.id,
					title: quest.title,
					description: quest.description,
					minLevel: quest.min_level,
					maxLevel: quest.max_level,
					objectives: quest.objectives.map((obj) => ({
						type: obj.type,
						description: obj.description,
						target: obj.target,
						required: obj.required
					})),
					rewards: quest.rewards,
					isRepeatable: quest.is_repeatable,
					cooldownHours: quest.cooldown_hours
				})),
				active: activeQuests.map((quest) => ({
					id: quest.id,
					questTemplateId: quest.quest_template_id,
					status: quest.status,
					progress: quest.progress,
					startedAt: quest.started_at
				}))
			}
		};
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}

		console.error('Failed to load quests:', err);
		throw error(500, 'Failed to load quests');
	}
};
