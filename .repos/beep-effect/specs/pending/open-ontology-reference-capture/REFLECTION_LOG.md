# Reflection Log

## Phase 0: Spec Creation

**Date**: 2026-02-07

### What Worked
- Explored the Open Ontology app via Claude in Chrome to understand full page inventory
- Fetched the existing Notion database schema to understand data source structure
- Iteratively refined the component inventory database columns with user input

### Key Decisions
- All 20 pages to be captured (not just high-relevance subset)
- Exhaustive state coverage including every dialog, modal, dropdown, component variant
- Component inventory as inline database per page entry (not flat text)
- Individual component screenshots and GIFs for interactive flows

---

## Phase 0.5: Dry Runs & Agent Doc Refinement

**Date**: 2026-02-07

### Agents Created
Three specialized sub-agents designed based on task decomposition:
1. **Page Scout** — Chrome reconnaissance, component tree reading, screenshot
2. **Reference Builder** — Notion entry creation, page content writing, component inventory DB
3. **State Capturer** — Interactive state capture, GIF recording, Page States creation

### Dry Run Results Summary

| Agent | Status | Key Metrics | Output |
|-------|--------|-------------|--------|
| Reference Builder | COMPLETED | 30 components, 18 features, 4 sections, inline DB working | `outputs/DRY_RUN_REFERENCE_BUILDER.md` |
| Page Scout | COMPLETED | 46 components, 16 graph edges, ~5-6 min per page | `outputs/DRY_RUN_PAGE_SCOUT.md` |
| State Capturer | COMPLETED (limited) | 3 components, 12 screenshots, 1 GIF, 2 Page States | `outputs/DRY_RUN_STATE_CAPTURER.md` |

### Critical Discoveries

#### Notion API Constraints
| Constraint | Discovered By |
|-----------|---------------|
| Select options CANNOT contain commas | Reference Builder |
| `notion://docs/enhanced-markdown-spec` NOT fetchable (400 error) | Reference Builder |
| `is_datetime` must be number, not string | Reference Builder |
| Tags stored as JSON string, not array | Reference Builder |
| Inline DB appears at bottom of page (not inline) | Reference Builder |
| Standard markdown tables auto-convert to Notion tables | Reference Builder |

#### Chrome/Browser Constraints
| Constraint | Discovered By |
|-----------|---------------|
| `javascript_tool` does NOT support top-level `await` | Page Scout |
| `upload_image` uploads TO a web page element, not to external storage | Page Scout |
| ref_ids are ephemeral — change across tabs and reloads | Page Scout |
| Claude-in-Chrome overlay pollutes screenshots and component tree | Page Scout |
| Screenshot resolution may differ from viewport due to DPR scaling | Page Scout |

#### State Capture Insights
| Insight | Discovered By |
|---------|---------------|
| Open Ontology defaults to dark mode — light is the variant | State Capturer |
| 3D View toggle replaces the entire visualization engine (major state) | State Capturer |
| GIF frames only capture on screenshots, not continuously — need 6-8 frames | State Capturer |
| Layout animation takes 1-2 seconds to settle | State Capturer |
| Theme toggle may be gear icon, not sun/moon — varies by site | State Capturer |

### Agent Doc Updates Applied (3 rounds)

**Round 1** (post-Reference Builder):
- Added "Notion API Constraints" section to all agents
- Added "Boundaries" section (does/does NOT) to all agents
- Added error recovery and retry patterns
- Added content length guidance (word counts)
- Removed `notion://docs/enhanced-markdown-spec` fetch step
- Added output file path conventions

**Round 2** (post-Page Scout):
- Fixed wait mechanism: `await` -> `computer wait` action
- Clarified `upload_image` purpose (not for external storage)
- Added ref_id stability warning
- Added browser extension UI filtering guidance
- Added page verification step after navigation
- Added shared vs page-specific component classification

**Round 3** (post-State Capturer):
- Added "dismiss notifications" step before default capture
- Added max-option-capture guidance for dropdowns (>5 options)
- Fixed dropdown wait to use `computer wait` instead of `await`
- Added dark mode default handling note
- Added GIF frame count guidance (6-8 frames for smooth playback)
- Added theme toggle discovery guidance (sun/moon/gear icons)

### Time Estimates (from dry runs)

| Agent | Est. Time per Page | Notes |
|-------|-------------------|-------|
| Page Scout | 5-6 min | Fast — mostly tool calls + report writing |
| Reference Builder | 5-10 min | Depends on feature mapping depth |
| State Capturer | 30-60 min | Bottleneck — many interactions per page |
| **Total per page** | **40-75 min** | ~1 hour average |
| **Total for 20 pages** | **~15-25 hours** | Across 6 phases |

### Readiness Assessment

**The spec is ready for Phase 1 execution.** All three agent workflows have been validated against the real Stats page with real Notion API calls. The critical Notion and Chrome constraints are documented. The agent docs have been refined through 3 rounds of feedback.

### Remaining Risks
1. **Some pages may have fundamentally different layouts** (e.g., Forms, Console, Chat) that don't fit the current protocols. Phase 1 will validate against Stats only.
2. **GIF quality may be insufficient** with only 4-6 frames. May need to increase intermediate screenshots for production quality.
3. **Existing dry-run Notion entry** for Stats needs to be updated or replaced during Phase 1 to avoid duplicates.

---

## Phase 0.6: Playwright MCP Integration

**Date**: 2026-02-07

### Background
User added `@executeautomation/playwright-mcp-server` MCP server for element-level CSS selector screenshots — a major upgrade over Chrome's coordinate-based `zoom` action.

### Testing Results

**Setup requirements:**
- `npx playwright install chromium` required (installs to `~/.cache/ms-playwright/`)
- MCP server may use a different Playwright version than the project — install browsers using the server's own CLI: `node <npx-cache>/node_modules/playwright/cli.js install chromium`

**Critical finding: `headless: true` is MANDATORY**
- Headed mode (`headless: false`, the default) causes screenshot timeouts on ALL pages, even example.com
- Root cause: likely GPU/rendering pipeline issue on Wayland/Manjaro
- Headless mode works perfectly — fast, reliable screenshots

**Element-level screenshots confirmed working:**
| Selector | Target | Result |
|----------|--------|--------|
| `aside` | Sidebar navigation | Clean element crop |
| `header` | Header bar | Clean element crop |
| `.react-flow` | React Flow graph canvas | Full canvas capture |
| `main` | Main content area | Full content capture |
| `[data-radix-popper-content-wrapper]` | Radix UI dropdown popup | Popup-only capture |
| `button:has-text("3D View")` | N/A (interaction test) | Click works |
| `[role="option"]:has-text("ELK Force")` | Dropdown option | Selection works |
| `button[aria-label="Switch to dark mode"]` | Theme toggle | Toggle works |

**Interaction capabilities confirmed:**
- `playwright_click` with `:has-text()` — reliable button/option selection
- `playwright_evaluate` with `await new Promise(...)` — async waits work
- `playwright_get_visible_html` with `selector` — targeted DOM reads
- `playwright_hover` — hover state support

**Limitation: No GIF recording**
- Playwright has no equivalent to Chrome's `gif_creator`
- State Capturer uses hybrid approach: Playwright primary, Chrome for GIFs only
- Separate browser instances — state does not sync

### Agent Doc Updates (Round 4)

| Agent | Change |
|-------|--------|
| Page Scout | Complete rewrite: Chrome -> Playwright. CSS selectors replace ref_ids. Element-level screenshots added. |
| State Capturer | Hybrid rewrite: Playwright primary for all screenshots/interactions, Chrome retained for GIF recording only. Tool Selection Guide added. |
| Reference Builder | No change (Notion-only agent) |
| QUICK_START.md | Added Playwright setup section, per-agent tool tables, CSS selector reference |

### Impact on Time Estimates
Element-level screenshots remove the need for manual `zoom` region captures and coordinate calculation. Expected speedup:
- **Page Scout**: 5-6 min -> ~3-4 min (direct element screenshots, no viewport math)
- **State Capturer**: 30-60 min -> ~25-50 min (reliable selector-based interactions, fewer retries)
- **Total per page**: ~35-65 min (from ~40-75 min)
