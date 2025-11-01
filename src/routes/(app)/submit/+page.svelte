<script lang="ts">
	import { applyAction, enhance } from "$app/forms";
	import { toast } from "$lib";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();

	const { status } = data;

	let isWaiting = $state(false);
</script>

<svelte:head>
	<title>Ryly's Game Queue</title>
</svelte:head>

{#if status === "closed"}
	<main class="w-full mt-16">
		<h1 class="text-center font-bold text-xl">Sorry, we're no longer taking submissions.</h1>
	</main>
{:else if status === "full"}
	<main class="w-full mt-16">
		<h1 class="text-center font-bold text-xl">Sorry the queue if full. Please check back in later.</h1>
	</main>
{:else if status === "open"}
	<main class="h-screen overflow-y-auto flex-col items-center justify-center">
		<form
			class="form center-form"
			method="post"
			action="?/submit"
			use:enhance={() => {
				isWaiting = true;

				return async ({ result }) => {
					isWaiting = false;

					switch (result.type) {
						case "failure":
							toast("Failed to submit your game.", { description: result.data as unknown as string, time: 10000 });
							break;
						case "error":
							toast("Error submitting your game.", { description: result.status + " - " + result.error, time: 10000 });
							break;
					}
					return await applyAction(result);
				};
			}}
		>
			<h1 class="mb-4 text-lg text-center font-bold">Submit your game for us to play on stream!</h1>

			<label class="labeled-entry">
				<div class="label">Game link:</div>
				<input class="entry" type="text" name="url" autocomplete="off" spellcheck="false" />
			</label>

			<label class="labeled-entry">
				<div class="label">Game title:</div>
				<input class="entry" type="text" name="title" />
			</label>

			<label class="labeled-entry">
				<div class="label">Twitch username:</div>
				<input class="entry" type="text" name="by" autocomplete="off" spellcheck="false" />
			</label>

			<label class="labeled-entry">
				<div class="label">Special notes?</div>
				<textarea class="entry resize-y min-h-[calc(3.1lh+1rem)]" name="note" wrap="soft"></textarea>
				<!-- <input class="entry" type="text" name="madeBy" autocomplete="off" spellcheck="false" /> -->
			</label>

			<button class="btn solid mt-4" type="submit" disabled={isWaiting}> Submit </button>
		</form>
	</main>
{/if}
