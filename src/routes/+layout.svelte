<script lang="ts">
	import "$lib/styles/index.css";
	import "virtual:uno.css";
	import type { LayoutProps } from "./$types";

	let { data, children }: LayoutProps = $props();
</script>

{@render children()}
