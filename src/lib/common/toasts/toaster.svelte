<script lang="ts">
	import { flip } from "svelte/animate";
	import { quintOut as ease, quintOut } from "svelte/easing";
	import { fly } from "svelte/transition";
	import { toasts } from "./toast-store.svelte";
</script>

<div class="fixed z-1000 top-4 right-4 flex-col gap-4 w-full max-w-sm">
	{#each toasts.slice(0, 3) as toast, index (toast.id)}
		<div
			class="toast"
			in:fly={{ x: 0, y: -200, duration: 500, easing: quintOut }}
			out:fly={{ x: 200, y: 0, duration: 500, easing: quintOut }}
			animate:flip={{ duration: 500, easing: ease }}
			onclick={() => {
				toasts.splice(index, 1);
			}}
		>
			<div class="font-bold">{toast.text}</div>
			<div class="text-muted-fg">
				{toast.description}
			</div>
			{#each toast.actions as action}
				<button onclick={action.onClick}>{action.label}</button>
			{/each}
		</div>
	{/each}
</div>
