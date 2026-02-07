# P11-D: Custom Features Decision Matrix

> Created: 2026-01-27
> Phase: P11-D Custom Features Evaluation

## Executive Summary

After auditing 8 custom nodes and 16 insert actions, the following decisions were made:

| Category | Count | Items |
|----------|-------|-------|
| **KEEP** | 3 | DateTimeNode, PageBreakNode, EquationNode |
| **OPTIONAL** | 4 | PollNode, ExcalidrawNode, FigmaNode, StickyNode |
| **REMOVE** | 1 | SpecialTextNode |

---

## Node Decisions

### KEEP (Business Critical)

| Node | Reasoning |
|------|-----------|
| **DateTimeNode** | Productivity-essential for scheduling/deadline features. Proper Effect usage. Calendar UI valuable for task contexts. |
| **PageBreakNode** | Essential for document layout and print support. Minimal overhead (~120 lines). |
| **EquationNode** | Important for scientific/technical documents. KaTeX is lightweight. Clean Base64 serialization. |

### OPTIONAL (Evaluate Based on Product Needs)

| Node | Reasoning | Action if Kept |
|------|-----------|----------------|
| **PollNode** | Engagement feature but adds complexity. No clear integration with core document workflow. | Refactor to use Effect Array utilities |
| **ExcalidrawNode** | Powerful but ~500KB+ dependency. ExcalidrawComponent needs splitting. | Document feature flag requirement |
| **FigmaNode** | Lower adoption, iframe-based (non-interactive). | Keep as-is, low maintenance cost |
| **StickyNode** | Nested editor complexity. Portal rendering breaks isolation. | Remove unless specific use case |

### REMOVE (Low Value)

| Node | Reasoning | Cleanup Steps |
|------|-----------|---------------|
| **SpecialTextNode** | Unclear purpose. Bracket-stripping logic incomplete. Constrains text insertion. | 1. Remove from PlaygroundNodes.ts 2. Delete SpecialTextNode.ts 3. Update imports |

---

## Insert Action Decisions

### CORE (Keep)

| Action | Pattern | Notes |
|--------|---------|-------|
| Insert Image | Modal | Essential for documents |
| Insert Table | Modal | Essential for data |
| Insert Horizontal Rule | Direct | Essential for structure |

### EXTENDED (Keep with Review)

| Action | Pattern | Notes |
|--------|---------|-------|
| Insert Equation | Modal | Valuable for technical docs |
| Insert Collapsible | Direct | Useful for FAQs/details |
| Insert Layout | Modal | Useful for columns |
| Insert Page Break | Direct | Essential for print |
| Insert YouTube | Direct | Valuable for embeds |
| Insert Tweet | Direct | Valuable for embeds |

### NICHE (Evaluate for Removal)

| Action | Pattern | Recommendation |
|--------|---------|----------------|
| Insert GIF | Direct | **REMOVE** - Redundant (hardcoded cat.gif, just use Insert Image) |
| Insert Sticky Note | Direct | **OPTIONAL** - Inconsistent implementation pattern |
| Insert DateTime | Direct | **KEEP** - Despite niche, integrates with DateTimeNode |
| Insert Excalidraw | Modal | **OPTIONAL** - Heavy dependency, consider feature flag |
| Insert Figma | Direct | **OPTIONAL** - Low adoption |
| Insert Poll | Modal | **OPTIONAL** - Engagement-focused, not core editing |

---

## Technical Debt Identified

### High Priority
1. **StickyNode nested editor serialization** - Creates data duplication
2. **ExcalidrawComponent** (200+ lines) - Should be split into smaller components
3. **PollNode Array operations** - Should use Effect Array utilities per CLAUDE.md

### Medium Priority
1. **CSS theme classes scattered** - Should consolidate into editor-theme.css
2. **Insert GIF action** - Remove hardcoded cat.gif, merge into image insertion

### Low Priority
1. **Multiple nodes use custom state** - Could use Lexical's `createState` API
2. **Modal-based actions** - Consider standardizing as a useInsertDialog hook

---

## Implementation Plan for P11-E

Based on these decisions, P11-E (Theme & CSS) should:

1. **Delete SpecialTextNode.ts** and update PlaygroundNodes.ts
2. **Remove Insert GIF action** from ToolbarPlugin
3. **Add feature flags** for optional features (Excalidraw, Poll, Figma, Sticky)
4. **Consolidate CSS** - Delete 5 old CSS files
5. **Clean up InsertContentMenu** - Remove redundant actions

---

## Metrics Summary

| Metric | Before | After Decision | Change |
|--------|--------|----------------|--------|
| Custom Nodes | 8 | 7 (-1 removed) | -12.5% |
| Insert Actions | 16 | 14 (-2 niche) | -12.5% |
| Optional Features | 0 | 4 (flagged) | +4 |
| Technical Debt Items | 6 | Documented | Tracked |
