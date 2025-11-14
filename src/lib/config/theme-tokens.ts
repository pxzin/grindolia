/**
 * Theme Tokens Configuration
 * Maps semantic tokens to Radix colors for different themes
 */

export interface ThemeConfig {
	name: string;
	displayName: string;
	colors: {
		primary: string;
		primaryHover: string;
		primaryActive: string;
	};
}

export const themes: Record<string, ThemeConfig> = {
	default: {
		name: 'default',
		displayName: 'Default',
		colors: {
			primary: 'var(--blue-9)',
			primaryHover: 'var(--blue-10)',
			primaryActive: 'var(--blue-11)'
		}
	},
	warrior: {
		name: 'warrior',
		displayName: 'Warrior',
		colors: {
			primary: 'var(--red-9)',
			primaryHover: 'var(--red-10)',
			primaryActive: 'var(--red-11)'
		}
	},
	mage: {
		name: 'mage',
		displayName: 'Mage',
		colors: {
			primary: 'var(--purple-9)',
			primaryHover: 'var(--purple-10)',
			primaryActive: 'var(--purple-11)'
		}
	},
	rogue: {
		name: 'rogue',
		displayName: 'Rogue',
		colors: {
			primary: 'var(--green-9)',
			primaryHover: 'var(--green-10)',
			primaryActive: 'var(--green-11)'
		}
	},
	premium_gold: {
		name: 'premium_gold',
		displayName: 'Premium Gold',
		colors: {
			primary: 'var(--amber-9)',
			primaryHover: 'var(--amber-10)',
			primaryActive: 'var(--amber-11)'
		}
	}
};

/**
 * Get theme configuration by name
 */
export function getTheme(name: string): ThemeConfig {
	return themes[name] || themes.default;
}

/**
 * Get all available themes
 */
export function getAllThemes(): ThemeConfig[] {
	return Object.values(themes);
}

/**
 * Apply theme to document
 */
export function applyTheme(themeName: string): void {
	const theme = getTheme(themeName);
	document.documentElement.setAttribute('data-theme', theme.name);

	// Store preference
	localStorage.setItem('theme', theme.name);
}
