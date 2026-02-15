# Master Orchestration: Taskade UI Reference Capture

> Complete workflow specification for capturing 17 Taskade views into structured markdown outputs.

## Complexity Assessment

| Factor | Weight | Scale | Score |
|--------|--------|-------|-------|
| Phase Count | 2 | 5 | 10 |
| Agent Diversity | 3 | 2 | 6 |
| Cross-Package | 4 | 1 | 4 |
| External Dependencies | 3 | 2 | 6 |
| Uncertainty | 5 | 2 | 10 |
| Research Required | 2 | 3 | 6 |
| **Total** | | | **42 (High)** |

## Agent Architecture

### Agent Roles

| Agent | Role | Tools | Input | Output |
|-------|------|-------|-------|--------|
| **Page Capturer** | Full page reconnaissance + interaction capture | Chrome (auth, GIFs) + Playwright (persistent screenshots) | VIEW_NAME, VIEW_URL, NAVIGATION_INSTRUCTIONS | `outputs/CAPTURE_{VIEW_NAME}.md` + S3 screenshots |

### Dual-Browser Architecture

Phase 1 used Claude-in-Chrome only, which produced ephemeral `ss_*` screenshot IDs lost between sessions. Phase 1.5 validated a dual-browser approach:

| Browser | Purpose | Auth |
|---------|---------|------|
| **Chrome** (Claude-in-Chrome) | Authenticated navigation, GIF recording, visual inspection | Persistent session cookies |
| **Playwright** (MCP) | Disk-persistent screenshots, element-level captures | Requires manual login at session start |

Chrome remains the primary tool for navigation and interaction discovery. Playwright is used whenever a screenshot needs to persist beyond the current session.

### Why One Agent (Not Three)

The open-ontology spec used a 3-agent pipeline (Scout → Reference Builder → State Capturer) because it needed Playwright for CSS-selector screenshots AND Notion for database writes. This spec writes markdown files with persistent S3-hosted screenshots, so the pipeline collapses to a single agent that discovers components, captures their states, and uploads assets in one pass.

### Data Flow

```
Orchestrator → (VIEW_NAME, URL, NAV_INSTRUCTIONS) → Page Capturer → (CAPTURE_*.md)
```

Each view produces one output file plus uploaded screenshots. Views are independent within a phase and can be captured in any order (though sequential is recommended for consistent state).

## Screenshot Infrastructure

All screenshots are saved to disk via Playwright and uploaded to S3 for permanent public access. This replaces the ephemeral `ss_*` IDs from Chrome that were lost between sessions.

### Pipeline

```
Playwright page.screenshot({ path })  -->  /tmp/taskade-screenshots/{view}/
                                              |
                                        aws s3 cp --recursive
                                              |
                                              v
                            s3://static.vaultctx.com/notion/taskade-ui-reference/{view}/screenshots/
                                              |
                                        CloudFront CDN
                                              |
                                              v
                            https://static.vaultctx.com/notion/taskade-ui-reference/{view}/screenshots/{file}.png
```

### S3 Bucket

- **Bucket**: `s3://static.vaultctx.com`
- **Prefix**: `notion/taskade-ui-reference/`
- **Region**: `us-east-1`
- **Public URL base**: `https://static.vaultctx.com/notion/taskade-ui-reference/`

### Folder Convention

```
{view-name-kebab}/
  screenshots/    -- Static PNG screenshots
  gifs/           -- Animated GIF recordings (from Chrome)
```

### Upload Commands

```bash
# Single file
aws s3 cp {local_file} \
  s3://static.vaultctx.com/notion/taskade-ui-reference/{view}/screenshots/{filename}.png \
  --content-type image/png --region us-east-1

# Entire view directory
aws s3 cp /tmp/taskade-screenshots/{view}/ \
  s3://static.vaultctx.com/notion/taskade-ui-reference/{view}/screenshots/ \
  --recursive --content-type image/png --region us-east-1
```

### Playwright Screenshot Pattern

Use `browser_run_code` (NOT `browser_take_screenshot` which has a 5s timeout):

```javascript
// Full page
await page.waitForTimeout(2000);
await page.screenshot({
  path: '/tmp/taskade-screenshots/{view}/full-page.png',
  timeout: 30000
});

// Element-level with clip
await page.screenshot({
  path: '/tmp/taskade-screenshots/{view}/component-sidebar.png',
  clip: { x: 0, y: 0, width: 300, height: 800 },
  timeout: 30000
});
```

### Session Setup Requirement

Playwright runs a separate browser without Chrome's auth cookies. At the start of each capture session:

1. Navigate Playwright to `https://www.taskade.com/login`
2. Manually log in (or use `browser_fill_form` + `browser_click` if credentials are available)
3. Verify authenticated state before beginning captures

## Phase Plan

### Phase 1: Pilot - Workspace Shell (3 views)

- **Views**: Workspace Home, Sidebar Navigation, Workspace Header
- **Purpose**: Validate workflow end-to-end, document the app shell architecture
- **Work Items**: 5 (3 captures + architecture synthesis + handoff)
- **Success Gate**: 3 capture files complete, app shell architecture documented in `outputs/ARCHITECTURE_APP_SHELL.md`

**Critical**: This phase captures the **persistent app shell** that wraps all other views. Its output is prerequisite context for all subsequent phases.

### Phase 2: Settings General (4 views)

- **Views**: Account, Password, Connected Accounts, Sessions
- **Purpose**: Capture the General settings section with its sub-tab pattern
- **Work Items**: 5 (4 captures + handoff)
- **Success Gate**: All 4 capture files complete, sub-tab navigation pattern documented

### Phase 3: Settings Billing (3 views)

- **Views**: Plans, Usage & Billing, Credits & Rewards
- **Purpose**: Capture billing/plan views with card layouts and data displays
- **Work Items**: 4 (3 captures + handoff)
- **Success Gate**: All 3 capture files complete

### Phase 4: Settings Features (3 views)

- **Views**: Notifications, Integrations, Archives
- **Purpose**: Capture feature settings with table layouts and expandable sections
- **Work Items**: 4 (3 captures + handoff)
- **Success Gate**: All 3 capture files complete
- **Note**: Integrations is an expandable sidebar section with external links, not a page view

### Phase 5: Settings Admin + Review (4 views + review)

- **Views**: Manage > Workspaces, Manage > Activate, Workspace Overview, Workspace Members/Apps
- **Work Items**: 6 (4 captures + cross-cutting synthesis + final review)
- **Success Gate**: All captures complete, `outputs/ARCHITECTURE_SETTINGS.md` synthesized

### Total: 17 views across 5 phases

## Per-View Workflow

For each view, the orchestrator:

1. **Prepare navigation context** — determine the URL or navigation steps needed
2. **Ensure Playwright is authenticated** — if first view in session, verify Playwright login
3. **Launch Page Capturer** agent with VIEW_NAME, URL, and navigation instructions
4. **Verify screenshots uploaded** — check that S3 URLs are accessible for the view's screenshots
5. **Verify** output file exists at `outputs/CAPTURE_{VIEW_NAME}.md` with all required sections and S3 URLs (not ephemeral `ss_*` IDs)
6. **Spot-check** component inventory has reasonable count (3+ components for simple views, 8+ for complex)
7. **Log** any issues or observations to REFLECTION_LOG.md

### Delegation Matrix

**Orchestrator Actions (Direct)**:
- Read navigation context (1-2 files)
- Spawn PAGE_CAPTURER with parameters
- Verify output file existence and section completeness
- Spot-check component counts
- Write REFLECTION_LOG entries
- Produce synthesis documents (ARCHITECTURE_*.md, COMPONENT_PATTERNS.md)
- Create phase handoff documents

**PAGE_CAPTURER Actions (Delegated)**:
- All browser navigation (5-15 tool calls per view)
- All screenshots and GIF recordings
- All layout measurements via JavaScript
- All component discovery via `read_page` and `find`
- Writing per-view capture markdown files (`outputs/CAPTURE_*.md`)

### Navigation Notes

Some views require multi-step navigation rather than direct URLs:

| View | Navigation |
|------|-----------|
| Sidebar Navigation | Hover/click icon sidebar items on workspace home |
| Workspace Header | Interact with top bar on workspace home |
| Integrations | Click Integrations in settings sidebar to expand sub-items |
| Manage > Workspaces | Click Manage in settings sidebar → Workspaces |
| Manage > Activate | Click Manage in settings sidebar → Activate |
| Workspace Members/Apps | Click Members or Apps tab on Workspace settings page |

## Cross-Cutting Synthesis Outputs

Beyond per-view captures, the spec produces synthesis documents:

### Phase 1 Output: `outputs/ARCHITECTURE_APP_SHELL.md`

Documents:
- Icon sidebar width, items, behavior (tooltips, active states, routing)
- Top navbar composition (logo, breadcrumb, workspace name, actions)
- Content area composition and how it varies between workspace home vs settings
- The orb-glow and glass-morphism CSS patterns
- Transition behavior between workspace home and settings

### Phase 5 Output: `outputs/ARCHITECTURE_SETTINGS.md`

Documents:
- Settings sidebar structure (items, expandable sections, active indicators)
- Sub-tab pattern used across General, Archives, and Workspace views
- Settings URL routing model (`/settings`, `/settings/password`, `/settings/manage/{id}`)
- Common form patterns (two-column, single-column, table, card grid)
- Common component patterns (buttons, badges, toggles, dropdowns)

### Final Output: `outputs/COMPONENT_PATTERNS.md`

Cross-references all captures to identify reusable patterns:
- Form field layouts
- Data table patterns
- Card/pricing layouts
- Action button patterns (primary red, secondary outlined)
- Badge and status indicator patterns
- Empty state patterns

## Contingency Protocol

### Authentication Issues

If Taskade session expires during capture:
1. Stop capture workflow
2. Note which views were completed
3. Re-authenticate manually
4. Resume from the next uncaptured view

### Dynamic Content

Some views show user-specific content (sessions, workspace members):
- Capture what's visible — exact data doesn't matter
- Focus on **component structure** and **layout patterns**, not data values

### GIF Recording Failures

If Chrome GIF recording fails:
1. Skip the GIF
2. Take sequential screenshots of the interaction states instead
3. Note the failure in the capture output

## KV-Cache Optimization

**Stable Prefixes** (reused across all PAGE_CAPTURER invocations):
- Agent prompt (`agents/PAGE_CAPTURER.md`) is identical for every view
- Template path is constant: `specs/pending/taskade-ui-reference-capture/templates/capture.template.md`
- Output path follows predictable pattern: `outputs/CAPTURE_{VIEW_NAME}.md`
- Parameter structure is identical: VIEW_NAME, VIEW_URL, NAV_INSTRUCTIONS, TAB_ID

**Append-Only Structures**:
- `REFLECTION_LOG.md` grows monotonically (new entries appended at bottom)
- Handoff files are created once per phase, never modified after creation
- Capture output files are written once and not updated

**Orchestrator Prompt Stability**:
- Phase prompts (P1_ORCHESTRATOR_PROMPT.md, P2_...) share >70% boilerplate
- Only the view list and phase-specific context vary between phases

## Quality Gates

Each view capture is verified against:
- [ ] Output file exists at `outputs/CAPTURE_{VIEW_NAME}.md`
- [ ] Overview section describes the view's purpose
- [ ] Layout section includes measurements and ASCII diagram
- [ ] Component inventory table has entries for all visible interactive elements
- [ ] Interactive states documented with screenshot references
- [ ] Feature mapping table links components to TodoX packages
- [ ] Implementation notes suggest shadcn components and Phosphor icons
