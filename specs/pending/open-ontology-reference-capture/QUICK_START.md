# Quick Start: Capturing an Open Ontology Page

> Step-by-step workflow for capturing a single page. Repeat for all 20 pages.

---

## Prerequisites

1. **Notion plugin** authenticated (`/mcp` -> connect to Notion)
2. **Playwright MCP server** running (primary browser automation tool)
3. **Claude in Chrome extension** active (needed ONLY for GIF recording by State Capturer)
4. Read `templates/page-content.template.md` for the content format
5. Read `agents/` docs for specialized sub-agent prompts

## Playwright Setup

The Playwright MCP server provides the primary browser automation for Page Scout and State Capturer.

**Install Chromium** (required by Playwright):
```bash
npx playwright install chromium
```

**Critical constraint: `headless: true` is REQUIRED** for all `playwright_navigate` calls. Headed mode causes screenshot timeouts even on simple pages. Always pass `headless: true` when navigating.

**Viewport**: Set to `1920x1080` for consistent captures across all pages.

**Separate browser instance**: Playwright opens its own Chromium browser, independent of the Chrome extension. State changes in one browser are NOT reflected in the other. This matters for the State Capturer agent which uses both.

## Notion API Constraints (IMPORTANT)

These constraints were discovered during dry-run testing and cause 400 errors if violated:

| Constraint | Details |
|-----------|---------|
| Select options cannot contain commas | Use slashes or semicolons: `"pan/zoom/click"` not `"pan, zoom, click"` |
| Reserved property names | Must prefix with `"userDefined:"`: `"userDefined:URL"` not `"URL"` |
| Date properties split format | Value: `"date:Captured:start"`, Flag: `"date:Captured:is_datetime"` |
| `is_datetime` type | Must be number `0`, not string `"0"` |
| Tags format | JSON string: `"[\"a\", \"b\"]"` not native array |
| Markdown tables | Standard markdown table syntax auto-converts to Notion tables |
| Inline database placement | Always appears at bottom of page content |

## Per-Page Workflow (3 agents)

The workflow is split across three specialized agents. Run them in sequence:

### Agent 1: Page Scout (`agents/PAGE_SCOUT.md`)

**Purpose**: Navigate the page via Playwright, read its component tree, take default screenshots (full viewport + element-level), produce inventory with CSS selectors.

**Tools**: Playwright MCP only (no Chrome extension needed)

| Tool | Purpose |
|------|---------|
| `playwright_navigate` | Navigate to page (`headless: true`, 1920x1080) |
| `playwright_get_visible_html` | Read HTML of specific containers (replaces `read_page`) |
| `playwright_evaluate` | Execute JS for component inventory, scrolling, measurements |
| `playwright_screenshot` | Full viewport + element-level screenshots via `selector` param |
| `playwright_get_visible_text` | Get visible text content |

```
Input: PAGE_NAME, PAGE_URL
Output: specs/pending/open-ontology-reference-capture/outputs/SCOUT_{PAGE_NAME}.md
```

### Agent 2: Reference Builder (`agents/REFERENCE_BUILDER.md`)

**Purpose**: Create the Notion database entry, write page content, build component inventory.

**Tools**: Notion MCP only (no browser tools needed)

```
Input: Page Scout Report, PAGE_NAME, PAGE_URL, TAGS
Output: Created Notion page URL, Data Source IDs
```

### Agent 3: State Capturer (`agents/STATE_CAPTURER.md`)

**Purpose**: Interact with every component via Playwright, capture all visual states as screenshots, record GIFs of interactive flows via Chrome extension, create Page States entries in Notion.

**Tools**: Hybrid -- Playwright primary, Chrome for GIFs only

| Tool | Purpose |
|------|---------|
| `playwright_navigate` | Navigate to page (`headless: true`, 1920x1080) |
| `playwright_click` | Click buttons, dropdowns, toggles (CSS selectors) |
| `playwright_hover` | Hover for tooltip/state capture |
| `playwright_screenshot` | All static screenshots (full viewport + element-level) |
| `playwright_evaluate` | Wait for state changes, DOM queries |
| `playwright_fill` | Fill form inputs |
| `playwright_press_key` | Press Escape to close modals |
| `gif_creator` | Record GIFs of interactive flows (**Chrome-only**) |

**Note**: For GIF recording, the agent opens a separate Chrome tab (independent of the Playwright browser). Any state set up in Playwright must be re-created in Chrome before recording.

```
Input: Page Scout Report, PAGE_URL, PAGE_NAME, NOTION_ENTRY_URL
Output: specs/pending/open-ontology-reference-capture/outputs/CAPTURE_{PAGE_NAME}.md
```

## Manual Workflow (if not using agents)

### Step 1: Navigate & Screenshot

```
1. Navigate via Playwright: playwright_navigate with headless: true and 1920x1080 viewport
2. Wait for full page load: playwright_evaluate with await new Promise(r => setTimeout(r, 3000))
3. Take a full viewport screenshot: playwright_screenshot (no selector)
4. Take element-level screenshots: playwright_screenshot with selector param (aside, header, main)
5. Read page structure: playwright_get_visible_html with selector: "body"
6. Inventory interactive elements: playwright_evaluate with querySelectorAll for buttons, inputs, etc.
```

### Step 2: Create Web Reference Entry

Create a row in the Web References data source (`collection://30069573-788d-8001-bcea-000b74c4c50a`):

| Property | Value |
|----------|-------|
| Page title | Page name (e.g., "Stats Dashboard") |
| Area | "Open Ontology" |
| Tags | Relevant tags (dashboard, graph, table, form, etc.) |
| userDefined:URL | Full page URL |
| Description | 1-2 sentence summary of what the page does |
| date:Captured:start | Today's date (YYYY-MM-DD) |
| date:Captured:is_datetime | 0 |

### Step 3: Write Page Content

Using standard markdown syntax, write the page body with:
- Overview section (2-4 sentences, 50-100 words)
- Layout description (1 paragraph, 80-150 words)
- Feature mapping table (1 row per significant feature, 10-20 rows)
- Implementation notes (4 bullet points)

### Step 4: Create Component Inventory

For each distinct component/widget on the page, either:

**Option A (preferred):** Create an inline database on the page with these columns:

| Column | Type | Purpose |
|--------|------|---------|
| Component | title | Name (e.g., "Graph Layout Dropdown") |
| Type | select | Button, Dropdown, Toggle, Chart, Table, Panel, Toolbar, Modal, Input, Navigation, Card, List, Tab, Form |
| Section | select | Parent section the component belongs to |
| Label | text | Visible text content |
| Interaction | select | click, hover, drag, input, select, toggle, expand |
| TodoX Mapping | text | Target package/component |
| Priority | select | P0, P1, P2, P3 |
| Notes | text | Implementation considerations (5-15 words) |

**Remember**: Select option names CANNOT contain commas.

**Option B (fallback):** If inline database creation fails, use a markdown table in the page content.

### Step 5: Capture Component States

For each component in the inventory (using Playwright):
1. Locate the element by CSS selector
2. Take an element-level screenshot in its default state: `playwright_screenshot` with `selector`
3. Interact to trigger other states: `playwright_click`, `playwright_hover`
4. Wait for state change: `playwright_evaluate` with `await new Promise(r => setTimeout(r, ms))`
5. Screenshot each state (element-level and/or full viewport)
6. For interactive flows, record a GIF using Chrome extension's `gif_creator`
7. Create Page States entries for significant full-page state changes

### Useful CSS Selectors for Open Ontology

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

## Page States Database

For significant full-page states (not per-component), create entries in the Page States data source (`collection://bd3bf088-316a-49eb-8707-3849af87bff6`):

| Property | Value |
|----------|-------|
| State | State name (e.g., "3D Graph View") |
| Reference | JSON array of page URLs: [NOTION_ENTRY_URL] |
| State type | "Default" or "Variant" |
| Variant kind | Loading, Empty, Error, Success, etc. |
| Order | Sort order within this reference (1.0, 2.0, ...) |
| Notes | What changed and what to pay attention to |

## Tips

- Use `playwright_get_visible_html` with targeted selectors to read specific sections (faster than reading entire page)
- Use `playwright_evaluate` with `querySelectorAll` to programmatically inventory interactive elements
- Use `playwright_screenshot` with `selector` param for precise element-level captures
- Use Playwright's `:has-text()` pseudo-selector for finding elements by visible label
- Use `playwright_evaluate` with `await new Promise(r => setTimeout(r, ms))` for waits between interactions
- Use Chrome `gif_creator` ONLY for GIF recording -- all other captures should use Playwright
- Check existing entries before creating duplicates
- Standard markdown table syntax works for Notion -- no special syntax needed
- Remember: Playwright and Chrome are separate browsers -- state does not sync between them
