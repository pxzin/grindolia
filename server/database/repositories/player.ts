/**
 * Player Repository
 * Data access layer for player (user account) operations
 */

import type Database from 'better-sqlite3';
import { getDatabase } from '../connection';

export interface Player {
	id: number;
	email: string;
	password_hash: string;
	username: string;
	created_at: number;
	last_login_at: number | null;
	is_active: number;
	preferred_locale: string;
}

export interface CreatePlayerData {
	email: string;
	password_hash: string;
	username: string;
	preferred_locale?: string;
}

export interface UpdatePlayerData {
	last_login_at?: number;
	is_active?: number;
	preferred_locale?: string;
}

export class PlayerRepository {
	private db: Database.Database;

	constructor(database?: Database.Database) {
		this.db = database || getDatabase();
	}

	/**
	 * Find player by ID
	 */
	findById(id: number): Player | null {
		const stmt = this.db.prepare('SELECT * FROM players WHERE id = ?');
		return (stmt.get(id) as Player) || null;
	}

	/**
	 * Find player by email
	 */
	findByEmail(email: string): Player | null {
		const stmt = this.db.prepare('SELECT * FROM players WHERE email = ?');
		return (stmt.get(email) as Player) || null;
	}

	/**
	 * Find player by username
	 */
	findByUsername(username: string): Player | null {
		const stmt = this.db.prepare('SELECT * FROM players WHERE username = ?');
		return (stmt.get(username) as Player) || null;
	}

	/**
	 * Create a new player
	 */
	create(data: CreatePlayerData): Player {
		const stmt = this.db.prepare(`
			INSERT INTO players (email, password_hash, username, preferred_locale)
			VALUES (@email, @password_hash, @username, @preferred_locale)
		`);

		const result = stmt.run({
			email: data.email,
			password_hash: data.password_hash,
			username: data.username,
			preferred_locale: data.preferred_locale || 'en'
		});

		const player = this.findById(result.lastInsertRowid as number);
		if (!player) {
			throw new Error('Failed to create player');
		}

		return player;
	}

	/**
	 * Update player data
	 */
	update(id: number, data: UpdatePlayerData): Player {
		const updates: string[] = [];
		const params: Record<string, unknown> = { id };

		if (data.last_login_at !== undefined) {
			updates.push('last_login_at = @last_login_at');
			params.last_login_at = data.last_login_at;
		}

		if (data.is_active !== undefined) {
			updates.push('is_active = @is_active');
			params.is_active = data.is_active;
		}

		if (data.preferred_locale !== undefined) {
			updates.push('preferred_locale = @preferred_locale');
			params.preferred_locale = data.preferred_locale;
		}

		if (updates.length === 0) {
			throw new Error('No fields to update');
		}

		const stmt = this.db.prepare(`
			UPDATE players
			SET ${updates.join(', ')}
			WHERE id = @id
		`);

		stmt.run(params);

		const player = this.findById(id);
		if (!player) {
			throw new Error('Player not found after update');
		}

		return player;
	}

	/**
	 * Delete player (soft delete by setting is_active = 0)
	 */
	softDelete(id: number): void {
		const stmt = this.db.prepare('UPDATE players SET is_active = 0 WHERE id = ?');
		stmt.run(id);
	}

	/**
	 * Hard delete player (removes from database)
	 */
	hardDelete(id: number): void {
		const stmt = this.db.prepare('DELETE FROM players WHERE id = ?');
		stmt.run(id);
	}

	/**
	 * Check if email exists
	 */
	emailExists(email: string): boolean {
		const stmt = this.db.prepare('SELECT COUNT(*) as count FROM players WHERE email = ?');
		const result = stmt.get(email) as { count: number };
		return result.count > 0;
	}

	/**
	 * Check if username exists
	 */
	usernameExists(username: string): boolean {
		const stmt = this.db.prepare('SELECT COUNT(*) as count FROM players WHERE username = ?');
		const result = stmt.get(username) as { count: number };
		return result.count > 0;
	}
}
