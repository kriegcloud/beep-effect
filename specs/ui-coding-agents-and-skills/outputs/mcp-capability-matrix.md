# MCP Server Capability Matrix

> Comprehensive mapping of UI-focused MCP server tools and integration patterns.

---

## Availability Status Summary

| Server | Package | Status | Fallback Required |
|--------|---------|--------|-------------------|
| MUI MCP | `@anthropic-ai/mui-mcp` | **Not Available** | Yes |
| shadcn MCP | `shadcn@latest mcp` | **Not Available** | Yes |
| Playwright MCP | `@playwright/mcp@latest` | **Not Available** | Yes |
| MCP Docker | `mcp-docker` | **Not Available** | N/A |

**Validation Date**: 2026-01-11

**Method**: Tool availability check in Claude Code session. The following MCP tools are NOT present:
- `mcp__MCP_DOCKER__mcp-find`
- `mcp__MCP_DOCKER__mcp-add`
- `mcp__mui__useMuiDocs`
- `mcp__mui__fetchDocs`
- `mcp__shadcn__search`
- `mcp__shadcn__install`
- `mcp__playwright__browser_navigate`

**Available MCP Tools**: Only `mcp__ide__getDiagnostics` (IDE diagnostics)

---

## MUI MCP Server

**Package**: `@anthropic-ai/mui-mcp`
**Status**: Not Available

### Expected Tools

| Tool | Signature | Purpose |
|------|-----------|---------|
| `useMuiDocs` | `{ packages: string[], query: string }` | Query documentation for MUI packages |
| `fetchDocs` | `{ url: string }` | Fetch additional docs from returned URLs |

### Value Proposition
- Eliminates 404 errors from fabricated documentation URLs
- Direct source attribution with real quotes
- Accurate component prop information

### Fallback Strategy (ACTIVE)

1. **Read from node_modules**: Examine `node_modules/@mui/material/` type definitions
2. **Web search**: Use WebSearch tool for mui.com documentation
3. **Existing implementations**: Reference patterns in `packages/ui/core/src/theme/core/components/`
4. **TypeScript types**: Extract prop types from MUI's TypeScript definitions

### Fallback Implementation

```typescript
// Option 1: Read type definitions
const buttonTypes = await Read({
  file_path: "node_modules/@mui/material/Button/Button.d.ts"
});

// Option 2: Web search
const docs = await WebSearch({
  query: "MUI Button component props API site:mui.com"
});

// Option 3: Reference existing overrides
const existingPattern = await Read({
  file_path: "packages/ui/core/src/theme/core/components/button.tsx"
});
```

---

## shadcn MCP Server

**Package**: `shadcn@latest mcp`
**Status**: Not Available

### Expected Tools

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
    "@internal": "https://internal-registry.beep.dev"
  }
}
```

### Fallback Strategy (ACTIVE)

1. **Manual installation**: Use `npx shadcn@latest add <component>`
2. **Copy from registry**: Fetch components from https://ui.shadcn.com/registry
3. **Existing project components**: Reference `packages/ui/` implementations

### Fallback Implementation

```typescript
// Manual component installation via Bash
await Bash({
  command: "npx shadcn@latest add button --yes"
});

// Or fetch component definition via web
const component = await WebFetch({
  url: "https://ui.shadcn.com/registry/styles/default/button.json",
  prompt: "Extract component source code"
});
```

---

## Playwright MCP Server

**Package**: `@playwright/mcp@latest`
**Status**: Not Available
**Expected Capabilities**: `--caps=vision,testing`

### Expected Core Tools

| Tool | Purpose |
|------|---------|
| `browser_navigate` | Load URL in browser |
| `browser_click` | Click element by selector |
| `browser_type` | Type text into element |
| `browser_snapshot` | Capture accessibility tree |
| `browser_take_screenshot` | Capture visual screenshot |

### Expected Testing Tools (--caps=testing)

| Tool | Purpose |
|------|---------|
| `browser_verify_element_visible` | Assert element visibility |
| `browser_verify_text_visible` | Assert text presence |
| `browser_verify_value` | Assert element value |
| `browser_generate_locator` | Generate test locator |

### Expected Vision Tools (--caps=vision)

| Tool | Purpose |
|------|---------|
| `browser_mouse_click_xy` | Click at coordinates |
| `browser_mouse_drag_xy` | Drag from/to coordinates |
| `browser_mouse_move_xy` | Move mouse to coordinates |

### Fallback Strategy (ACTIVE)

1. **Generate test files**: Create Playwright test scripts for manual/CI execution
2. **Manual browser testing**: Request user to verify in browser
3. **Screenshot comparison**: Use external tools for visual regression

### Fallback Implementation

```typescript
// Generate Playwright test file
await Write({
  file_path: "tests/e2e/button.spec.ts",
  content: `
import { test, expect } from '@playwright/test';

test('Button renders correctly', async ({ page }) => {
  await page.goto('http://localhost:3000/demo/button');
  await expect(page.locator('[data-testid="primary-button"]')).toBeVisible();
  await page.screenshot({ path: 'screenshots/button.png' });
});
`
});

// Prompt user for manual verification
// "Please run: bun run test:e2e --project=chromium"
```

---

## Integration Patterns (Fallback Mode)

### Pattern 1: MUI Documentation + Codebase Reference

Since MUI MCP is unavailable, combine web search with existing codebase patterns:

```typescript
// Step 1: Search MUI documentation online
const docs = await WebSearch({
  query: "MUI DataGrid column configuration API"
});

// Step 2: Reference existing theme overrides
const existingPattern = await Read({
  file_path: "packages/ui/core/src/theme/core/components/data-grid.tsx"
});

// Step 3: Generate component following established patterns
// ... code generation using discovered patterns ...
```

### Pattern 2: shadcn Bash Installation

```typescript
// Step 1: Install component via npx
await Bash({
  command: "cd packages/ui/ui && npx shadcn@latest add dialog --yes"
});

// Step 2: Adapt to project conventions
// - Update imports to use @beep/* aliases
// - Apply theme tokens
// - Add TypeScript strict typing
```

### Pattern 3: Test File Generation

```typescript
// Step 1: Generate comprehensive Playwright test
await Write({
  file_path: "apps/web/tests/e2e/component.spec.ts",
  content: generatedTestContent
});

// Step 2: Instruct user to run tests
// "Run: bun run test:e2e to verify component rendering"
```

---

## MCP Server Installation Instructions

For future sessions, these MCP servers can be enabled:

### MUI MCP

```bash
# Add to Claude Code MCP configuration
mcp-add @anthropic-ai/mui-mcp --activate
```

### shadcn MCP

```bash
# Add to Claude Code MCP configuration
mcp-add shadcn@latest --activate
```

### Playwright MCP

```bash
# Add to Claude Code MCP configuration
mcp-add @playwright/mcp@latest --caps=vision,testing --activate
```

### MCP Docker (for discovery)

```bash
# Add MCP Docker for server discovery
mcp-add mcp-docker --activate
```

---

## Recommendations for P2

1. **Design skills assuming fallback mode**: All skills should work without MCP servers
2. **Include MCP enhancement sections**: Add optional MCP usage when available
3. **Create helper utilities**: Build reusable fallback patterns (e.g., MUI doc search)
4. **Document verification protocols**: Define how to verify components without Playwright MCP

---

## Status Legend

| Status | Meaning |
|--------|---------|
| Available | Server in catalog, ready to enable |
| Enabled | Server active in session |
| **Not Available** | Server not accessible in current session |
| Error | Server failed to start |
