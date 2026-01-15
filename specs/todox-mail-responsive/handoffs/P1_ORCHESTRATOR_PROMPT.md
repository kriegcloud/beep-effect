# P1 Orchestrator Prompt

> Entry point for Phase 1 implementation of todox mail responsive fixes.

---

## Context

You are fixing critical responsive design issues in the `apps/todox` mail inbox feature. Testing revealed that:

1. **Mobile (<600px)**: Email interface is completely inaccessible - only conversation panel shows
2. **Tablet (600-900px)**: Severe text truncation, navigation overflow
3. **Root cause**: `layout.tsx` hides LayoutNav and LayoutList below `md` breakpoint

## Your Mission

Implement Phase 1 from [MASTER_ORCHESTRATION.md](../MASTER_ORCHESTRATION.md):

1. **Fix LayoutList visibility** - Show email list by default (mobile-first)
2. **Hide LayoutDetails on mobile** - Detail view should be separate screen on mobile
3. **Consider mobile detail navigation** - Click email → navigate to detail route

## Primary Target File

`apps/todox/src/features/mail/layout.tsx`

Current breakpoint logic is inverted for mobile-first design:
- LayoutNav: `display: none` by default → shows at `md+`
- LayoutList: `display: none` by default → shows at `md+`
- LayoutDetails: `display: flex` always

Target:
- LayoutNav: Keep hidden (will use drawer in Phase 2)
- LayoutList: `display: flex` by default → fixed width at `md+`
- LayoutDetails: `display: none` by default → shows at `md+`

## Implementation Steps

### Step 1: Read Current Layout

```bash
# Read the current layout file
Read apps/todox/src/features/mail/layout.tsx
```

### Step 2: Modify LayoutList

Change from:
```typescript
const LayoutList = styled("div")(({ theme }) => ({
  display: "none",
  flex: "0 0 320px",
  // ...
  [theme.breakpoints.up("md")]: { display: "flex" },
}));
```

To:
```typescript
const LayoutList = styled("div")(({ theme }) => ({
  display: "flex",  // Mobile-first: show by default
  flex: "1 1 auto",  // Take available space on mobile
  // ...
  [theme.breakpoints.up("md")]: {
    flex: "0 0 320px",  // Fixed width on desktop
  },
}));
```

### Step 3: Modify LayoutDetails

Change from:
```typescript
const LayoutDetails = styled("div")(({ theme }) => ({
  display: "flex",
  // ...
}));
```

To:
```typescript
const LayoutDetails = styled("div")(({ theme }) => ({
  display: "none",  // Hidden on mobile
  // ...
  [theme.breakpoints.up("md")]: {
    display: "flex",  // Show on tablet+
  },
}));
```

### Step 4: Test Changes

1. Start dev server: `bun run dev --filter @beep/todox`
2. Use Playwright MCP or browser DevTools to test:
   - 320px (iPhone SE)
   - 375px (iPhone)
   - 600px (tablet)
   - 900px (tablet landscape)
   - 1200px (desktop)

### Step 5: Verify Build

```bash
bun run check --filter @beep/todox
```

## Success Criteria for Phase 1

- [ ] Email list visible at 320px width
- [ ] Email list visible at 375px width
- [ ] Email list visible at 600px width
- [ ] Detail panel shows only at 900px+
- [ ] No TypeScript errors
- [ ] Layout looks reasonable at all sizes

## What's Next

After Phase 1, proceed to Phase 2 (Navigation Drawer) in MASTER_ORCHESTRATION.md.

## Important Notes

1. **Don't break desktop**: Ensure 1200px+ still works correctly
2. **Mobile detail view**: For now, clicking an email on mobile won't show details (that's Phase 3)
3. **Update REFLECTION_LOG.md**: Document what worked and what needed adjustment

## Reference Screenshots

Check `.playwright-mcp/` for before screenshots:
- `breakpoint-xs-320px.png` - Current broken state
- `breakpoint-sm-600px.png` - Current broken state
- `breakpoint-lg-1200px.png` - Target working state
