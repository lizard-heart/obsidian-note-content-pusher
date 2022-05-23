# Obsidian Note Content Pusher
An Obsidian plugin to automatically create notes with some specified content when you link to a note that doesn't yet exist.

## How to use
- When you want to link to a file that doesn't yet exist, do it with this syntax: `[[title of new file]]>>{content you want to appear in file}`
- Then run the only command in this plugin, "Create file and push content," either from the command palette or with a hotkey. The command will automatically replace content in the original file to look like this: `[[title of new file]]`, will create the file, and add the content within the brackets to it, all without leaving the currently open note.

### Aliases
- To add an alias to the new file, do it in the following format: `[[title for new file|>>alternate title]]>>{}`
- Running the command will fix the formatting on the current file: `[[title for new file|alternate title]]` and will also add the alias you wrote, in this case "alternate title," to the yaml frontmatter of the new note, like this:
```yaml
---
alias: alternate title
---
```

## Customization/Settings
