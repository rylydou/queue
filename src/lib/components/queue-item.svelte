<script lang="ts">
	import { toast } from "$lib/common/toasts";
	import { doc } from "$lib/stores/app.svelte";
	import type { QueueItemData } from "$lib/types";
	import dayjs from "dayjs";
	import plugin from "dayjs/plugin/relativeTime";
	dayjs.extend(plugin);

	interface Props {
		placement: number;
		myGame: boolean;

		data: QueueItemData;
		[key: string]: any;
	}

	let props: Props = $props();

	let confirmRemove = $state(false);

	const formatTime = (date: Date) => {
		let days = dayjs().diff(date, "days");
		let day;
		if (days < 1) {
			day = "Today";
		} else if (days < 2) {
			day = "Yesterday";
		} else {
			day = days + " days ago";
		}

		let time = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

		return `${day} at ${time}`;
	};
</script>

<div class="group flex-1 py-3">
	<div class="flex justify-between gap-2">
		<h3 class="relative self-end font-bold text-lg md:text-2xl text-wrap">
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
				{props.data.title}
			</a>
		</h3>
		<div class="shrink-0 flex-col text-right">
			<div class="text-sm md:text-base opacity-50" title={props.data.submittedAt.toLocaleString()}>
				<!-- {props.data.time.toLocaleString()} -->
				{formatTime(props.data.submittedAt)}
			</div>
			<div class="flex-row justify-end gap-0 text-xs font-bold opacity-0 group-hover:opacity-100">
				{#if props.data.status !== "current"}
					<button
						class="text-btn px-2 text-green-600"
						onclick={() => {
							toast(`Made "${props.data.title}" the current game`);
							window.scroll({ top: 0, behavior: "auto" });
							// window.scrollTo({ top: 0, behavior: "smooth" });
							if (props.data.status == "hold") {
								doc.holdQueue.splice(doc.holdQueue.indexOf(props.data), 1);
							} else if (props.data.status == "queue") {
								doc.nextQueue.splice(doc.nextQueue.indexOf(props.data), 1);
							}
							doc.current = props.data;
							props.data.status = "current";
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
							props.data.status = "queue";
							doc.nextQueue.unshift(props.data);
							doc.holdQueue.splice(doc.holdQueue.indexOf(props.data), 1);
						}}
					>
						Unhold
					</button>
				{:else}
					<button
						class="text-btn px-2 text-amber-600"
						onclick={() => {
							toast(`Put "${props.data.title}" on hold`);
							props.data.status = "hold";
							doc.holdQueue.push(props.data);
							doc.nextQueue.splice(doc.nextQueue.indexOf(props.data), 1);
							if (props.data.status == "hold") {
								doc.current = null;
							}
						}}
					>
						Hold
					</button>
				{/if}
				<button
					class="text-btn px-2 -mr-2 text-red-600 aria-expanded:(bg-red-600 text-white rounded animate-shake shadow no-underline)"
					onpointerleave={() => {
						confirmRemove = false;
					}}
					aria-expanded={confirmRemove}
					onclick={() => {
						if (!confirmRemove) {
							confirmRemove = true;
							return;
						}

						if (props.data.status == "hold") {
							doc.holdQueue.splice(doc.holdQueue.indexOf(props.data), 1);
						} else if (props.data.status == "queue") {
							doc.nextQueue.splice(doc.nextQueue.indexOf(props.data), 1);
						} else if (props.data.status == "current") {
							doc.current = null;
						}
					}}
				>
					Remove
				</button>
			</div>
		</div>
	</div>

	<div>by {props.data.by}</div>

	<p class="mt-2 text-sm opacity-50">
		{props.data.note}
	</p>
</div>
