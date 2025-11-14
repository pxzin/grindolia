/**
 * Validation Utilities
 * Common validation functions for server-side operations
 */

/**
 * Email validation
 */
export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email) && email.length <= 255;
}

/**
 * Username validation
 * - 3-20 characters
 * - Alphanumeric and underscores only
 */
export function isValidUsername(username: string): boolean {
	const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
	return usernameRegex.test(username);
}

/**
 * Password strength validation
 * - At least 8 characters
 * - Contains uppercase letter
 * - Contains lowercase letter
 * - Contains number
 */
export function isValidPassword(password: string): boolean {
	if (password.length < 8) return false;

	const hasUppercase = /[A-Z]/.test(password);
	const hasLowercase = /[a-z]/.test(password);
	const hasNumber = /[0-9]/.test(password);

	return hasUppercase && hasLowercase && hasNumber;
}

/**
 * Get password strength score (0-4)
 */
export function getPasswordStrength(password: string): number {
	let score = 0;

	if (password.length >= 8) score++;
	if (password.length >= 12) score++;
	if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
	if (/[0-9]/.test(password)) score++;
	if (/[^A-Za-z0-9]/.test(password)) score++;

	return Math.min(score, 4);
}

/**
 * Character name validation
 * - 2-30 characters
 * - Letters, numbers, spaces, hyphens, apostrophes
 * - Must start with a letter
 */
export function isValidCharacterName(name: string): boolean {
	const nameRegex = /^[a-zA-Z][a-zA-Z0-9\s'-]{1,29}$/;
	return nameRegex.test(name);
}

/**
 * ID validation (positive integer)
 */
export function isValidId(id: unknown): id is number {
	return typeof id === 'number' && Number.isInteger(id) && id > 0;
}

/**
 * Quantity validation (positive integer within max)
 */
export function isValidQuantity(quantity: unknown, max: number = 999999): boolean {
	return typeof quantity === 'number' && Number.isInteger(quantity) && quantity > 0 && quantity <= max;
}

/**
 * Price validation (non-negative integer)
 */
export function isValidPrice(price: unknown): price is number {
	return typeof price === 'number' && Number.isInteger(price) && price >= 0;
}

/**
 * Level validation (1-100)
 */
export function isValidLevel(level: unknown): level is number {
	return typeof level === 'number' && Number.isInteger(level) && level >= 1 && level <= 100;
}

/**
 * Stat value validation (0-10000)
 */
export function isValidStatValue(value: unknown): value is number {
	return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 10000;
}

/**
 * Duration validation (1-168 hours)
 */
export function isValidDuration(hours: unknown): hours is number {
	return typeof hours === 'number' && Number.isInteger(hours) && hours >= 1 && hours <= 168;
}

/**
 * Enum validation
 */
export function isValidEnum<T extends string>(value: unknown, validValues: T[]): value is T {
	return typeof value === 'string' && validValues.includes(value as T);
}

/**
 * Sanitize string input
 * - Trim whitespace
 * - Remove null bytes
 * - Limit length
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
	return input
		.replace(/\0/g, '') // Remove null bytes
		.trim()
		.slice(0, maxLength);
}

/**
 * Validate required fields in object
 */
export function hasRequiredFields<T extends Record<string, unknown>>(
	obj: unknown,
	requiredFields: (keyof T)[]
): obj is T {
	if (typeof obj !== 'object' || obj === null) return false;

	return requiredFields.every((field) => field in obj);
}

/**
 * Validate array of specific type
 */
export function isArrayOf<T>(
	value: unknown,
	validator: (item: unknown) => item is T
): value is T[] {
	return Array.isArray(value) && value.every(validator);
}

/**
 * Rate limit key generation
 */
export function getRateLimitKey(prefix: string, identifier: string): string {
	return `ratelimit:${prefix}:${identifier}`;
}

/**
 * Validate pagination parameters
 */
export interface PaginationParams {
	page: number;
	limit: number;
}

export function validatePagination(
	page: unknown,
	limit: unknown,
	maxLimit: number = 100
): PaginationParams | null {
	if (
		typeof page !== 'number' ||
		typeof limit !== 'number' ||
		!Number.isInteger(page) ||
		!Number.isInteger(limit)
	) {
		return null;
	}

	if (page < 1 || limit < 1 || limit > maxLimit) {
		return null;
	}

	return { page, limit };
}

/**
 * Calculate pagination offset
 */
export function getPaginationOffset(page: number, limit: number): number {
	return (page - 1) * limit;
}

/**
 * Validate sort direction
 */
export type SortDirection = 'asc' | 'desc';

export function isValidSortDirection(value: unknown): value is SortDirection {
	return value === 'asc' || value === 'desc';
}

/**
 * Validate JSON string
 */
export function isValidJSON(str: string): boolean {
	try {
		JSON.parse(str);
		return true;
	} catch {
		return false;
	}
}

/**
 * Parse and validate JSON with type guard
 */
export function parseJSON<T>(
	str: string,
	validator: (value: unknown) => value is T
): T | null {
	try {
		const parsed = JSON.parse(str);
		return validator(parsed) ? parsed : null;
	} catch {
		return null;
	}
}
