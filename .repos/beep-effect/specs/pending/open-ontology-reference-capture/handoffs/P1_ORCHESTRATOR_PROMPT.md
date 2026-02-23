# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 (pilot capture of the Stats page).

---

## Prompt

You are implementing Phase 1 of the **open-ontology-reference-capture** spec.

### Context

We are building an exhaustive UI/feature reference library in Notion by screenshotting and documenting every page, component, and interaction state in the Open Ontology app (`https://open-ontology.com/databases/lively-birch-keeping-autumn`). This reference will guide implementation of similar features in our `apps/todox` application and `packages/knowledge` slice.

The Notion database already exists with two data sources:
- **Web References** (`collection://30069573-788d-8001-bcea-000b74c4c50a`) -- one entry per OO page
- **Page States** (`collection://bd3bf088-316a-49eb-8707-3849af87bff6`) -- variant states per page

A dry-run already created a Stats page entry. Check it first to avoid duplicates:
- **Page URL**: https://www.notion.so/30069573788d81c1a881d598349ddcf5
- **Component Inventory DB**: `collection://1313a58a-71ca-4b8f-a281-d69b85011d16`

You may update the existing entry or delete and recreate. Do NOT create duplicates.

### Your Mission

Capture a complete reference entry for the **Stats** page of the Open Ontology application, validating the full 3-agent workflow before scaling to all 20 pages.

Execute three specialized agents in sequence:

- **Agent 1 -- Page Scout**: Navigate via Playwright, read the component tree, take default screenshots (full viewport + element-level), produce an inventory with CSS selectors.
  - Read: `specs/pending/open-ontology-reference-capture/agents/PAGE_SCOUT.md`
  - Input: `PAGE_NAME=Stats`, `PAGE_URL=https://open-ontology.com/databases/lively-birch-keeping-autumn`
  - Output: `specs/pending/open-ontology-reference-capture/outputs/SCOUT_Stats.md`

- **Agent 2 -- Reference Builder**: Create the Notion database entry, write page content (Overview, Layout, Feature Mapping, Implementation Notes), build component inventory.
  - Read: `specs/pending/open-ontology-reference-capture/agents/REFERENCE_BUILDER.md`
  - Input: Page Scout Report, `PAGE_NAME=Stats`, `TAGS=["dashboard", "graph", "stats", "metrics", "schema"]`
  - Output: Created Notion page URL and data source IDs

- **Agent 3 -- State Capturer**: Interact with every component via Playwright, capture all visual states as screenshots, record GIFs of interactive flows via Chrome extension, create Page States entries in Notion.
  - Read: `specs/pending/open-ontology-reference-capture/agents/STATE_CAPTURER.md`
  - Input: Page Scout Report, `PAGE_URL`, `PAGE_NAME=Stats`, `NOTION_ENTRY_URL` (from Agent 2)
  - Output: `specs/pending/open-ontology-reference-capture/outputs/CAPTURE_Stats.md`

### Critical Patterns

**Pattern 1: Playwright Navigation (MUST use headless: true)**

Headed mode causes screenshot timeouts even on simple pages. Always pass `headless: true`.

```
playwright_navigate
  url: "https://open-ontology.com/databases/lively-birch-keeping-autumn"
  headless: true
  viewport: { width: 1920, height: 1080 }
```

**Pattern 2: Element-Level Screenshots**

Use the `selector` param for precise component captures instead of full-viewport screenshots.

```
playwright_screenshot with selector: "aside"         -- sidebar navigation
playwright_screenshot with selector: ".react-flow"   -- graph canvas
playwright_screenshot with selector: "header"         -- header bar
playwright_screenshot (no selector)                   -- full viewport
```

**Pattern 3: Notion API -- Select Options (NO commas)**

Commas in select values cause 400 errors. Use slashes or semicolons instead.

```
"Type": "Button"             (OK)
"Interaction": "click/hover" (OK -- uses slash)
"Interaction": "click, hover" (FAILS -- comma in select value)
```

**Pattern 4: Notion API -- Date Property**

Date properties use a split format. `is_datetime` must be a number, not a string.

```
"date:Captured:start": "2026-02-07"
"date:Captured:is_datetime": 0          (number, NOT string "0")
```

**Pattern 5: CSS Selectors for Open Ontology**

These Playwright-compatible CSS selectors were validated during testing:

```
button:has-text("3D View")                -- button by visible text
button[aria-label="Switch to dark mode"]  -- button by aria-label
[role="option"]:has-text("ELK Force")     -- dropdown option by text
[data-radix-popper-content-wrapper]       -- Radix UI dropdown popup
.react-flow                               -- React Flow canvas
aside                                     -- sidebar navigation
header                                    -- header bar
main                                      -- main content area
```

### Reference Files

- Full handoff: `specs/pending/open-ontology-reference-capture/handoffs/HANDOFF_P1.md` -- complete context, Notion schema, all constraints
- Page content template: `specs/pending/open-ontology-reference-capture/templates/page-content.template.md` -- markdown template for page body
- Quick workflow: `specs/pending/open-ontology-reference-capture/QUICK_START.md` -- step-by-step with CSS selectors and tool usage
- Dry run report: `specs/pending/open-ontology-reference-capture/outputs/DRY_RUN_REFERENCE_BUILDER.md` -- learnings from dry-run attempt
- TodoX PRD: `documentation/todox/PRD.md` -- for feature mapping column in component inventory

### Verification

After completing all three agents, verify:

- [ ] Stats entry visible in Notion "Open Ontology Web References" database
- [ ] Page content has all 4 sections (Overview, Layout, Feature Mapping, Implementation Notes)
- [ ] Component inventory has 10+ entries with CSS selectors
- [ ] 15+ screenshots captured across component states
- [ ] 5+ Page States entries created in Notion
- [ ] At least 1 GIF recorded via Chrome extension
- [ ] No duplicate entries created (dry-run entry reused or replaced)

### Success Criteria

- [ ] All 3 agents executed successfully in sequence (Scout -> Builder -> Capturer)
- [ ] Stats page fully documented in Notion with all 4 content sections
- [ ] Component inventory populated with CSS selectors, types, interactions, and TodoX mappings
- [ ] All interactive states captured as screenshots (default, hover, expanded, toggled)
- [ ] Page States entries created for significant full-page state variants
- [ ] At least 1 GIF recorded for an interactive flow
- [ ] Workflow validated end-to-end -- ready to scale to remaining 19 pages

### Handoff Document

Read full context in: `specs/pending/open-ontology-reference-capture/handoffs/HANDOFF_P1.md`

### Next Phase

After completing Phase 1:
1. Update `REFLECTION_LOG.md` with learnings
2. Create `HANDOFF_P2.md` (context document for Schema, Explorer, Builder, Attributes pages)
3. Create `P2_ORCHESTRATOR_PROMPT.md` (copy-paste prompt)
