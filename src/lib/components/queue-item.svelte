<script lang="ts">
	import { page } from "$app/state";
	import { toast } from "$lib/common/toasts";
	import { deleteItem, doc, patchItem } from "$lib/stores/app.svelte";
	import type { QueueItemData } from "$lib/types";
	import dayjs from "dayjs";
	import plugin from "dayjs/plugin/relativeTime";
	import ky from "ky";
	dayjs.extend(plugin);

	let props: {
		placement: number;
		myGame: boolean;

		data: QueueItemData;
		[key: string]: any;
	} = $props();

	const debugMode = page.url.searchParams.has("debug");
	const manageMode = true;

	let confirmRemove = $state(false);

	function hashCode(s: string) {
		let h = 0;
		for (let i = 0; i < s.length; i++) {
			h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
		}
		return h;
	}

	function hashToFloat(inputString: string) {
		const hash = hashCode(inputString);
		// Ensure the hash is positive for normalization
		const positiveHash = Math.abs(hash);
		// Normalize the hash to a float between 0 and 1
		// The maximum value for a 32-bit signed integer is 2^31 - 1
		const normalizedFloat = positiveHash / (Math.pow(2, 31) - 1);
		return normalizedFloat;
	}

	const formatTime = (date: Date | string) => {
		let days = dayjs().diff(date, "days");
		let day;
		if (days < 1) {
			day = "Today";
		} else if (days < 2) {
			day = "Yesterday";
		} else {
			day = days + " days ago";
		}

		let time = new Date(date).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

		return `${day} at ${time}`;
	};

	const debounceUnconfirmedRemove = () => {
		if (!confirmRemove) return;
		setTimeout(() => {
			confirmRemove = false;
		}, 100);
	};
</script>

<div
	class="group flex-1 py-3"
	style={debugMode ? `color: oklch(0.5 0.5 ${hashToFloat(props.data.id + "123") * 360.0}` : ""}
>
	<div class="flex flex-col-reverse justify-between sm:gap-2 sm:flex-row">
		<h3 class="relative sm:self-end font-bold text-lg md:text-2xl text-wrap">
			{#if props.placement > 0}
				<div
					class="absolute pointer-events-none text-base lg:text-2xl bottom-0.25 lg:bottom-0 -left-1 lg:-left-2 -translate-x-full font-normal opacity-0 group-hover:opacity-25"
				>
					#{props.placement}
				</div>
			{/if}
			<a
				class="decoration-2 hover:underline focus-visible:underline"
				href={props.data.url}
				target="_blank"
				title={props.data.url}
			>
				{debugMode ? props.data.id : props.data.title}
			</a>
		</h3>
		<div class="shrink-0 flex flex-col-reverse sm:flex-col sm:text-right">
			<div class="text-sm md:text-base opacity-50" title={props.data.submittedAt.toLocaleString()}>
				<!-- {props.data.time.toLocaleString()} -->
				{formatTime(props.data.submittedAt)}
			</div>
			{#if manageMode}
				<div
					class="shrink-0 -ml-2 text-base sm:(-mr-2 ml-0 text-xs opacity-0 justify-end) flex-row gap-0 font-bold group-hover:opacity-100"
				>
					{#if props.data.status !== "current"}
						<button
							class="text-btn px-2 text-green-600"
							onclick={() => {
								toast(`Made "${props.data.title}" the current game`);
								const patch = {
									id: props.data.id,
									status: "current",
									afterID: undefined,
								} satisfies Partial<QueueItemData>;

								ky.patch("/api", { json: patch }).catch((error) => toast("AJAX error:", error));
								patchItem(patch);

								window.scroll({ top: 0, behavior: "auto" });
							}}
						>
							Make Current
						</button>
					{/if}
					{#if props.data.status === "hold"}
						<button
							class="text-btn px-2 text-amber-600"
							onclick={() => {
								toast(`Removed "${props.data.title}" from hold`);
								const patch = {
									id: props.data.id,
									status: "queue",
									// Move to start of next queue
									afterID: undefined,
								} satisfies Partial<QueueItemData>;
								ky.patch("/api", { json: patch }).catch((error) => toast("AJAX error:", error));
								patchItem(patch);
							}}
						>
							Unhold
						</button>
					{:else}
						<button
							class="text-btn px-2 text-amber-600"
							onclick={() => {
								toast(`Put "${props.data.title}" on hold`);

								const patch = {
									id: props.data.id,
									status: "hold",
									// Move to end of hold queue
									afterID: doc.holdQueue.at(-1)?.id,
								} satisfies Partial<QueueItemData>;
								ky.patch("/api", { json: patch }).catch((error) => toast("AJAX error:", error));
								patchItem(patch);
							}}
						>
							Hold
						</button>
					{/if}
					<button
						class="text-btn px-2 text-red-600 aria-expanded:(bg-red-600 text-white rounded animate-shake shadow no-underline)"
						onpointerleave={debounceUnconfirmedRemove}
						onmouseleave={debounceUnconfirmedRemove}
						aria-expanded={confirmRemove}
						onclick={() => {
							if (!confirmRemove) {
								confirmRemove = true;
								return;
							}

							const id = props.data.id;
							ky.delete("/api", { body: id }).catch((error) => toast("AJAX error:", error));
							deleteItem(id);
						}}
					>
						{props.data.status === "current" ? "Done" : "Remove"}
					</button>
				</div>
			{/if}
		</div>
	</div>

	<div>
		{#if debugMode}
			{props.data.title}
		{/if}
		by {props.data.by}
	</div>

	<p class="mt-2 text-sm opacity-50">
		{props.data.note}
	</p>
</div>
