/**
 * Quest Template Repository
 * Database operations for quest templates (quest definitions)
 */

import { getDatabase } from '../connection';
import type { QuestObjective, QuestRewards } from '$lib/types/quest';

export interface QuestTemplate {
	id: number;
	title: string;
	description: string;
	zone_id: number | null;
	min_level: number;
	max_level: number | null;
	objectives: QuestObjective[];
	rewards: QuestRewards;
	is_repeatable: boolean;
	cooldown_hours: number | null;
	created_at: number;
}

/**
 * Get quest template by ID
 */
export function getQuestTemplateById(id: number): QuestTemplate | null {
	const db = getDatabase();
	const stmt = db.prepare('SELECT * FROM quest_templates WHERE id = ?');
	const row = stmt.get(id) as Omit<QuestTemplate, 'objectives' | 'rewards'> & { objectives: string; rewards: string } | null;

	if (!row) return null;

	return {
		...row,
		objectives: JSON.parse(row.objectives) as QuestObjective[],
		rewards: JSON.parse(row.rewards) as QuestRewards
	};
}

/**
 * Get all quest templates
 */
export function getAllQuestTemplates(): QuestTemplate[] {
	const db = getDatabase();
	const stmt = db.prepare('SELECT * FROM quest_templates ORDER BY min_level ASC');
	const rows = stmt.all() as Array<Omit<QuestTemplate, 'objectives' | 'rewards'> & { objectives: string; rewards: string }>;

	return rows.map(row => ({
		...row,
		objectives: JSON.parse(row.objectives) as QuestObjective[],
		rewards: JSON.parse(row.rewards) as QuestRewards
	}));
}

/**
 * Get quest templates by zone
 */
export function getQuestTemplatesByZone(zoneId: number): QuestTemplate[] {
	const db = getDatabase();
	const stmt = db.prepare('SELECT * FROM quest_templates WHERE zone_id = ? ORDER BY min_level ASC');
	const rows = stmt.all(zoneId) as Array<Omit<QuestTemplate, 'objectives' | 'rewards'> & { objectives: string; rewards: string }>;

	return rows.map(row => ({
		...row,
		objectives: JSON.parse(row.objectives) as QuestObjective[],
		rewards: JSON.parse(row.rewards) as QuestRewards
	}));
}

/**
 * Get quest templates by level range
 */
export function getQuestTemplatesByLevel(level: number): QuestTemplate[] {
	const db = getDatabase();
	const stmt = db.prepare('SELECT * FROM quest_templates WHERE min_level <= ? AND (max_level IS NULL OR max_level >= ?) ORDER BY min_level ASC');
	const rows = stmt.all(level, level) as Array<Omit<QuestTemplate, 'objectives' | 'rewards'> & { objectives: string; rewards: string }>;

	return rows.map(row => ({
		...row,
		objectives: JSON.parse(row.objectives) as QuestObjective[],
		rewards: JSON.parse(row.rewards) as QuestRewards
	}));
}

/**
 * Create quest template
 */
export function createQuestTemplate(quest: Omit<QuestTemplate, 'id' | 'created_at'>): QuestTemplate {
	const db = getDatabase();
	const stmt = db.prepare(`
		INSERT INTO quest_templates (
			title, description, zone_id, min_level, max_level,
			objectives, rewards, is_repeatable, cooldown_hours, created_at
		)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`);

	const now = Math.floor(Date.now() / 1000);
	const result = stmt.run(
		quest.title,
		quest.description,
		quest.zone_id,
		quest.min_level,
		quest.max_level,
		JSON.stringify(quest.objectives),
		JSON.stringify(quest.rewards),
		quest.is_repeatable ? 1 : 0,
		quest.cooldown_hours,
		now
	);

	return {
		id: result.lastInsertRowid as number,
		...quest,
		created_at: now
	};
}

/**
 * Update quest template
 */
export function updateQuestTemplate(
	id: number,
	updates: Partial<Omit<QuestTemplate, 'id' | 'created_at'>>
): boolean {
	const db = getDatabase();
	const fields: string[] = [];
	const values: unknown[] = [];

	if (updates.title !== undefined) {
		fields.push('title = ?');
		values.push(updates.title);
	}
	if (updates.description !== undefined) {
		fields.push('description = ?');
		values.push(updates.description);
	}
	if (updates.zone_id !== undefined) {
		fields.push('zone_id = ?');
		values.push(updates.zone_id);
	}
	if (updates.min_level !== undefined) {
		fields.push('min_level = ?');
		values.push(updates.min_level);
	}
	if (updates.max_level !== undefined) {
		fields.push('max_level = ?');
		values.push(updates.max_level);
	}
	if (updates.objectives !== undefined) {
		fields.push('objectives = ?');
		values.push(JSON.stringify(updates.objectives));
	}
	if (updates.rewards !== undefined) {
		fields.push('rewards = ?');
		values.push(JSON.stringify(updates.rewards));
	}
	if (updates.is_repeatable !== undefined) {
		fields.push('is_repeatable = ?');
		values.push(updates.is_repeatable ? 1 : 0);
	}
	if (updates.cooldown_hours !== undefined) {
		fields.push('cooldown_hours = ?');
		values.push(updates.cooldown_hours);
	}

	if (fields.length === 0) return false;

	values.push(id);
	const stmt = db.prepare(`UPDATE quest_templates SET ${fields.join(', ')} WHERE id = ?`);
	const result = stmt.run(...values);
	return result.changes > 0;
}

/**
 * Delete quest template
 */
export function deleteQuestTemplate(id: number): boolean {
	const db = getDatabase();
	const stmt = db.prepare('DELETE FROM quest_templates WHERE id = ?');
	const result = stmt.run(id);
	return result.changes > 0;
}
