# Memory Management Skill

---
name: memory-management
description: Query, store, search, and retrieve project context using Obsidian CLI for persistent agent knowledge
invocableBy: agent
context: fork
---

## Overview

This skill provides memory management capabilities using **native obsidian-cli commands**. All project memories are stored in a shared vault at `~/.claude/memory/`, enabling agents to:

- **Persist context** across sessions
- **Search past solutions** and decisions using `search-content`
- **Track architectural patterns** and discoveries
- **Build knowledge graphs** through wikilinks
- **Query memories** using list, search-content, and print
- **Navigate relationships** by following wikilinks between notes

**Key Capabilities:**
- `search-content`: Full-text search across all notes
- `list`: Browse vault structure and categories
- `print`: Read note contents with optional backlinks
- `create`: Create or update notes with frontmatter
- `frontmatter`: Query and modify metadata

All operations use the `obsidian-cli` command via the Bash tool (wrapped by `./.claude/bin/memory` for convenience). Memories are plain markdown files with optional YAML frontmatter for metadata.

**Vault Location:** `~/.claude/memory/`

**Focus:** This skill documents native obsidian-cli commands that work reliably. Advanced graph utilities are optional and not required for core functionality.

## Setup-Free Usage

For immediate use without manual installation, this project includes a wrapper script that auto-configures everything:

```bash
./.claude/bin/memory <command> [args...]
```

**The wrapper automatically:**
1. Installs `obsidian-cli` (via brew or cargo) if not present
2. Creates the memory vault directory at `~/.claude/memory/`
3. Configures it as the default vault
4. Forwards all commands to `obsidian-cli`

**Examples:**

```bash
# List vault contents (installs and configures on first run)
./.claude/bin/memory list

# Create a note
./.claude/bin/memory create "pattern-discovery" \
  --content "# Pattern Discovery

Found Layer.provide pattern eliminates dependency leakage."

# Search vault
./.claude/bin/memory search-content "Layer.provide"

# Read note
./.claude/bin/memory print "pattern-discovery"
```

**First run output:**
```bash
$ ./.claude/bin/memory list
obsidian-cli not found. Installing...
Creating memory vault at /Users/username/.claude/memory...
Configuring default vault...
• README.md
• installation-test.md
```

Subsequent runs execute immediately without setup checks.

**Recommendation:** Use `./.claude/bin/memory` in agent workflows to avoid manual vault configuration.

## Manual Installation (Optional)

If you prefer to install and configure `obsidian-cli` yourself instead of using the wrapper:

### Install obsidian-cli

**Mac/Linux (Homebrew):**
```bash
brew tap yakitrak/yakitrak
brew install yakitrak/yakitrak/obsidian-cli
```

**Windows (Scoop):**
```powershell
scoop bucket add scoop-yakitrak https://github.com/yakitrak/scoop-yakitrak.git
scoop install obsidian-cli
```

**Verify installation:**
```bash
obsidian-cli --version
# Output: obsidian-cli version v0.2.3
```

### Initialize Vault

The memory vault must be registered with Obsidian before use:

**1. Create vault directory:**
```bash
mkdir -p ~/.claude/memory
```

**2. Register vault with Obsidian:**

The vault needs to be added to Obsidian's configuration. If you have Obsidian installed, you can manually register the vault, or the vault will be auto-created on first `obsidian-cli` command that requires it.

**3. Set as default vault:**
```bash
obsidian-cli set-default ~/.claude/memory
obsidian-cli print-default
# Output: Default vault path: /Users/username/.claude/memory
```

**4. Test installation:**
```bash
# Create a test note
echo "# Test Note" > ~/.claude/memory/test.md

# List vault contents
obsidian-cli list

# Read the note
obsidian-cli print "test"
```

Once installed and configured, the vault is shared across all sessions and projects for persistent knowledge management.

## Command Reference

### Wrapper vs Native CLI

**This project uses:** `./.claude/bin/memory` wrapper script

**Benefits:**
- Auto-installs obsidian-cli if not present
- Auto-configures vault on first run
- Drop-in replacement for `obsidian-cli` command
- Zero manual setup required

**Native CLI equivalent:**
```bash
# After manual installation and vault setup
obsidian-cli <command> [args...]
```

All examples in this skill use `./.claude/bin/memory` for convenience. If you've manually installed obsidian-cli and configured the vault, you can replace `./.claude/bin/memory` with `obsidian-cli`.

### Available Commands

```
obsidian-cli - CLI to open, search, move, create, delete and update notes

Available Commands:
  create         Creates note in vault
  daily          Creates or opens daily note in vault
  delete         Delete note in vault
  frontmatter    View or modify note frontmatter
  list           List files and folders in vault
  move           Move or rename note in vault and updated corresponding links
  open           Opens note in vault by note name
  print          Print contents of note
  print-default  prints default vault name and path
  search         Fuzzy searches and opens note in vault
  search-content Search node content for search term
  set-default    Sets default vault

Flags:
  -h, --help      help for obsidian-cli
  -v, --version   version for obsidian-cli
```

This skill provides comprehensive command documentation with examples and output format specifications.

## Vault Setup

### Set Default Vault

```bash
./.claude/bin/memory set-default <vault-path>
```

**What it does:** Configures the default vault for all subsequent operations.

**When to use:** First-time setup or when switching between vaults.

**Example:**
```bash
./.claude/bin/memory set-default ~/.claude/memory
# Subsequent commands omit -v/--vault flag
```

### Check Current Vault

```bash
./.claude/bin/memory print-default
```

**What it does:** Shows the currently configured default vault name and path.

**When to use:** Verify vault configuration before operations.

**Example:**
```bash
./.claude/bin/memory print-default
# Output: Default vault: memory
#         Default vault path: /Users/username/.claude/memory
```

## Creating & Updating

### Create Note

```bash
./.claude/bin/memory create [note-name] [flags]

Aliases: create, c

Flags:
  -a, --append           append to note
  -c, --content string   text to add to note
  -e, --editor           open in editor instead of Obsidian (requires --open flag)
  -h, --help             help for create
      --open             open created note
  -o, --overwrite        overwrite note
  -v, --vault string     vault name
```

**What it does:** Creates a new note or updates an existing one.

**When to use:**
- Capture architectural decisions
- Document discoveries
- Record patterns and solutions
- Log significant changes

**Examples:**

**Create with inline content:**
```bash
./.claude/bin/memory create "effect-layer-memoization" \
  --content "# Layer Memoization

MemoMap deduplicates by reference identity (===). Same imported const = same ref = built exactly once per ManagedRuntime.

## Key Pattern
\`\`\`typescript
export const ServiceLive = Layer.provide(ServiceLiveInternal, DependencyLive)
// Type: Layer<Service, E, never> — zero requirements
\`\`\`

Tags: #effect #architecture #pattern"
```

**Append to existing:**
```bash
./.claude/bin/memory create "daily-discoveries" \
  --content "

## 2026-02-10
- Discovered TSS Lint type-aware analysis for dependency extraction
- Layer registry tracks 50+ layers across codebase" \
  --append
```

**Create and open:**
```bash
./.claude/bin/memory create "architecture/service-patterns" --open
```

**Overwrite existing note:**
```bash
./.claude/bin/memory create "temp-notes" \
  --content "# Replaced Content" \
  --overwrite
```

### Manage Frontmatter

```bash
./.claude/bin/memory frontmatter <note> [flags]

Aliases: frontmatter, fm

Flags:
  -d, --delete         delete a frontmatter key
  -e, --edit           edit a frontmatter key
  -h, --help           help for frontmatter
  -k, --key string     key to edit or delete
  -p, --print          print frontmatter
      --value string   value to set (required for --edit)
  -v, --vault string   vault name
```

**What it does:** View or modify YAML frontmatter in a note.

**When to use:**
- Add tags for categorization
- Link related notes
- Track creation/update dates
- Set project context

**Examples:**

**View frontmatter:**
```bash
./.claude/bin/memory fm "effect-layer-memoization" --print
```

**Add or edit metadata:**
```bash
./.claude/bin/memory fm "effect-layer-memoization" --edit \
  --key "project" --value "vmruntime-demo"

./.claude/bin/memory fm "effect-layer-memoization" --edit \
  --key "tags" --value "[effect, architecture, pattern]"

./.claude/bin/memory fm "effect-layer-memoization" --edit \
  --key "related" --value "[layer-analysis.md, dependency-injection.md]"
```

**Delete key:**
```bash
./.claude/bin/memory fm "effect-layer-memoization" --delete --key "deprecated"
```

## Reading & Searching

### Read Note

```bash
./.claude/bin/memory print [note-name] [flags]

Aliases: print, p

Flags:
  -h, --help           help for print
  -m, --mentions       include linked mentions at the end
  -v, --vault string   vault name
```

**What it does:** Print contents of note to stdout.

**When to use:**
- Retrieve stored context
- Review past decisions
- Access documented patterns

**Examples:**

**Read note:**
```bash
./.claude/bin/memory print "effect-layer-memoization"
```

**Read with linked mentions:**
```bash
./.claude/bin/memory print "effect-layer-memoization" --mentions
# Shows note content plus all notes that link to this note
```

**Read note in subdirectory:**
```bash
./.claude/bin/memory print "architecture/layer-patterns"
```

### Fuzzy Search Titles

```bash
./.claude/bin/memory search [flags]

Aliases: search, s

Flags:
  -e, --editor         open in editor instead of Obsidian
  -h, --help           help for search
  -v, --vault string   vault name
```

**What it does:** Interactive fuzzy search across note titles. Opens an interactive UI for selecting notes.

**When to use:**
- Browse available memories interactively
- Find notes when you remember partial name
- Discover related content

**Example:**
```bash
./.claude/bin/memory search
# Opens interactive fuzzy finder for note titles
```

**Note for agents:** This command is interactive and requires user input. For non-interactive workflows, use `list` or `search-content` instead.

### Full-Text Search

```bash
./.claude/bin/memory search-content [search-term] [flags]

Aliases: search-content, sc

Flags:
  -e, --editor         open in editor instead of Obsidian
  -h, --help           help for search-content
  -v, --vault string   vault name
```

**What it does:** Search note content for search term and display matching snippets with file paths and line numbers.

**When to use:**
- Find notes discussing specific topics
- Locate past solutions to similar problems
- Discover related patterns

**Output format:**
```
path/to/note.md:12: matching line with context
path/to/note.md:45: another matching line
```

**Examples:**

**Search for pattern:**
```bash
./.claude/bin/memory search-content "Layer.provide"
# Returns:
# architecture/layer-patterns.md:23: Using Layer.provide to hide dependencies
# decisions/layer-convention.md:10: export const ServiceLive = Layer.provide(...)
```

**Search for error:**
```bash
./.claude/bin/memory search-content "type mismatch"
# Find past solutions to type errors
```

**Multi-word search:**
```bash
./.claude/bin/memory search-content "Effect.gen function"
# Searches for notes containing both terms
```

**Note for agents:** The output can be parsed to extract file paths, then use `print` to read full contents.

### List Vault Structure

```bash
./.claude/bin/memory list [path] [flags]

Aliases: list, ls

Flags:
  -h, --help           help for list
  -v, --vault string   vault name
```

**What it does:** List files and folders in vault. Returns bullet-point list with `•` for files and folders.

**When to use:**
- Explore organization
- Find notes in specific categories
- Audit memory coverage
- Get overview of available notes

**Output format:**
```
• folder-name/
• note-name.md
• another-note.md
```

**Examples:**

**List root:**
```bash
./.claude/bin/memory list
# Output:
# • architecture/
# • decisions/
# • patterns/
# • README.md
```

**List subdirectory:**
```bash
./.claude/bin/memory list "architecture"
# Output:
# • layer-patterns.md
# • service-patterns.md
# • vm-patterns.md
```

**Note for agents:** Parse output to extract file names (remove `• ` prefix and `.md` extension).

## Command Output Formats

Understanding command outputs is essential for parsing and automation.

### list

**Format:** Bullet list with `• ` prefix

```
• folder-name/
• note-name.md
• another-note.md
```

**Parsing:**
- Lines starting with `• ` are files/folders
- Folders end with `/`
- Files typically end with `.md`
- Remove `• ` prefix to get name
- Remove `.md` extension for note name

**Example:**
```bash
output=$(./.claude/bin/memory list "architecture")
# Parse to extract note names without extensions:
# effect-layer-memoization
# layer-patterns
# service-patterns
```

### search-content

**Format:** Ripgrep-style output with file:line:content

```
path/to/note.md:23:matching line with search term
path/to/note.md:45:another matching line
another-note.md:12:third match
```

**Parsing:**
- Format: `<path>:<line>:<content>`
- Use `:` as delimiter (first two occurrences)
- Extract unique file paths: `path/to/note.md`
- Remove `.md` extension for note name: `path/to/note`
- Line numbers useful for context but not required for reading

**Example:**
```bash
output=$(./.claude/bin/memory search-content "Layer.provide")
# Extract file paths: architecture/layer-patterns.md
# Convert to note names: architecture/layer-patterns
# Read full content: ./.claude/bin/memory print "architecture/layer-patterns"
```

### print

**Format:** Raw note content (markdown)

```markdown
# Note Title

Note content here with **formatting**.

## Section Header

More content.

- List item
- [[wikilink]]
- Another item
```

**Parsing:**
- Raw markdown text
- Extract `[[wikilinks]]` using regex: `\[\[([^\]]+)\]\]`
- Extract headings: lines starting with `#`
- No special prefixes or formatting
- May include YAML frontmatter at top (between `---` delimiters)

**Example:**
```bash
content=$(./.claude/bin/memory print "effect-layer-memoization")
# Extract wikilinks from content:
# [[dependency-injection-patterns]]
# [[layer-analysis]]
# Then read those notes
```

### frontmatter --print

**Format:** YAML output

```yaml
tags: [architecture, effect, layer]
project: vmruntime-demo
related: ["dependency-injection.md", "layer-analysis.md"]
status: active
```

**Parsing:**
- YAML format
- Parse using YAML parser or simple key-value extraction
- Array values in brackets: `[item1, item2]`
- String arrays with quotes: `["file1.md", "file2.md"]`

**Example:**
```bash
frontmatter=$(./.claude/bin/memory fm "effect-layer-memoization" --print)
# Parse 'related' field to get linked notes
# Remove .md extensions and read those notes
```

### print-default

**Format:** Plain text key-value

```
Default vault: memory
Default vault path: /Users/username/.claude/memory
```

**Parsing:**
- Two lines
- Line 1: vault name after "Default vault: "
- Line 2: vault path after "Default vault path: "

### create, move, delete

**Format:** Success messages or errors

```
# Success (no output typically)

# Or error messages:
Error: note already exists (use --overwrite)
Error: note not found
```

**Parsing:**
- Check exit code (0 = success)
- Parse stderr for error messages
- No structured output on success

## Organizing

### Move/Rename Note

```bash
./.claude/bin/memory move [flags]

Aliases: move, m

Flags:
  -e, --editor         open in editor instead of Obsidian (requires --open flag)
  -h, --help           help for move
  -o, --open           open new note
  -v, --vault string   vault name
```

**What it does:** Move or rename note in vault and update corresponding links.

**When to use:**
- Reorganize memory structure
- Rename for clarity
- Move to appropriate category

**Note:** The move command expects you to provide the current and new note names as arguments (interactive prompt if not specified).

**Example:**
```bash
./.claude/bin/memory move "temp-notes" "architecture/layer-patterns" --open
# Renames note and updates all [[temp-notes]] links to [[architecture/layer-patterns]]
```

### Delete Note

```bash
./.claude/bin/memory delete [note-name] [flags]

Aliases: delete, d

Flags:
  -h, --help           help for delete
  -o, --open           open new note
  -v, --vault string   vault name
```

**What it does:** Delete note from vault.

**When to use:**
- Remove outdated information
- Clean up temporary notes
- Delete duplicates

**Example:**
```bash
./.claude/bin/memory delete "scratch-notes"
```

## Daily Workflow

### Open Daily Note

```bash
./.claude/bin/memory daily [flags]

Aliases: daily, d

Flags:
  -h, --help           help for daily
  -v, --vault string   vault name (not required if default is set)
```

**What it does:** Creates or opens daily note in vault.

**When to use:**
- Journal daily discoveries
- Track session progress
- Log quick observations

**Example:**
```bash
./.claude/bin/memory daily
# Opens today's daily note (YYYY-MM-DD.md) in Obsidian app
```

### Open Note in Obsidian

```bash
./.claude/bin/memory open [note-name] [flags]

Aliases: open, o

Flags:
  -h, --help             help for open
  -s, --section string   heading text to open within the note (case-sensitive)
  -v, --vault string     vault name (not required if default is set)
```

**What it does:** Opens note in vault by note name.

**When to use:**
- View note in full editor
- Edit complex content
- Navigate to specific section

**Examples:**

**Open note:**
```bash
./.claude/bin/memory open "effect-layer-memoization"
```

**Jump to section:**
```bash
./.claude/bin/memory open "effect-layer-memoization" --section "Key Pattern"
# Opens note and scrolls to "Key Pattern" heading (case-sensitive)
```

## Practical Workflows

### Find All Notes About a Topic

**Goal:** Discover all knowledge about "Layer.provide" pattern.

```bash
# Step 1: Full-text search for content
./.claude/bin/memory search-content "Layer.provide"

# Example output:
# architecture/layer-patterns.md:23: Using Layer.provide to hide dependencies
# decisions/layer-convention.md:10: export const ServiceLive = Layer.provide(...)

# Step 2: Read each matching note
./.claude/bin/memory print "architecture/layer-patterns"
./.claude/bin/memory print "decisions/layer-convention"

# Step 3: Check for related notes via wikilinks
# Look for [[wikilinks]] in the content, then read those too
./.claude/bin/memory print "effect-layer-memoization"

# Step 4: Check metadata for related notes
./.claude/bin/memory fm "architecture/layer-patterns" --print

# Example output:
# related: ["effect-layer-memoization.md", "dependency-injection.md"]

# Step 5: Read related notes
./.claude/bin/memory print "dependency-injection"
```

**Expected result:** Complete picture of Layer.provide pattern from multiple angles.

### Navigate from Concept to Related Concepts

**Goal:** Starting from "Effect Layer memoization", discover connected knowledge.

```bash
# Step 1: Read the entry point note
./.claude/bin/memory print "effect-layer-memoization"

# Step 2: Extract wikilinks from content
# Look for [[wikilink]] patterns in the output
# Example content might show:
# - [[dependency-injection-patterns]]
# - [[layer-analysis]]
# - [[architecture-decisions]]

# Step 3: Read each linked note
./.claude/bin/memory print "dependency-injection-patterns"
./.claude/bin/memory print "layer-analysis"

# Step 4: Find notes that reference back to original
./.claude/bin/memory search-content "[[effect-layer-memoization]]"

# Step 5: Explore the broader category
./.claude/bin/memory list "architecture"

# Output:
# • effect-layer-memoization.md
# • dependency-injection-patterns.md
# • layer-analysis.md
# • service-patterns.md
# • vm-patterns.md

# Step 6: Read other notes in same category
./.claude/bin/memory print "architecture/service-patterns"
```

**Expected result:** Web of related knowledge discovered through links and categories.

### Find Most Important Notes

**Goal:** Identify frequently-referenced or central notes in the knowledge graph.

**Method 1: Search for backlinks**
```bash
# Count how many notes link to a specific note
./.claude/bin/memory search-content "[[effect-layer-memoization]]"

# High number of results = important/central note
```

**Method 2: Check frontmatter tags**
```bash
# List all architecture notes
./.claude/bin/memory list "architecture"

# Read frontmatter of each to check status
./.claude/bin/memory fm "architecture/layer-patterns" --print

# Look for:
# status: active    (vs archived/deprecated)
# type: decision    (important) vs discovery (exploratory)
# updated: recent dates (actively maintained)
```

**Method 3: Browse by category**
```bash
# Check decisions directory (architectural decisions are important)
./.claude/bin/memory list "decisions"

# Read each decision
./.claude/bin/memory print "decisions/layer-provide-convention"
```

**Expected result:** Identify core knowledge vs exploratory notes.

### Update Existing Knowledge

**Goal:** Add new discovery to existing note about TSS Lint.

```bash
# Step 1: Search for existing note
./.claude/bin/memory search-content "TSS Lint"

# Output might show:
# tools/tsslint-patterns.md:5: TSS Lint provides type-aware analysis

# Step 2: Read current content to avoid duplication
./.claude/bin/memory print "tools/tsslint-patterns"

# Step 3: Append new discovery
./.claude/bin/memory create "tools/tsslint-patterns" \
  --content "

## Type-Aware Dependency Extraction (2026-02-10)

Using program.getTypeChecker() to extract Layer type parameters:

\`\`\`typescript
const typeArgs = (returnType as any).typeArguments
const [serviceType, errorType, requirementsType] = typeArgs
\`\`\`

This enables automatic dependency graph construction from Layer definitions.

Related: [[layer-analysis]], [[architecture-tools]]" \
  --append

# Step 4: Update metadata
./.claude/bin/memory fm "tools/tsslint-patterns" --edit \
  --key "updated" --value "2026-02-10"
```

**Expected result:** Note updated with new knowledge, maintaining chronological log.

### Capture Architectural Decision

**Goal:** Document a new architectural pattern for future reference.

```bash
# Step 1: Check if decision already exists
./.claude/bin/memory search-content "Layer.provide convention"

# No results = create new note

# Step 2: Create structured decision record
./.claude/bin/memory create "decisions/layer-provide-zero-requirements" \
  --content "# Layer.provide Zero Requirements Convention

## Decision
All exported service layers must use Layer.provide to hide dependencies, exporting Layer<Service, E, never>.

## Context
- MemoMap deduplicates by reference identity (===)
- Consumers should see clean interfaces without leaked requirements
- Dependency management should be internal to service implementation

## Rationale
- Consumer sees zero requirements (Layer<Service, E, never>)
- Dependency tree stays flat and auditable
- Follows Effect memoization patterns
- Prevents coupling between consumers and service dependencies

## Implementation
\`\`\`typescript
// Internal implementation with dependencies
const ServiceLiveInternal = Layer.scoped(
  Service,
  Effect.gen(function* () {
    const dep = yield* DependencyService
    return implementation
  })
)

// Exported layer with zero requirements
export const ServiceLive = Layer.provide(
  ServiceLiveInternal,
  DependencyServiceLive
)
// Type: Layer<Service, E, never>
\`\`\`

## Examples
- StackKeyBindingRegistryLive (requires AtomRegistry)
- GridVMLive (requires multiple services)

## Related
- [[effect-layer-memoization]]
- [[dependency-injection-patterns]]
- [[architecture/layer-patterns]]

## Status
active

## Metadata
Date: 2026-02-10
Project: vmruntime-demo
Author: Claude"

# Step 3: Add frontmatter for discoverability
./.claude/bin/memory fm "decisions/layer-provide-zero-requirements" --edit \
  --key "tags" --value "[architecture, decision, effect, layer]"

./.claude/bin/memory fm "decisions/layer-provide-zero-requirements" --edit \
  --key "type" --value "decision"

./.claude/bin/memory fm "decisions/layer-provide-zero-requirements" --edit \
  --key "status" --value "active"

# Step 4: Verify creation
./.claude/bin/memory print "decisions/layer-provide-zero-requirements"
```

**Expected result:** Searchable decision record with proper metadata and cross-references.

### Complex Query: Find Solutions to Similar Problems

**Goal:** User encounters "Layer dependency not found" error, search for past solutions.

```bash
# Step 1: Search for error keywords
./.claude/bin/memory search-content "dependency not found"

# Might find:
# troubleshooting/layer-errors.md:34: Layer dependency not found at runtime

# Step 2: Read the troubleshooting guide
./.claude/bin/memory print "troubleshooting/layer-errors"

# Step 3: Search for related error patterns
./.claude/bin/memory search-content "Layer.provide"
./.claude/bin/memory search-content "MemoMap"
./.claude/bin/memory search-content "missing dependency"

# Step 4: Check decision records for architectural guidance
./.claude/bin/memory list "decisions"

# Step 5: Read relevant decisions
./.claude/bin/memory print "decisions/layer-provide-zero-requirements"

# Step 6: Check if there are examples
./.claude/bin/memory search-content "StackKeyBindingRegistryLive"
```

**Expected result:** Combine troubleshooting, patterns, and examples to solve the problem.

### Multi-Step Knowledge Building

**Goal:** Build comprehensive understanding of Effect Layer architecture.

```bash
# Step 1: List all architecture notes
./.claude/bin/memory list "architecture"

# Output:
# • effect-layer-memoization.md
# • layer-patterns.md
# • service-patterns.md
# • vm-patterns.md

# Step 2: Read foundation note
./.claude/bin/memory print "architecture/effect-layer-memoization"

# Step 3: Follow wikilinks mentioned in content
# (extract [[links]] from output)
./.claude/bin/memory print "architecture/layer-patterns"
./.claude/bin/memory print "architecture/service-patterns"

# Step 4: Check decision records
./.claude/bin/memory list "decisions"
./.claude/bin/memory print "decisions/layer-provide-zero-requirements"

# Step 5: Find practical examples
./.claude/bin/memory search-content "Layer.scoped"
./.claude/bin/memory search-content "Layer.provide"

# Step 6: Check for common issues
./.claude/bin/memory list "troubleshooting"
./.claude/bin/memory print "troubleshooting/layer-errors"

# Step 7: Create summary note linking everything
./.claude/bin/memory create "architecture/layer-architecture-complete" \
  --content "# Complete Layer Architecture Reference

## Foundation
- [[effect-layer-memoization]] - How MemoMap works
- [[layer-patterns]] - Common patterns and anti-patterns
- [[service-patterns]] - Service implementation patterns

## Decisions
- [[decisions/layer-provide-zero-requirements]] - Zero requirements convention

## Troubleshooting
- [[troubleshooting/layer-errors]] - Common errors and solutions

## Examples
(Search results from codebase showing implementations)

Last updated: 2026-02-10"
```

**Expected result:** Comprehensive knowledge map of Layer architecture.

## Quick Reference

### Common Command Patterns

```bash
# Search → Read workflow
./.claude/bin/memory search-content "keyword"
./.claude/bin/memory print "path/to/note"

# List → Select → Read workflow
./.claude/bin/memory list "category"
./.claude/bin/memory print "category/note-name"

# Create → Tag workflow
./.claude/bin/memory create "note-name" --content "..."
./.claude/bin/memory fm "note-name" --edit --key "tags" --value "[tag1, tag2]"

# Update → Metadata workflow
./.claude/bin/memory create "note-name" --content "..." --append
./.claude/bin/memory fm "note-name" --edit --key "updated" --value "$(date +%Y-%m-%d)"

# Follow links workflow
./.claude/bin/memory print "note-name"
# Extract [[wikilinks]] from output
./.claude/bin/memory print "linked-note"

# Check metadata → Read related
./.claude/bin/memory fm "note-name" --print
# Extract related field
./.claude/bin/memory print "related-note"
```

### Agent-Friendly Snippets

**Parse search-content output:**
```bash
# Get unique file paths from search results
./.claude/bin/memory search-content "keyword" | cut -d: -f1 | sort -u

# Extract note names (remove .md extension)
./.claude/bin/memory search-content "keyword" | cut -d: -f1 | sort -u | sed 's/\.md$//'
```

**Parse list output:**
```bash
# Get all note names from a directory
./.claude/bin/memory list "category" | sed 's/^• //' | grep '\.md$' | sed 's/\.md$//'
```

**Extract wikilinks from note content:**
```bash
# Extract all [[wikilinks]] from a note
./.claude/bin/memory print "note-name" | grep -o '\[\[[^]]*\]\]' | sed 's/\[\[\(.*\)\]\]/\1/'
```

## Laws

### Memory Management Principles

1. **memory-first**: Architectural decisions, patterns, and discoveries MUST be documented
   - Capture decisions when made, not later
   - Include context: why, not just what
   - Link to code/files for traceability

2. **search-before-create**: Always search existing memories before creating new notes
   - Use `search-content` to check for existing knowledge
   - Update existing notes rather than duplicate
   - Append to existing if same topic

3. **evidence-linked**: All memories MUST reference concrete artifacts
   - Link to source code: `/path/to/file.ts`
   - Reference commands: `bun test path/to/test.ts`
   - Include examples, not just descriptions

4. **frontmatter-metadata**: All memories MUST include discoverable metadata
   - `tags`: Keywords for search
   - `related`: Wikilinks to connected notes
   - `created`/`updated`: Date tracking
   - `status`: active | archived | deprecated
   - `type`: decision | pattern | discovery | solution

5. **wikilink-relationships**: Use `[[wikilinks]]` to build knowledge graphs
   - Create bidirectional links (mention in both notes)
   - Build topic clusters (hub notes → specific concepts)
   - Link related concepts even if not directly dependent

6. **atomic-notes**: One concept per note for composability
   - Split large topics into focused notes
   - Link related concepts via wikilinks
   - Prefer multiple small notes over one large note

7. **delete-conservatively**: Prefer updating or archiving over deletion
   - Set `status: archived` for outdated notes
   - Update notes with corrections, don't delete history
   - Preserve context even if no longer relevant

## Frontmatter Schema

Recommended YAML structure for memory notes:

```yaml
---
project: vmruntime-demo
topic: architecture
tags: [effect, layer, pattern]
created: 2026-02-10
updated: 2026-02-10
related: ["dependency-injection.md", "layer-analysis.md"]
status: active
type: decision | pattern | discovery | solution
---
```

**Field Meanings:**

- `project`: Codebase or project context
- `topic`: High-level categorization (architecture, testing, tooling)
- `tags`: Searchable keywords (array format)
- `created`: Initial note creation date (YYYY-MM-DD)
- `updated`: Last modification date (YYYY-MM-DD)
- `related`: Wikilinks to related notes (array format)
- `status`: active | archived | deprecated
- `type`: Nature of the memory (decision | pattern | discovery | solution)

## Best Practices

### Note Naming

- Use kebab-case: `effect-layer-memoization`
- Prefix by category: `decisions/`, `patterns/`, `solutions/`
- Be descriptive: `typescript-ast-type-extraction` not `ts-types`

### Content Structure

```markdown
# Title

Brief description of the concept/decision/pattern.

## Context
Why this matters, when it applies.

## Implementation
Code examples, commands, or concrete steps.

## Related
- [[wikilink-to-related-note]]
- [[another-related-concept]]

## References
- Source file: /path/to/file.ts
- Command: bun test path/to/test.ts
- Documentation: URL or path
```

### Linking Strategy

- Use `[[wikilinks]]` for internal references
- Create bidirectional links (mention related notes in both)
- Build topic clusters (hub notes linking to related concepts)
- Tag with multiple keywords for discoverability

### Search Strategy

**Decision tree for finding information:**

```
Need to find knowledge?
├─ Know exact note name?
│  └─ Use: ./.claude/bin/memory print "note-name"
│
├─ Know topic/keyword?
│  ├─ Use: ./.claude/bin/memory search-content "keyword"
│  ├─ Parse output for file paths: path/to/note.md:line
│  └─ Read matching notes: ./.claude/bin/memory print "path/to/note"
│
├─ Know category?
│  ├─ Use: ./.claude/bin/memory list "category"
│  └─ Read notes in that category
│
├─ Want to browse/explore?
│  ├─ Use: ./.claude/bin/memory list (see all top-level)
│  ├─ Read interesting notes
│  └─ Follow [[wikilinks]] to related content
│
└─ Following wikilinks?
   ├─ Extract [[link-name]] from note content
   └─ Use: ./.claude/bin/memory print "link-name"
```

**Multi-step search pattern:**

1. **Broad search:** `./.claude/bin/memory search-content "topic"`
2. **Extract paths:** Parse output for `path/to/file.md:line` format
3. **Read notes:** `./.claude/bin/memory print "path/to/file"`
4. **Follow links:** Extract `[[wikilinks]]` from content, read those notes
5. **Check metadata:** `./.claude/bin/memory fm "note-name" --print` for related field
6. **Explore category:** `./.claude/bin/memory list "category"` for more notes

**Agent-friendly patterns:**

```bash
# Pattern 1: Keyword → Files → Content
search_output=$(./.claude/bin/memory search-content "Effect Layer")
# Parse search_output for file paths, then:
./.claude/bin/memory print "architecture/layer-patterns"

# Pattern 2: Category → Files → Select → Read
category_list=$(./.claude/bin/memory list "decisions")
# Parse category_list for note names, then:
./.claude/bin/memory print "decisions/layer-provide-zero-requirements"

# Pattern 3: Note → Links → Follow
note_content=$(./.claude/bin/memory print "effect-layer-memoization")
# Extract [[wikilinks]] from note_content, then:
./.claude/bin/memory print "dependency-injection-patterns"
```

### Maintenance

- Update `updated` frontmatter field when editing
- Add new `related` links when discovering connections
- Archive outdated notes (set `status: archived`) rather than delete
- Review daily notes weekly, promote significant content to dedicated notes

## Troubleshooting

### Command Not Found

**Issue:** `obsidian-cli: command not found`

**Solution:** Use the wrapper script which auto-installs:
```bash
./.claude/bin/memory list
```

Or install manually per "Manual Installation" section.

### Vault Not Configured

**Issue:** `Error: vault not found` or `Error: no default vault set`

**Solution:**
```bash
# Check current vault
./.claude/bin/memory print-default

# Set default vault
./.claude/bin/memory set-default ~/.claude/memory

# Verify
./.claude/bin/memory list
```

### Note Not Found

**Issue:** `Error: note not found: note-name`

**Causes:**
1. Incorrect note name (check exact spelling)
2. Note in subdirectory (must include path)
3. Note doesn't exist yet

**Solutions:**
```bash
# List to find correct name
./.claude/bin/memory list
./.claude/bin/memory list "subdirectory"

# Search for note
./.claude/bin/memory search-content "partial name"

# Check if note exists before reading
./.claude/bin/memory list | grep "note-name"
```

### Search Returns No Results

**Issue:** `search-content` returns nothing but you know the note exists

**Causes:**
1. Search term is case-sensitive (usually)
2. Searching for phrase vs individual words
3. Content not indexed yet

**Solutions:**
```bash
# Try broader search
./.claude/bin/memory search-content "keyword"

# Search with different terms
./.claude/bin/memory search-content "Layer"
./.claude/bin/memory search-content "provide"

# List directory to confirm note exists
./.claude/bin/memory list "architecture"
```

### Interactive Search Blocks Agent

**Issue:** `search` command (fuzzy search) waits for user input

**Solution:** Don't use interactive `search` in agent workflows. Use `search-content` or `list` instead:
```bash
# ✗ Interactive (blocks)
./.claude/bin/memory search

# ✓ Non-interactive (agent-friendly)
./.claude/bin/memory search-content "keyword"
./.claude/bin/memory list "category"
```

### Parsing Command Output

**Issue:** Difficulty extracting note names from command output

**Solutions:**

```bash
# Extract note names from search-content
./.claude/bin/memory search-content "keyword" \
  | cut -d: -f1 \
  | sort -u \
  | sed 's/\.md$//'

# Extract note names from list
./.claude/bin/memory list "category" \
  | sed 's/^• //' \
  | grep '\.md$' \
  | sed 's/\.md$//'

# Extract wikilinks from note content
./.claude/bin/memory print "note-name" \
  | grep -o '\[\[[^]]*\]\]' \
  | sed 's/\[\[\(.*\)\]\]/\1/'
```

### Frontmatter Not Updating

**Issue:** `frontmatter --edit` doesn't seem to work

**Check:**
```bash
# Verify frontmatter exists
./.claude/bin/memory fm "note-name" --print

# Ensure proper value format
# Arrays need brackets: "[item1, item2]"
# Strings with quotes: "value"
./.claude/bin/memory fm "note-name" --edit --key "tags" --value "[tag1, tag2]"
```

### Path vs Name Confusion

**Issue:** Unclear whether to use file path or note name

**Rule:**
- Commands accept **note name** without `.md` extension
- Paths are relative to vault root
- Subdirectories use `/` separator

**Examples:**
```bash
# Note in root
./.claude/bin/memory print "note-name"

# Note in subdirectory
./.claude/bin/memory print "architecture/layer-patterns"

# NOT:
./.claude/bin/memory print "architecture/layer-patterns.md"  # ✗
./.claude/bin/memory print "note-name.md"  # ✗
```
