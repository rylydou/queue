<script lang="ts">
	import "$lib/styles/fonts/hyperlegible.css";
	import "$lib/styles/reset.css";
	import type { QueueItemData } from "$lib/types";
	import { onMount } from "svelte";
	import { source } from "sveltekit-sse";
	import "virtual:uno.css";
	import type { PageProps } from "./$types";

	const JUST_SWITCHED_ITEMS_TIME = 30_000;

	let { data }: PageProps = $props();

	let currentItem = $state<QueueItemData | null>(data.current);
	let lastItem = $state<QueueItemData | null>();
	let justSwitchedItems = $state(false);

	let acceptingSubmissions = $state(data.acceptingSubmissions);

	const sse = source("/api/sse?channel=status", {
		error: (error) => {
			console.error("Failed to get live events:", error);
		},
	});

	onMount(() => {
		let firstUpdate = true;
		sse
			.select("current")
			.json()
			.subscribe((data) => {
				if (firstUpdate) {
					firstUpdate = false;
					return;
				}

				lastItem = currentItem;
				currentItem = data as QueueItemData | null;

				justSwitchedItems = true;
				setTimeout(() => {
					justSwitchedItems = false;
				}, JUST_SWITCHED_ITEMS_TIME);

				setSlide("up-next");
			});

		sse.select("submissions").subscribe((value) => {
			if (value == "") return;
			acceptingSubmissions = !!value;
		});
	});

	type Slide = "none" | "current-item" | "submit-hint" | "last-played" | "up-next";

	let activeSlide = $state<Slide>("submit-hint");

	let autoscrollIndex = 0;
	let autoscrollTimeout;
	const autoscroll: {
		slide: Slide;
		sec: number;
		check?: () => boolean;
	}[] = [
		{ slide: "none", sec: 3, check: () => false },
		{ slide: "up-next", sec: 10, check: () => false },
		{ slide: "submit-hint", sec: 10, check: () => acceptingSubmissions },
		{ slide: "current-item", sec: 10, check: () => !!currentItem && !justSwitchedItems },
		{ slide: "last-played", sec: 10, check: () => !currentItem && !!lastItem && justSwitchedItems },
	];

	onMount(() => {
		setSlide(autoscroll[0].slide);
	});

	const nextSlide = () => {
		let slide: Slide = "none";
		let sec = 3.0;

		const startingIndex = autoscrollIndex;
		while (true) {
			autoscrollIndex++;
			if (autoscrollIndex >= autoscroll.length) {
				autoscrollIndex = 0;
			}

			if (autoscrollIndex === startingIndex) {
				break;
			}

			const item = autoscroll[autoscrollIndex];

			if (!item.check || item.check()) {
				slide = item.slide;
				sec = item.sec;
				break;
			}
		}

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
	<section class="slide" aria-current={activeSlide === "current-item"}>
		{#if currentItem}
			Currently playing: {currentItem.title} by {currentItem.by}
		{:else}
			Error
		{/if}
	</section>
	<section class="slide" aria-current={activeSlide === "up-next"}>
		{#if currentItem}
			Up next: {currentItem.title} by {currentItem.by}
		{:else}
			Error
		{/if}
	</section>
	<section class="slide" aria-current={activeSlide === "last-played"}>
		{#if lastItem}
			Just played: {lastItem.title} by {lastItem.by}
		{:else}
			Error
		{/if}
	</section>
	<section class="slide" aria-current={activeSlide === "submit-hint"}>
		{#if acceptingSubmissions}
			Submit your game at submit.ryly.dev
		{:else}
			Submissions closed
		{/if}
	</section>
</div>

<style>
	:global(html, body) {
		background-color: transparent;
	}

	:global(body) {
		font-family: "hyperlegible", monospace, ui-sans-serif, sans-serif;
		font-weight: bold;
		text-align: center;
		height: 100vh;
	}

	.slides {
		position: relative;
		isolation: isolate;
		height: 100%;
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

		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		width: 100%;
		padding-inline: 1rem;

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
