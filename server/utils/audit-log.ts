/**
 * Audit Logging System
 * Track suspicious activity and security events
 */

import { getDatabase } from '../database/connection.js';
import { logger } from './logger.js';

export type AuditEventType =
	| 'AUTH_FAILED'
	| 'AUTH_SUCCESS'
	| 'RATE_LIMIT_EXCEEDED'
	| 'INVALID_INPUT'
	| 'UNAUTHORIZED_ACCESS'
	| 'CHARACTER_DELETED'
	| 'SUSPICIOUS_ACTIVITY'
	| 'ADMIN_ACTION';

export interface AuditLogEntry {
	eventType: AuditEventType;
	playerId?: number;
	characterId?: number;
	ipAddress?: string;
	userAgent?: string;
	details: Record<string, any>;
	severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Log an audit event
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
	const db = getDatabase();

	try {
		// Create audit_logs table if it doesn't exist
		db.exec(`
			CREATE TABLE IF NOT EXISTS audit_logs (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				event_type TEXT NOT NULL,
				player_id INTEGER,
				character_id INTEGER,
				ip_address TEXT,
				user_agent TEXT,
				details TEXT NOT NULL,
				severity TEXT NOT NULL,
				created_at INTEGER NOT NULL DEFAULT (unixepoch())
			);

			CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
			CREATE INDEX IF NOT EXISTS idx_audit_logs_player_id ON audit_logs(player_id);
			CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
			CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
		`);

		// Insert audit log
		db.prepare(
			`
			INSERT INTO audit_logs (
				event_type, player_id, character_id, ip_address, user_agent, details, severity
			) VALUES (?, ?, ?, ?, ?, ?, ?)
		`
		).run(
			entry.eventType,
			entry.playerId ?? null,
			entry.characterId ?? null,
			entry.ipAddress ?? null,
			entry.userAgent ?? null,
			JSON.stringify(entry.details),
			entry.severity
		);

		// Log to console for critical/high severity
		if (entry.severity === 'critical' || entry.severity === 'high') {
			logger.warn(`[AUDIT] ${entry.eventType}:`, entry.details);
		}
	} catch (error) {
		logger.error('Failed to log audit event:', error);
	}
}

/**
 * Get request metadata
 */
export function getRequestMetadata(request: Request): Pick<AuditLogEntry, 'ipAddress' | 'userAgent'> {
	const forwarded = request.headers.get('x-forwarded-for');
	const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
	const userAgent = request.headers.get('user-agent') || 'unknown';

	return {
		ipAddress: ip,
		userAgent
	};
}

/**
 * Log failed authentication attempt
 */
export async function logFailedAuth(
	request: Request,
	details: { email?: string; username?: string; reason: string }
): Promise<void> {
	await logAuditEvent({
		eventType: 'AUTH_FAILED',
		...getRequestMetadata(request),
		details,
		severity: 'medium'
	});
}

/**
 * Log successful authentication
 */
export async function logSuccessfulAuth(
	request: Request,
	playerId: number,
	details: { email?: string; username?: string }
): Promise<void> {
	await logAuditEvent({
		eventType: 'AUTH_SUCCESS',
		playerId,
		...getRequestMetadata(request),
		details,
		severity: 'low'
	});
}

/**
 * Log rate limit exceeded
 */
export async function logRateLimitExceeded(
	request: Request,
	details: { endpoint: string; limit: number }
): Promise<void> {
	await logAuditEvent({
		eventType: 'RATE_LIMIT_EXCEEDED',
		...getRequestMetadata(request),
		details,
		severity: 'medium'
	});
}

/**
 * Log suspicious activity
 */
export async function logSuspiciousActivity(
	request: Request,
	playerId: number | undefined,
	details: { activity: string; reason: string }
): Promise<void> {
	await logAuditEvent({
		eventType: 'SUSPICIOUS_ACTIVITY',
		playerId,
		...getRequestMetadata(request),
		details,
		severity: 'high'
	});
}

/**
 * Query audit logs
 */
export function getAuditLogs(filters: {
	eventType?: AuditEventType;
	playerId?: number;
	severity?: string;
	limit?: number;
	offset?: number;
}): any[] {
	const db = getDatabase();

	let query = 'SELECT * FROM audit_logs WHERE 1=1';
	const params: any[] = [];

	if (filters.eventType) {
		query += ' AND event_type = ?';
		params.push(filters.eventType);
	}

	if (filters.playerId) {
		query += ' AND player_id = ?';
		params.push(filters.playerId);
	}

	if (filters.severity) {
		query += ' AND severity = ?';
		params.push(filters.severity);
	}

	query += ' ORDER BY created_at DESC';

	if (filters.limit) {
		query += ' LIMIT ?';
		params.push(filters.limit);
	}

	if (filters.offset) {
		query += ' OFFSET ?';
		params.push(filters.offset);
	}

	try {
		return db.prepare(query).all(...params);
	} catch (error) {
		logger.error('Failed to query audit logs:', error);
		return [];
	}
}

/**
 * Clean old audit logs (keep last 90 days)
 */
export function cleanOldAuditLogs(): void {
	const db = getDatabase();
	const ninetyDaysAgo = Math.floor(Date.now() / 1000) - 90 * 24 * 60 * 60;

	try {
		const result = db
			.prepare('DELETE FROM audit_logs WHERE created_at < ?')
			.run(ninetyDaysAgo);

		logger.info(`Cleaned ${result.changes} old audit log entries`);
	} catch (error) {
		logger.error('Failed to clean old audit logs:', error);
	}
}
