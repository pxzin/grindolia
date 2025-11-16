<script lang="ts">
	/**
	 * CharacterCreation Component
	 * Dark Fantasy character creation with class selection grid
	 */
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import ClassCard from '$lib/components/game/ClassCard.svelte';
	import { Sword, Sparkles, Wind, Heart } from 'lucide-svelte';

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

	// Map class IDs to icons and colors
	const classMetadata: Record<string, { icon: any; color: string; stats: any }> = {
		warrior: {
			icon: Sword,
			color: '#ff6b35',
			stats: { strength: 15, intelligence: 8, dexterity: 10, vitality: 14 }
		},
		mage: {
			icon: Sparkles,
			color: '#2a9d8f',
			stats: { strength: 6, intelligence: 16, dexterity: 9, vitality: 8 }
		},
		rogue: {
			icon: Wind,
			color: '#43a047',
			stats: { strength: 10, intelligence: 10, dexterity: 16, vitality: 10 }
		},
		cleric: {
			icon: Heart,
			color: '#d946ef',
			stats: { strength: 11, intelligence: 13, dexterity: 8, vitality: 12 }
		}
	};

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

	const getClassMeta = (className: string) => {
		const key = className.toLowerCase();
		return classMetadata[key] || classMetadata.warrior;
	};
</script>

<div class="min-h-screen flex items-center justify-center p-4 bg-gradient-radial from-arcana-bg-primary via-arcana-bg-primary/95 to-arcana-bg-primary animate-fadeIn">
	<div class="w-full max-w-4xl">
		<!-- Title Section -->
		<div class="text-center mb-12">
			<h1 class="text-5xl font-serif text-arcana-gold-400 mb-4 drop-shadow-[0_0_20px_rgba(201,152,74,0.4)]">
				Create Your Hero
			</h1>
			<p class="text-xl text-arcana-text-secondary">Choose your path through the shadows</p>
		</div>

		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleSubmit();
			}}
		>
			<!-- Class Selection Grid -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
				{#each classes as characterClass}
					{@const meta = getClassMeta(characterClass.name)}
					<ClassCard
						id={characterClass.name.toLowerCase()}
						name={characterClass.name}
						description={characterClass.description}
						icon={meta.icon}
						color={meta.color}
						stats={meta.stats}
						selected={selectedClass === characterClass.id}
						onclick={() => (selectedClass = characterClass.id)}
					/>
				{/each}
			</div>

			<!-- Character Name Input -->
			<Card variant="elevated" class="mb-8">
				{#if error}
					<div class="bg-arcana-orange-900/60 border border-arcana-orange-500/50 rounded-xl p-4 mb-4">
						<p class="text-arcana-orange-300 text-sm font-semibold">{error}</p>
					</div>
				{/if}

				<Input
					label="Character Name"
					type="text"
					placeholder="Enter your hero's name..."
					bind:value={characterName}
					required
					disabled={loading}
				/>
			</Card>

			<!-- Submit Button -->
			<Button variant="hero" size="lg" type="submit" class="w-full" disabled={loading}>
				{loading ? 'Creating Character...' : 'Begin Adventure'}
			</Button>
		</form>
	</div>
</div>

<style>
	.bg-gradient-radial {
		background: radial-gradient(
			ellipse at center,
			var(--color-arcana-bg-primary),
			rgba(93, 106, 184, 0.05),
			var(--color-arcana-bg-primary)
		);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.animate-fadeIn {
		animation: fadeIn 0.5s ease-out;
	}
</style>
