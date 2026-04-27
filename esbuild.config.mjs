import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";
import fs from "fs";
import path from "path";

const prod = process.argv[2] === "production";

const obsidianPluginDir = path.join(
	process.env.USERPROFILE || process.env.HOME,
	"documents/Obsidian Vault/.obsidian/plugins/habit-grid"
);

const copyToObsidian = {
	name: "copy-to-obsidian",
	setup(build) {
		build.onEnd(() => {
			if (!fs.existsSync(obsidianPluginDir)) return;
			for (const file of ["main.js", "styles.css", "manifest.json"]) {
				if (fs.existsSync(file)) {
					fs.copyFileSync(file, path.join(obsidianPluginDir, file));
				}
			}
			console.log("Copied to Obsidian plugin folder");
		});
	},
};

const context = await esbuild.context({
	entryPoints: ["src/main.ts"],
	bundle: true,
	external: [
		"obsidian",
		"electron",
		"@codemirror/autocomplete",
		"@codemirror/closebrackets",
		"@codemirror/collab",
		"@codemirror/commands",
		"@codemirror/comment",
		"@codemirror/fold",
		"@codemirror/gutter",
		"@codemirror/highlight",
		"@codemirror/history",
		"@codemirror/language",
		"@codemirror/lint",
		"@codemirror/matchbrackets",
		"@codemirror/panel",
		"@codemirror/rangeset",
		"@codemirror/rectangular-selection",
		"@codemirror/search",
		"@codemirror/state",
		"@codemirror/stream-parser",
		"@codemirror/text",
		"@codemirror/tooltip",
		"@codemirror/view",
		...builtins,
	],
	format: "cjs",
	target: "es2018",
	logLevel: "info",
	sourcemap: prod ? false : "inline",
	treeShaking: true,
	outfile: "main.js",
	minify: prod,
	plugins: [copyToObsidian],
});

if (prod) {
	await context.rebuild();
	process.exit(0);
} else {
	await context.watch();
}
