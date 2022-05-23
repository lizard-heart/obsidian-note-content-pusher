import { App, PluginSettingTab, Setting } from "obsidian";
import ListModified from "./main";

export interface ListModifiedSettings {
	outputFormat: string;
	tags: string;
	excludedFolders: string;
}

export const DEFAULT_SETTINGS: ListModifiedSettings = {
	outputFormat: "- [[link]]",
	tags: "",
	excludedFolders: "",
};

export class ListModifiedSettingTab extends PluginSettingTab {
	plugin: ListModified;
	tagString: string;

	constructor(app: App, plugin: ListModified) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "No Settings Currently" });

	}
}
