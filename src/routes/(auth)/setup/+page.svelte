<script lang="ts">
	import { applyAction, enhance } from "$app/forms";
	import { toast } from "$lib";
	import { PasswordInput } from "$lib/components";
	import { appName } from "$lib/config";

	let is_waiting = $state(false);
</script>

<svelte:head>
	<title>Signup - IDE</title>
</svelte:head>

<main class="flex-col items-center justify-center h-screen overflow-y-auto">
	<h1 class="text-4xl text-center font-bold">Welcome to {appName}</h1>
	<p class="mb-8 text-muted-fg text-xl">Let's get some things set up first...</p>

	<form
		class="form center-form card w-full max-w-sm"
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
						toast("Failed to create admin account", {
							description: result.data?.message?.toString(),
						});
						return;
					case "error":
						toast("Failed to login", {
							description: result.error.message || result.status,
						});
						return;
				}
			};
		}}
	>
		<div class="mb-4 text-center">
			<h2 class="text-xl font-bold mb-1">Create your admin account</h2>
			<p class="text-muted-fg">You can set up more admin moderator accounts later.</p>
		</div>

		<div class="flex-col gap-4">
			<label class="labeled-entry">
				<span class="label">Email</span>
				<input class="entry" type="text" name="email" autocomplete="email" autofocus minlength="6" maxlength="40" />
			</label>

			<div class="labeled-entry" data-tooltip="Password must be at least 8 characters long">
				<label class="label" for="password">Password</label>
				<PasswordInput
					id="password"
					name="password"
					autocomplete="new-password"
					disabled={is_waiting}
					minlength="8"
					maxlength="64"
				/>
			</div>

			<label class="labeled-entry">
				<span class="label">Confirm Password</span>
				<PasswordInput name="confirmPassword" autocomplete="new-password" minlength="8" maxlength="64" />
			</label>

			<button type="submit" class="btn primary" disabled={is_waiting}> Next &rightarrow; </button>
		</div>
	</form>
</main>
