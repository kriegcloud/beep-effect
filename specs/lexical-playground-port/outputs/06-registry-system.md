# shadcn-Editor Registry System Analysis

## Executive Summary

The shadcn-editor registry is a multi-layered system designed to distribute and install Lexical editor plugins and components via the shadcn CLI.

## 1. Registry Structure

### Core Files

| File | Purpose |
|------|---------|
| `registry.json` | Master registry index (2,643 lines) |
| `registry/index.ts` | TypeScript source that validates exports |
| `registry/registry-ui.ts` | UI plugin definitions |
| `registry/registry-blocks.ts` | Complete editor block definitions |
| `public/r/` | 91 JSON files ready for CLI consumption |

## 2. Registry Item Structure

Each registry item follows a standardized JSON schema:

```json
{
  "name": "plugin-name",
  "type": "registry:ui|registry:block|registry:component|registry:hook|registry:page|registry:theme",
  "title": "Human Readable Title",
  "description": "What this item does",
  "dependencies": ["npm-packages"],
  "registryDependencies": ["@shadcn-editor/other-plugin"],
  "files": [
    {
      "path": "registry/new-york-v4/...",
      "target": "components/...",
      "type": "registry:ui",
      "content": "...optional inline code..."
    }
  ]
}
```

## 3. File Types

| Type | Purpose |
|------|---------|
| `registry:ui` | UI components and utilities |
| `registry:component` | React components |
| `registry:hook` | Custom React hooks |
| `registry:block` | Complete editor blocks (full pages) |
| `registry:page` | Next.js page files |
| `registry:theme` | Theme definitions (CSS/TS) |

## 4. Available Components (91 items)

### Blocks (3 main blocks)

| Block | Features |
|-------|----------|
| **editor** | Basic editor (minimal plugins, core formatting) |
| **editor-md** | Markdown-focused (transformers, shortcuts) |
| **editor-x** | Full featured (all plugins, embeds, speech-to-text) |

### Plugins (40+ individual plugins)

- actions-plugin
- autocomplete-plugin
- auto-embed-plugin
- auto-focus-plugin
- block-format-toolbar-plugin
- clear-editor-plugin
- code-plugin
- component-picker-menu-plugin
- context-menu-plugin
- counter-character-plugin
- drag-drop-paste-plugin
- draggable-block-plugin
- edit-mode-toggle-plugin
- element-format-toolbar-plugin
- floating-text-format-plugin
- font-color-toolbar-plugin
- font-family-toolbar-plugin
- font-format-toolbar-plugin
- font-size-toolbar-plugin
- hashtag-plugin
- history-toolbar-plugin
- horizontal-rule-plugin
- image-plugin
- import-export-plugin
- keywords-plugin
- layout-plugin
- link-plugin
- link-toolbar-plugin
- markdown-plugin
- markdown-toggle-plugin
- max-length-plugin
- mention-plugin
- rich-text-editor-plugin
- share-content-plugin
- speech-to-text-plugin
- subsuper-toolbar-plugin
- tab-focus-plugin
- table-plugin
- toolbar-plugin
- tree-view-plugin
- typing-pref-plugin

## 5. Dependency Management

### Two types of dependencies

**1. npm dependencies** - External packages:
```json
"dependencies": [
  "@lexical/rich-text",
  "@lexical/markdown",
  "lucide-react"
]
```

**2. registryDependencies** - Other registry items:
```json
"registryDependencies": [
  "@shadcn-editor/rich-text-editor-plugin",
  "@shadcn-editor/toolbar-plugin"
]
```

## 6. Installation Pattern

### Using shadcn CLI

```bash
# Install a single plugin
npx shadcn@latest add @shadcn-editor/link-plugin

# Install a complete block
npx shadcn@latest add @shadcn-editor/editor

# CLI automatically:
# 1. Fetches JSON registry item
# 2. Resolves registryDependencies
# 3. Downloads npm packages
# 4. Copies files to project targets
# 5. Runs formatting
```

## 7. Registry URL Format

Published items served from:
```
https://shadcn-editor.vercel.app/r/{item-name}.json
```

Example:
```
https://shadcn-editor.vercel.app/r/editor-md.json
```

## 8. File Path Mapping

| Source | Target |
|--------|--------|
| `registry/new-york-v4/...` | `components/...` |
| `registry/new-york-v4/blocks/...` | `components/blocks/...` |
| `blocks/editor-00/...` | `app/editor-00/page.tsx` |

The `new-york-v4` prefix indicates the design system style.

## 9. Registry Build Process

### Build Scripts

```bash
# Main build
pnpm registry:build
# - Runs scripts/build-registry.mts
# - Creates registry/__index__.tsx
# - Generates registry.json
# - Runs prettier

# Screenshot capture
pnpm registry:capture
# - Uses Puppeteer for light/dark screenshots
# - Stores in public/r/styles/new-york-v4/

# Validation
pnpm validate:registries
# - Ensures all items are valid per shadcn schema
```

## 10. Editor Block Differences

| Block | Use Case |
|-------|----------|
| **editor** | Minimal, core text formatting only |
| **editor-md** | Markdown-first workflows |
| **editor-x** | Maximum features, largest bundle |

## 11. Using shadcn-mcp Tools

The MCP server provides tools for registry interaction:

```typescript
// List available items
mcp__shadcn__list_items_in_registries({
  registries: ["@shadcn-editor"]
})

// Search for plugins
mcp__shadcn__search_items_in_registries({
  registries: ["@shadcn-editor"],
  query: "toolbar"
})

// View item details
mcp__shadcn__view_items_in_registries({
  items: ["@shadcn-editor/toolbar-plugin"]
})

// Get install command
mcp__shadcn__get_add_command_for_items({
  items: ["@shadcn-editor/editor-x"]
})
```

## 12. Integration with beep-effect

### Steps to Use

1. **Add registry to components.json**:
```json
{
  "registries": {
    "@shadcn-editor": {
      "url": "https://shadcn-editor.vercel.app/r"
    }
  }
}
```

2. **Install editor block**:
```bash
npx shadcn@latest add @shadcn-editor/editor-x
```

3. **Or install individual plugins**:
```bash
npx shadcn@latest add @shadcn-editor/toolbar-plugin
npx shadcn@latest add @shadcn-editor/floating-text-format-plugin
```

## Key Takeaways

1. **Modular architecture** - Install only what you need
2. **Dependency resolution** - Automatic via registryDependencies
3. **CLI integration** - Standard shadcn workflow
4. **Version management** - Each item has version field
5. **Style variants** - Organized under design system (new-york-v4)
6. **91 components** - Comprehensive plugin ecosystem
