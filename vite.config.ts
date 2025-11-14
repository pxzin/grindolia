import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import UnoCSS from 'unocss/vite';
import { fileURLToPath } from 'url';

export default defineConfig({
	plugins: [UnoCSS(), sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		globals: true,
		environment: 'jsdom'
	},
	resolve: {
		alias: {
			$server: fileURLToPath(new URL('./server', import.meta.url))
		}
	}
});
