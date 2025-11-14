/**
 * Login API Endpoint
 * POST /api/auth/login
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PlayerRepository } from '../../../../../server/database/repositories/player';
import { verifyPassword, generateSessionId } from '../../../../../server/utils/crypto';
import { createSession } from '../../../../../server/websocket/session';

interface LoginRequest {
	email: string;
	password: string;
}

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const body = (await request.json()) as LoginRequest;

		// Validation
		if (!body.email || !body.password) {
			return json({ error: 'Missing required fields: email, password' }, { status: 400 });
		}

		const playerRepo = new PlayerRepository();

		// Find player by email
		const player = playerRepo.findByEmail(body.email);

		if (!player) {
			return json({ error: 'Invalid email or password' }, { status: 401 });
		}

		// Check if account is active
		if (!player.is_active) {
			return json({ error: 'Account is deactivated' }, { status: 403 });
		}

		// Verify password
		const isValid = await verifyPassword(body.password, player.password_hash);

		if (!isValid) {
			return json({ error: 'Invalid email or password' }, { status: 401 });
		}

		// Update last login timestamp
		playerRepo.update(player.id, { last_login_at: Math.floor(Date.now() / 1000) });

		// Generate session ID
		const sessionId = generateSessionId();

		// Create session in Redis
		await createSession(sessionId, {
			userId: player.id,
			username: player.username,
			connectedAt: Date.now(),
			lastActivity: Date.now()
		});

		// Set session cookie
		cookies.set('session_id', sessionId, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7 // 7 days
		});

		// Return success
		return json({
			success: true,
			player: {
				id: player.id,
				username: player.username,
				email: player.email,
				preferred_locale: player.preferred_locale
			},
			sessionId
		});
	} catch (error) {
		console.error('Login error:', error);
		return json({ error: 'Login failed. Please try again.' }, { status: 500 });
	}
};
