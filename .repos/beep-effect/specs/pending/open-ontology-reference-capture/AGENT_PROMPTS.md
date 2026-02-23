# Agent Prompts: Open Ontology Reference Capture

> Index of specialized sub-agent prompts for the 3-agent capture pipeline.

## Agent Pipeline

```
Page Scout → Reference Builder → State Capturer
(Playwright)    (Notion)           (Playwright + Chrome)
```

## Agent Prompt Files

| Agent | Prompt File | Tools | Input | Output |
|-------|-------------|-------|-------|--------|
| **Page Scout** | [`agents/PAGE_SCOUT.md`](agents/PAGE_SCOUT.md) | Playwright MCP | PAGE_NAME, PAGE_URL | `outputs/SCOUT_{PAGE_NAME}.md` |
| **Reference Builder** | [`agents/REFERENCE_BUILDER.md`](agents/REFERENCE_BUILDER.md) | Notion MCP | Scout Report, PAGE_NAME, TAGS | Notion page URL + Data Source IDs |
| **State Capturer** | [`agents/STATE_CAPTURER.md`](agents/STATE_CAPTURER.md) | Playwright + Chrome (GIFs) | Scout Report, PAGE_URL, NOTION_ENTRY_URL | `outputs/CAPTURE_{PAGE_NAME}.md` |

## Agent Architecture Notes

- Agent docs are maintained as **individual files** in `agents/` rather than consolidated into this document for maintainability (each underwent 4 rounds of iterative refinement).
- Each agent doc is self-contained: includes Role, Input, Tools, Boundaries, Procedure, Error Recovery, Output Format, and Quality Checklist.
- The `agents/` directory is a non-standard extension of the spec structure, chosen because the 3 agent prompts are large (~200 lines each) and benefit from independent revision.

## Inter-Agent Data Contract

### Page Scout → Reference Builder

The scout report (`SCOUT_{PAGE_NAME}.md`) provides:
- **Metadata**: URL, viewport, scrollable status, screenshot references
- **Layout Summary**: 2-3 sentence page structure description
- **Component Inventory table**: columns are #, Component, Type, CSS Selector, Section, Label/Content, Has Children, Interaction Type
- **Sections Map**: hierarchical outline of page areas
- **Downstream Hints**: explicit suggestions for feature mapping and state capture

### Reference Builder → State Capturer

Reference Builder returns:
- **Created page URL**: the Notion Web Reference entry URL (used for Page States `Reference` field)
- **Data Source IDs**: page data source and component inventory data source IDs

### Page Scout → State Capturer

State Capturer also reads the scout report directly for:
- **Component Inventory**: CSS selectors and interaction types guide capture protocols
- **Downstream Hints → For State Capturer**: recommended components to focus on, estimated screenshot count

## Cross-Agent Constraints

1. **Playwright `headless: true`**: Both Page Scout and State Capturer MUST use headless mode
2. **Notion select options**: No commas in select option values (Reference Builder + State Capturer)
3. **Separate browser instances**: Playwright and Chrome extension are independent -- state does not sync
4. **GIF recording**: Only available in Chrome extension, not Playwright
