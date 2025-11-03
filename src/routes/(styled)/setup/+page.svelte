<script lang="ts">
	import { applyAction, enhance } from "$app/forms";
	import { toast } from "$lib";
	import { PasswordInput } from "$lib/components";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();

	let isWaiting = $state(false);
</script>

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
						toast("Failed:", { description: result.data as unknown as string, time: 10000 });
						break;
					case "error":
						toast("Error:", { description: result.status + " - " + result.error, time: 10000 });
						break;
				}

				return await applyAction(result);
			};
		}}
	>
		<h1 class="mb-4 text-lg text-center font-bold">Setup Game Queue</h1>

		<label class="labeled-entry">
			<div class="label">Admin password:</div>
			<div class="entry flex-row items-center">
				<div class="text-gray">admin-</div>
				<input type="text" name="adminPassword" autocomplete="off" spellcheck="false" />
			</div>
			<!-- <PasswordInput name="adminPassword" /> -->
		</label>

		<label class="labeled-entry">
			<div class="label">Mod password:</div>
			<div class="entry flex-row items-center">
				<div class="text-gray">mod-</div>
				<input type="text" name="modPassword" autocomplete="off" spellcheck="false" />
			</div>
		</label>

		<button class="btn solid mt-4" type="submit" disabled={isWaiting}> Get Started </button>
	</form>
</main>
