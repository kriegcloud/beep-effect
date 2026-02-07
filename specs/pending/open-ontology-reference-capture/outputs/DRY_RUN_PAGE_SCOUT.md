> **SUPERSEDED**: This dry-run report was generated using Chrome extension tools (Phase 0.5). The Page Scout agent has since been rewritten for Playwright MCP (Phase 0.6). Browser interaction patterns described here (ref_ids, javascript_tool, computer actions) are no longer current. Playwright equivalents are documented in `agents/PAGE_SCOUT.md`.

---

# Dry Run Feedback: Page Scout Agent

**Page scouted**: Stats
**Date**: 2026-02-07
**Agent doc**: `specs/pending/open-ontology-reference-capture/agents/PAGE_SCOUT.md`

---

## 1. What Worked Well

1. **The procedure's step ordering is logical and efficient.** Navigate -> Full Page Read -> Interactive Filter -> Screenshot -> Scroll Check -> Viewport Measure forms a natural reconnaissance pipeline. Each step builds on the prior one, and the outputs accumulate cleanly into the final report.

2. **`read_page` with `depth: 10` captured the full component tree in a single call.** For the Stats page, depth 10 was sufficient to reach React Flow internals (edges, nodes, control panel). The accessibility labels on edges (e.g., "Edge from obj-Employee to link-collaborates-on") were particularly valuable -- they provide structural graph data that is impossible to extract from screenshots alone.

3. **The `filter: "interactive"` mode cleanly isolates actionable elements.** It returned 43 interactive elements (excluding injected Claude overlay), which made the inventory tractable. The separation between full tree (Step 2) and interactive filter (Step 3) is the right design.

4. **The output format is well-structured and comprehensive.** The Component Inventory table, Sections Map, and Downstream Hints provide clearly delineated information for different consumers. The format covers what downstream agents need.

5. **Tab management via `tabs_context_mcp` then `tabs_create_mcp` worked correctly.** Creating a fresh tab avoided the stale-tab issues from prior sessions. The tab IDs were stable throughout the session.

6. **The Boundaries section was clear and helpful.** Knowing that Page Scout does NOT interact with components (no clicking, toggling) and does NOT capture states kept the scope well-defined. It prevented scope creep during the run.

## 2. What Was Unclear or Missing

1. **The wait mechanism is wrong.** The procedure says:
   > Wait 2 seconds for render (use JS: `await new Promise(r => setTimeout(r, 2000))`)

   The `javascript_tool` does NOT support top-level `await`. Executing this produces:
   ```
   SyntaxError: await is only valid in async functions and the top level bodies of modules
   ```
   The `computer` tool's `action: "wait"` with `duration: 2` is the correct approach.

2. **No guidance on what to do with injected browser extension UI.** The Claude-in-Chrome extension injects its own elements ("Claude is active in this tab group", "Open chat", "Dismiss") which appear in `read_page` output and screenshots. The procedure should explicitly state to filter these out of the component inventory.

3. **Missing page verification step.** After navigation, the procedure does not instruct the agent to verify that the correct page loaded. A simple check (confirm the page title in tab context matches expectations, e.g., "Stats - Open Ontology") would catch redirect or auth issues early.

4. **ref_id stability is not discussed.** The procedure records ref_ids for downstream use but never warns that ref_ids are ephemeral -- they change across tabs and page reloads. Downstream agents (State Capturer, Reference Builder) cannot reuse these ref_ids directly; they must call `read_page` on their own tab to get fresh ones. The report's ref_ids serve as structural reference only.

5. **No guidance for graph-heavy pages.** The Stats page contains a React Flow graph with 11 nodes and 16 edges. The procedure has no special handling for graph-based content. A "drill deeper with `ref_id`" suggestion would help agents capture the full edge inventory which only appears at higher depth.

6. **Step 4 mentions `upload_image` but does not clarify its purpose.** The procedure says to "Upload the screenshot using `upload_image` and note the file reference." However, `upload_image` uploads to a file input or drag-drop target ON a web page -- it is not a general-purpose image storage tool. The screenshot ID (e.g., `ss_1627jv15z`) returned by the `computer` tool's `screenshot` action is the file reference. No separate upload step is needed unless persisting to an external service.

7. **No classification of shared vs. page-specific components.** The header, sidebar, and theme toggle appear on every page. The procedure does not instruct the agent to classify which components are shared/global vs. page-specific, which would save downstream agents from duplicating work across multiple page scout reports.

## 3. Chrome/Browser Quirks Encountered

| Issue | Details | Impact | Workaround |
|-------|---------|--------|------------|
| `javascript_tool` no `await` | Top-level `await` is not supported in the JS execution context | Cannot use async patterns like `await new Promise(...)` | Use `computer` tool with `action: "wait"` and `duration: N` |
| Screenshot resolution mismatch | Screenshot captured at 1571x782 but viewport reports 1920x956 | Coordinate-based tools (zoom, click by coordinate) may have misaligned reference frames due to device pixel ratio | Be aware of DPR scaling; prefer ref-based interactions over coordinate-based ones |
| Pre-existing tabs from prior sessions | `tabs_context_mcp` showed 2 existing tabs from previous runs at the same URL | Could cause confusion about which tab to use | Always create a fresh tab with `tabs_create_mcp`; never reuse existing tab IDs |
| Claude overlay in screenshots | The Claude-in-Chrome notification bar ("Claude is active in this tab group") appears at the bottom of screenshots | Adds non-page content to screenshots; pollutes component inventory | Dismiss the overlay before taking screenshots, or note it as non-page content |
| Extra tab created on wait | After the `computer wait` action, a 4th tab appeared (tabId 1500476888) at chrome://newtab/ | Minor -- does not affect the target tab | Ignore phantom tabs; always use the explicitly created tab ID |

## 4. Recommendations for Improving the Agent Prompt

### R1: Fix the wait mechanism
**Current**:
```
Wait 2 seconds for render (use JS: `await new Promise(r => setTimeout(r, 2000))`)
```
**Recommended**:
```
Wait 2-3 seconds for render using `computer` tool with `action: "wait"` and `duration: 3`
```

### R2: Add page verification after navigation
Add after Step 1, item 4:
```
5. Verify navigation succeeded by checking the tab title in subsequent tool
   output matches expectations (e.g., "{PAGE_NAME} - Open Ontology").
   If the title does not match, retry navigation once.
```

### R3: Add ref_id stability warning to Output Format
Add a note block at the top of the Component Inventory section:
```
> **Note**: ref_ids are ephemeral and tied to a specific tab session.
> Downstream agents must call `read_page` on their own tab to get fresh ref_ids.
> The ref_ids in this report are for structural reference only.
```

### R4: Add filtering guidance for injected browser UI
Add to Step 2:
```
3. Filter out any browser extension UI elements from the inventory
   (e.g., Claude-in-Chrome overlay elements like "Claude is active"
   notifications, "Open chat" buttons, "Dismiss" buttons).
```

### R5: Remove or clarify the `upload_image` step
**Current (Step 4)**:
```
2. Upload the screenshot using `upload_image` and note the file reference
```
**Recommended**:
```
2. Note the screenshot ID returned by the `computer` tool (e.g., "ss_XXXXX").
   This ID serves as the file reference for the report.
   (The `upload_image` tool uploads TO a web page element, not to external storage.)
```

### R6: Add detail drill-down guidance
Add as Step 2b:
```
Step 2b: Detail Inspection (if needed)
If the full page read is truncated or a section (like a graph, table, or
nested component) needs more detail, re-read with a specific `ref_id` at
higher depth. For React Flow graphs, reading the `application` ref_id at
depth 15 will capture edge labels and node relationships.
```

### R7: Add shared vs. page-specific classification
Add to the Output Format template:
```
## Shared vs. Page-Specific Components
| Component | Classification | Notes |
|-----------|---------------|-------|
| Header bar | Shared | Appears on all pages |
| Sidebar nav | Shared | Same 19 links on all pages |
| Theme toggle | Shared | Global setting |
| Stats summary | Page-specific | Only on Stats page |
| React Flow graph | Page-specific | Stats page visualization |
```

### R8: Split the Component Inventory table
The single flat table becomes unwieldy at 40+ rows. Recommend splitting by section (Header, Sidebar, Main/Summary, Main/Graph, Graph Toolbar) with sub-tables, as done in this dry run's SCOUT_Stats.md output.

## 5. Time Estimate

| Step | Time (approx.) |
|------|----------------|
| Step 1: Navigate (tabs_context + create + navigate + wait) | 15 seconds |
| Step 2: Full Page Read (read_page depth 10) | 10 seconds |
| Step 3: Interactive Elements (read_page filter interactive) | 10 seconds |
| Step 4: Default Screenshot | 5 seconds |
| Step 5: Scroll Exploration (JS check + optional scroll screenshots) | 10 seconds |
| Step 6: Measure Viewport | 5 seconds |
| Writing the output document | 3-5 minutes (the bulk of the work) |
| **Total** | **~5-6 minutes per page** |

The tool calls themselves are fast (under 1 minute total). The majority of time is spent analyzing the `read_page` output and composing the structured report. For pages with more components (e.g., a complex form page or data table), expect 8-10 minutes.

## 6. Summary

The Page Scout agent procedure is fundamentally sound. The step ordering, output format, and boundary definitions are well-designed. The main issues are:

1. **Broken wait mechanism** -- easy fix, change JS `await` to `computer wait` action
2. **Missing `upload_image` clarification** -- the tool does not do what the procedure implies
3. **No ref_id stability warning** -- critical for downstream agent coordination
4. **No browser extension filtering guidance** -- minor but produces cleaner output
5. **No page verification step** -- defensive programming for navigation failures

All five issues have straightforward fixes documented in the Recommendations section above.
