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
		const createdFile = await vault.create(
			path+".md", content

		);

		new Notice(`Creating file and pushing content...`);

		return createdFile;
	} catch (err) {
		console.error(`Failed to create file`, err);
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
		var newContent = editorText.split("]]>>{")[1].split("}")[0];
		const tempSplit = editorText.split("]]>>{");

		console.log(newContent);
		const firstPart = tempSplit[0].split("[[");
		var newTitle = firstPart[firstPart.length-1];
		const restOfNote = tempSplit[1].split("}")[1]
		this.app.vault.modify(view.file, tempSplit[0] + "]]" + restOfNote)
		const newEditorText = tempSplit[0] + "]]" + restOfNote
		if (newTitle.includes("|>>")) {
			var newContent = "---\nalias: " + newTitle.split("|>>")[1] + "\n---\n" + newContent
			newTitle = newTitle.split("|>>")[0]
			this.app.vault.modify(view.file, newEditorText.split("|>>")[0]+"|"+newEditorText.split("|>>")[1])
		}
		createANote(newTitle,newContent)
	}


	private async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}
}
