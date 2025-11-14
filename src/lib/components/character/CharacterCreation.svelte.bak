<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';

	interface CharacterClass {
		id: number;
		name: string;
		description: string;
	}

	interface Props {
		classes: CharacterClass[];
		onSubmit: (name: string, classId: number) => Promise<void>;
	}

	let { classes, onSubmit }: Props = $props();

	let characterName = $state('');
	let selectedClass = $state<number | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);

	const handleSubmit = async () => {
		error = null;

		if (!characterName.trim()) {
			error = 'Character name is required';
			return;
		}

		if (characterName.length < 2 || characterName.length > 20) {
			error = 'Character name must be between 2 and 20 characters';
			return;
		}

		if (selectedClass === null) {
			error = 'Please select a character class';
			return;
		}

		try {
			loading = true;
			await onSubmit(characterName, selectedClass);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create character';
		} finally {
			loading = false;
		}
	};
</script>

<div class="character-creation">
	<Card variant="glass" class="max-w-2xl mx-auto p-8">
		<h1 class="text-3xl font-bold mb-6 text-center">Create Your Character</h1>

		{#if error}
			<div class="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-md mb-6">
				{error}
			</div>
		{/if}

		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleSubmit();
			}}
		>
			<!-- Character Name -->
			<div class="mb-6">
				<label for="characterName" class="block text-sm font-medium mb-2">
					Character Name
				</label>
				<Input
					id="characterName"
					type="text"
					placeholder="Enter your character name"
					bind:value={characterName}
					disabled={loading}
					required
					minlength={2}
					maxlength={20}
				/>
			</div>

			<!-- Class Selection -->
			<div class="mb-8">
				<label class="block text-sm font-medium mb-4">Choose Your Class</label>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					{#each classes as characterClass}
						<button
							type="button"
							class="class-card"
							class:selected={selectedClass === characterClass.id}
							onclick={() => {
								selectedClass = characterClass.id;
							}}
							disabled={loading}
						>
							<div class="class-name">{characterClass.name}</div>
							<div class="class-description">{characterClass.description}</div>
						</button>
					{/each}
				</div>
			</div>

			<!-- Submit Button -->
			<Button type="submit" variant="primary" class="w-full" disabled={loading}>
				{loading ? 'Creating Character...' : 'Create Character'}
			</Button>
		</form>
	</Card>
</div>

<style>
	.character-creation {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.class-card {
		padding: 1.5rem;
		border: 2px solid var(--color-primary-6);
		border-radius: 0.5rem;
		background: var(--color-primary-2);
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
	}

	.class-card:hover {
		border-color: var(--color-primary-8);
		background: var(--color-primary-3);
		transform: translateY(-2px);
	}

	.class-card.selected {
		border-color: var(--color-primary-9);
		background: var(--color-primary-4);
		box-shadow: 0 0 20px var(--color-primary-7);
	}

	.class-card:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	.class-name {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: var(--color-primary-12);
	}

	.class-description {
		font-size: 0.875rem;
		color: var(--color-gray-11);
		line-height: 1.4;
	}
</style>
