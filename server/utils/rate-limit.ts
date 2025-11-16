/**
 * Rate Limiting Utility
 * Protect API endpoints from abuse
 */

import { getRedisClient } from '../websocket/redis.js';
import { logger } from './logger.js';

export interface RateLimitConfig {
	windowMs: number; // Time window in milliseconds
	maxRequests: number; // Max requests per window
	keyPrefix?: string; // Redis key prefix
}

export interface RateLimitResult {
	allowed: boolean;
	remaining: number;
	resetAt: number;
}

/**
 * Check rate limit for a given key
 */
export async function checkRateLimit(
	key: string,
	config: RateLimitConfig
): Promise<RateLimitResult> {
	const redis = getRedisClient();
	const {
		windowMs,
		maxRequests,
		keyPrefix = 'ratelimit'
	} = config;

	const redisKey = `${keyPrefix}:${key}`;
	const now = Date.now();
	const windowStart = now - windowMs;

	try {
		// Remove old entries outside the window
		await redis.zremrangebyscore(redisKey, 0, windowStart);

		// Count current requests in window
		const count = await redis.zcard(redisKey);

		if (count >= maxRequests) {
			// Get oldest request timestamp for reset time
			const oldest = await redis.zrange(redisKey, 0, 0, { WITHSCORES: true });
			const resetAt = oldest.length > 0
				? Number(oldest[1]) + windowMs
				: now + windowMs;

			return {
				allowed: false,
				remaining: 0,
				resetAt
			};
		}

		// Add current request
		await redis.zadd(redisKey, now, `${now}:${Math.random()}`);

		// Set TTL on key
		await redis.expire(redisKey, Math.ceil(windowMs / 1000));

		return {
			allowed: true,
			remaining: maxRequests - count - 1,
			resetAt: now + windowMs
		};
	} catch (error) {
		logger.error('Rate limit check error:', error);
		// Fail open - allow request if rate limit check fails
		return {
			allowed: true,
			remaining: maxRequests,
			resetAt: now + windowMs
		};
	}
}

/**
 * Preset rate limit configurations
 */
export const RateLimits = {
	// Strict - for sensitive endpoints like auth
	STRICT: {
		windowMs: 15 * 60 * 1000, // 15 minutes
		maxRequests: 5
	},
	// Standard - for normal API endpoints
	STANDARD: {
		windowMs: 60 * 1000, // 1 minute
		maxRequests: 60
	},
	// Relaxed - for public endpoints
	RELAXED: {
		windowMs: 60 * 1000, // 1 minute
		maxRequests: 120
	},
	// Per-character - for character-specific actions
	PER_CHARACTER: {
		windowMs: 10 * 1000, // 10 seconds
		maxRequests: 10
	}
} as const;

/**
 * Rate limit middleware for SvelteKit endpoints
 */
export async function rateLimitMiddleware(
	request: Request,
	config: RateLimitConfig,
	identifier: string
): Promise<RateLimitResult> {
	return checkRateLimit(identifier, config);
}

/**
 * Get rate limit key from request
 */
export function getRateLimitKey(request: Request, prefix: string = ''): string {
	// Try to get IP from headers
	const forwarded = request.headers.get('x-forwarded-for');
	const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

	return prefix ? `${prefix}:${ip}` : ip;
}

/**
 * Rate limit response headers
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
	return {
		'X-RateLimit-Remaining': result.remaining.toString(),
		'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
		...(result.allowed ? {} : { 'Retry-After': Math.ceil((result.resetAt - Date.now()) / 1000).toString() })
	};
}
