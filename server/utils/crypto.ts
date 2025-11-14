/**
 * Cryptography Utilities
 * Password hashing and verification using bcrypt
 */

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

/**
 * Generate a random token
 */
export function generateToken(length: number = 32): string {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let token = '';

	for (let i = 0; i < length; i++) {
		token += characters.charAt(Math.floor(Math.random() * characters.length));
	}

	return token;
}

/**
 * Generate a session ID
 */
export function generateSessionId(): string {
	return `sess_${generateToken(48)}_${Date.now()}`;
}
