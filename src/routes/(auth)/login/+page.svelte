<script lang="ts">
	import { applyAction, enhance } from "$app/forms";
	import { config } from "$lib";
	import { PasswordInput } from "$lib/components";

	let message = $state("");
	let is_waiting = $state(false);
</script>

<svelte:head>
	<title>Login - {config.appName}</title>
</svelte:head>

<main class="h-screen overflow-y-auto flex-col items-center justify-center">
	<form
		class="form center-form"
		method="post"
		use:enhance={() => {
			is_waiting = true;

			return async ({ result }) => {
				is_waiting = false;

				switch (result.type) {
					case "redirect":
					case "success":
						return await applyAction(result);
					case "failure":
						message = result.data?.message?.toString() || "Something went wrong";
						return;
					case "error":
						message = "Failed to login - " + (result.error.message || "Error code=" + result.status);
						return;
				}
			};
		}}
	>
		<label class="labeled-entry">
			<span class="label">Email</span>
			<input class="entry" type="text" name="email" autocomplete="email" autofocus />
		</label>

		<label class="labeled-entry">
			<span class="label">Password</span>
			<PasswordInput name="password" autocomplete="current-password" disabled={is_waiting} />
		</label>

		<button class="btn-primary" type="submit"> Login </button>
	</form>
</main>
