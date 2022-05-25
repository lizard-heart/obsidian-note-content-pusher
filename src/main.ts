import { serialize } from "monkey-around";
import {
	MarkdownView,
	CachedMetadata,
	Notice,
	Plugin,
	TFile,
} from "obsidian";

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
		new Notice(`Something didn't work.`)
	}
}


export default class ListModified extends Plugin {
	settings: ListModifiedSettings;

	async onload() {
		await this.loadSettings();
		this.addCommand({
			id: "create-and-push",
			name: "Create file and push content",
			callback: () => this.createAndPush(),
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

	// the first function that runs
	async createAndPush() {
		const app = window.app as App;
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		const editor = view.editor;
		const editorText = editor.getValue();
		const indicatorCharacter = this.settings.indicatorCharacter
		var newContent = ""
		var newTitle = ""

		// check if syntax to push file is present
		try {
			newContent = editorText.split("]]" + indicatorCharacter + "{")[1].split("}")[0];

			// fix formatting of original note
			const tempSplit = editorText.split("]]" + indicatorCharacter + "{");
			const firstPart = tempSplit[0].split("[[");
			newTitle = firstPart[firstPart.length - 1];
			const restOfNote = tempSplit[1].split("}")[1]
			this.app.vault.modify(view.file, tempSplit[0] + "]]" + restOfNote)
			const newEditorText = tempSplit[0] + "]]" + restOfNote
			if (newTitle.includes("|" + indicatorCharacter)) {
				newContent = "---\nalias: " + newTitle.split("|" + indicatorCharacter)[1] + "\n---\n" + newContent
				newTitle = newTitle.split("|" + indicatorCharacter)[0]
				this.app.vault.modify(view.file, newEditorText.split("|" + indicatorCharacter)[0] + "|" + newEditorText.split("|" + indicatorCharacter)[1])
			}

			// check if file exists already
			const files = app.vault.getMarkdownFiles();
			var filesWithName: TFile[] = [];
			var baseTitleName = newTitle;
			if (baseTitleName.includes("/")) {
				var pathParts = baseTitleName.split("/");
				baseTitleName = pathParts[pathParts.length - 1];
			}
			files.forEach(function (myFile: TFile) {
				if (myFile.path == newTitle + ".md") {
					filesWithName.push(myFile);
					console.log(myFile);
				}
			});

			// append content or create new file
			if (filesWithName.length == 0) {
				new Notice(`Creating file and pushing content...`);
				createANote(newTitle, newContent)
			} else {
				new Notice(`File already exists. Appending content...`);
				const existingFileText = await app.vault.cachedRead(filesWithName[0]);
				if (this.settings.shouldPrepend == true) {
					this.app.vault.modify(filesWithName[0], newContent + "\n" + existingFileText)
				} else {
					this.app.vault.modify(filesWithName[0], existingFileText + "\n" + newContent)
				}
			}

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
