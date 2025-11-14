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
	progress: QuestObjective[];
	started_at: number;
	completed_at: number | null;
}

/**
 * Get character quest by ID
 */
export function getCharacterQuestById(id: number): CharacterQuest | null {
	const db = getDatabase();
	const stmt = db.prepare('SELECT * FROM character_quests WHERE id = ?');
	const row = stmt.get(id) as Omit<CharacterQuest, 'progress'> & { progress: string } | null;

	if (!row) return null;

	return {
		...row,
		progress: JSON.parse(row.progress) as QuestObjective[]
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
	const rows = stmt.all(...params) as Array<Omit<CharacterQuest, 'progress'> & { progress: string }>;

	return rows.map(row => ({
		...row,
		progress: JSON.parse(row.progress) as QuestObjective[]
	}));
}

/**
 * Get active quests for a character
 */
export function getActiveQuests(characterId: number): CharacterQuest[] {
	return getCharacterQuests(characterId, 'in_progress');
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
	initialProgress: QuestObjective[]
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
export function updateQuestProgress(id: number, progress: QuestObjective[]): boolean {
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
