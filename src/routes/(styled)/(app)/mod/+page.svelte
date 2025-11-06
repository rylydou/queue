<script lang="ts">
	import { goto } from "$app/navigation";
	import { toast } from "$lib";
	import { createTRPC } from "$lib/trpc";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();

	const { isAdmin } = data;

	const trpc = createTRPC();
</script>

<main class="layout">
	<h1 class="mt-12 mb-4 text-2xl font-bold">
		Hello {isAdmin ? "admin" : "mod"} 👋
	</h1>

	<div class="layout flex-row gap-4 mb-8">
		<button
			class="text-btn text-red-600"
			onclick={async () => {
				toast(`Logging you out...`);

				const result = window.confirm("Are you sure you want to log out?");

				if (!result) return;
				await trpc.deleteMySession.query();
				goto("/mod");
			}}
		>
			Logout
		</button>
		{#if isAdmin}
			<button
				class="text-btn text-red-600"
				onclick={async () => {
					const result = window.confirm("Are you sure you want to nuke all sessions? This will also log you out too.");

					if (!result) return;
					const { deletedCount } = await trpc.deleteAllSessions.query();
					toast(`Deleted all ${deletedCount} sessions`);

					goto("/mod");
				}}
			>
				Nuke all sessions
			</button>
		{/if}
	</div>

	<div class="card w-md">
		<label class="flex-row gap-8 mb-4">
			<div class="flex-1 self-center text-2xl font-bold">Submissions</div>
			<div class="tab-bar big">
				<button class="tab-item text-green-700" aria-current={true}>Open</button>
				<button class="tab-item text-red-700">Closed</button>
			</div>
		</label>
		<form class="form w-full flex-col gap-4" method="post">
			<label class="labeled-entry">
				<div class="label">Max Submissions</div>
				<div class="flex-row gap-2">
					<input class="entry flex-1" type="number" name="maxQueueSize" value={100} />
					<button class="btn" type="submit"> Apply </button>
				</div>
			</label>

			<label class="labeled-entry">
				<div class="label">Max Queue Size</div>
				<div class="flex-row gap-2">
					<input class="entry flex-1" type="number" name="maxQueueSize" value={50} />
					<button class="btn" type="submit"> Apply </button>
				</div>
			</label>
		</form>

		<button
			class="btn mt-4 w-full bg-red-50 text-red-700"
			onclick={() => {
				const result = window.confirm("Are you sure? This will delete ALL games in the queue.");

				if (!result) return;
			}}
		>
			Reset Queue
		</button>
	</div>
</main>
