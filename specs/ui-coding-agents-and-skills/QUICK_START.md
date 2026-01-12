# UI Coding Agents & Skills: Quick Start

> 5-minute guide to implementing this specification.

---

## Prerequisites

- MCP Docker gateway running
- Access to `.claude/` directory
- Familiarity with beep-effect UI packages

---

## Step 1: Enable MCP Servers (2 min)

Check availability and enable:

```
# Check catalog
mcp__MCP_DOCKER__mcp-find({ query: "mui" })
mcp__MCP_DOCKER__mcp-find({ query: "shadcn" })
mcp__MCP_DOCKER__mcp-find({ query: "playwright" })

# Enable servers
mcp__MCP_DOCKER__mcp-add({ name: "mui", activate: true })
mcp__MCP_DOCKER__mcp-add({ name: "shadcn", activate: true })
mcp__MCP_DOCKER__mcp-add({ name: "playwright", activate: true })
```

---

## Step 2: Create Skill Directory (1 min)

```bash
mkdir -p .claude/skills/ui
```

---

## Step 3: Copy Skill Templates (1 min)

Use the doc-writer agent or manually create:

1. `.claude/skills/ui/mui-component-writer.md`
2. `.claude/skills/ui/shadcn-component-writer.md`
3. `.claude/skills/ui/visual-tester.md`

Templates available in `specs/ui-coding-agents-and-skills/templates/`

---

## Step 4: Create Agent Files (1 min)

Create agent definitions:

1. `.claude/agents/ui-code-writer.md`
2. `.claude/agents/ui-reviewer.md`
3. `.claude/agents/visual-qa.md`

---

## Quick Test

### Test MUI Documentation Lookup
```
# After enabling MUI MCP
mcp__mui__useMuiDocs({ packages: ["@mui/material"], query: "Button props" })
```

### Test shadcn Registry
```
# After enabling shadcn MCP
# List available components
```

### Test Playwright Navigation
```
# Start dev server first
bun run dev

# Then use Playwright MCP
mcp__playwright__browser_navigate({ url: "http://localhost:3000" })
mcp__playwright__browser_snapshot({})
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `README.md` | Overview and scope |
| `MASTER_ORCHESTRATION.md` | Full implementation workflow |
| `AGENT_PROMPTS.md` | Ready-to-use agent prompts |
| `templates/skill.template.md` | Skill file template |
| `templates/agent.template.md` | Agent file template |

---

## Next Steps

1. Run Phase 1 (Discovery) from `MASTER_ORCHESTRATION.md`
2. Generate `outputs/codebase-ui-patterns.md`
3. Proceed to Phase 3 (Skill Design)
4. Create and test skills
5. Update `REFLECTION_LOG.md` with learnings

---

## Common Issues

### MCP Server Not Found
If `mcp-find` returns no results, the server may not be in the catalog.
Check Docker MCP gateway logs or manually configure in `.mcp.json`.

### Documentation Lookup Fails
Fallback to reading local sources:
- MUI: `node_modules/@mui/material/`
- Effect: `node_modules/effect/src/`

### Playwright Can't Connect
Ensure dev server is running:
```bash
bun run dev
```

Then verify accessibility:
```
mcp__playwright__browser_navigate({ url: "http://localhost:3000" })
```
