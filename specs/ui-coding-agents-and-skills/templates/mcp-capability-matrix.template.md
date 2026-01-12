# MCP Server Capability Matrix

> Comprehensive mapping of UI-focused MCP server tools and integration patterns.

---

## MUI MCP Server

**Package**: `@anthropic-ai/mui-mcp`
**Status**: {{muiStatus}}

### Tools

| Tool | Signature | Purpose |
|------|-----------|---------|
| `useMuiDocs` | `{ packages: string[], query: string }` | Query documentation for MUI packages |
| `fetchDocs` | `{ url: string }` | Fetch additional docs from returned URLs |

### Usage Pattern

```typescript
// Step 1: Query primary documentation
const docs = await mcp__mui__useMuiDocs({
  packages: ["@mui/material"],
  query: "Button component props and variants"
});

// Step 2: Follow up on specific URLs if needed
const detailedDocs = await mcp__mui__fetchDocs({
  url: docs.relevantUrls[0]
});
```

### Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Tool not found | Server not enabled | Run mcp-add with activate: true |
| Empty response | Query too broad | Narrow query scope |
| Rate limited | Too many requests | Implement backoff |

---

## shadcn MCP Server

**Package**: `shadcn@latest mcp`
**Status**: {{shadcnStatus}}

### Tools

| Tool | Signature | Purpose |
|------|-----------|---------|
| `list` | `{ registry?: string }` | List available components |
| `search` | `{ query: string, registry?: string }` | Search components by name/functionality |
| `install` | `{ components: string[], registry?: string }` | Install components to project |

### Registry Configuration

```json
{
  "registries": {
    "shadcn": "https://ui.shadcn.com/registry",
    "@internal": "{{internalRegistryUrl}}"
  }
}
```

### Usage Pattern

```typescript
// Search for components
const results = await mcp__shadcn__search({
  query: "dialog modal popup"
});

// Install selected components
await mcp__shadcn__install({
  components: ["dialog", "button", "card"]
});
```

---

## Playwright MCP Server

**Package**: `@playwright/mcp@latest`
**Status**: {{playwrightStatus}}
**Capabilities**: `--caps=vision,testing`

### Core Tools

| Tool | Purpose |
|------|---------|
| `browser_navigate` | Load URL in browser |
| `browser_click` | Click element by selector |
| `browser_type` | Type text into element |
| `browser_snapshot` | Capture accessibility tree |
| `browser_take_screenshot` | Capture visual screenshot |

### Testing Tools (--caps=testing)

| Tool | Purpose |
|------|---------|
| `browser_verify_element_visible` | Assert element visibility |
| `browser_verify_text_visible` | Assert text presence |
| `browser_verify_value` | Assert element value |
| `browser_generate_locator` | Generate test locator |

### Vision Tools (--caps=vision)

| Tool | Purpose |
|------|---------|
| `browser_mouse_click_xy` | Click at coordinates |
| `browser_mouse_drag_xy` | Drag from/to coordinates |
| `browser_mouse_move_xy` | Move mouse to coordinates |

### Running Modes

| Mode | Flag | Use Case |
|------|------|----------|
| Persistent | (default) | Maintain login state |
| Isolated | `--isolated` | Fresh session per test |
| Extension | `--browser-extension` | Connect to existing browser |

### Usage Pattern

```typescript
// Navigate to component
await mcp__playwright__browser_navigate({
  url: "http://localhost:3000/demo/button"
});

// Capture accessibility snapshot
const snapshot = await mcp__playwright__browser_snapshot({});

// Verify element
await mcp__playwright__browser_verify_element_visible({
  selector: "[data-testid='primary-button']"
});

// Screenshot
await mcp__playwright__browser_take_screenshot({
  path: "screenshots/button-default.png"
});
```

---

## Integration Patterns

### Combined MUI + Playwright Workflow

```typescript
// 1. Look up MUI docs for component
const docs = await mcp__mui__useMuiDocs({
  packages: ["@mui/material"],
  query: "DataGrid columns configuration"
});

// 2. Generate component based on docs
// ... code generation ...

// 3. Visual verification with Playwright
await mcp__playwright__browser_navigate({
  url: "http://localhost:3000/test/datagrid"
});
await mcp__playwright__browser_verify_element_visible({
  selector: ".MuiDataGrid-root"
});
```

### Combined shadcn + Playwright Workflow

```typescript
// 1. Install shadcn component
await mcp__shadcn__install({
  components: ["data-table"]
});

// 2. Verify installation and rendering
await mcp__playwright__browser_navigate({
  url: "http://localhost:3000/test/data-table"
});
await mcp__playwright__browser_snapshot({});
```

---

## Fallback Strategies

### When MUI MCP Unavailable

1. Read from `node_modules/@mui/material/`
2. Use web search for mui.com documentation
3. Check existing implementations in `packages/ui/`

### When shadcn MCP Unavailable

1. Manual component installation via npx
2. Copy from shadcn/ui registry website
3. Use existing project components

### When Playwright MCP Unavailable

1. Use manual browser testing
2. Generate Playwright test files for CI
3. Screenshot comparison via external tools

---

## Status Legend

| Status | Meaning |
|--------|---------|
| Available | Server in catalog, ready to enable |
| Enabled | Server active in session |
| Not Found | Server not in catalog |
| Error | Server failed to start |
