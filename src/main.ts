import { Plugin, WorkspaceLeaf } from "obsidian";
import { PluginData, DEFAULT_DATA, VIEW_TYPE_HABIT_TRACKER } from "./types";
import { HabitTrackerView } from "./HabitTrackerView";
import { HabitTrackerSettingsTab } from "./SettingsTab";

export default class HabitTrackerPlugin extends Plugin {
	settings: PluginData;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.registerView(
			VIEW_TYPE_HABIT_TRACKER,
			(leaf: WorkspaceLeaf) => new HabitTrackerView(leaf, this)
		);

		this.addRibbonIcon("layout-grid", "Habit Tracker", () => {
			this.activateView();
		});

		this.addCommand({
			id: "open-habit-tracker",
			name: "Open Habit Tracker",
			callback: () => this.activateView(),
		});

		this.addSettingTab(new HabitTrackerSettingsTab(this.app, this));
	}

	onunload(): void {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_HABIT_TRACKER);
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_DATA, await this.loadData());
		if (!Array.isArray(this.settings.habits)) {
			this.settings.habits = [];
		}
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	async activateView(): Promise<void> {
		const { workspace } = this.app;

		const existing = workspace.getLeavesOfType(VIEW_TYPE_HABIT_TRACKER);
		if (existing.length > 0) {
			workspace.revealLeaf(existing[0]);
			return;
		}

		const leaf = workspace.getRightLeaf(false);
		if (!leaf) return;

		await leaf.setViewState({
			type: VIEW_TYPE_HABIT_TRACKER,
			active: true,
		});

		workspace.revealLeaf(leaf);
	}
}
