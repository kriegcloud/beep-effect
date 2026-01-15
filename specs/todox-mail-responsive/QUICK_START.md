# Quick Start

> 5-minute guide to begin fixing todox mail responsive issues.

---

## Prerequisites

1. Development server running: `bun run dev --filter @beep/todox`
2. Browser DevTools open with device toolbar enabled
3. Familiarity with MUI breakpoints and styled components

## Step 1: Verify the Issue (1 min)

1. Navigate to `http://localhost:3000/?id=mail-inbox-1`
2. Open DevTools → Toggle device toolbar
3. Select "iPhone SE" (320px) - observe email list is completely hidden
4. Select "iPad" (768px) - observe partial visibility

## Step 2: Locate the Problem (1 min)

Open `apps/todox/src/features/mail/layout.tsx`:

```typescript
// Lines 53-59: LayoutNav hidden below md
const LayoutNav = styled("div")(({ theme }) => ({
  display: "none",
  [theme.breakpoints.up("md")]: { display: "flex" },
}));

// Lines 61-69: LayoutList hidden below md
const LayoutList = styled("div")(({ theme }) => ({
  display: "none",
  [theme.breakpoints.up("md")]: { display: "flex" },
}));
```

## Step 3: Quick Fix Strategy (2 min)

The fix involves:

1. **Show LayoutList by default** - Mobile users need to see emails
2. **Hide LayoutDetails on mobile** - Detail view should be a separate screen
3. **Add drawer for LayoutNav** - Folder navigation via hamburger menu
4. **Fix truncation** - Ensure min-width for text containers

## Step 4: Begin Implementation (1 min)

Start with [P1_ORCHESTRATOR_PROMPT.md](./handoffs/P1_ORCHESTRATOR_PROMPT.md) for detailed steps.

## Key Commands

```bash
# Run todox dev server
bun run dev --filter @beep/todox

# Type check after changes
bun run check --filter @beep/todox

# Lint fix
bun run lint:fix
```

## Breakpoint Reference

| Breakpoint | Width | MUI Key |
|------------|-------|---------|
| xs | 0-599px | `xs` |
| sm | 600-899px | `sm` |
| md | 900-1199px | `md` |
| lg | 1200-1535px | `lg` |
| xl | 1536px+ | `xl` |
