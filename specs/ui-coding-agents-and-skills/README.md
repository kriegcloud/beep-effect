# UI Coding Agents and Skills Specification

> Comprehensive skill and agent ecosystem for optimized frontend React & styling code generation in the beep-effect monorepo.

---

## Purpose

Create specialized Claude skills and agents that leverage MCP servers to enhance frontend UI development with @mui/material, shadcn/ui + Tailwind CSS, and visual testing via Playwright.

## Scope

| Area | In Scope | Out of Scope |
|------|----------|--------------|
| **UI Libraries** | @mui/material, shadcn/ui | Other component libraries |
| **Styling** | Tailwind CSS, MUI sx prop | CSS-in-JS alternatives |
| **Testing** | Playwright visual testing | Unit testing frameworks |
| **MCP Servers** | MUI MCP, shadcn MCP, Playwright MCP | Generic browser automation |

## Success Criteria

- [ ] Claude skill for MUI component generation with live documentation lookup
- [ ] Claude skill for shadcn/ui + Tailwind component generation
- [ ] Playwright-integrated visual testing skill
- [ ] Specialized agents with MCP tools for UI code review
- [ ] Integration with existing beep-effect theme system (`packages/ui/core`)

---

## MCP Server Integration

### 1. MUI MCP Server

**Purpose**: Direct access to official Material UI documentation and code examples.

**Configuration**:
```json
{
  "mcpServers": {
    "mui": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mui-mcp"]
    }
  }
}
```

**Tools Provided**:
| Tool | Purpose |
|------|---------|
| `useMuiDocs` | Fetch documentation for MUI packages |
| `fetchDocs` | Retrieve additional docs from returned URLs |

**Value**: Eliminates hallucinated documentation links; provides accurate, up-to-date API references.

### 2. shadcn MCP Server

**Purpose**: Component discovery, search, and installation from registries.

**Configuration**:
```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    }
  }
}
```

**Capabilities**:
- List all available components, blocks, and templates
- Search components by name or functionality
- Install components via natural language
- Multi-registry support (public + private)

**Value**: Natural language component installation; registry awareness.

### 3. Playwright MCP Server

**Purpose**: Browser automation for visual testing and verification.

**Configuration**:
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--caps=vision,testing"]
    }
  }
}
```

**Tools Provided** (40+ total):
| Category | Key Tools |
|----------|-----------|
| **Navigation** | `browser_navigate`, `browser_click`, `browser_type` |
| **Observation** | `browser_snapshot`, `browser_take_screenshot` |
| **Testing** | `browser_verify_element_visible`, `browser_verify_text_visible` |
| **Code Gen** | `browser_generate_locator` |

**Running Modes**:
- **Persistent profile**: Maintains login state
- **Isolated mode**: Fresh session per test
- **Browser extension**: Connect to existing browser

**Value**: LLM-friendly accessibility tree; deterministic automation without vision models.

---

## Deliverables

### Skills

| Skill | File Location | Purpose |
|-------|---------------|---------|
| `mui-component-writer` | `.claude/skills/ui/mui-component-writer.md` | MUI component generation |
| `shadcn-component-writer` | `.claude/skills/ui/shadcn-component-writer.md` | shadcn/Tailwind generation |
| `ui-visual-tester` | `.claude/skills/ui/visual-tester.md` | Playwright visual testing |

### Agents

| Agent | File Location | Purpose |
|-------|---------------|---------|
| `ui-code-writer` | `.claude/agents/ui-code-writer.md` | Unified UI code generation |
| `ui-reviewer` | `.claude/agents/ui-reviewer.md` | Component code review |
| `visual-qa` | `.claude/agents/visual-qa.md` | Visual testing automation |

---

## Phase Overview

| Phase | Focus | Agents |
|-------|-------|--------|
| 0: Scaffolding | Create spec structure, skill templates | doc-writer |
| 1: Discovery | Research codebase UI patterns, existing theme | codebase-researcher, web-researcher |
| 2: Evaluation | Validate MCP server capabilities | mcp-researcher, architecture-pattern-enforcer |
| 3: Synthesis | Design skill/agent architecture | reflector, doc-writer |
| 4+: Implementation | Create skills and agents | test-writer, code-reviewer |

---

## Codebase Context

### Existing UI Structure

```
packages/
├── ui/
│   ├── core/src/theme/         # MUI theme system
│   │   └── core/components/    # Component overrides (50+ files)
│   └── ui/src/                 # Reusable components
│       ├── atoms/              # Base components
│       ├── inputs/             # Form inputs
│       ├── form/               # Form system
│       └── animate/            # Motion components
└── shared/
    └── ui/src/                 # Domain-specific UI
        └── files/              # File management UI
```

### Theme Conventions

The monorepo uses MUI with custom theme overrides. All UI code must:

1. Use existing theme tokens (`packages/ui/core/src/theme`)
2. Follow component override patterns in `core/components/`
3. Use `sx` prop for inline styling (not `styled`)
4. Leverage existing atoms from `packages/ui/ui`

---

## Quick Start

1. **Enable MCP servers** (session-scoped):
   ```
   mcp__MCP_DOCKER__mcp-add({ name: "mui", activate: true })
   mcp__MCP_DOCKER__mcp-add({ name: "shadcn", activate: true })
   mcp__MCP_DOCKER__mcp-add({ name: "playwright", activate: true })
   ```

2. **Invoke skill** (after creation):
   ```
   /mui-component-writer - Generate MUI component with docs lookup
   /shadcn-component-writer - Generate shadcn/Tailwind component
   /ui-visual-tester - Visual testing workflow
   ```

---

## Related Documentation

- [SPEC_CREATION_GUIDE](../SPEC_CREATION_GUIDE.md)
- [META_SPEC_TEMPLATE](../ai-friendliness-audit/META_SPEC_TEMPLATE.md)
- [MUI MCP Documentation](https://mui.com/material-ui/getting-started/mcp/)
- [shadcn MCP Documentation](https://ui.shadcn.com/docs/mcp)
- [Playwright MCP Repository](https://github.com/microsoft/playwright-mcp)
