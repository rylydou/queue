<script lang="ts">
	import { QueueItem } from "$lib/components";
	import { doc } from "$lib/stores/app.svelte";
	import { flip } from "svelte/animate";
	import { backOut } from "svelte/easing";
	import { fly, scale } from "svelte/transition";
	import type { PageProps } from "./$types";
	// import {current, holdQueue, nextQueue} from '$lib/stores/queue.svelte';

	let { data }: PageProps = $props();

	doc.current = data.current;
	doc.holdQueue = data.holdQueue;
	doc.nextQueue = data.nextQueue;

	const queueSize = $derived(doc.holdQueue.length + doc.nextQueue.length + (doc.current ? 1 : 0));
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
		<div class="flex-row justify-between">
			<div class="font-bold">Currently playing...</div>
			<a class="hover:underline" href="/archive">See previous games...</a>
		</div>
		{#key doc.current?.id}
			<div class="relative h-full flex-1">
				<div
					class="isolate absolute inset-0 will-change-transform"
					in:scale={{ duration: 500, delay: 200, opacity: 0, start: 0.75, easing: backOut }}
					out:fly={{ duration: 200, opacity: 0, x: 300, y: 0 }}
				>
					{#if doc.current}
						<QueueItem data={doc.current} myGame={false} placement={0} />
					{:else}
						<div class="text-center opacity-50 mt-12">Nothing at the moment...</div>
					{/if}
				</div>
			</div>
		{/key}
	</div>

	{#if doc.holdQueue.length > 0}
		<div class="mt-8 flex-col text-amber-600">
			<div class="flex">
				<div class="flex-1 font-bold">On hold:</div>
				<!-- <div class="text-xs opacity-50">
					If the creator misses their time their time will be kept here for a little bit
				</div> -->
			</div>
			<ol class="layout list-none">
				{#each doc.holdQueue as item, index (item.id)}
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

	{#if doc.nextQueue.length > 0}
		<div class="mt-8 flex-col">
			<div class="font-bold">Up next:</div>
			<ol class="layout list-none">
				{#each doc.nextQueue as item, index (item.id)}
					<li
						class="will-change-transform"
						animate:flip={{ duration: 200 }}
						in:scale={{ duration: 200, opacity: 0, start: 0.75, delay: 200 }}
						out:scale={{ duration: 200, opacity: 0, start: 0.75 }}
					>
						<QueueItem data={item} myGame={false} placement={doc.holdQueue.length + index + 1} />
					</li>
				{/each}
			</ol>
		</div>
	{/if}
</main>
