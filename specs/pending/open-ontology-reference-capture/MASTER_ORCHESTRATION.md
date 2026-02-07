# Master Orchestration: Open Ontology Reference Capture

> Complete workflow specification for capturing all 20 Open Ontology pages into Notion.

## Complexity Assessment

| Factor | Weight | Scale | Score |
|--------|--------|-------|-------|
| Phase Count | 2 | 6 | 12 |
| Agent Diversity | 3 | 4 | 12 |
| Cross-Package | 4 | 2 | 8 |
| External Dependencies | 3 | 3 | 9 |
| Uncertainty | 5 | 3 | 15 |
| Research Required | 2 | 2 | 4 |
| **Total** | | | **60 (High)** |

## Agent Architecture

### Agent Roles

| Agent | Role | Tools | Input | Output |
|-------|------|-------|-------|--------|
| Page Scout | UI reconnaissance | Playwright MCP | PAGE_NAME, PAGE_URL | `outputs/SCOUT_{PAGE_NAME}.md` |
| Reference Builder | Notion entry creation | Notion MCP | Scout Report, PAGE_NAME, TAGS | Notion page URL, Data Source IDs |
| State Capturer | Interaction capture | Playwright + Chrome (GIFs) | Scout Report, PAGE_URL, NOTION_ENTRY_URL | `outputs/CAPTURE_{PAGE_NAME}.md` |

### Data Flow

```
Page Scout → (SCOUT_*.md) → Reference Builder → (Notion page URL) → State Capturer → (CAPTURE_*.md)
```

Each page follows this sequential 3-agent pipeline. Pages are independent and can be processed in any order within a phase.

## Phase Plan

### Phase 1: Pilot (Stats)
- **Pages**: Stats (root)
- **Purpose**: Validate full workflow end-to-end
- **Work Items**: 5 (scout, build, capture, review, handoff)
- **Estimated Duration**: 1-2 hours
- **Success Gate**: Stats entry complete with 15+ screenshots, 5+ page states, 1+ GIF

### Phase 2: Core Knowledge (4 pages)
- **Pages**: Schema, Explorer, Builder, Attributes
- **Purpose**: Capture core knowledge management features
- **Work Items**: 5 (1 per page + review)
- **Estimated Duration**: 4-6 hours
- **Success Gate**: All 4 entries complete with component inventories

### Phase 3: Data Management (4 pages)
- **Pages**: Objects, Links, Rules, Violations
- **Work Items**: 5
- **Estimated Duration**: 4-6 hours

### Phase 4: Query & AI (4 pages)
- **Pages**: Queries, Console, Chat, Views
- **Work Items**: 5
- **Estimated Duration**: 4-6 hours
- **Note**: Chat and Console may have fundamentally different layouts (see Contingency Protocol)

### Phase 5: Workflow (4 pages)
- **Pages**: Actions, Tasks, Workflows, Forms
- **Work Items**: 5
- **Estimated Duration**: 4-6 hours
- **Note**: Forms page may be a form builder with unique interaction patterns

### Phase 6: Admin + Review Pass (3 pages + review)
- **Pages**: Files, Inbox, Settings + review of all 20 entries
- **Work Items**: 6
- **Estimated Duration**: 4-6 hours

### Total Estimated Duration: 20-30 hours across 6 phases

## Per-Page Workflow

For each page, the orchestrator:

1. **Launch Page Scout** agent with PAGE_NAME and PAGE_URL
2. **Verify** scout output has component inventory with CSS selectors
3. **Launch Reference Builder** agent with scout report and TAGS
4. **Verify** Notion entry exists with all 4 content sections
5. **Launch State Capturer** agent with scout report and Notion entry URL
6. **Verify** capture report shows all components captured
7. **Log** any issues to REFLECTION_LOG.md

## Contingency Protocol

### Pages with Non-Standard Layouts

Some pages may not follow the standard sidebar+main+graph layout observed on Stats. Known risk pages:

| Page | Expected Difference | Adaptation |
|------|-------------------|------------|
| Chat | Conversational UI, message input | Treat message bubbles as components, capture send/receive states |
| Console | REPL/terminal-like interface | Capture input/output states, command history |
| Forms | Form builder with drag-and-drop | Use GIF recording for drag interactions, capture form preview states |
| Queries | Code editor (SPARQL) | Capture syntax highlighting, query execution, results display |

**Adaptation rules**:
- If sidebar is absent, skip `aside` screenshots -- document in scout report
- If page is scrollable with no graph, take screenshots at each fold
- If page has a text editor, capture empty, with-content, and error states
- If agent fails on a component twice, skip and note in output

### GIF Recording Failures

If Chrome GIF recording fails:
1. Skip the GIF -- Playwright screenshots are the primary deliverable
2. Note the failure in the capture report
3. Consider re-attempting in a later phase

## Tool Dependencies

| Tool | Purpose | Required By |
|------|---------|-------------|
| Playwright MCP (`@executeautomation/playwright-mcp-server`) | Browser automation, screenshots | Page Scout, State Capturer |
| Notion MCP (`mcp__plugin_Notion_notion__*`) | Database CRUD | Reference Builder, State Capturer |
| Chrome Extension (`mcp__claude-in-chrome__*`) | GIF recording only | State Capturer |

### Playwright Setup

```bash
# Install Chromium for the MCP server's Playwright version
node ~/.npm/_npx/0b9ff77863cb6e9f/node_modules/playwright/cli.js install chromium
```

**Critical**: Always use `headless: true` when navigating -- headed mode causes screenshot timeouts on Wayland/Manjaro.

## Notion Database Context

| Resource | ID |
|----------|------|
| Parent page | `2c569573-788d-8087-850d-c46260c2b647` |
| Database | `30069573-788d-804a-9cee-d1a6eeffa460` |
| Web References data source | `collection://30069573-788d-8001-bcea-000b74c4c50a` |
| Page States data source | `collection://bd3bf088-316a-49eb-8707-3849af87bff6` |

## Quality Gates

Each page capture is verified against:
- [ ] Notion entry exists with all properties populated
- [ ] Page content has 4 sections (Overview, Layout, Feature Mapping, Implementation Notes)
- [ ] Component inventory has entries matching scout report
- [ ] All interactive components have default state screenshots
- [ ] All dropdowns documented with available options
- [ ] All toggles captured in both states
- [ ] Page States entries created for full-page variants
- [ ] At least 1 GIF recorded per page (best-effort)
