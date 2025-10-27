import { importDirectorySync, parseColors, runSVGO } from "@iconify/tools";
import { defineConfig, presetIcons, presetWind3, transformerVariantGroup } from "unocss";

const loadCustomIconSet = (path: string) => {
	// Load icon set
	const iconSet = importDirectorySync(path, {
		prefix: "svg",
	});

	// Parse all icons: optimise, clean up palette
	iconSet.forEachSync((name) => {
		const svg = iconSet.toSVG(name)!;

		parseColors(svg, {
			defaultColor: "currentColor",
			callback: (attr, colorStr, color) => {
				if (!color || color.type === "none" || color.type === "transparent") return "transparent";
				return "currentColor";
			},
		});

		// Optimise
		runSVGO(svg);

		// Update icon in icon set
		iconSet.fromSVG(name, svg);
	});

	// Return as function
	return () => iconSet.export();
};

export default defineConfig({
	outputToCssLayers: true,
	theme: {
		// prettier-ignore
		colors: {
			"base-bg": "var(--base-bg)",
			"base-fg": "var(--base-fg)",
			"card-bg": "var(--card-bg)",
			"card-fg": "var(--card-fg)",
			"popover-bg": "var(--popover-bg)",
			"popover-fg": "var(--popover-fg)",
			"primary": "var(--primary)",
			"primary-fg": "var(--primary-fg)",
			"secondary": "var(--secondary)",
			"secondary-fg": "var(--secondary-fg)",
			"muted": "var(--muted)",
			"muted-fg": "var(--muted-fg)",
			"accent": "var(--accent)",
			"accent-fg": "var(--accent-fg)",
			"border": "var(--border)",
			"input": "var(--input)",
			"ring": "var(--ring)",
			"sidebar-bg": "var(--sidebar-bg)",
			"sidebar-fg": "var(--sidebar-fg)",
		},
		// prettier-ignore
		breakpoints: {
			"md": "48rem",
		},
	},
	rules: [
		[
			/^stack$/,
			function* ([], { symbols }) {
				yield {
					display: "grid",
					"place-content": "center",
				};
				yield {
					[symbols.selector]: (selector) => `${selector}>*`,
					"grid-area": "1/1",
				};
			},
		],
		["animation-reverse", { "animation-direction": "reverse" }],
		["animate-shake", { animation: "shake 500ms infinite" }],
		["collapse", { visibility: "collapse" }],
		[
			"flex-col",
			{
				display: "flex",
				"flex-direction": "column",
			},
		],
		[
			"flex-row",
			{
				display: "flex",
				"flex-direction": "row",
			},
		],
		["col-span", { "grid-column": "1/-1" }],
		["row-span", { "grid-row": "1/-1" }],
	],
	presets: [
		presetWind3({ dark: "media" }),
		presetIcons({
			autoInstall: false,
			prefix: "",
			collections: {
				icon: loadCustomIconSet("assets/icons"),
			},
		}),
	],
	transformers: [transformerVariantGroup()],
	// extractors: [
	// 	extractorSvelte(),
	// ]
});
