# Obsidian Note Content Pusher
_An Obsidian plugin to automatically create notes with some specified content when you link to a note that doesn't yet exist._

As requested in [this](https://forum.obsidian.md/t/push-content-to-link-automatically-apply-tags-links-embeds-into-newly-created-links-through-link-insert-content/36844) forum post.

<a href="https://www.youtube.com/channel/UC0ZCat9S6KoR7dAiIezBfhg">
  <img align="left" alt="One time donation" width="200px" src="https://raw.githubusercontent.com/lizard-heart/lizard-heart/main/61e11e22d8ff4a5b4a1b3346_Supportbutton-1.png" />
</a>
<br> <br>

## How to use
- When you want to link to a file that doesn't yet exist, do it with this syntax: `[[title of new file]]>>{content you want to appear in file}`
- Then run the only command in this plugin, "Create file and push content," either from the command palette or with a hotkey. The command will automatically replace content in the original file to look like this: `[[title of new file]]`, will create the file, and add the content within the brackets to it, all without leaving the currently open note.
- If a file with the name you specified already exists, the content in the brackets will be added to the end of that file.

### Aliases
- To add an alias to the new file, do it in the following format: `[[title for new file|>>alternate title]]>>{}`
- Running the command will fix the formatting on the current file: `[[title for new file|alternate title]]` and will also add the alias you wrote, in this case "alternate title," to the yaml frontmatter of the new note, like this:
```yaml
---
alias: alternate title
---
```

## Customization/Settings
### Content Pusher Characters
First, you can customize the string of characters the plugin will look for when pushing content to a file. Make this something you don't often type elsewhere. The default is `>>`. For example, if you changed this setting to `%%%`, you would type something like `[[title]]%%%{content}` to push content to a new note.

### Automatic Push
The second setting allows you to toggle on Automatic Push. This will automatically check for any text in the correct format when you switch to a new line in your note. This way you never have to run the plugin's command to trigger the note creation. You will still be able to run the command manually at any time.

### Push to Existing Notes
The third setting allows you to toggle whether content being pushed to new notes will be added to the beginning or to the end of the note. By default, the content will be appended (added to the end), but turning the toggle on will add new content to the beginning.
