import { serialize } from "monkey-around";
import {
	MarkdownView,
	CachedMetadata,
	Notice,
	Plugin,
	TFile,
	moment,
	getAllTags,
	Vault,
} from "obsidian";
import * as CodeMirror from "codemirror";

import {
	getAllDailyNotes,
	getDailyNote,
	createDailyNote,
} from "obsidian-daily-notes-interface";
import {
	ListModifiedSettings,
	DEFAULT_SETTINGS,
	ListModifiedSettingTab,
} from "./settings";


export async function createANote(path: String, content: String): Promise<TFile> {
	const app = window.app as App;
	const { vault } = app;

	try {
		const createdFile = await vault.create(path+".md", content);
		return createdFile;
	} catch (err) {
		if (String(err).includes("already exists")) {
			new Notice(`File alreay exists. Not creating any file.`)
		} else {
			new Notice(`Something didn't work.`)
		}
	}
}


export default class ListModified extends Plugin {
	settings: ListModifiedSettings;
	private cmEditors: CodeMirror.Editor[];

	async onload() {
		await this.loadSettings();
		this.addCommand({
			id: "create-and-push",
			name: "Create file and push content",
			callback: () => this.createAndPush(),
			hotkeys: [{
				modifiers: ["Mod"],
				key: "tab"
			}],
		});

		this.registerEvent(
			this.app.metadataCache.on("changed", this.automaticPush)
		);

		this.addSettingTab(new ListModifiedSettingTab(this.app, this));
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	onunload() {}


	createAndPush() {

		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		const editor = view.editor;
		const editorText = editor.getValue();
		const indicatorCharacter = this.settings.indicatorCharacter
		try {
			var newContent = editorText.split("]]" + indicatorCharacter + "{")[1].split("}")[0];
			const tempSplit = editorText.split("]]" + indicatorCharacter + "{");
			console.log(newContent);
			const firstPart = tempSplit[0].split("[[");
			var newTitle = firstPart[firstPart.length - 1];
			const restOfNote = tempSplit[1].split("}")[1]
			this.app.vault.modify(view.file, tempSplit[0] + "]]" + restOfNote)
			const newEditorText = tempSplit[0] + "]]" + restOfNote
			if (newTitle.includes("|" + indicatorCharacter)) {
				var newContent = "---\nalias: " + newTitle.split("|" + indicatorCharacter)[1] + "\n---\n" + newContent
				newTitle = newTitle.split("|" + indicatorCharacter)[0]
				this.app.vault.modify(view.file, newEditorText.split("|" + indicatorCharacter)[0] + "|" + newEditorText.split("|" + indicatorCharacter)[1])
			}
			createANote(newTitle, newContent)
			new Notice(`Creating file and pushing content...`);
		} catch (err) {
			if (this.settings.automaticPush == false) {
				new Notice(`Didn't detect correct syntax. Doing nothing`)
			}
		}

	}

	private automaticPush = serialize(
		async (file: TFile, _data: string, cache: CachedMetadata) => {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			const indicatorCharacter = this.settings.indicatorCharacter
			const editor = view.editor;
			const currentPos = editor.getCursor();
			const nextPos = { line: currentPos.line, ch: currentPos.ch + 1 };
			const zeroPos = { line: currentPos.line, ch: 0 };
			const lineString = editor.getRange(zeroPos, nextPos);
			if (this.settings.automaticPush == true && lineString.includes("]]"+indicatorCharacter+"{")==false) {
				await this.createAndPush();
			}
		}
	);


	private async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}
}
