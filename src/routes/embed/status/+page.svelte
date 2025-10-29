<script lang="ts">
	import "$lib/styles/fonts/hyperlegible.css";
	import "$lib/styles/reset.css";
	import "virtual:uno.css";
	import type { PageProps } from "./$types";
	import { onMount } from "svelte";

	let { data }: PageProps = $props();

	type Slide = "current-game-status" | "submit-hint";

	let activeSlide = $state<Slide>("submit-hint");

	let autoscrollIndex = 0;
	let autoscrollTimeout;
	const autoscroll: {
		slide: Slide;
		sec: number;
	}[] = [
		{ slide: "submit-hint", sec: 10 },
		{ slide: "current-game-status", sec: 10 },
	];

	onMount(() => {
		setSlide(autoscroll[0].slide);
	});

	const nextSlide = () => {
		autoscrollIndex++;
		if (autoscrollIndex >= autoscroll.length) {
			autoscrollIndex = 0;
		}
		const { slide, sec } = autoscroll[autoscrollIndex];

		setSlide(slide, sec);
	};

	const setSlide = (slide: Slide, sec?: number) => {
		activeSlide = slide;
		if (!sec) {
			sec = autoscroll.find(({ slide }) => slide)?.sec || 5;
		}
		clearTimeout(autoscrollTimeout);
		setTimeout(nextSlide, sec * 1000);
	};
</script>

<div class="slides">
	<div class="slide" aria-current={activeSlide === "current-game-status"}>
		Currently playing: {data.current.title} by {data.current.by}
	</div>
	<div class="slide" aria-current={activeSlide === "submit-hint"}>Submit your game at submit.ryly.dev</div>
</div>

<style>
	:global(html, body) {
		background-color: transparent;
	}

	:global(body) {
		font-family: "hyperlegible", monospace, ui-sans-serif, sans-serif;
		font-weight: bold;
		text-align: center;
	}

	.slides {
		position: relative;
		isolation: isolate;
	}

	.slide {
		position: absolute;
		inset: 0;
		isolation: isolate;

		will-change: transform;

		opacity: 0;
		translate: 0 -4rem;
		transition:
			opacity 2s,
			translate 1s;

		&[aria-current="true"] {
			opacity: 1;
			translate: 0 0%;

			transition:
				opacity 0.5s 1s,
				translate 1s 1s cubic-bezier(0.22, 1, 0.36, 1);
		}
	}

	div {
		color: white;
		text-shadow: 0 1px 6px black;
		margin-top: 8px;
		font-size: 24px;
	}
</style>
