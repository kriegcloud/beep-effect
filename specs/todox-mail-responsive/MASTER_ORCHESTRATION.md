# Master Orchestration

> Complete workflow for fixing todox mail responsive issues.

---

## Overview

This spec fixes critical responsive design issues in the mail inbox feature. The implementation follows a mobile-first approach, ensuring the email list is accessible on all devices.

## Phase 1: Layout Restructure

### Task 1.1: Fix LayoutList Visibility

**File**: `apps/todox/src/features/mail/layout.tsx`

**Current Code** (lines 61-69):
```typescript
const LayoutList = styled("div")(({ theme }) => ({
  display: "none",
  flex: "0 0 320px",
  overflow: "hidden",
  flexDirection: "column",
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: theme.vars.palette.background.default,
  [theme.breakpoints.up("md")]: { display: "flex" },
}));
```

**Target Code**:
```typescript
const LayoutList = styled("div")(({ theme }) => ({
  display: "flex",  // Show by default (mobile-first)
  flex: "1 1 auto",  // Take available space on mobile
  overflow: "hidden",
  flexDirection: "column",
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: theme.vars.palette.background.default,
  [theme.breakpoints.up("md")]: {
    flex: "0 0 320px",  // Fixed width on desktop
  },
}));
```

### Task 1.2: Hide LayoutDetails on Mobile

**File**: `apps/todox/src/features/mail/layout.tsx`

**Current Code** (lines 71-79):
```typescript
const LayoutDetails = styled("div")(({ theme }) => ({
  minWidth: 0,
  display: "flex",
  flex: "1 1 auto",
  overflow: "hidden",
  flexDirection: "column",
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: theme.vars.palette.background.default,
}));
```

**Target Code**:
```typescript
const LayoutDetails = styled("div")(({ theme }) => ({
  minWidth: 0,
  display: "none",  // Hidden by default (mobile)
  flex: "1 1 auto",
  overflow: "hidden",
  flexDirection: "column",
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: theme.vars.palette.background.default,
  [theme.breakpoints.up("md")]: {
    display: "flex",  // Show on tablet and up
  },
}));
```

### Task 1.3: Add Mobile Detail View Route

On mobile, clicking an email should navigate to a detail view. This requires:

1. **Create mobile detail route**: `apps/todox/src/app/mail/[id]/page.tsx`
2. **Update mail-item click handler**: Navigate on mobile, show panel on desktop
3. **Use breakpoint hook**: `useBreakpoints()` from `@beep/ui`

---

## Phase 2: Navigation Drawer

### Task 2.1: Implement Drawer Component

**File**: `apps/todox/src/features/mail/mail-nav-drawer.tsx` (new file)

Create a slide-out drawer for folder navigation on mobile:

```typescript
"use client";

import { Drawer } from "@mui/material";
import { useBreakpoints } from "@beep/ui/providers";
import { MailNav } from "./mail-nav";

interface MailNavDrawerProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly children: React.ReactNode;
}

export function MailNavDrawer({ open, onClose, children }: MailNavDrawerProps) {
  const { down } = useBreakpoints();
  const isMobile = down("md");

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 280 },
      }}
    >
      {children}
    </Drawer>
  );
}
```

### Task 2.2: Add Hamburger Menu Button

**File**: `apps/todox/src/features/mail/mail-header.tsx`

Add a menu button that triggers the drawer on mobile:

```typescript
// Add to imports
import { IconButton } from "@mui/material";
import { Menu as MenuIcon } from "lucide-react";
import { useBreakpoints } from "@beep/ui/providers";

// Add state to parent or use context
const { down } = useBreakpoints();
const isMobile = down("md");

// Add button (conditionally rendered)
{isMobile && (
  <IconButton onClick={onMenuClick} aria-label="Open navigation">
    <MenuIcon />
  </IconButton>
)}
```

### Task 2.3: Wire Up Drawer State

**File**: `apps/todox/src/features/mail/provider/mail-provider.tsx`

Add drawer state to the mail context:

```typescript
// Add to context
interface MailContextValue {
  // ... existing
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}
```

---

## Phase 3: Text Truncation Fixes

### Task 3.1: Fix Email Item Truncation

**File**: `apps/todox/src/features/mail/mail-item.tsx`

Ensure sender name and preview have minimum readable widths:

```typescript
// Sender name container
<Box sx={{
  minWidth: 80,  // Minimum width for readability
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
}}>
  {sender}
</Box>

// Preview text
<Typography
  variant="body2"
  sx={{
    minWidth: 100,  // Minimum width for preview
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }}
>
  {preview}
</Typography>
```

### Task 3.2: Responsive List Item Layout

Consider a stacked layout on mobile vs horizontal on desktop:

```typescript
<Box sx={(theme) => ({
  display: "flex",
  flexDirection: "column",  // Stack on mobile
  [theme.breakpoints.up("sm")]: {
    flexDirection: "row",  // Horizontal on tablet+
  },
})}>
```

---

## Phase 4: Navigation Tab Overflow

### Task 4.1: Collapse Tabs to Menu on Mobile

**File**: `apps/todox/src/components/navigation-tabs.tsx` (or equivalent)

Options:
1. **Horizontal scroll**: Add `overflow-x: auto` with hidden scrollbar
2. **Dropdown menu**: Collapse tabs into a "More" menu
3. **Icon-only**: Show icons only on mobile, full labels on desktop

Recommended: Horizontal scroll with snap points:

```typescript
<Box sx={{
  display: "flex",
  overflowX: "auto",
  scrollSnapType: "x mandatory",
  "&::-webkit-scrollbar": { display: "none" },
  msOverflowStyle: "none",
  scrollbarWidth: "none",
}}>
  {tabs.map(tab => (
    <Box key={tab.id} sx={{ scrollSnapAlign: "start", flexShrink: 0 }}>
      {tab.content}
    </Box>
  ))}
</Box>
```

---

## Phase 5: Validation

### Task 5.1: Visual Testing

Use Playwright MCP to test all breakpoints:

```bash
# Test each breakpoint
320px  - iPhone SE
375px  - iPhone 6/7/8/X
600px  - Small tablet
768px  - iPad portrait
900px  - iPad landscape
1200px - Desktop
1536px - Large desktop
```

Verify:
- [ ] Email list visible at all sizes
- [ ] Navigation accessible (drawer on mobile, sidebar on desktop)
- [ ] Text readable (no severe truncation)
- [ ] No horizontal scrollbar
- [ ] Detail view works (panel on desktop, route on mobile)

### Task 5.2: Type Checking

```bash
bun run check --filter @beep/todox
```

### Task 5.3: Lint

```bash
bun run lint:fix
```

---

## Completion Checklist

- [ ] Phase 1: Layout restructure complete
- [ ] Phase 2: Navigation drawer implemented
- [ ] Phase 3: Text truncation fixed
- [ ] Phase 4: Navigation tab overflow handled
- [ ] Phase 5: All breakpoints validated
- [ ] Type checking passes
- [ ] Lint passes
- [ ] REFLECTION_LOG.md updated with learnings
