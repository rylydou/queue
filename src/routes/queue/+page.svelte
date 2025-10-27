<script lang="ts">
	import { QueueItem } from "$lib/components";
	import { queues } from "$lib/stores/queue.svelte";
	import { flip } from "svelte/animate";
	import { backOut } from "svelte/easing";
	import { fly, scale } from "svelte/transition";
	import type { PageProps } from "./$types";
	// import {current, holdQueue, nextQueue} from '$lib/stores/queue.svelte';

	let { data }: PageProps = $props();

	queues.current = data.current;
	queues.holdQueue = data.holdQueue;
	queues.nextQueue = data.nextQueue;

	const queueSize = $derived(queues.holdQueue.length + queues.nextQueue.length + (queues.current ? 1 : 0));
</script>

<svelte:head>
	<title>Ryly's Game Queue</title>
</svelte:head>

<main class="mt-16 layout mb-16">
	<header class="flex-row flex-wrap last gap-4 justify-between items-start">
		<h1 class="text-4xl font-bold">{queueSize} {queueSize == 1 ? "game" : "games"} in queue</h1>

		<a class="btn solid fixed bottom-8 right-8 z-50 isolate shadow-xl md:static md:shadow-none" href="/submit">
			Submit your game
		</a>
	</header>

	<div class="mt-12 flex-col min-h-[10rem]">
		<div class="font-bold">Currently playing...</div>
		{#key queues.current?.id}
			<div class="relative h-full flex-1">
				<div
					class="isolate absolute inset-0 will-change-transform"
					in:scale={{ duration: 500, delay: 200, opacity: 0, start: 0.75, easing: backOut }}
					out:fly={{ duration: 200, opacity: 0, x: 300, y: 0 }}
				>
					{#if queues.current}
						<QueueItem data={queues.current} myGame={false} placement={0} />
					{:else}
						<div class="text-center opacity-50 mt-12">Nothing at the moment...</div>
					{/if}
				</div>
			</div>
		{/key}
	</div>

	{#if queues.holdQueue.length > 0}
		<div class="mt-8 flex-col text-amber-600">
			<div class="flex">
				<div class="flex-1 font-bold">On hold:</div>
				<!-- <div class="text-xs opacity-50">
					If the creator misses their time their time will be kept here for a little bit
				</div> -->
			</div>
			<ol class="layout list-none">
				{#each queues.holdQueue as item, index (item.id)}
					<li
						class="will-change-transform"
						animate:flip={{ duration: 200 }}
						in:scale={{ duration: 200, opacity: 0, start: 0.75, delay: 200 }}
						out:scale={{ duration: 200, opacity: 0, start: 0.75 }}
					>
						<QueueItem data={item} myGame={false} placement={index + 1} />
					</li>
				{/each}
			</ol>
		</div>
	{/if}

	{#if queues.nextQueue.length > 0}
		<div class="mt-8 flex-col">
			<div class="font-bold">Up next:</div>
			<ol class="layout list-none">
				{#each queues.nextQueue as item, index (item.id)}
					<li
						class="will-change-transform"
						animate:flip={{ duration: 200 }}
						in:scale={{ duration: 200, opacity: 0, start: 0.75, delay: 200 }}
						out:scale={{ duration: 200, opacity: 0, start: 0.75 }}
					>
						<QueueItem data={item} myGame={false} placement={queues.holdQueue.length + index + 1} />
					</li>
				{/each}
			</ol>
		</div>
	{/if}
</main>
