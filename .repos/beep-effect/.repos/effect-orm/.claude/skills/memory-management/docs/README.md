# Obsidian Documentation

Reference documentation for Obsidian and related tools used in the memory-management skill.

## Contents

### Core Tools

- **[obsidian-cli.md](./obsidian-cli.md)** - Command-line interface for Obsidian vault operations
  - Source: [Yakitrak/obsidian-cli](https://github.com/Yakitrak/obsidian-cli)
  - Features: open, search, create, move, delete notes; vault management; daily notes
  - Installation via Homebrew (Mac/Linux) or Scoop (Windows)

### Essential Plugins

- **[obsidian-tasks-plugin.md](./obsidian-tasks-plugin.md)** - Task management plugin
  - Source: [obsidian-tasks-group/obsidian-tasks](https://github.com/obsidian-tasks-group/obsidian-tasks)
  - Features: track tasks across vault, due dates, recurring tasks, query language
  - Full docs: [publish.obsidian.md/tasks](https://publish.obsidian.md/tasks/)

- **[obsidian-dataview-plugin.md](./obsidian-dataview-plugin.md)** - Database query plugin
  - Source: [blacksmithgu/obsidian-dataview](https://github.com/blacksmithgu/obsidian-dataview)
  - Features: DQL query language, DataviewJS API, frontmatter/inline fields
  - Full docs: [blacksmithgu.github.io/obsidian-dataview](https://blacksmithgu.github.io/obsidian-dataview/)

## Usage

These docs support the memory-management skill which provides:

1. **Vault selection** - Choose which Obsidian vault to operate on
2. **Note creation** - Create notes from conversation context
3. **Search and retrieval** - Find existing notes by content or title
4. **Task tracking** - Create and manage tasks in Obsidian
5. **Context integration** - Link conversation topics to vault knowledge

## Quick Reference

### obsidian-cli Commands

```bash
# Set default vault
obsidian-cli set-default "{vault-name}"

# Open a note
obsidian-cli open "{note-name}"

# Search notes (fuzzy)
obsidian-cli search

# Search note content
obsidian-cli search-content "search term"

# Create note with content
obsidian-cli create "{note-name}" --content "..." --open

# Move/rename note
obsidian-cli move "{old-path}" "{new-path}"
```

### Tasks Plugin Query Syntax

```markdown
\`\`\`tasks
not done
due before tomorrow
group by filename
sort by due reverse
\`\`\`
```

### Dataview Query Syntax

```markdown
\`\`\`dataview
TABLE field1, field2
FROM #tag
WHERE condition
SORT field DESC
\`\`\`
```

## Official Resources

- [Obsidian Help](https://help.obsidian.md/)
- [Obsidian CLI GitHub](https://github.com/Yakitrak/obsidian-cli)
- [Tasks Plugin Docs](https://publish.obsidian.md/tasks/)
- [Dataview Plugin Docs](https://blacksmithgu.github.io/obsidian-dataview/)
