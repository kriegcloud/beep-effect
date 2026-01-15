# todox-mail-responsive

> Fix critical responsive design issues in the `apps/todox` mail inbox feature to ensure usability across all device sizes.

---

## Purpose

The mail inbox feature in `apps/todox` has critical responsive design issues discovered during breakpoint testing:

1. **Mobile breakpoints (<600px)**: Email interface is completely inaccessible
2. **Tablet breakpoints (600-900px)**: Severe text truncation and layout issues
3. **Navigation overflow**: Horizontal scrollbar appears on smaller screens

This spec defines the fixes needed to make the mail feature fully responsive.

## Scope

**In Scope:**
- Fix mobile layout to show email list as primary content
- Add mobile-first navigation (hamburger menu, slide-out drawer)
- Fix text truncation in email list items
- Handle horizontal overflow in navigation tabs
- Ensure all breakpoints (xs, sm, md, lg, xl) are usable

**Out of Scope:**
- New mail features or functionality
- Backend/API changes
- Email detail view redesign (only layout adjustments)

## Current State

| Breakpoint | Width | Current Status | Target Status |
|------------|-------|----------------|---------------|
| **XL** | 1536px | Working | Working |
| **LG** | 1200px | Working | Working |
| **MD** | 900px | Minor issues | Working |
| **SM** | 600px | Broken - text truncation | Working |
| **XS** | 320px | **Critical** - inaccessible | Working |

### Root Cause Analysis

The issue is in `apps/todox/src/features/mail/layout.tsx`:

```typescript
// Current: LayoutNav and LayoutList hidden below md breakpoint
const LayoutNav = styled("div")(({ theme }) => ({
  display: "none",  // Hidden by default
  [theme.breakpoints.up("md")]: { display: "flex" },  // Only shows at 900px+
}));

const LayoutList = styled("div")(({ theme }) => ({
  display: "none",  // Hidden by default
  [theme.breakpoints.up("md")]: { display: "flex" },  // Only shows at 900px+
}));
```

This causes the email list to be completely hidden on mobile, while another panel (conversation) takes the full width.

## Success Criteria

- [ ] Email list visible and usable at 320px width (iPhone SE)
- [ ] Email list visible and usable at 375px width (iPhone 6/7/8)
- [ ] Email list visible and usable at 600px width (tablet)
- [ ] No horizontal scrollbar at any breakpoint
- [ ] Navigation tabs accessible at all breakpoints (collapse to menu if needed)
- [ ] Sender names and message previews readable (no severe truncation)
- [ ] `bun run check --filter @beep/todox` passes
- [ ] Visual regression testing passes at all breakpoints

## Complexity

**Level: Medium**
- Sessions: 2-3
- Files affected: ~8-10
- Agents needed: 2-3 (codebase-researcher, code-reviewer)

## Key Reference Files

| File | Purpose |
|------|---------|
| `apps/todox/src/features/mail/layout.tsx` | **Primary fix target** - breakpoint logic |
| `apps/todox/src/features/mail/mail-list.tsx` | Email list component - text truncation |
| `apps/todox/src/features/mail/mail-item.tsx` | Individual email item - truncation styles |
| `apps/todox/src/features/mail/mail-nav.tsx` | Folder navigation - drawer pattern |
| `apps/todox/src/features/mail/provider/mail-provider.tsx` | State management for responsive |
| `packages/ui/ui/src/providers/break-points.provider.tsx` | Breakpoint hook reference |

## Screenshots

Screenshots from responsive testing are saved in:
- `.playwright-mcp/breakpoint-xl-1536px.png` - Working
- `.playwright-mcp/breakpoint-lg-1200px.png` - Working
- `.playwright-mcp/breakpoint-md-900px.png` - Minor issues
- `.playwright-mcp/breakpoint-sm-600px.png` - Broken
- `.playwright-mcp/breakpoint-xs-320px.png` - Critical
- `.playwright-mcp/breakpoint-375px-iphone.png` - Critical
- `.playwright-mcp/breakpoint-768px-ipad.png` - Minor issues

## Quick Start

See [QUICK_START.md](./QUICK_START.md) for 5-minute setup.

## Full Workflow

See [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) for complete implementation steps.

## Entry Point

Begin with [P1_ORCHESTRATOR_PROMPT.md](./handoffs/P1_ORCHESTRATOR_PROMPT.md).
