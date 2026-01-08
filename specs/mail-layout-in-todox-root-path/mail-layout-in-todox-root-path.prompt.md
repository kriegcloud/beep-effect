---
name: mail-layout-in-todox-root-path
version: 1
created: 2026-01-08T00:00:00Z
iterations: 1
---

# Mail Layout Integration to TodoX Root Path - Refined Prompt

## Context

The TodoX application currently has a standalone mail view at `/features/mail/view/mail-view.tsx` that uses Material UI's custom layout system. The main application page (`/app/page.tsx`) has a new layout structure using shadcn/ui's Sidebar components with a MainContentPanelSidebar.

The MainContentPanelSidebar component (`/components/sidebar/main-content-panel-sidebar.tsx`) was created as a temporary solution and currently contains mail-specific state management logic that should be extracted into a proper provider.

**Current State**:
- Mail view is self-contained with MUI-based `MailLayout` component
- Main page has placeholder content (three aspect-video boxes and a large muted box)
- MainContentPanelSidebar has embedded mail state management (lines 142-205)
- Existing provider patterns in the codebase: `SidePanelProvider`, `MiniSidebarProvider`

**Desired State**:
- `MailList` and `MailDetails` components integrated into the main content panel of `/app/page.tsx`
- Mail-specific state management extracted to a new `MailProvider` component
- `MailNav` remains in the sidebar via MainContentPanelSidebar
- Clean separation of concerns following existing provider patterns

## Objective

Refactor the mail feature to integrate with the root page layout by:

1. Creating a `MailProvider` context component that manages all mail-related state
2. Replacing placeholder content in `/app/page.tsx` with `MailList` and `MailDetails` components
3. Cleaning up `MainContentPanelSidebar` to consume mail state from the provider
4. Maintaining all existing functionality (navigation, composition, search params, responsive behavior)

**Success Criteria**:
- Mail list and details render in the main content area of `/app/page.tsx`
- All mail state is managed by the new `MailProvider`
- No functionality is lost (label navigation, mail selection, compose toggle, responsive drawers)
- Provider follows the same pattern as `SidePanelProvider` (context validation, memoized values)
- Note: Unlike `SidePanelProvider`, this provider does NOT need localStorage persistence as mail state is derived from URL search params
- TypeScript strict mode with no errors
- All existing hooks and behavior preserved

**Scope Boundaries**:
- IN SCOPE: State extraction, provider creation, component integration
- OUT OF SCOPE: Changing mail functionality, styling modifications, new features
- DO NOT modify: `MailList`, `MailDetails`, `MailNav`, `MailCompose` component internals

## Role

You are a senior React/Next.js engineer with expertise in:
- React Context API and provider patterns
- Next.js 16 App Router patterns (useRouter, usePathname, useSearchParams)
- Component composition and state management
- TypeScript with strict mode
- Refactoring without breaking existing functionality

**Behavioral Expectations**:
- Analyze the existing code thoroughly before making changes
- Follow established patterns from `SidePanelProvider` (context validation, memoization)
- Use TypeScript readonly types for context values
- Preserve all existing callbacks with useCallback
- Maintain responsive behavior (mdUp breakpoint logic)
- No hydration concerns: state is derived from URL, not localStorage

## Constraints

### Forbidden Patterns
- Relative imports (`../../../`) - use `@beep/todox/*` path aliases
- Unnecessary localStorage access (mail state is URL-based, not persisted)
- Mutable context values (always use `readonly`)
- Context usage without proper validation
- Inline functions in context value (must use useCallback/useMemo)
- Any modifications to MUI-based mail components

### Required Patterns
- Provider pattern from `apps/todox/src/components/side-panel/side-panel.tsx` (context validation, memoization)
- Path aliases: `@beep/todox/*` for all internal imports
- Context validation: throw error if used outside provider
- Memoized context values with useMemo
- Callbacks with useCallback and proper dependencies
- Export pattern: named exports in component file + barrel export in index.ts
- No localStorage needed: mail state is URL-based (search params)

### File Organization
```
apps/todox/src/features/mail/
├── provider/
│   ├── mail-provider.tsx      # New: Context + Provider + Hook
│   └── index.ts               # New: Barrel export
├── view/
│   └── mail-view.tsx          # Remove or repurpose
├── mail-list.tsx
├── mail-details.tsx
├── mail-nav.tsx
└── mail-compose.tsx
```

## Resources

### Files to Read/Modify

**Read for Pattern Reference**:
- `/home/elpresidank/YeeBois/projects/beep-effect/apps/todox/src/components/side-panel/side-panel.tsx` - Provider pattern template
- `/home/elpresidank/YeeBois/projects/beep-effect/apps/todox/src/components/mini-sidebar/mini-sidebar.tsx` - Alternative provider example

**Modify**:
- `/home/elpresidank/YeeBois/projects/beep-effect/apps/todox/src/components/sidebar/main-content-panel-sidebar.tsx` - Remove state, consume from provider
- `/home/elpresidank/YeeBois/projects/beep-effect/apps/todox/src/app/page.tsx` - Replace placeholder with mail components

**Create**:
- `/home/elpresidank/YeeBois/projects/beep-effect/apps/todox/src/features/mail/provider/mail-provider.tsx` - New provider
- `/home/elpresidank/YeeBois/projects/beep-effect/apps/todox/src/features/mail/provider/index.ts` - Barrel export

### State to Extract

From `main-content-panel-sidebar.tsx` (lines 142-205):

```typescript
// Hooks (lines 142-151)
const router = useRouter()
const pathname = usePathname()
const searchParams = useSearchParams()
const selectedLabelId = searchParams.get("label") ?? LABEL_INDEX
const selectedMailId = searchParams.get("id") ?? ""
const openNav = useBoolean()
const openMail = useBoolean()
const openCompose = useBoolean()
const { labels, labelsLoading, labelsEmpty } = useGetLabels()
const { mails } = useGetMails(selectedLabelId)
const firstMailId = mails.allIds[0] || ""
const mdUp = useMediaQuery((theme) => theme.breakpoints.up("md"))

// Callbacks (lines 157-199)
const handleToggleCompose = useCallback(...)
const handleClickLabel = useCallback(...)
const handleClickMail = useCallback(...)

// Effect (lines 201-205)
useEffect(() => {
  if (!selectedMailId && firstMailId) {
    handleClickMail(firstMailId)
  }
}, [firstMailId, handleClickMail, selectedMailId])
```

### Key Dependencies

```typescript
// Hooks from @beep/ui
import { useBoolean, usePathname, useRouter, useSearchParams } from "@beep/ui/hooks"

// MUI hooks
import useMediaQuery from "@mui/material/useMediaQuery"

// Mail actions
import { useGetLabels, useGetMail, useGetMails } from "@beep/todox/actions/mail"

// React hooks
import { startTransition, useCallback, useEffect, useMemo, useState } from "react"
```

## Output Specification

### 1. Create Mail Provider

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/apps/todox/src/features/mail/provider/mail-provider.tsx`

```typescript
"use client"

import type * as React from "react"
import type { IMail, IMailLabel, IMails } from "@beep/mock/_mail"
import { useBoolean, usePathname, useRouter, useSearchParams } from "@beep/ui/hooks"
import useMediaQuery from "@mui/material/useMediaQuery"
import { useGetLabels, useGetMail, useGetMails } from "@beep/todox/actions/mail"
import { startTransition, useCallback, useEffect, useMemo, useState } from "react"

const LABEL_INDEX = "inbox"

// ============================================================================
// MailProvider - Manages mail state and navigation
// ============================================================================

type MailContextValue = {
  readonly mounted: boolean
  readonly selectedLabelId: string
  readonly selectedMailId: string
  readonly openNav: {
    readonly value: boolean
    readonly onTrue: () => void
    readonly onFalse: () => void
    readonly onToggle: () => void
  }
  readonly openMail: {
    readonly value: boolean
    readonly onTrue: () => void
    readonly onFalse: () => void
    readonly onToggle: () => void
  }
  readonly openCompose: {
    readonly value: boolean
    readonly onTrue: () => void
    readonly onFalse: () => void
    readonly onToggle: () => void
  }
  readonly labels: IMailLabel[]
  readonly labelsLoading: boolean
  readonly labelsEmpty: boolean
  readonly mails: IMails
  readonly mailsLoading: boolean
  readonly mailsEmpty: boolean
  readonly mail: IMail | undefined
  readonly mailLoading: boolean
  readonly mailError: Error | undefined
  readonly handleToggleCompose: () => void
  readonly handleClickLabel: (labelId: string) => void
  readonly handleClickMail: (mailId: string) => void
}

const MailContext = React.createContext<MailContextValue | null>(null)

export function useMail() {
  const context = React.useContext(MailContext)
  if (!context) {
    throw new Error("useMail must be used within a MailProvider.")
  }
  return context
}

interface MailProviderProps {
  readonly children: React.ReactNode
}

export function MailProvider({ children }: MailProviderProps) {
  // Implement all state management from main-content-panel-sidebar.tsx
  // Pattern to follow:
  // 1. useState for mounted (set to true immediately, no localStorage)
  // 2. All hooks from main-content-panel-sidebar.tsx lines 142-151
  // 3. useCallback for all handlers (lines 157-199)
  // 4. useEffect for auto-select first mail (lines 201-205)
  // 5. useMemo for context value

  // Key implementation notes:
  // - NO localStorage (state is URL-based via search params)
  // - Preserve all existing logic exactly as-is
  // - Maintain all dependency arrays in useCallback/useEffect
  // - Use startTransition for router.push calls

  // ... implementation

  return <MailContext.Provider value={contextValue}>{children}</MailContext.Provider>
}
```

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/apps/todox/src/features/mail/provider/index.ts`

```typescript
export { MailProvider, useMail, type MailContextValue } from "./mail-provider"
```

### 2. Update MainContentPanelSidebar

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/apps/todox/src/components/sidebar/main-content-panel-sidebar.tsx`

Remove all state management (lines 142-205) and replace with:

```typescript
import { useMail } from "@beep/todox/features/mail/provider"

export function MainContentPanelSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
  const {
    labels,
    labelsLoading,
    labelsEmpty,
    openNav,
    selectedLabelId,
    handleClickLabel,
    handleToggleCompose,
  } = useMail()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarContent>
        <MailNav
          labels={labels}
          isEmpty={labelsEmpty}
          loading={labelsLoading}
          openNav={openNav.value}
          onCloseNav={openNav.onFalse}
          selectedLabelId={selectedLabelId}
          onClickLabel={handleClickLabel}
          onToggleCompose={handleToggleCompose}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user}/>
      </SidebarFooter>
      <SidebarRail/>
    </Sidebar>
  )
}
```

### 3. Update Main Page

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/apps/todox/src/app/page.tsx`

Wrap the main content area with `MailProvider` and replace placeholder content:

```typescript
import { MailProvider } from "@beep/todox/features/mail/provider"
import { MailList } from "@beep/todox/features/mail/mail-list"
import { MailDetails } from "@beep/todox/features/mail/mail-details"
import { MailCompose } from "@beep/todox/features/mail/mail-compose"
import { useMail } from "@beep/todox/features/mail/provider"

function MailContent() {
  const {
    mails,
    mailsEmpty,
    mailsLoading,
    openMail,
    selectedLabelId,
    selectedMailId,
    mail,
    mailLoading,
    mailError,
    labels,
    openCompose,
    handleClickMail,
  } = useMail()

  return (
    <>
      <div className="flex min-h-0 flex-1">
        <MainContentPanelSidebar fixed={false} />
        <SidebarInset className="bg-sidebar">
          {/* Replace placeholder content with mail components */}
          <div className="flex min-h-0 flex-1">
            <MailList
              mails={mails}
              isEmpty={mailsEmpty}
              loading={mailsLoading}
              openMail={openMail.value}
              onCloseMail={openMail.onFalse}
              onClickMail={handleClickMail}
              selectedLabelId={selectedLabelId}
              selectedMailId={selectedMailId}
            />
            <MailDetails
              mail={mail}
              error={mailError?.message}
              loading={mailsLoading || mailLoading}
              renderLabel={(id: string) => labels.find((label) => label.id === id)}
            />
          </div>
        </SidebarInset>
      </div>

      {openCompose.value && <MailCompose onCloseCompose={openCompose.onFalse} />}
    </>
  )
}

function MainContent() {
  const { open: chatOpen } = useSidePanel()
  const [viewMode, setViewMode] = React.useState<string[]>(["email"])

  return (
    <>
      {/* AI Chat Panel */}
      <SidePanel width={AI_CHAT_WIDTH} className="p-2">
        <AIChatPanel />
      </SidePanel>

      {/* Main Content Panel Wrapper */}
      <div className={cn("flex flex-1 p-2", chatOpen && "pl-0")}>
        <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-sidebar-border bg-sidebar shadow-sm">
          <SidebarProvider
            style={{ "--sidebar-width": "17rem" } as React.CSSProperties}
            className="min-h-0 flex-1 flex-col"
          >
            {/* Panel Header */}
            <header className="flex h-12 shrink-0 items-center gap-2 border-b border-sidebar-border px-3">
              {/* ... existing header content ... */}
            </header>

            {/* Wrap content with MailProvider */}
            <MailProvider>
              <MailContent />
            </MailProvider>
          </SidebarProvider>
        </div>
      </div>
    </>
  )
}

export default function Page() {
  return (
    <MiniSidebarProvider>
      <SidePanelProvider>
        <div className="flex h-svh w-full flex-col bg-background">
          <TopNavbar user={user} />
          <div className="flex min-h-0 flex-1">
            <MainContent />
          </div>
        </div>
      </SidePanelProvider>
    </MiniSidebarProvider>
  )
}
```

### 4. Layout Considerations

The integration should result in a layout structure like:

```
Page (providers: MiniSidebar, SidePanel)
└─ MainContent (provider: MailProvider)
   ├─ SidePanel (AI Chat)
   └─ Main Content Panel
      ├─ Header (SidebarTrigger, ToggleGroup)
      └─ Sidebar + Content
         ├─ MainContentPanelSidebar (MailNav consuming MailProvider)
         └─ SidebarInset
            ├─ MailList (consuming MailProvider)
            └─ MailDetails (consuming MailProvider)
```

## Verification Checklist

- [ ] `MailProvider` created following `SidePanelProvider` pattern exactly
- [ ] All mail state extracted from `MainContentPanelSidebar` to provider
- [ ] `MainContentPanelSidebar` successfully consumes provider via `useMail()` hook
- [ ] `MailList` and `MailDetails` integrated into `/app/page.tsx` main content area
- [ ] All existing functionality preserved:
  - [ ] Label navigation via sidebar
  - [ ] Mail selection and detail view
  - [ ] Compose toggle
  - [ ] Search parameter sync
  - [ ] Responsive drawer behavior (mdUp breakpoint)
  - [ ] Auto-select first mail when none selected
- [ ] Provider properly wrapped around content in correct location
- [ ] All imports use `@beep/todox/*` path aliases
- [ ] TypeScript strict mode passes with no errors
- [ ] No console errors or warnings
- [ ] Hydration-safe (no SSR/client mismatches)

---

## Metadata

### Research Sources

**Files Explored**:
- `/home/elpresidank/YeeBois/projects/beep-effect/apps/todox/src/features/mail/view/mail-view.tsx` - Current mail implementation with state
- `/home/elpresidank/YeeBois/projects/beep-effect/apps/todox/src/app/page.tsx` - Target integration location
- `/home/elpresidank/YeeBois/projects/beep-effect/apps/todox/src/components/sidebar/main-content-panel-sidebar.tsx` - State to extract
- `/home/elpresidank/YeeBois/projects/beep-effect/apps/todox/src/components/side-panel/side-panel.tsx` - Provider pattern reference
- `/home/elpresidank/YeeBois/projects/beep-effect/apps/todox/src/features/mail/mail-list.tsx` - Component props interface
- `/home/elpresidank/YeeBois/projects/beep-effect/apps/todox/src/features/mail/mail-details.tsx` - Component props interface
- `/home/elpresidank/YeeBois/projects/beep-effect/apps/todox/src/features/mail/layout.tsx` - Current MUI layout (to be replaced)

**Package Guidelines**:
- `/home/elpresidank/YeeBois/projects/beep-effect/apps/todox/AGENTS.md` - TodoX-specific patterns and constraints

### Refinement History

| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0         | Initial draft | N/A          |
| 1         | Type definitions incomplete; localStorage confusion | Added explicit imports for IMail, IMailLabel, IMails; Clarified NO localStorage needed (URL-based state); Added implementation notes in provider template |
