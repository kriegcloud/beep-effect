# Todox View Switcher Handoff - Phase 1

> Foundation phase: Wire up ToggleGroup to conditionally render views.

---

## Context

The `page.tsx` in `apps/todox` has a ToggleGroup component with 10 view options, but the selection doesn't affect what's rendered. This phase fixes the fundamental wiring.

**File**: `apps/todox/src/app/page.tsx`

---

## Phase 1 Tasks

### Task 1.1: Remove Duplicate Calendar Entry

**Location**: Lines 170-173

**Action**: Delete this entire block:
```tsx
<ToggleGroupItem value="calendar" className="gap-1.5 px-3">
  <CalendarIcon className="size-3.5" />
  Calendar
</ToggleGroupItem>
```

### Task 1.2: Define ViewMode Type

**Location**: Before the `MainContent` function (around line 101)

**Add**:
```tsx
type ViewMode =
  | "workspace"
  | "calendar"
  | "email"
  | "knowledge-base"
  | "todos"
  | "people"
  | "tasks"
  | "files"
  | "heat-map";
```

### Task 1.3: Refactor State to Single Select

**Location**: Line 103

**Before**:
```tsx
const [viewMode, setViewMode] = React.useState<string[]>(["email"]);
```

**After**:
```tsx
const [viewMode, setViewMode] = React.useState<ViewMode>("email");
```

### Task 1.4: Update onChange Handler

**Location**: Lines 131-133

**Before**:
```tsx
onValueChange={(value) => {
  if (value.length > 0) setViewMode(value);
}}
```

**After**:
```tsx
onValueChange={(value) => {
  if (value) setViewMode(value as ViewMode);
}}
```

### Task 1.5: Update ToggleGroup Props

**Location**: Line 130

**Before**:
```tsx
value={viewMode}
```

**After**:
```tsx
type="single"
value={viewMode}
```

### Task 1.6: Add Conditional Rendering

**Location**: Lines 181-185

**Before**:
```tsx
{/* Wrap mail content with MailProvider */}
<MailProvider>
  <MailContent />
</MailProvider>
```

**After**:
```tsx
{/* Conditional view rendering */}
{viewMode === "email" ? (
  <MailProvider>
    <MailContent />
  </MailProvider>
) : (
  <PlaceholderView viewMode={viewMode} />
)}
```

### Task 1.7: Create PlaceholderView Component

**Prerequisites**: Create components directory if it doesn't exist:
```bash
mkdir -p apps/todox/src/components
```

**New File**: `apps/todox/src/components/placeholder-view.tsx`

```tsx
interface PlaceholderViewProps {
  viewMode: string;
}

export function PlaceholderView({ viewMode }: PlaceholderViewProps) {
  const formattedName = viewMode
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
      <div className="text-4xl opacity-50">
        {getViewIcon(viewMode)}
      </div>
      <div className="text-center">
        <h2 className="text-lg font-medium">{formattedName}</h2>
        <p className="text-sm">Coming soon</p>
      </div>
    </div>
  );
}

function getViewIcon(viewMode: string): string {
  const icons: Record<string, string> = {
    workspace: "🖥️",
    calendar: "📅",
    "knowledge-base": "🧠",
    todos: "✅",
    people: "👥",
    tasks: "📋",
    files: "📁",
    "heat-map": "📊",
  };
  return icons[viewMode] ?? "📄";
}
```

### Task 1.8: Add Import

**Location**: Top of `page.tsx` (around line 14)

**Add**:
```tsx
import { PlaceholderView } from "@beep/todox/components/placeholder-view";
```

---

## Verification

```bash
# Type check
bun run check

# Dev server
cd apps/todox && bun run dev
```

**Manual Test**:
1. Load the app
2. Click each toggle button
3. Verify email shows MailContent
4. Verify other views show placeholder

---

## Success Criteria

- [ ] No TypeScript errors
- [ ] Duplicate calendar removed (only 9 toggle items)
- [ ] Clicking toggles changes the view
- [ ] Email view still works with full functionality
- [ ] Other views show placeholder message

---

## Notes for Phase 2

Phase 2 will create proper feature directories for each view with their own providers and content components. The placeholder pattern established here will be replaced incrementally.
