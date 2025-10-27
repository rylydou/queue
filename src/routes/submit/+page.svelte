<script lang="ts">
	import { enhance } from "$app/forms";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Ryly's Game Queue</title>
</svelte:head>

<main class="h-screen overflow-y-auto flex-col items-center justify-center">
	<form
		class="form center-form"
		method="post"
		use:enhance={() => {
			return async ({ result }) => {};
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

		<button class="btn solid mt-4" type="submit"> Submit </button>
	</form>
</main>
