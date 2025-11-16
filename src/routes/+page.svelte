<script lang="ts">
	/**
	 * Landing Page
	 * Welcome page for Grindolia - Dark Fantasy RPG
	 */
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { Sword, Trophy, Users, Zap } from 'lucide-svelte';

	const features = [
		{
			icon: Sword,
			title: 'Epic Dungeons',
			description: 'Explore treacherous dungeons filled with monsters and treasure'
		},
		{
			icon: Trophy,
			title: 'Compete & Conquer',
			description: 'Rise through the ranks in global leaderboards'
		},
		{
			icon: Users,
			title: 'Multiplayer',
			description: 'Team up with friends or challenge rivals in the arena'
		},
		{
			icon: Zap,
			title: 'Progressive Power',
			description: 'Level up, unlock abilities, and become legendary'
		}
	];
</script>

<svelte:head>
	<title>Grindolia - Dark Fantasy RPG</title>
	<meta name="description" content="Enter a dark fantasy world of dungeons, combat, and glory" />
</svelte:head>

<div
	class="min-h-screen flex flex-col bg-gradient-radial from-arcana-bg-primary via-arcana-bg-primary/95 to-arcana-bg-primary"
>
	<!-- Hero Section -->
	<section class="flex-1 flex items-center justify-center p-4 md:p-8">
		<div class="max-w-6xl w-full">
			<div class="text-center mb-12 animate-fadeIn">
				<h1
					class="text-6xl md:text-8xl font-serif text-arcana-gold-400 mb-6 drop-shadow-[0_0_40px_rgba(201,152,74,0.6)] animate-glow"
				>
					Grindolia
				</h1>
				<p class="text-2xl md:text-3xl text-arcana-text-secondary mb-4">
					A Dark Fantasy Multiplayer RPG
				</p>
				<p class="text-lg text-arcana-text-muted max-w-2xl mx-auto mb-8">
					Enter a world shrouded in darkness, where only the strongest survive. Battle fierce
					monsters, delve into ancient dungeons, and forge your legend.
				</p>

				<!-- CTA Buttons -->
				<div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
					<Button variant="hero" size="lg" onclick={() => goto('/auth/register')}>
						Begin Your Journey
					</Button>
					<Button variant="secondary" size="lg" onclick={() => goto('/auth/login')}>
						Login
					</Button>
				</div>
			</div>

			<!-- Features Grid -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
				{#each features as feature}
					<Card variant="elevated" class="text-center hover:scale-105 transition-transform">
						<div class="p-6">
							<div
								class="w-16 h-16 mx-auto mb-4 rounded-full bg-arcana-gold-600/20 flex items-center justify-center"
							>
								<feature.icon size={32} class="text-arcana-gold-400" />
							</div>
							<h3 class="text-xl font-serif text-arcana-text-primary mb-2">{feature.title}</h3>
							<p class="text-sm text-arcana-text-muted">{feature.description}</p>
						</div>
					</Card>
				{/each}
			</div>

			<!-- Call to Action -->
			<div class="mt-16 text-center">
				<Card variant="gold" class="max-w-2xl mx-auto">
					<div class="p-8">
						<h2 class="text-3xl font-serif text-arcana-gold-400 mb-4">Ready to Start?</h2>
						<p class="text-arcana-text-secondary mb-6">
							Create your character, choose your class, and dive into the adventure. Your destiny
							awaits in the depths of Grindolia.
						</p>
						<Button variant="hero" size="lg" onclick={() => goto('/auth/register')}>
							Create Account
						</Button>
					</div>
				</Card>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="py-8 border-t border-arcana-border-default">
		<div class="max-w-6xl mx-auto px-4 text-center">
			<p class="text-sm text-arcana-text-muted">
				&copy; 2025 Grindolia. A dark fantasy multiplayer RPG experience.
			</p>
		</div>
	</footer>
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
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes glow {
		0%,
		100% {
			text-shadow: 0 0 40px rgba(201, 152, 74, 0.6);
		}
		50% {
			text-shadow: 0 0 60px rgba(201, 152, 74, 0.8);
		}
	}

	.animate-fadeIn {
		animation: fadeIn 1s ease-out;
	}

	.animate-glow {
		animation: glow 3s ease-in-out infinite;
	}
</style>
