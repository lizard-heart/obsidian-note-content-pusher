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


// export async function createANote(path: String, content: String): Promise<TFile> {
// 	const app = window.app as App;
// 	const { vault } = app;

// 	try {
// 		const createdFile = await vault.create(path+".md", content);
// 		return createdFile;
// 	} catch (err) {
// 		new Notice(`Something didn't work.`)
// 	}
// }


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
		// const app = window.app as App;
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (view!=null) {
			const editor = view.editor;
			const editorText = editor.getValue();
			const indicatorCharacter = this.settings.indicatorCharacter
			let newContent = ""
			let inlineSetting = ""
			let newTitle = ""
			let newAlias = ""
			let shouldPrepend = this.settings.shouldPrepend

			// check if syntax to push file is present
			try {
				newContent = editorText.split("]]" + indicatorCharacter + "{")[1].split("}")[0];
				if (newContent.includes(this.settings.inlineSettingCharacter)) {
					inlineSetting = newContent.split(this.settings.inlineSettingCharacter)[1];
					newContent = newContent.split(this.settings.inlineSettingCharacter)[0];
				}

				if (inlineSetting == "append") {
					shouldPrepend = false;
				} else if (inlineSetting == "prepend") {
					shouldPrepend = true;
				}
			

				// fix formatting of original note
				// const view = this.app.workspace.getActiveViewOfType(MarkdownView);
				// const editor = view.editor;
				const zeroPos = { line: 0, ch: 0 };
				const lastPos = { line: Number(editor.lineCount()) - 1, ch: editor.getLine(Number(editor.lineCount()) - 1).length };
				const tempSplit = editorText.split("]]" + indicatorCharacter + "{");
				const firstPart = tempSplit[0].split("[[");
				newTitle = firstPart[firstPart.length - 1];
				const restOfNote = tempSplit[1].split("}")[1]
				// this.app.vault.modify(view.file, tempSplit[0] + "]]" + restOfNote)
				editor.replaceRange(tempSplit[0] + "]]" + restOfNote, zeroPos, lastPos);
				const newEditorText = tempSplit[0] + "]]" + restOfNote
				if (newTitle.includes("|" + indicatorCharacter)) {
					newAlias = newTitle.split("|" + indicatorCharacter)[1]
					newTitle = newTitle.split("|" + indicatorCharacter)[0]
					editor.replaceRange(newEditorText.split("|" + indicatorCharacter)[0] + "|" + newEditorText.split("|" + indicatorCharacter)[1], zeroPos, lastPos);
				}

				// check if file exists already
				const files = app.vault.getMarkdownFiles();
				var filesWithName: TFile[] = [];
				var baseTitleName = newTitle;
				if (baseTitleName.includes("/")) {
					var pathParts = baseTitleName.split("/");
					baseTitleName = pathParts[pathParts.length - 1];
				}
				var heading = "";
				if (newTitle.includes("#")) {
					heading = newTitle.split("#")[1];
					newTitle = newTitle.split("#")[0];
				}
				console.log("base: " + baseTitleName)
				for (i=0; i<files.length; i++) {
					if (files[i].basename == baseTitleName) {
						filesWithName.push(files[i]);
						break;
					}
				}
				// files.forEach(function (myFile: TFile) {
				// 	if (myFile.basename == baseTitleName) {
				// 		filesWithName.push(myFile);
				// 		console.log(myFile);
				// 	}
				// });
				var realExistingFile: TFile = null;
				if (filesWithName.length > 0) {
					if (filesWithName.length > 1) {
						for (var i = 0; i < filesWithName.length; i++) {
							if (filesWithName[i].path == newTitle + ".md") {
								realExistingFile = filesWithName[i];
								break;
							}
						}
						// filesWithName.forEach(function (myFile: TFile) {
						// 	if (myFile.path == newTitle + ".md") {
						// 		realExistingFile = myFile;
						// 	}
						// });
					} else {
						realExistingFile = filesWithName[0];
					}
				}

				// append content or create new file
				if (newAlias != "") {
					newAlias = newAlias+", "
				}
				if (filesWithName.length == 0) {
					new Notice(`Creating file and pushing content...`);
					if (newAlias == "") {
						await app.vault.create(newTitle + ".md", newContent);
						// createANote(newTitle, newContent);
					} else {
						newContent = "---\nalias: " + newAlias + "\n---\n" + newContent;
						await app.vault.create(newTitle + ".md", newContent);
						// createANote(newTitle, newContent);
					}
				} else {
					var pushingType = "Appending";
					if (shouldPrepend) {
						pushingType = "Prepending";
					}
					new Notice(`File already exists. ${pushingType} content...`);
					const fullExistingFileText = await app.vault.read(realExistingFile);
					var newYaml = ""
					var existingFileText = ""
					if (fullExistingFileText.includes("---")) {
						console.log(fullExistingFileText.split("---"))
						if (fullExistingFileText.split("---").length > 2) {
							var currentYaml = fullExistingFileText.split("---")[1]
							for (let i=2; i<fullExistingFileText.split("---").length; i++) {
								if (i==2){
									existingFileText = existingFileText + fullExistingFileText.split("---")[i]
								} else {
									existingFileText = existingFileText + fullExistingFileText.split("---")[i] + "---"
								}
							}
							if (currentYaml.includes("alias:")) {
								newYaml = "---" + currentYaml.split("alias:")[0] + "alias: " + newAlias + currentYaml.split("alias:")[1] + "---"
							} else {
								newYaml = "---alias: " + newAlias + currentYaml + "---"
							}
						} else {
							newYaml = "---\nalias: " + newAlias + "\n---\n";
							existingFileText = fullExistingFileText;
						}
					} else {
						if (newAlias!="") {
							newYaml = "---\nalias: " + newAlias + "\n---\n";
						}
						existingFileText = fullExistingFileText;
					};
					if (heading == "") {
						if (shouldPrepend == true) {
							this.app.vault.modify(realExistingFile, newYaml + newContent + "\n" + existingFileText)
						} else {
							this.app.vault.modify(realExistingFile, newYaml + existingFileText + "\n" + newContent)
						}
					} else {
						this.app.vault.modify(realExistingFile, newYaml + existingFileText.split("# " + heading)[0] + "\n# " + heading + "\n" + newContent + "\n" + existingFileText.split("# " + heading)[1])
					}
				}

			} catch (err) {
				if (this.settings.automaticPush == false) {
					new Notice(`Didn't detect correct syntax. Doing nothing`)
				}
			}
		}
	}

	private automaticPush = serialize(
		async (file: TFile, _data: string, cache: CachedMetadata) => {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (view!= null) {
				const indicatorCharacter = this.settings.indicatorCharacter
				const editor = view.editor;
				const currentPos = editor.getCursor();
				const nextPos = { line: currentPos.line, ch: currentPos.ch + 1 };
				const zeroPos = { line: currentPos.line, ch: 0 };
				const lineString = editor.getRange(zeroPos, nextPos);
				if (this.settings.automaticPush == true && lineString.includes("]]" + indicatorCharacter + "{") == false) {
					await this.createAndPush();
				}
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
