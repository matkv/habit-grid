export interface Habit {
	id: string;
	name: string;
	completedDates: string[]; // "YYYY-MM-DD" local time
}

export interface PluginData {
	habits: Habit[];
}

export const DEFAULT_DATA: PluginData = {
	habits: [],
};

export const VIEW_TYPE_HABIT_TRACKER = "habit-tracker-view";
