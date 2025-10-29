import { sveltekit } from "@sveltejs/kit/vite";
import UnoCSS from "@unocss/vite";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";

export default defineConfig({
	plugins: [UnoCSS(), sveltekit(), devtoolsJson()],
});
