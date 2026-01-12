# Todox View Switcher: Quick Start

> 5-minute guide to implementing the view switcher.

---

## Goal

Make the ToggleGroup in `apps/todox/src/app/page.tsx` actually switch between different views.

---

## Current State

```tsx
// page.tsx:103 - State exists but isn't used
const [viewMode, setViewMode] = React.useState<string[]>(["email"]);

// page.tsx:182-184 - Only MailContent renders, ignoring viewMode
<MailProvider>
  <MailContent />
</MailProvider>
```

---

## Minimal Fix (5 minutes)

### Step 1: Change State to Single Select

```tsx
// Before
const [viewMode, setViewMode] = React.useState<string[]>(["email"]);

// After
const [viewMode, setViewMode] = React.useState<string>("email");
```

### Step 2: Update onChange Handler

```tsx
// Before
onValueChange={(value) => {
  if (value.length > 0) setViewMode(value);
}}

// After
onValueChange={(value) => {
  if (value) setViewMode(value);
}}
```

### Step 3: Remove Duplicate Calendar (lines 170-173)

Delete this block:
```tsx
<ToggleGroupItem value="calendar" className="gap-1.5 px-3">
  <CalendarIcon className="size-3.5" />
  Calendar
</ToggleGroupItem>
```

### Step 4: Add Conditional Rendering

```tsx
{/* Replace static MailProvider/MailContent with: */}
{viewMode === "email" ? (
  <MailProvider>
    <MailContent />
  </MailProvider>
) : (
  <div className="flex flex-1 items-center justify-center">
    <p className="text-muted-foreground">
      {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} view coming soon
    </p>
  </div>
)}
```

---

## Verification

```bash
bun run check
```

Then run dev server and click toggle buttons - view should switch.

---

## Next Steps

See [README.md](./README.md) for full implementation plan including:
- Proper ViewSwitcher component
- Type-safe view mode union
- Placeholder components per view
- View state preservation
