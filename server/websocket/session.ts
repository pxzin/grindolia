/**
 * Session Management with Redis
 * Handles WebSocket session state and user authentication
 */

import Redis from 'ioredis';

const REDIS_CONFIG = {
	host: process.env.REDIS_HOST || 'localhost',
	port: parseInt(process.env.REDIS_PORT || '6379'),
	password: process.env.REDIS_PASSWORD || undefined,
	db: parseInt(process.env.REDIS_DB || '0')
};

const SESSION_TTL = 60 * 60; // 1 hour in seconds

let redis: Redis | null = null;

/**
 * Get or create Redis connection
 */
export function getRedis(): Redis {
	if (redis) {
		return redis;
	}

	redis = new Redis(REDIS_CONFIG);

	redis.on('connect', () => {
		console.log('✅ Redis connected');
	});

	redis.on('error', (error) => {
		console.error('❌ Redis error:', error);
	});

	return redis;
}

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

/**
 * Create a new session
 */
export async function createSession(sessionId: string, data: SessionData): Promise<void> {
	const client = getRedis();
	const key = `session:${sessionId}`;

	await client.setex(key, SESSION_TTL, JSON.stringify(data));
}

/**
 * Get session data
 */
export async function getSession(sessionId: string): Promise<SessionData | null> {
	const client = getRedis();
	const key = `session:${sessionId}`;

	const data = await client.get(key);
	if (!data) {
		return null;
	}

	return JSON.parse(data) as SessionData;
}

/**
 * Update session data
 */
export async function updateSession(sessionId: string, data: Partial<SessionData>): Promise<void> {
	const client = getRedis();
	const key = `session:${sessionId}`;

	const existing = await getSession(sessionId);
	if (!existing) {
		throw new Error('Session not found');
	}

	const updated = {
		...existing,
		...data,
		lastActivity: Date.now()
	};

	await client.setex(key, SESSION_TTL, JSON.stringify(updated));
}

/**
 * Delete session
 */
export async function deleteSession(sessionId: string): Promise<void> {
	const client = getRedis();
	const key = `session:${sessionId}`;

	await client.del(key);
}

/**
 * Refresh session TTL
 */
export async function refreshSession(sessionId: string): Promise<void> {
	const client = getRedis();
	const key = `session:${sessionId}`;

	await client.expire(key, SESSION_TTL);
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId: number): Promise<string[]> {
	const client = getRedis();
	const pattern = 'session:*';

	const keys = await client.keys(pattern);
	const userSessions: string[] = [];

	for (const key of keys) {
		const data = await client.get(key);
		if (data) {
			const session = JSON.parse(data) as SessionData;
			if (session.userId === userId) {
				userSessions.push(key.replace('session:', ''));
			}
		}
	}

	return userSessions;
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
	if (redis) {
		await redis.quit();
		redis = null;
		console.log('✅ Redis connection closed');
	}
}
