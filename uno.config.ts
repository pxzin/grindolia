import { defineConfig, presetUno, presetTypography, presetWebFonts } from 'unocss';
import { radixColors } from './src/lib/config/radix-colors';

export default defineConfig({
	presets: [
		presetUno(),
		presetTypography(),
		presetWebFonts({
			fonts: {
				sans: 'Inter:400,500,600,700',
				serif: 'Cinzel:400,500,600,700,800',
				mono: 'Fira Code:400,500'
			}
		})
	],
	theme: {
		colors: {
			...radixColors,
			// Arcana Dark Fantasy Theme
			arcana: {
				bg: {
					primary: 'var(--color-arcana-bg-primary)',
					secondary: 'var(--color-arcana-bg-secondary)',
					elevated: 'var(--color-arcana-bg-elevated)',
					overlay: 'var(--color-arcana-bg-overlay)',
				},
				gold: {
					50: 'var(--color-arcana-gold-50)',
					100: 'var(--color-arcana-gold-100)',
					200: 'var(--color-arcana-gold-200)',
					300: 'var(--color-arcana-gold-300)',
					400: 'var(--color-arcana-gold-400)',
					500: 'var(--color-arcana-gold-500)',
					600: 'var(--color-arcana-gold-600)',
					700: 'var(--color-arcana-gold-700)',
					800: 'var(--color-arcana-gold-800)',
					900: 'var(--color-arcana-gold-900)',
				},
				cyan: {
					50: 'var(--color-arcana-cyan-50)',
					100: 'var(--color-arcana-cyan-100)',
					200: 'var(--color-arcana-cyan-200)',
					300: 'var(--color-arcana-cyan-300)',
					400: 'var(--color-arcana-cyan-400)',
					500: 'var(--color-arcana-cyan-500)',
					600: 'var(--color-arcana-cyan-600)',
					700: 'var(--color-arcana-cyan-700)',
					800: 'var(--color-arcana-cyan-800)',
					900: 'var(--color-arcana-cyan-900)',
				},
				magenta: {
					50: 'var(--color-arcana-magenta-50)',
					100: 'var(--color-arcana-magenta-100)',
					200: 'var(--color-arcana-magenta-200)',
					300: 'var(--color-arcana-magenta-300)',
					400: 'var(--color-arcana-magenta-400)',
					500: 'var(--color-arcana-magenta-500)',
					600: 'var(--color-arcana-magenta-600)',
					700: 'var(--color-arcana-magenta-700)',
					800: 'var(--color-arcana-magenta-800)',
					900: 'var(--color-arcana-magenta-900)',
				},
				orange: {
					50: 'var(--color-arcana-orange-50)',
					100: 'var(--color-arcana-orange-100)',
					200: 'var(--color-arcana-orange-200)',
					300: 'var(--color-arcana-orange-300)',
					400: 'var(--color-arcana-orange-400)',
					500: 'var(--color-arcana-orange-500)',
					600: 'var(--color-arcana-orange-600)',
					700: 'var(--color-arcana-orange-700)',
					800: 'var(--color-arcana-orange-800)',
					900: 'var(--color-arcana-orange-900)',
				},
				green: {
					50: 'var(--color-arcana-green-50)',
					100: 'var(--color-arcana-green-100)',
					200: 'var(--color-arcana-green-200)',
					300: 'var(--color-arcana-green-300)',
					400: 'var(--color-arcana-green-400)',
					500: 'var(--color-arcana-green-500)',
					600: 'var(--color-arcana-green-600)',
					700: 'var(--color-arcana-green-700)',
					800: 'var(--color-arcana-green-800)',
					900: 'var(--color-arcana-green-900)',
				},
				text: {
					primary: 'var(--color-arcana-text-primary)',
					secondary: 'var(--color-arcana-text-secondary)',
					muted: 'var(--color-arcana-text-muted)',
					white: 'var(--color-arcana-text-white)',
					gold: 'var(--color-arcana-text-gold)',
				},
				border: {
					default: 'var(--color-arcana-border-default)',
					gold: 'var(--color-arcana-border-gold)',
					glow: 'var(--color-arcana-border-glow)',
				},
			}
		}
	},
	shortcuts: {
		// Arcana Button Variants
		'arcana-btn': 'px-6 py-3 rounded-xl font-bold transition-all duration-300 cursor-pointer relative overflow-hidden',
		'arcana-btn-primary': 'arcana-btn bg-arcana-gold-600 text-arcana-bg-primary hover:bg-arcana-gold-500 border-2 border-arcana-gold-800',
		'arcana-btn-secondary': 'arcana-btn bg-arcana-bg-elevated text-arcana-text-primary hover:bg-arcana-bg-secondary border-2 border-arcana-border-default',
		'arcana-btn-hero': 'arcana-btn min-w-80 text-xl font-serif border-3 border-arcana-gold-800',

		// Arcana Card Variants
		'arcana-card': 'bg-arcana-bg-secondary rounded-2xl shadow-xl border border-arcana-border-default p-6 backdrop-blur-sm',
		'arcana-card-elevated': 'arcana-card bg-arcana-bg-elevated shadow-2xl border-arcana-border-glow',
		'arcana-card-gold': 'arcana-card border-2 border-arcana-gold-600',
		'arcana-card-sm': 'arcana-card p-4',
		'arcana-card-lg': 'arcana-card p-8',

		// Arcana Text Styles
		'arcana-heading': 'font-serif text-arcana-gold-300 font-bold',
		'arcana-heading-lg': 'arcana-heading text-4xl md:text-5xl',
		'arcana-heading-md': 'arcana-heading text-2xl md:text-3xl',
		'arcana-heading-sm': 'arcana-heading text-xl md:text-2xl',
		'arcana-text': 'text-arcana-text-primary',
		'arcana-text-muted': 'text-arcana-text-muted',
		'arcana-text-gold': 'text-arcana-text-gold',

		// Layout helpers
		'center': 'flex items-center justify-center',
		'center-col': 'flex flex-col items-center justify-center',

		// Legacy shortcuts (keep for backward compatibility)
		'btn': 'px-4 py-2 rounded-md font-medium transition-colors duration-200',
		'btn-primary': 'btn bg-primary-9 text-white hover:bg-primary-10',
		'btn-secondary': 'btn bg-gray-3 text-gray-12 hover:bg-gray-4',
		'card': 'bg-surface p-4 rounded-lg border border-gray-6',
		'input': 'px-3 py-2 rounded-md border border-gray-7 bg-gray-1 text-gray-12 focus:outline-none focus:ring-2 focus:ring-primary-9'
	}
});
