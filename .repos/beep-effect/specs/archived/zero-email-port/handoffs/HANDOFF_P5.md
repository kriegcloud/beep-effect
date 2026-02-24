# Phase 5 Handoff: UI Components

**Date**: 2026-01-29
**From**: Phase 4 (AI Features RPC)
**To**: Phase 5 (UI Components)
**Status**: Ready for implementation

---

## Context for Phase 5

### Working Context (Current Objectives)

**Current Task**: Build React components with the View Model (VM) pattern using Effect-Atom for reactive state management.

**Success Criteria**:
- `@beep/comms-ui` package structure created
- VMRuntime and mail client configured
- InboxView component with folder navigation, search, thread list
- ThreadView component with messages and AI summary
- ComposeModal component with AI compose assist
- ConnectionManager component for OAuth account management
- SettingsPanel component for user preferences
- BrainSettings component for AI auto-label configuration
- All components follow VM pattern strictly

**Blocking Issues**: None expected - requires familiarity with VM pattern and Effect-Atom.

**Immediate Dependencies**:
- `@effect-atom/atom` and `@effect-atom/atom-react` packages
- `@beep/comms-client` RPC client wrappers (create if missing)
- `@beep/ui` for shadcn/ui components
- P2-P4 RPC contracts for client-side calls

### Episodic Context (Previous Phase Summary)

**Phase 4 Outcome**: AI-powered features were implemented using `@effect/ai`:
- LLM provider Layer with Anthropic/OpenAI configuration
- EmailAiService with composeEmail, generateSubject, summarizeThread, suggestLabels
- AI RPC contracts and handlers for compose, subject generation, search query
- Brain RPC contracts and handlers for summaries, labels, state management

**Key Decisions Made**:
1. Use `LanguageModel.LanguageModel` abstraction from `@effect/ai`
2. Structured output via `generateObject()` with Effect Schema
3. Streaming via `streamText()` returning Effect Stream
4. Graceful degradation with `catchTag` for AI errors

**Patterns Discovered**:
- Provider Layers wrap `FetchHttpClient.layer` for HTTP transport
- `Effect.fnUntraced` for service methods (cleaner traces)
- `Prompt.make()` takes array of message objects
- ThreadSummaryRepo caches AI-generated summaries

### Semantic Context (Tech Stack Constants)

**Tech Stack**:
- React 19 with `"use client"` directives
- `@effect-atom/atom` for reactive state atoms
- `@effect-atom/atom-react` for React hooks
- `@beep/ui` (shadcn/ui components)
- Effect 3, `@effect/rpc`

**Package Structure**:
```
packages/comms/ui/
  src/
    components/
      InboxView/
        InboxView.tsx
        InboxView.vm.ts
        index.ts
      ThreadView/
        ThreadView.tsx
        ThreadView.vm.ts
        index.ts
      ComposeModal/
        ComposeModal.tsx
        ComposeModal.vm.ts
        index.ts
      ConnectionManager/
        ConnectionManager.tsx
        ConnectionManager.vm.ts
        index.ts
      SettingsPanel/
        SettingsPanel.tsx
        SettingsPanel.vm.ts
        index.ts
      BrainSettings/
        BrainSettings.tsx
        BrainSettings.vm.ts
        index.ts
    lib/
      mail-client.ts
      VMRuntime.ts
    index.ts
  package.json
```

**Standards**:
- VM owns all state, components are pure renderers
- ALL formatting happens in VM (dates, numbers, strings)
- Components receive UI-ready values only
- Use `Data.TaggedEnum` for state machines
- Actions return `void`, use `Effect.runFork` internally

### Procedural Context (Reference Links)

- VM pattern skill: `.claude/skills/react-vm/SKILL.md`
- Effect-Atom: Use `mcp-researcher` for @effect-atom documentation
- Phase planning: `specs/zero-email-port/phases/P5-ui-components.md`
- UI components: `packages/ui/ui/src/components/`
- Effect patterns: `.claude/rules/effect-patterns.md`

---

## VM Pattern Overview

```
Component/
  Component.tsx      # Pure renderer, receives VM via useVM hook
  Component.vm.ts    # Interface, Tag, Layer, default export { tag, layer }
  index.ts           # Re-exports
```

**VM Rules**:
1. ALL formatting happens in VM (dates, numbers, strings)
2. Components receive UI-ready values only
3. Actions return `void`, use `Effect.runFork` internally
4. Use `Data.TaggedEnum` for state machines
5. Derived atoms use `Atom.map` or `Atom.tuple`

---

## Components to Implement

### InboxView (P5-1)

| State Atom | Type | Purpose |
|------------|------|---------|
| `state$` | `InboxState` | Loading / Loaded / Error state machine |
| `selectedFolder$` | `Folder` | Current folder selection |
| `searchQuery$` | `string` | Search input value |
| `isRefreshing$` | `boolean` | Refresh indicator |

| Action | Parameters | Effect |
|--------|------------|--------|
| `refresh` | - | Refetch current folder |
| `loadMore` | - | Pagination via cursor |
| `selectFolder` | `Folder` | Switch folders, reset cursor |
| `search` | `string` | Filter threads |
| `markAsRead` | `string[]` | Batch mark read |
| `archive` | `string[]` | Batch archive |
| `deleteThreads` | `string[]` | Batch delete |
| `star` | `string` | Toggle star |

### ThreadView (P5-2)

| State Atom | Type | Purpose |
|------------|------|---------|
| `state$` | `ThreadState` | Loading / Loaded / Error |
| `messages$` | `MessageItem[]` | Formatted message list |
| `summary$` | `Option<string>` | AI-generated summary |
| `isLoadingSummary$` | `boolean` | Summary loading indicator |

| Action | Parameters | Effect |
|--------|------------|--------|
| `loadSummary` | - | Fetch AI summary on demand |
| `reply` | `string` | Quick reply action |
| `replyAll` | `string` | Reply all |
| `forward` | `string` | Forward email |

### ComposeModal (P5-3)

| State Atom | Type | Purpose |
|------------|------|---------|
| `to$`, `cc$`, `bcc$` | `string` | Recipient fields |
| `subject$`, `body$` | `string` | Message content |
| `attachments$` | `AttachmentItem[]` | File attachments |
| `state$` | `ComposeState` | Editing / Saving / Sending / Sent / Error |
| `aiState$` | `AiState` | Idle / Generating / Suggestion |
| `canSend$` | `boolean` | Derived validation |

| Action | Parameters | Effect |
|--------|------------|--------|
| `send` | - | Send email via RPC |
| `saveDraft` | - | Save as draft |
| `discard` | - | Clear all fields |
| `aiCompose` | `string` | AI compose assist |
| `aiGenerateSubject` | - | AI subject generation |
| `acceptAiSuggestion` | - | Apply AI content |
| `rejectAiSuggestion` | - | Dismiss AI content |

### ConnectionManager (P5-4)

| State Atom | Type | Purpose |
|------------|------|---------|
| `state$` | `ConnectionsState` | Loading / Loaded / Error |
| `isConnecting$` | `boolean` | OAuth in progress |

| Action | Parameters | Effect |
|--------|------------|--------|
| `refresh` | - | Refetch connections |
| `connectGoogle` | - | Initiate Google OAuth |
| `connectOutlook` | - | Initiate Microsoft OAuth |
| `setDefault` | `string` | Set default connection |
| `disconnect` | `string` | Remove connection |

### SettingsPanel (P5-5)

| State Atom | Type | Purpose |
|------------|------|---------|
| `settings$` | `SettingsData` | User preferences |
| `hotkeys$` | `HotkeyItem[]` | Keyboard shortcuts |
| `isSaving$` | `boolean` | Save in progress |

| Action | Parameters | Effect |
|--------|------------|--------|
| `updateSetting` | `key, value` | Modify setting |
| `updateHotkey` | `key, binding` | Modify shortcut |
| `save` | - | Persist changes |
| `reset` | - | Reset to defaults |

### BrainSettings (P5-6)

| State Atom | Type | Purpose |
|------------|------|---------|
| `state$` | `BrainState` | Loading / Loaded / Error |
| `isEnabled$` | `boolean` | Derived from state |
| `labelCount$` | `string` | "3 labels configured" |
| `isSaving$` | `boolean` | Save in progress |

| Action | Parameters | Effect |
|--------|------------|--------|
| `toggle` | - | Enable/disable Brain |
| `addLabel` | `name, usecase` | Add label config |
| `updateLabel` | `key, name, usecase` | Modify label |
| `removeLabel` | `key` | Remove label |
| `saveLabels` | - | Persist label changes |

---

## VM Implementation Pattern

```typescript
import * as Atom from "@effect-atom/atom/Atom";
import { AtomRegistry } from "@effect-atom/atom/Registry";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Data from "effect/Data";

// State machine
export type InboxState = Data.TaggedEnum<{
  Loading: {}
  Loaded: { threads: readonly ThreadItem[]; hasMore: boolean }
  Error: { message: string }
}>
export const InboxState = Data.taggedEnum<InboxState>();

// VM interface
export interface InboxViewVM {
  readonly state$: Atom.Atom<InboxState>
  readonly refresh: () => void
  // ...
}

// Context tag
export const InboxViewVM = Context.GenericTag<InboxViewVM>("InboxViewVM");

// Layer implementation
const layer = Layer.effect(
  InboxViewVM,
  Effect.gen(function* () {
    const registry = yield* AtomRegistry;
    const mailClient = yield* Mail.Client;

    const state$ = Atom.make<InboxState>(InboxState.Loading());

    const refresh = () => {
      Effect.runFork(/* fetch logic */);
    };

    // Initial load
    Effect.runFork(/* initial fetch */);

    return { state$, refresh };
  })
);

export default { tag: InboxViewVM, layer };
```

---

## Component Implementation Pattern

```tsx
"use client";

import { useVM } from "../../lib/VMRuntime";
import { useAtomValue } from "@effect-atom/atom-react";
import * as Result from "@effect-atom/atom/Result";
import InboxViewVM, { InboxState } from "./InboxView.vm";
import { Button, Skeleton } from "@beep/ui";

// Child receives VM as prop
function ThreadList({ vm }: { vm: InboxViewVM }) {
  const state = useAtomValue(vm.state$);

  return InboxState.$match(state, {
    Loading: () => <Skeleton />,
    Error: ({ message }) => <div>Error: {message}</div>,
    Loaded: ({ threads }) => (
      <ul>
        {threads.map((t) => <li key={t.key}>{t.subject}</li>)}
      </ul>
    ),
  });
}

// Parent owns VM
export default function InboxView() {
  const vmResult = useVM(InboxViewVM.tag, InboxViewVM.layer);

  return Result.match(vmResult, {
    onInitial: () => <div>Loading...</div>,
    onSuccess: ({ value: vm }) => <ThreadList vm={vm} />,
    onFailure: ({ cause }) => <div>Failed: {String(cause)}</div>,
  });
}
```

---

## UI-Ready Transformations

VMs must transform domain data to UI-ready strings:

```typescript
// Date formatting (in VM)
const formatRelativeDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (days < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
};

// File size formatting (in VM)
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ThreadItem (UI-ready)
interface ThreadItem {
  readonly key: string;           // Thread ID
  readonly from: string;          // "John Doe" (not { name, email })
  readonly subject: string;       // "(No subject)" for null
  readonly preview: string;       // First 100 chars
  readonly date: string;          // "Jan 15" (not Date object)
  readonly isUnread: boolean;
  readonly hasAttachments: boolean;
  readonly isStarred: boolean;
}
```

---

## Verification Steps

After implementing each component:

```bash
# Check UI package
bun run check --filter @beep/comms-ui

# Run component tests
bun run test --filter @beep/comms-ui

# Lint
bun run lint --filter @beep/comms-ui
```

---

## Known Issues & Gotchas

1. **"use client" directive**: Required at top of component files
2. **useVM hook**: Returns `Result` that must be matched (Initial/Success/Failure)
3. **Atom imports**: `Atom` from `@effect-atom/atom/Atom`, `useAtomValue` from `@effect-atom/atom-react`
4. **Effect.runFork**: Use for fire-and-forget actions in VMs
5. **State machines**: Always use `Data.TaggedEnum` for exhaustive matching
6. **Derived atoms**: Use `Atom.map()` or `Atom.tuple()`, never raw computations

---

## Success Criteria

Phase 5 is complete when:

- [ ] `packages/comms/ui/package.json` - Package structure
- [ ] `packages/comms/ui/src/lib/VMRuntime.ts` - VM runtime setup
- [ ] `packages/comms/ui/src/lib/mail-client.ts` - RPC client instance
- [ ] `InboxView` - VM + component + index
- [ ] `ThreadView` - VM + component + index
- [ ] `ComposeModal` - VM + component + index
- [ ] `ConnectionManager` - VM + component + index
- [ ] `SettingsPanel` - VM + component + index
- [ ] `BrainSettings` - VM + component + index
- [ ] `packages/comms/ui/src/index.ts` - Barrel exports
- [ ] Type check passes: `bun run check --filter @beep/comms-ui`
- [ ] Lint passes: `bun run lint --filter @beep/comms-ui`
- [ ] `REFLECTION_LOG.md` updated with P5 learnings

---

## Agent Recommendations

| Agent | Task |
|-------|------|
| `architecture-pattern-enforcer` | Verify VM pattern compliance |
| `test-writer` | Create component tests |
| `doc-writer` | Create CLAUDE.md for comms-ui package |
