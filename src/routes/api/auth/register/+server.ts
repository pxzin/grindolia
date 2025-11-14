/**
 * Registration API Endpoint
 * POST /api/auth/register
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PlayerRepository } from '$server/database/repositories/player';
import { hashPassword } from '$server/utils/crypto';

interface RegisterRequest {
	email: string;
	username: string;
	password: string;
	preferred_locale?: string;
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Validate password strength
 */
function isValidPassword(password: string): boolean {
	// Min 8 characters, must contain uppercase, lowercase, and number
	if (password.length < 8) return false;
	if (!/[A-Z]/.test(password)) return false;
	if (!/[a-z]/.test(password)) return false;
	if (!/[0-9]/.test(password)) return false;
	return true;
}

/**
 * Validate username
 */
function isValidUsername(username: string): boolean {
	// 3-20 characters, alphanumeric + underscore
	const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
	return usernameRegex.test(username);
}

export const POST: RequestHandler = async ({ request }) => {
	console.log('[AUTH] Registration request received');
	try {
		const body = (await request.json()) as RegisterRequest;
		console.log('[AUTH] Request body:', { email: body.email, username: body.username });

		// Validation
		if (!body.email || !body.username || !body.password) {
			return json(
				{ error: 'Missing required fields: email, username, password' },
				{ status: 400 }
			);
		}

		// Validate email format
		if (!isValidEmail(body.email)) {
			return json({ error: 'Invalid email format' }, { status: 400 });
		}

		// Validate username
		if (!isValidUsername(body.username)) {
			return json(
				{ error: 'Username must be 3-20 characters, alphanumeric and underscore only' },
				{ status: 400 }
			);
		}

		// Validate password strength
		if (!isValidPassword(body.password)) {
			return json(
				{
					error:
						'Password must be at least 8 characters and contain uppercase, lowercase, and number'
				},
				{ status: 400 }
			);
		}

		console.log('[AUTH] Validation passed, creating PlayerRepository');
		const playerRepo = new PlayerRepository();

		// Check if email already exists
		console.log('[AUTH] Checking if email exists');
		if (playerRepo.emailExists(body.email)) {
			return json({ error: 'Email already registered' }, { status: 409 });
		}

		// Check if username already exists
		if (playerRepo.usernameExists(body.username)) {
			return json({ error: 'Username already taken' }, { status: 409 });
		}

		// Hash password
		const password_hash = await hashPassword(body.password);

		// Create player
		const player = playerRepo.create({
			email: body.email,
			username: body.username,
			password_hash,
			preferred_locale: body.preferred_locale || 'en'
		});

		// Return success (without sensitive data)
		return json(
			{
				success: true,
				player: {
					id: player.id,
					username: player.username,
					email: player.email,
					preferred_locale: player.preferred_locale,
					created_at: player.created_at
				}
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Registration error:', error);
		return json({ error: 'Registration failed. Please try again.' }, { status: 500 });
	}
};
