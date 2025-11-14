/**
 * Radix Colors mapping for UnoCSS
 * Maps Radix UI color scales to UnoCSS color utilities
 */

import * as radix from '@radix-ui/colors';

/**
 * Convert Radix color scale to UnoCSS format
 * Radix: { blue1: '#...', blue2: '#...', ... }
 * UnoCSS: { blue: { 1: '#...', 2: '#...', ... } }
 */
function convertRadixToUnoCSS(colors: Record<string, string>) {
	const result: Record<string, Record<string, string>> = {};

	for (const [key, value] of Object.entries(colors)) {
		// Extract color name and step (e.g., 'blue1' -> 'blue', '1')
		const match = key.match(/^([a-z]+)(\d+)$/i);
		if (match) {
			const [, colorName, step] = match;
			if (!result[colorName]) {
				result[colorName] = {};
			}
			result[colorName][step] = value;
		}
	}

	return result;
}

// Convert all Radix colors
const colors = {
	...convertRadixToUnoCSS(radix.blue),
	...convertRadixToUnoCSS(radix.gray),
	...convertRadixToUnoCSS(radix.green),
	...convertRadixToUnoCSS(radix.red),
	...convertRadixToUnoCSS(radix.yellow),
	...convertRadixToUnoCSS(radix.amber),
	...convertRadixToUnoCSS(radix.purple),
	...convertRadixToUnoCSS(radix.teal)
};

// Alias primary to blue
colors.primary = colors.blue;

export const radixColors = colors;
