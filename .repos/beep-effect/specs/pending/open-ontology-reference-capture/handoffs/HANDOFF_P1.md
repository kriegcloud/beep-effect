# Phase 1 Handoff: Pilot Capture (Stats Page)

**Date**: 2026-02-07
**From**: Phase 0 (Spec Creation & Dry Runs)
**To**: Phase 1 (Pilot Capture -- Stats Page)
**Status**: Ready for implementation

---

## Working Context

### Mission

Validate the full capture workflow end-to-end on the **Stats** page before scaling to all 20 pages. Prove out Notion database writes, component inventory creation, Playwright screenshot workflow, and page content template.

### Success Criteria

- [ ] Stats entry exists in Notion Web References database
- [ ] Page content follows template (Overview, Layout, Feature Mapping, Implementation Notes)
- [ ] Component inventory created (inline DB or markdown table fallback)
- [ ] 15+ component-level screenshots captured
- [ ] 5+ Page States entries created with screenshots
- [ ] At least 1 GIF captured for an interactive flow
- [ ] All 3 agent outputs produced and reviewed
- [ ] Workflow validated; issues documented for Phase 2 adjustments

### Blocking Issues

None. All prerequisites resolved in Phase 0 dry runs.

### Immediate Tasks: 3-Agent Sequential Workflow

**Agent 1 -- Page Scout** (`agents/PAGE_SCOUT.md`)
- Input: `PAGE_NAME=Stats`, `PAGE_URL=https://open-ontology.com/databases/lively-birch-keeping-autumn`
- Output: `outputs/SCOUT_Stats.md`
- Verify: Every interactive element has an inventory row; CSS selectors are correct

**Agent 2 -- Reference Builder** (`agents/REFERENCE_BUILDER.md`)
- Input: Scout report, `PAGE_NAME=Stats`, `PAGE_URL=...`, `TAGS=["dashboard", "graph", "stats", "metrics", "schema"]`
- Output: Created Notion page URL, data source IDs
- Verify: All 4 content sections present; component inventory populated

**Agent 3 -- State Capturer** (`agents/STATE_CAPTURER.md`)
- Input: Scout report, `PAGE_URL=...`, `PAGE_NAME=Stats`, `NOTION_ENTRY_URL=...`
- Output: `outputs/CAPTURE_Stats.md`
- Verify: All components captured; GIFs recorded; Page States created

### Component State Capture Targets

**Critical captures:**
- Metric cards: default state
- Object Types section: collapsed + expanded
- Link Types section: collapsed + expanded
- Graph visualization: default layout, zoomed in/out, fit view
- Layout dropdown: open state showing all options (Dagre, ELK variants)
- 3D View toggle on
- Top-Down / Left-Right toggles
- Curved / Straight edges toggle
- Spacious / Compact toggle

**Full-page variants:**
- Dark mode (theme toggle)
- Help tooltip/panel
- GIF: open layout dropdown -> select ELK Force -> graph re-layout animation

---

## Episodic Context

### Phase 0 Outcomes

Phase 0 consisted of spec creation followed by dry-run validation of all three agent docs. Four rounds of refinement were performed:

1. **Round 1**: Initial agent doc drafts; dry-run revealed Chrome extension `read_page` ref_ids are ephemeral and unstable across sessions.
2. **Round 2**: Added ref_id stability warnings; identified React Flow graph components needed special handling.
3. **Round 3**: Complete rewrite -- migrated from Chrome extension (`read_page` + `ref_ids`) to **Playwright MCP** (`playwright_get_visible_html` + CSS selectors). This eliminated ref_id instability entirely.
4. **Round 4**: Added `headless: true` requirement (headed mode caused screenshot timeouts), element-level screenshots, and Playwright-specific error recovery procedures.

### Key Decisions

- Playwright headless mode is mandatory -- headed mode hangs on screenshots
- CSS selectors (e.g., `button:has-text("3D View")`, `.react-flow`) replace all ref_id references
- Notion inline databases appear at page bottom -- write content first, then create DB
- Select option names cannot contain commas -- use slashes instead

### Existing Dry-Run Entry

A Reference Builder dry run already created a Stats entry:
- **Page URL**: `https://www.notion.so/30069573788d81c1a881d598349ddcf5`
- **Component Inventory DB**: `https://www.notion.so/ea957ff82a9f4e90aa4686cfb7791509`
- **Data Source**: `collection://1313a58a-71ca-4b8f-a281-d69b85011d16`

Prefer **updating** this entry to avoid duplicates. Delete and recreate only if the dry-run entry needs significant structural changes.

---

## Semantic Context

### Notion Database IDs

| Resource | ID |
|----------|------|
| Web References | `collection://30069573-788d-8001-bcea-000b74c4c50a` |
| Page States | `collection://bd3bf088-316a-49eb-8707-3849af87bff6` |
| Parent page | `2c569573-788d-8087-850d-c46260c2b647` |

### Web References Schema

```
"Page title": TEXT (title)
"Area": "Open Ontology" (select)
"Tags": JSON array e.g., ["dashboard", "graph", "stats"]
"userDefined:URL": TEXT -- MUST use "userDefined:" prefix
"Description": TEXT
"date:Captured:start": "2026-02-07" (ISO date)
"date:Captured:is_datetime": 0 (number, NOT string)
```

### Page States Schema

```
"State": TEXT (title)
"State type": "Default" or "Variant"
"Variant kind": Loading | Empty | Error | Success | Permission denied | Mobile | Desktop | Dark mode | Other
"Order": FLOAT
"Notes": TEXT
"Reference": JSON array of page URLs linking to Web References entries
```

### API Constraints

| Constraint | Workaround |
|-----------|------------|
| Select options cannot contain commas | Use slashes (e.g., "pan/zoom/click") |
| `is_datetime` must be number, not string | Always use `0` not `"0"` |
| Tags stored as JSON string | Pass as `"[\"a\", \"b\"]"` |
| Inline DB appears at page bottom | Write content first, then create DB |
| Playwright headed mode hangs on screenshots | Always use `headless: true` |

---

## Procedural Context

| Resource | Path |
|----------|------|
| Page Scout agent doc | `specs/pending/open-ontology-reference-capture/agents/PAGE_SCOUT.md` |
| Reference Builder agent doc | `specs/pending/open-ontology-reference-capture/agents/REFERENCE_BUILDER.md` |
| State Capturer agent doc | `specs/pending/open-ontology-reference-capture/agents/STATE_CAPTURER.md` |
| Page content template | `specs/pending/open-ontology-reference-capture/templates/page-content.template.md` |
| Quick start guide | `specs/pending/open-ontology-reference-capture/QUICK_START.md` |
| Reflection log | `specs/pending/open-ontology-reference-capture/REFLECTION_LOG.md` |
| Spec README | `specs/pending/open-ontology-reference-capture/README.md` |

### Prerequisites

1. Notion plugin authenticated -- run `/mcp` and connect if needed
2. Playwright MCP server available -- tools prefixed `mcp__playwright__`
3. Read all agent docs before dispatching agents

---

## Context Verification Checklist

- [x] Working context <=2,000 tokens
- [x] Episodic context <=1,000 tokens
- [x] Semantic context <=500 tokens (or links)
- [x] Procedural context uses links, not inline content
- [x] Critical information at document start/end (success criteria first, verification + links last)
- [x] Total context <=4,000 tokens
