<script lang="ts">
	import { QueueItem } from "$lib/components";
	import { createItem, deleteItem, doc, itemMap, patchItem } from "$lib/stores/app.svelte";
	import { flip } from "svelte/animate";
	import { backOut } from "svelte/easing";
	import { fly, scale } from "svelte/transition";
	import type { PageProps } from "./$types";

	import { onMount } from "svelte";
	import { source, type Source } from "sveltekit-sse";
	import { toast } from "$lib";

	let { data }: PageProps = $props();

	doc.current = data.current;
	doc.holdQueue = data.holdQueue;
	doc.nextQueue = data.nextQueue;

	for (const item of [data.current, ...data.holdQueue, ...data.nextQueue]) {
		if (item) {
			itemMap.set(item.id, item);
		}
	}

	const queueSize = $derived(doc.holdQueue.length + doc.nextQueue.length + (doc.current ? 1 : 0));

	const parseDataModel = (text: string) => {
		let data = JSON.parse(text);

		// if (data.submittedAt) {
		// 	data.submittedAt = new Date(data.submittedAt);
		// } else {
		// 	data.submittedAt = undefined;
		// }

		// if (data.statusChangedAt) {
		// 	data.statusChangedAt = new Date(data.statusChangedAt);
		// } else {
		// 	data.statusChangedAt = undefined;
		// }

		// if (data.infoChangedAt) {
		// 	data.infoChangedAt = new Date(data.infoChangedAt);
		// } else {
		// 	data.infoChangedAt = undefined;
		// }

		return data;
	};

	onMount(() => {
		console.log("[SSE] Connecting...");

		let connection: Source | null = null;

		const errorTimeoutHandle = setTimeout(() => {
			toast("Live feed is not available.", { time: -1 });
		}, 5000);

		connection = source("/api/sse", {
			open: () => {
				console.log("[SSE] Connected");
			},
			close: () => {
				console.log("[SSE] Disconnected");
			},
			error: ({ error }) => {
				console.log("[SSE] Error:", error);
				toast("Error getting live feed.", { description: error ? `${error.message} - ${error.cause}` : undefined });
			},
		});

		if (connection) {
			connection.select("meta").subscribe((data) => {
				if (data) {
					clearTimeout(errorTimeoutHandle);
					console.log("[SSE] META:", data);
				}

				if (data == "reload") {
					window.location.reload();
				}
			});

			connection.select("create").subscribe((data) => {
				if (!data) return;
				console.log("[SSE] CREATE:", data);
				try {
					createItem(parseDataModel(data));
				} catch {}
			});

			connection.select("patch").subscribe((data) => {
				if (!data) return;
				console.log("[SSE] PATCH:", data);
				try {
					patchItem(parseDataModel(data));
				} catch {}
			});

			connection.select("delete").subscribe((data) => {
				if (!data) return;
				console.log("[SSE] DELETE:", data);
				try {
					deleteItem(parseDataModel(data));
				} catch {}
			});
		} else {
			toast("Error getting live feed.");
		}

		return () => {
			if (connection) {
				connection.close();
			}
		};
	});
</script>

<svelte:head>
	<title>Ryly's Game Queue</title>
</svelte:head>

<main class="mt-16 layout mb-32">
	<header class="flex-row flex-wrap last gap-4 justify-between items-start">
		<h1 class="text-4xl font-bold">{queueSize} {queueSize == 1 ? "game" : "games"} in queue</h1>

		<a class="btn solid fixed bottom-8 right-8 z-50 isolate shadow-xl md:static md:shadow-none" href="/submit">
			Submit your game
		</a>
	</header>

	<div class="mt-12 flex-col">
		<div class="flex-row justify-between">
			<div class="font-bold">Currently playing...</div>
			<a class="hover:underline" href="/archive">See previous games...</a>
		</div>
		<div class="isolate stack">
			{#key doc.current?.id}
				<div
					class="isolate will-change-transform w-full justify-self-stretch self-stretch"
					in:scale={{ duration: 500, delay: 200, opacity: 0, start: 0.75, easing: backOut }}
					out:fly={{ duration: 200, opacity: 0, x: 300, y: 0 }}
				>
					{#if doc.current}
						<QueueItem data={doc.current} myGame={false} placement={0} />
					{:else}
						<div class="text-center opacity-50 mt-12">Nothing at the moment...</div>
					{/if}
				</div>
			{/key}
		</div>
	</div>

	{#key "hold-queue"}
		{#if doc.holdQueue.length > 0}
			<div
				class="mt-8 flex-col text-amber-600"
				in:scale={{ duration: 200, opacity: 0, start: 0.75, delay: 200 }}
				out:scale={{ duration: 200, opacity: 0, start: 0.75 }}
			>
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
	{/key}

	{#key "next-queue"}
		{#if doc.nextQueue.length > 0}
			<div
				class="mt-8 flex-col"
				in:scale={{ duration: 200, opacity: 0, start: 0.75, delay: 200 }}
				out:scale={{ duration: 200, opacity: 0, start: 0.75 }}
			>
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
	{/key}
</main>
