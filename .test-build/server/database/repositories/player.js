"use strict";
/**
 * Player Repository
 * Data access layer for player (user account) operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerRepository = void 0;
const connection_1 = require("../connection");
class PlayerRepository {
    constructor(database) {
        this.db = database || (0, connection_1.getDatabase)();
    }
    /**
     * Find player by ID
     */
    findById(id) {
        const stmt = this.db.prepare('SELECT * FROM players WHERE id = ?');
        return stmt.get(id) || null;
    }
    /**
     * Find player by email
     */
    findByEmail(email) {
        const stmt = this.db.prepare('SELECT * FROM players WHERE email = ?');
        return stmt.get(email) || null;
    }
    /**
     * Find player by username
     */
    findByUsername(username) {
        const stmt = this.db.prepare('SELECT * FROM players WHERE username = ?');
        return stmt.get(username) || null;
    }
    /**
     * Create a new player
     */
    create(data) {
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
        const player = this.findById(result.lastInsertRowid);
        if (!player) {
            throw new Error('Failed to create player');
        }
        return player;
    }
    /**
     * Update player data
     */
    update(id, data) {
        const updates = [];
        const params = { id };
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
    softDelete(id) {
        const stmt = this.db.prepare('UPDATE players SET is_active = 0 WHERE id = ?');
        stmt.run(id);
    }
    /**
     * Hard delete player (removes from database)
     */
    hardDelete(id) {
        const stmt = this.db.prepare('DELETE FROM players WHERE id = ?');
        stmt.run(id);
    }
    /**
     * Check if email exists
     */
    emailExists(email) {
        const stmt = this.db.prepare('SELECT COUNT(*) as count FROM players WHERE email = ?');
        const result = stmt.get(email);
        return result.count > 0;
    }
    /**
     * Check if username exists
     */
    usernameExists(username) {
        const stmt = this.db.prepare('SELECT COUNT(*) as count FROM players WHERE username = ?');
        const result = stmt.get(username);
        return result.count > 0;
    }
}
exports.PlayerRepository = PlayerRepository;
