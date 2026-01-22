# Path Activation Strategy

> When should the JetBrains MCP skill be activated?

---

## Recommendation: Universal Activation

```yaml
---
paths:
  - "**/*"
---
```

### Rationale

Unlike the Playwright skill (which is specific to UI debugging), JetBrains MCP tools are useful across **all development contexts**:

1. **Code Intelligence** - Applies to any source file
2. **Refactoring** - Needed for any codebase
3. **Project Structure** - Universal need
4. **Search** - Works on any file type
5. **Execution** - Any project with run configurations

---

## Alternative Strategies Considered

### Option A: Source Files Only

```yaml
paths:
  - "packages/**/*"
  - "apps/**/*"
  - "src/**/*"
```

**Pros**:
- More targeted activation
- Won't trigger for config files, docs

**Cons**:
- JetBrains tools ARE useful for config files
- `list_directory_tree` works on any directory
- `get_project_modules` is project-wide
- May miss legitimate use cases

**Verdict**: Too restrictive

### Option B: Specific Extensions

```yaml
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.json"
```

**Pros**:
- Very targeted to code files
- Won't trigger for markdown, images

**Cons**:
- `rename_refactoring` can rename across file types
- Project structure tools work everywhere
- Hard to maintain comprehensive list
- TypeScript/JavaScript bias

**Verdict**: Too limiting

### Option C: Universal (Recommended)

```yaml
paths:
  - "**/*"
```

**Pros**:
- JetBrains MCP is useful in ANY development context
- No missed use cases
- Simple, maintainable
- Matches JetBrains IDE scope (whole project)

**Cons**:
- Skill always available in context
- Marginally more context used

**Verdict**: Best fit for JetBrains MCP tools

---

## Comparison with Other Skills

| Skill | Path Pattern | Rationale |
|-------|--------------|-----------|
| `playwright-mcp.md` | `apps/**/*`, `packages/ui/**/*` | UI-specific debugging |
| `jetbrains-mcp.md` (proposed) | `**/*` | Universal IDE integration |

The Playwright skill is appropriately scoped to UI code. JetBrains MCP is a general-purpose IDE integration that applies everywhere.

---

## When JetBrains MCP is NOT Relevant

Even with universal activation, the skill content should clarify when **not** to use JetBrains tools:

1. **Simple file reads** → Standard `Read`
2. **Precise edits** → Standard `Edit`
3. **Quick shell commands** → Standard `Bash`
4. **Go to definition** → Standard `LSP`
5. **Find references** → Standard `LSP`

The skill's Quick Reference table handles this by explicitly listing "Not This" alternatives.

---

## Implementation Note

The universal `**/*` pattern means the skill will be included in context for any file operation. This is acceptable because:

1. **Skill is ~270 lines** - Relatively compact
2. **Quick Reference table** - Rapidly guides tool selection
3. **Value proposition** - IDE integration is universally useful
4. **JetBrains MCP availability** - Only relevant when IDE is running

If context efficiency becomes a concern, Phase 4 validation can reassess based on real-world usage.

---

## Final Recommendation

```yaml
---
paths:
  - "**/*"
---
```

This aligns with JetBrains MCP's nature as a **project-wide IDE integration** rather than a specialized tool for specific file types.
