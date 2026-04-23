# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # watch mode with inline sourcemaps
npm run build    # production build (minified, no sourcemaps)
```

There are no tests or linter configured.

## Deployment

The plugin folder at `~/documents/Obsidian Vault/.obsidian/plugins/habit-grid` is a symlink to this repo. After any build, reload Obsidian (Ctrl+R) to pick up changes. Runtime data is written by Obsidian to `data.json` in this directory — it is gitignored.

## Architecture

This is an Obsidian plugin. The four source files each have a single responsibility:

- **`src/main.ts`** — Plugin entry point. Registers the view, ribbon icon, and command. Owns `loadData`/`saveData` (Obsidian's built-in persistence to `data.json`).
- **`src/HabitTrackerView.ts`** — The sidebar panel (`ItemView`). Renders a 26×7 CSS grid for each habit (26 weeks of history, Mon–Sun rows). Handles click-to-toggle. Calls `plugin.saveSettings()` and re-renders on every toggle.
- **`src/SettingsTab.ts`** — Settings UI. Lists habits with rename/delete, add-habit input, and a button to open `data.json` in the system default app via Electron's `shell.openPath`.
- **`src/types.ts`** — Shared types (`Habit`, `PluginData`) and the `VIEW_TYPE_HABIT_TRACKER` constant.

### Data model

```ts
interface Habit {
  id: string;
  name: string;
  completedDates: string[]; // "YYYY-MM-DD", local time always
}
```

Dates are always formatted with local-time getters (never `toISOString()`) to avoid UTC offset bugs.

### Grid layout

`buildDateGrid()` returns a `(string | null)[][]` — 26 columns (weeks), 7 rows (Mon=0, Sun=6). `null` means a future date or padding cell before the tracking start. The CSS grid uses `repeat(26, 1fr)` with `aspect-ratio: 26/7` to fill the sidebar width responsively with square cells.

### Key Obsidian APIs used

- `Plugin.loadData()` / `Plugin.saveData()` — persists to `.obsidian/plugins/habit-grid/data.json`
- `ItemView` — sidebar panel registered under `VIEW_TYPE_HABIT_TRACKER`
- `PluginSettingTab` — settings screen
- `app.vault.adapter.basePath` + `app.vault.configDir` — used to resolve the absolute path to `data.json`
- `require("electron").shell.openPath` — opens `data.json` in the system default app
