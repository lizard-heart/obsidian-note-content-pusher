import { App, PluginSettingTab, Setting } from "obsidian";
import ListModified from "./main";

export interface ListModifiedSettings {
	indicatorCharacter: string;
	automaticPush: boolean;
	shouldPrepend: boolean;
}

export const DEFAULT_SETTINGS: ListModifiedSettings = {
	indicatorCharacter: ">>",
	automaticPush: false,
	shouldPrepend: false,
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

		containerEl.createEl("h2", { text: "Settings" });

		new Setting(containerEl)
			.setName("Content Pusher Character")
			.setDesc(
				"Specify the string of characters you want to use to indicate when you want to push content to a new note."
			)
			.addText((text) =>
				text
					.setPlaceholder(">>")
					.setValue(this.plugin.settings.indicatorCharacter)
					.onChange(async (value) => {
						this.plugin.settings.indicatorCharacter = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Automatic Push")
			.setDesc("Automatically push content to a new note, when your cursor moves to a new line (without you running a command).")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.automaticPush)
					.onChange(async (value) => {
						this.plugin.settings.automaticPush = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Prepend to existing file")
			.setDesc("If a file already exists, prepends the content to the existing file instead of putting it at the end.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.shouldPrepend)
					.onChange(async (value) => {
						this.plugin.settings.shouldPrepend = value;
						await this.plugin.saveSettings();
					})
			);

	}
}
