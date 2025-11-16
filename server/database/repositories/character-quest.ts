/**
 * Character Quest Repository
 * Database operations for character quest progress
 */

import { getDatabase } from '../connection';
import type { QuestObjective } from '$lib/types/quest';

export interface CharacterQuest {
	id: number;
	character_id: number;
	quest_template_id: number;
	status: 'in_progress' | 'completed' | 'failed';
	progress: Record<string, number>;
	started_at: number;
	completed_at: number | null;
	template?: {
		id: number;
		title: string;
		description: string;
		min_level: number;
		max_level: number | null;
		objectives: QuestObjective[];
		rewards: { xp: number; currency: number };
		is_repeatable: boolean;
		cooldown_hours: number | null;
	};
}

/**
 * Get character quest by ID
 */
export function getCharacterQuestById(id: number): CharacterQuest | null {
	const db = getDatabase();
	const stmt = db.prepare('SELECT * FROM character_quests WHERE id = ?');
	const row = stmt.get(id) as Omit<CharacterQuest, 'progress' | 'template'> & { progress: string } | null;

	if (!row) return null;

	return {
		...row,
		progress: JSON.parse(row.progress) as Record<string, number>
	};
}

/**
 * Get all quests for a character
 */
export function getCharacterQuests(characterId: number, status?: CharacterQuest['status']): CharacterQuest[] {
	const db = getDatabase();

	let query = 'SELECT * FROM character_quests WHERE character_id = ?';
	const params: unknown[] = [characterId];

	if (status) {
		query += ' AND status = ?';
		params.push(status);
	}

	query += ' ORDER BY started_at DESC';

	const stmt = db.prepare(query);
	const rows = stmt.all(...params) as Array<Omit<CharacterQuest, 'progress' | 'template'> & { progress: string }>;

	return rows.map(row => ({
		...row,
		progress: JSON.parse(row.progress) as Record<string, number>
	}));
}

/**
 * Get active quests for a character with template data
 */
export function getActiveQuests(characterId: number): CharacterQuest[] {
	const db = getDatabase();

	const query = `
		SELECT
			cq.id,
			cq.character_id,
			cq.quest_template_id,
			cq.status,
			cq.progress,
			cq.started_at,
			cq.completed_at,
			qt.id as template_id,
			qt.title as template_title,
			qt.description as template_description,
			qt.min_level as template_min_level,
			qt.max_level as template_max_level,
			qt.objectives as template_objectives,
			qt.rewards as template_rewards,
			qt.is_repeatable as template_is_repeatable,
			qt.cooldown_hours as template_cooldown_hours
		FROM character_quests cq
		JOIN quest_templates qt ON cq.quest_template_id = qt.id
		WHERE cq.character_id = ? AND cq.status = ?
		ORDER BY cq.started_at DESC
	`;

	const stmt = db.prepare(query);
	const rows = stmt.all(characterId, 'in_progress') as Array<{
		id: number;
		character_id: number;
		quest_template_id: number;
		status: 'in_progress' | 'completed' | 'failed';
		progress: string;
		started_at: number;
		completed_at: number | null;
		template_id: number;
		template_title: string;
		template_description: string;
		template_min_level: number;
		template_max_level: number | null;
		template_objectives: string;
		template_rewards: string;
		template_is_repeatable: number;
		template_cooldown_hours: number | null;
	}>;

	return rows.map(row => ({
		id: row.id,
		character_id: row.character_id,
		quest_template_id: row.quest_template_id,
		status: row.status,
		progress: JSON.parse(row.progress) as Record<string, number>,
		started_at: row.started_at,
		completed_at: row.completed_at,
		template: {
			id: row.template_id,
			title: row.template_title,
			description: row.template_description,
			min_level: row.template_min_level,
			max_level: row.template_max_level,
			objectives: JSON.parse(row.template_objectives) as QuestObjective[],
			rewards: JSON.parse(row.template_rewards) as { xp: number; currency: number },
			is_repeatable: Boolean(row.template_is_repeatable),
			cooldown_hours: row.template_cooldown_hours
		}
	}));
}

/**
 * Check if character has quest
 */
export function hasQuest(characterId: number, questTemplateId: number): boolean {
	const db = getDatabase();
	const stmt = db.prepare('SELECT COUNT(*) as count FROM character_quests WHERE character_id = ? AND quest_template_id = ? AND status = ?');
	const result = stmt.get(characterId, questTemplateId, 'in_progress') as { count: number };
	return result.count > 0;
}

/**
 * Get quest completion time (for cooldown check)
 */
export function getLastCompletionTime(characterId: number, questTemplateId: number): number | null {
	const db = getDatabase();
	const stmt = db.prepare('SELECT MAX(completed_at) as last_completion FROM character_quests WHERE character_id = ? AND quest_template_id = ? AND status = ?');
	const result = stmt.get(characterId, questTemplateId, 'completed') as { last_completion: number | null };
	return result.last_completion;
}

/**
 * Create character quest (accept quest)
 */
export function createCharacterQuest(
	characterId: number,
	questTemplateId: number,
	initialProgress: Record<string, number>
): CharacterQuest {
	const db = getDatabase();
	const stmt = db.prepare(`
		INSERT INTO character_quests (
			character_id, quest_template_id, status, progress, started_at
		)
		VALUES (?, ?, ?, ?, ?)
	`);

	const now = Math.floor(Date.now() / 1000);
	const result = stmt.run(
		characterId,
		questTemplateId,
		'in_progress',
		JSON.stringify(initialProgress),
		now
	);

	return {
		id: result.lastInsertRowid as number,
		character_id: characterId,
		quest_template_id: questTemplateId,
		status: 'in_progress',
		progress: initialProgress,
		started_at: now,
		completed_at: null
	};
}

/**
 * Update quest progress
 */
export function updateQuestProgress(id: number, progress: Record<string, number>): boolean {
	const db = getDatabase();
	const stmt = db.prepare('UPDATE character_quests SET progress = ? WHERE id = ?');
	const result = stmt.run(JSON.stringify(progress), id);
	return result.changes > 0;
}

/**
 * Complete quest
 */
export function completeQuest(id: number): boolean {
	const db = getDatabase();
	const now = Math.floor(Date.now() / 1000);
	const stmt = db.prepare('UPDATE character_quests SET status = ?, completed_at = ? WHERE id = ?');
	const result = stmt.run('completed', now, id);
	return result.changes > 0;
}

/**
 * Fail quest
 */
export function failQuest(id: number): boolean {
	const db = getDatabase();
	const stmt = db.prepare('UPDATE character_quests SET status = ? WHERE id = ?');
	const result = stmt.run('failed', id);
	return result.changes > 0;
}

/**
 * Abandon quest (delete)
 */
export function abandonQuest(id: number): boolean {
	const db = getDatabase();
	const stmt = db.prepare('DELETE FROM character_quests WHERE id = ?');
	const result = stmt.run(id);
	return result.changes > 0;
}
