import { ItemView, WorkspaceLeaf } from "obsidian";
import { VIEW_TYPE_HABIT_TRACKER, Habit } from "./types";
import HabitTrackerPlugin from "./main";

export class HabitTrackerView extends ItemView {
	plugin: HabitTrackerPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: HabitTrackerPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return VIEW_TYPE_HABIT_TRACKER;
	}

	getDisplayText(): string {
		return "Habit Tracker";
	}

	getIcon(): string {
		return "check-square";
	}

	async onOpen(): Promise<void> {
		this.render();
	}

	async onClose(): Promise<void> {
		// ItemView handles DOM cleanup
	}

	render(): void {
		const container = this.containerEl.children[1] as HTMLElement;
		container.empty();
		container.addClass("habit-tracker-container");

		if (this.plugin.settings.habits.length === 0) {
			container.createEl("p", {
				text: "No habits yet. Add one in Settings → Habit Tracker.",
				cls: "habit-tracker-empty",
			});
			return;
		}

		for (const habit of this.plugin.settings.habits) {
			this.renderHabit(container, habit);
		}
	}

	private renderHabit(parent: HTMLElement, habit: Habit): void {
		const section = parent.createEl("div", { cls: "habit-section" });
		section.createEl("div", { cls: "habit-name", text: habit.name });

		const gridContainer = section.createEl("div", { cls: "grid-container" });
		const completedSet = new Set(habit.completedDates);
		const dates = this.buildDateGrid();

		for (let col = 0; col < 26; col++) {
			for (let row = 0; row < 7; row++) {
				const dateStr = dates[col][row];
				const cell = gridContainer.createEl("div", { cls: "grid-cell" });

				if (!dateStr) {
					cell.addClass("grid-cell-empty");
				} else {
					if (completedSet.has(dateStr)) {
						cell.addClass("completed");
					}
					cell.setAttribute("title", dateStr);
					cell.addEventListener("click", async () => {
						await this.toggleDate(habit, dateStr);
					});
				}
			}
		}
	}

	// Returns a 26×7 array of "YYYY-MM-DD" strings (or null for future/padding cells).
	// col=0 is the oldest week, col=25 is the current week.
	// row=0 is Monday, row=6 is Sunday.
	private buildDateGrid(): (string | null)[][] {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		// Find the Monday of the current week
		const dow = today.getDay(); // 0=Sun, 1=Mon ... 6=Sat
		const daysFromMonday = dow === 0 ? 6 : dow - 1;
		const gridEndMonday = new Date(today);
		gridEndMonday.setDate(today.getDate() - daysFromMonday);

		// Grid start = 25 weeks before the current week's Monday
		const gridStartMonday = new Date(gridEndMonday);
		gridStartMonday.setDate(gridEndMonday.getDate() - 25 * 7);

		const grid: (string | null)[][] = [];
		for (let col = 0; col < 26; col++) {
			grid[col] = [];
			for (let row = 0; row < 7; row++) {
				const d = new Date(gridStartMonday);
				d.setDate(gridStartMonday.getDate() + col * 7 + row);
				grid[col][row] = d > today ? null : this.formatDate(d);
			}
		}
		return grid;
	}

	// Use local time getters — never toISOString() which returns UTC
	private formatDate(d: Date): string {
		const year = d.getFullYear();
		const month = String(d.getMonth() + 1).padStart(2, "0");
		const day = String(d.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	}

	private async toggleDate(habit: Habit, dateStr: string): Promise<void> {
		const idx = habit.completedDates.indexOf(dateStr);
		if (idx === -1) {
			habit.completedDates.push(dateStr);
		} else {
			habit.completedDates.splice(idx, 1);
		}
		await this.plugin.saveSettings();
		this.render();
	}
}
