/**
 * Database Optimization
 * Indexes and performance optimizations for SQLite
 */

import { getDatabase } from './connection.js';
import { logger } from '../utils/logger.js';

/**
 * Create performance indexes
 */
export function createPerformanceIndexes(): void {
	const db = getDatabase();

	try {
		logger.info('Creating performance indexes...');

		// Characters - frequently queried by player_id, level, and for leaderboards
		db.exec(`
			CREATE INDEX IF NOT EXISTS idx_characters_player_id ON characters(player_id);
			CREATE INDEX IF NOT EXISTS idx_characters_level ON characters(level DESC);
			CREATE INDEX IF NOT EXISTS idx_characters_active ON characters(is_active);
			CREATE INDEX IF NOT EXISTS idx_characters_name ON characters(name);
		`);

		// Dungeon progress - queried by character_id and floor
		db.exec(`
			CREATE INDEX IF NOT EXISTS idx_dungeon_progress_character ON dungeon_progress(character_id);
			CREATE INDEX IF NOT EXISTS idx_dungeon_progress_floor ON dungeon_progress(current_floor DESC);
			CREATE INDEX IF NOT EXISTS idx_dungeon_progress_character_dungeon ON dungeon_progress(character_id, dungeon_id);
		`);

		// Character quests - frequently queried by character and status
		db.exec(`
			CREATE INDEX IF NOT EXISTS idx_character_quests_character ON character_quests(character_id);
			CREATE INDEX IF NOT EXISTS idx_character_quests_status ON character_quests(status);
			CREATE INDEX IF NOT EXISTS idx_character_quests_character_status ON character_quests(character_id, status);
		`);

		// Combat instances - queried by character
		db.exec(`
			CREATE INDEX IF NOT EXISTS idx_combat_instances_character ON combat_instances(character_id);
			CREATE INDEX IF NOT EXISTS idx_combat_instances_status ON combat_instances(status);
		`);

		// Inventory - queried by character
		db.exec(`
			CREATE INDEX IF NOT EXISTS idx_inventory_items_character ON inventory_items(character_id);
			CREATE INDEX IF NOT EXISTS idx_inventory_items_equipped ON inventory_items(is_equipped);
		`);

		// Audit logs - for security monitoring
		db.exec(`
			CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
			CREATE INDEX IF NOT EXISTS idx_audit_logs_player_id ON audit_logs(player_id);
			CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
			CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
		`);

		logger.info('Performance indexes created successfully');
	} catch (error) {
		logger.error('Failed to create performance indexes:', error);
	}
}

/**
 * Analyze database for query optimization
 */
export function analyzeDatabase(): void {
	const db = getDatabase();

	try {
		logger.info('Analyzing database...');
		db.exec('ANALYZE;');
		logger.info('Database analysis complete');
	} catch (error) {
		logger.error('Failed to analyze database:', error);
	}
}

/**
 * Vacuum database to reclaim space
 */
export function vacuumDatabase(): void {
	const db = getDatabase();

	try {
		logger.info('Vacuuming database...');
		db.exec('VACUUM;');
		logger.info('Database vacuum complete');
	} catch (error) {
		logger.error('Failed to vacuum database:', error);
	}
}

/**
 * Get database statistics
 */
export function getDatabaseStats(): {
	pageCount: number;
	pageSize: number;
	freelistCount: number;
	cacheSize: number;
} {
	const db = getDatabase();

	try {
		const pageCount = db.prepare('PRAGMA page_count').get() as { page_count: number };
		const pageSize = db.prepare('PRAGMA page_size').get() as { page_size: number };
		const freelistCount = db.prepare('PRAGMA freelist_count').get() as {
			freelist_count: number;
		};
		const cacheSize = db.prepare('PRAGMA cache_size').get() as { cache_size: number };

		return {
			pageCount: pageCount.page_count,
			pageSize: pageSize.page_size,
			freelistCount: freelistCount.freelist_count,
			cacheSize: cacheSize.cache_size
		};
	} catch (error) {
		logger.error('Failed to get database stats:', error);
		return {
			pageCount: 0,
			pageSize: 0,
			freelistCount: 0,
			cacheSize: 0
		};
	}
}

/**
 * Optimize database (run periodically)
 */
export function optimizeDatabase(): void {
	logger.info('Starting database optimization...');

	createPerformanceIndexes();
	analyzeDatabase();

	// Vacuum only if there's significant fragmentation
	const stats = getDatabaseStats();
	const fragmentationRatio = stats.freelistCount / stats.pageCount;

	if (fragmentationRatio > 0.1) {
		logger.info(`Database fragmentation: ${(fragmentationRatio * 100).toFixed(2)}%`);
		vacuumDatabase();
	}

	logger.info('Database optimization complete');
}
