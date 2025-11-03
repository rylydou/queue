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
		<h1 class="mb-4 text-lg text-center font-bold">Mod login</h1>

		<label class="labeled-entry">
			<div class="label">Access Code:</div>
			<PasswordInput name="secret" />
		</label>

		<button class="btn solid mt-4" type="submit" disabled={isWaiting}> Submit </button>
	</form>
</main>
