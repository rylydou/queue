<script lang="ts">
	import type { Snippet } from "svelte";
	import type { LayoutData } from "./$types";

	interface Props {
		data: LayoutData;
		children?: Snippet;
	}

	let { data, children }: Props = $props();
</script>

<div class="wave fixed -z-1 left-0 right-0 top-8 h-4 bg-surface"></div>
<div class="wave animation-reverse fixed -z-1 left-0 right-0 bottom-8 h-4 bg-surface"></div>
{@render children?.()}
