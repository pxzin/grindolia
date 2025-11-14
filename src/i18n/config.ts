import { register, init, getLocaleFromNavigator } from 'svelte-i18n';

// Register locale files
register('en', () => import('./locales/en.json'));
register('pt-BR', () => import('./locales/pt-BR.json'));
register('es', () => import('./locales/es.json'));
register('ru', () => import('./locales/ru.json'));
register('zh', () => import('./locales/zh.json'));
register('ja', () => import('./locales/ja.json'));
register('ko', () => import('./locales/ko.json'));

// Initialize i18n
export function initI18n() {
	init({
		fallbackLocale: 'en',
		initialLocale: getLocaleFromNavigator()
	});
}

// Supported locales
export const supportedLocales = [
	{ code: 'en', name: 'English' },
	{ code: 'pt-BR', name: 'Português (Brasil)' },
	{ code: 'es', name: 'Español' },
	{ code: 'ru', name: 'Русский' },
	{ code: 'zh', name: '中文' },
	{ code: 'ja', name: '日本語' },
	{ code: 'ko', name: '한국어' }
];
