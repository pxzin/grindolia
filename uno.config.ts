import { defineConfig, presetUno, presetTypography, presetWebFonts } from 'unocss';
import { radixColors } from './src/lib/config/radix-colors';

export default defineConfig({
	presets: [
		presetUno(),
		presetTypography(),
		presetWebFonts({
			fonts: {
				sans: 'Inter:400,500,600,700',
				mono: 'Fira Code:400,500'
			}
		})
	],
	theme: {
		colors: {
			...radixColors
		}
	},
	shortcuts: {
		// Common UI patterns
		'btn': 'px-4 py-2 rounded-md font-medium transition-colors duration-200',
		'btn-primary': 'btn bg-primary-9 text-white hover:bg-primary-10',
		'btn-secondary': 'btn bg-gray-3 text-gray-12 hover:bg-gray-4',
		'card': 'bg-surface p-4 rounded-lg border border-gray-6',
		'input': 'px-3 py-2 rounded-md border border-gray-7 bg-gray-1 text-gray-12 focus:outline-none focus:ring-2 focus:ring-primary-9'
	}
});
