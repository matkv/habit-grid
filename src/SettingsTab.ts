import { App, PluginSettingTab, Setting } from "obsidian";
import HabitTrackerPlugin from "./main";
import { VIEW_TYPE_HABIT_TRACKER } from "./types";
import { HabitTrackerView } from "./HabitTrackerView";

export class HabitTrackerSettingsTab extends PluginSettingTab {
	plugin: HabitTrackerPlugin;

	constructor(app: App, plugin: HabitTrackerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h2", { text: "Habit Tracker" });

		for (const habit of this.plugin.settings.habits) {
			new Setting(containerEl)
				.addText((text) =>
					text
						.setValue(habit.name)
						.onChange(async (value) => {
							habit.name = value;
							await this.plugin.saveSettings();
							this.refreshView();
						})
				)
				.addButton((btn) =>
					btn
						.setButtonText("Delete")
						.setWarning()
						.onClick(async () => {
							this.plugin.settings.habits =
								this.plugin.settings.habits.filter(
									(h) => h.id !== habit.id
								);
							await this.plugin.saveSettings();
							this.refreshView();
							this.display();
						})
				);
		}

		containerEl.createEl("hr");

		let newHabitName = "";
		new Setting(containerEl)
			.setName("Add habit")
			.addText((text) => {
				text.setPlaceholder("Habit name").onChange((value) => {
					newHabitName = value;
				});
				text.inputEl.addEventListener("keydown", async (e) => {
					if (e.key === "Enter" && newHabitName.trim()) {
						await this.addHabit(newHabitName.trim());
						text.setValue("");
						newHabitName = "";
						this.display();
					}
				});
			})
			.addButton((btn) =>
				btn
					.setButtonText("Add")
					.setCta()
					.onClick(async () => {
						if (!newHabitName.trim()) return;
						await this.addHabit(newHabitName.trim());
						newHabitName = "";
						this.display();
					})
			);

		containerEl.createEl("hr");

		new Setting(containerEl)
			.setName("Data file")
			.setDesc("Open the JSON file where habit data is stored.")
			.addButton((btn) =>
				btn
					.setButtonText("Open data.json")
					.onClick(() => {
						const adapter = this.app.vault.adapter as any;
						const dataPath = `${adapter.basePath}/${this.app.vault.configDir}/plugins/habit-grid/data.json`;
						const { shell } = require("electron");
						shell.openPath(dataPath);
					})
			);
	}

	private async addHabit(name: string): Promise<void> {
		this.plugin.settings.habits.push({
			id: this.generateId(),
			name,
			completedDates: [],
		});
		await this.plugin.saveSettings();
		this.refreshView();
	}

	private generateId(): string {
		if (typeof crypto !== "undefined" && crypto.randomUUID) {
			return crypto.randomUUID();
		}
		return Date.now().toString(36) + Math.random().toString(36).slice(2);
	}

	private refreshView(): void {
		this.app.workspace
			.getLeavesOfType(VIEW_TYPE_HABIT_TRACKER)
			.forEach((leaf) => {
				if (leaf.view instanceof HabitTrackerView) {
					leaf.view.render();
				}
			});
	}
}
