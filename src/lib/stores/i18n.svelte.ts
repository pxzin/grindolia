/**
 * I18n Store
 * Reactive store for managing internationalization state using Svelte 5 runes
 */

import { locale, _ } from 'svelte-i18n';
import { get } from 'svelte/store';

type Locale = 'en' | 'pt-BR' | 'es' | 'ru' | 'zh' | 'ja' | 'ko';

interface I18nState {
	currentLocale: Locale;
	isLoading: boolean;
}

/**
 * Create reactive i18n state using Svelte 5 runes
 */
class I18nStore {
	private state = $state<I18nState>({
		currentLocale: 'en',
		isLoading: false
	});

	/**
	 * Get current locale
	 */
	get currentLocale(): Locale {
		return this.state.currentLocale;
	}

	/**
	 * Check if locale is loading
	 */
	get isLoading(): boolean {
		return this.state.isLoading;
	}

	/**
	 * Set locale and update svelte-i18n
	 */
	async setLocale(newLocale: Locale): Promise<void> {
		if (this.state.currentLocale === newLocale) return;

		this.state.isLoading = true;

		try {
			// Update svelte-i18n locale
			await locale.set(newLocale);

			// Update state
			this.state.currentLocale = newLocale;

			// Persist to localStorage
			if (typeof window !== 'undefined') {
				localStorage.setItem('locale', newLocale);
			}
		} catch (error) {
			console.error('Failed to set locale:', error);
			throw error;
		} finally {
			this.state.isLoading = false;
		}
	}

	/**
	 * Initialize locale from localStorage or browser
	 */
	initialize(): void {
		let initialLocale: Locale = 'en';

		if (typeof window !== 'undefined') {
			// Try to get from localStorage
			const stored = localStorage.getItem('locale') as Locale | null;
			if (stored && this.isValidLocale(stored)) {
				initialLocale = stored;
			} else {
				// Try to get from browser language
				const browserLang = this.getBrowserLocale();
				if (browserLang) {
					initialLocale = browserLang;
				}
			}
		}

		// Set initial locale without saving to localStorage (already there or not applicable)
		this.state.currentLocale = initialLocale;
		locale.set(initialLocale);
	}

	/**
	 * Get browser locale
	 */
	private getBrowserLocale(): Locale | null {
		if (typeof window === 'undefined') return null;

		const browserLang = window.navigator.language;

		// Map browser language to supported locales
		const localeMap: Record<string, Locale> = {
			en: 'en',
			'en-US': 'en',
			'en-GB': 'en',
			pt: 'pt-BR',
			'pt-BR': 'pt-BR',
			'pt-PT': 'pt-BR',
			es: 'es',
			'es-ES': 'es',
			'es-MX': 'es',
			ru: 'ru',
			'ru-RU': 'ru',
			zh: 'zh',
			'zh-CN': 'zh',
			'zh-TW': 'zh',
			ja: 'ja',
			'ja-JP': 'ja',
			ko: 'ko',
			'ko-KR': 'ko'
		};

		return localeMap[browserLang] || null;
	}

	/**
	 * Validate locale
	 */
	private isValidLocale(locale: string): locale is Locale {
		return ['en', 'pt-BR', 'es', 'ru', 'zh', 'ja', 'ko'].includes(locale);
	}

	/**
	 * Get translation function
	 */
	get t() {
		return get(_);
	}
}

/**
 * Export singleton instance
 */
export const i18nStore = new I18nStore();

/**
 * Available locales with display names
 */
export const availableLocales: Record<Locale, string> = {
	en: 'English',
	'pt-BR': 'Português (Brasil)',
	es: 'Español',
	ru: 'Русский',
	zh: '中文',
	ja: '日本語',
	ko: '한국어'
};

/**
 * Get locale display name
 */
export function getLocaleDisplayName(locale: Locale): string {
	return availableLocales[locale] || locale;
}
