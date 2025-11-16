<script lang="ts">
	import { goto } from '$app/navigation';
	import CharacterCreation from '$lib/components/character/CharacterCreation.svelte';
	import { characterStore } from '$lib/stores/character.svelte';

	interface CharacterClass {
		id: number;
		name: string;
		description: string;
	}

	let { data } = $props();

	const classes: CharacterClass[] = data.classes || [];

	const handleCreateCharacter = async (name: string, classId: number) => {
		const response = await fetch('/api/character', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ name, classId })
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to create character');
		}

		const result = await response.json();

		// Update character store
		characterStore.setCharacter({
			id: result.character.id,
			name: result.character.name,
			class: result.character.class,
			level: result.character.level,
			xp: result.character.xp,
			hp: result.character.hp,
			maxHp: result.character.maxHp,
			stats: result.character.stats,
			currency: result.character.currency,
			position: { x: 0, y: 0, z: 0 },
			zoneId: null,
			status: 'alive'
		});

		// Redirect to town hall
		goto('/town');
	};
</script>

<CharacterCreation {classes} onSubmit={handleCreateCharacter} />
