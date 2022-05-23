import { App, PluginSettingTab, Setting } from "obsidian";
import ListModified from "./main";

export interface ListModifiedSettings {
	indicatorCharacter: string;
}

export const DEFAULT_SETTINGS: ListModifiedSettings = {
	indicatorCharacter: ">>",
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
	}
}
