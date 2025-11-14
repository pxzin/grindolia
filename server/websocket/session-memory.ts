/**
 * In-Memory Session Store (MVP Implementation)
 * Simple session management without Redis dependency
 * Note: Sessions will be lost on server restart
 */

const SESSION_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Session data structure
 */
export interface SessionData {
	userId: number;
	characterId?: number;
	username: string;
	connectedAt: number;
	lastActivity: number;
}

interface SessionEntry {
	data: SessionData;
	expiresAt: number;
}

// In-memory session store
const sessions = new Map<string, SessionEntry>();

/**
 * Clean up expired sessions periodically
 */
setInterval(() => {
	const now = Date.now();
	for (const [sessionId, entry] of sessions.entries()) {
		if (entry.expiresAt < now) {
			sessions.delete(sessionId);
		}
	}
}, 60 * 1000); // Clean every minute

/**
 * Create a new session
 */
export async function createSession(sessionId: string, data: SessionData): Promise<void> {
	sessions.set(sessionId, {
		data,
		expiresAt: Date.now() + SESSION_TTL
	});
}

/**
 * Get session data
 */
export async function getSession(sessionId: string): Promise<SessionData | null> {
	const entry = sessions.get(sessionId);

	if (!entry) {
		return null;
	}

	// Check if expired
	if (entry.expiresAt < Date.now()) {
		sessions.delete(sessionId);
		return null;
	}

	return entry.data;
}

/**
 * Update session data
 */
export async function updateSession(sessionId: string, data: Partial<SessionData>): Promise<void> {
	const entry = sessions.get(sessionId);

	if (!entry) {
		throw new Error('Session not found');
	}

	entry.data = {
		...entry.data,
		...data,
		lastActivity: Date.now()
	};

	entry.expiresAt = Date.now() + SESSION_TTL;
}

/**
 * Delete session
 */
export async function deleteSession(sessionId: string): Promise<void> {
	sessions.delete(sessionId);
}

/**
 * Refresh session TTL
 */
export async function refreshSession(sessionId: string): Promise<void> {
	const entry = sessions.get(sessionId);

	if (entry) {
		entry.expiresAt = Date.now() + SESSION_TTL;
	}
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId: number): Promise<string[]> {
	const userSessions: string[] = [];
	const now = Date.now();

	for (const [sessionId, entry] of sessions.entries()) {
		if (entry.expiresAt >= now && entry.data.userId === userId) {
			userSessions.push(sessionId);
		}
	}

	return userSessions;
}

/**
 * Close session store (no-op for in-memory implementation)
 */
export async function closeRedis(): Promise<void> {
	sessions.clear();
	console.log('✅ In-memory session store cleared');
}
