/**
 * Radix Colors mapping for UnoCSS
 * Maps Radix UI color scales to semantic tokens
 */

import * as radixColors from '@radix-ui/colors';

// Export all Radix colors for UnoCSS
export { radixColors };

// Semantic color tokens for theming
export const themeTokens = {
	// Base colors
	surface: 'var(--color-surface)',
	'surface-raised': 'var(--color-surface-raised)',

	// Text colors
	text: 'var(--color-text)',
	'text-subtle': 'var(--color-text-subtle)',
	'text-inverse': 'var(--color-text-inverse)',

	// Primary brand colors
	primary: 'var(--color-primary)',
	'primary-hover': 'var(--color-primary-hover)',
	'primary-active': 'var(--color-primary-active)',

	// Feedback colors
	success: 'var(--color-success)',
	warning: 'var(--color-warning)',
	error: 'var(--color-error)',
	info: 'var(--color-info)'
};
