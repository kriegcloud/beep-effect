# Phase 5 Orchestrator Prompt

Copy-paste this prompt to start Phase 5 implementation.

---

## Pre-Flight Checklist

Before executing this phase, verify all prior phases are complete:

- [ ] P2 RPC contracts exist in `packages/comms/domain/src/rpc/v1/{connections,mail,drafts,labels}/`
- [ ] P3 RPC contracts exist in `packages/comms/domain/src/rpc/v1/{templates,notes,shortcuts,settings}/`
- [ ] P4 RPC contracts exist in `packages/comms/domain/src/rpc/v1/{ai,brain}/`
- [ ] `CommsRpcsLive` includes all RPC groups from P2-P4
- [ ] `LlmLive` and `EmailAiService` are configured
- [ ] `REFLECTION_LOG.md` contains Phase 4 learnings

If prior phase artifacts are missing, complete them before proceeding.

---

## Prompt

You are implementing Phase 5 of the Zero Email Port spec.

### Context

Phases 1-4 completed all backend infrastructure: email drivers, core email RPC, user features RPC, and AI features RPC. Now we implement the React UI layer using the View Model (VM) pattern with Effect-Atom.

This phase requires understanding of:
- VM pattern from `.claude/skills/react-vm/SKILL.md`
- `@effect-atom/atom` reactive state management
- `Data.TaggedEnum` for state machines
- UI-ready transformations in VMs

### Your Mission

Build React components with the VM pattern for the email client UI.

**Work Items**:
1. Create `@beep/comms-ui` package structure
2. Set up VMRuntime and mail client
3. Implement InboxView (folder navigation, search, thread list)
4. Implement ThreadView (messages, AI summary)
5. Implement ComposeModal (AI compose assist)
6. Implement ConnectionManager (OAuth accounts)
7. Implement SettingsPanel (user preferences)
8. Implement BrainSettings (AI auto-label config)

### Critical Patterns

**VM File Structure**:
```
ComponentName/
  ComponentName.tsx     # Pure renderer
  ComponentName.vm.ts   # State + actions
  index.ts              # Re-exports
```

**VM State Machine Pattern**:
```typescript
import * as Data from "effect/Data";

export type InboxState = Data.TaggedEnum<{
  Loading: {}
  Loaded: { threads: readonly ThreadItem[]; hasMore: boolean }
  Error: { message: string }
}>
export const InboxState = Data.taggedEnum<InboxState>();
```

**VM Service Pattern**:
```typescript
import * as Atom from "@effect-atom/atom/Atom";
import { AtomRegistry } from "@effect-atom/atom/Registry";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export interface InboxViewVM {
  readonly state$: Atom.Atom<InboxState>
  readonly refresh: () => void
}

export const InboxViewVM = Context.GenericTag<InboxViewVM>("InboxViewVM");

const layer = Layer.effect(
  InboxViewVM,
  Effect.gen(function* () {
    const registry = yield* AtomRegistry;
    const mailClient = yield* Mail.Client;

    const state$ = Atom.make<InboxState>(InboxState.Loading());

    const refresh = () => {
      registry.set(state$, InboxState.Loading());
      Effect.runFork(/* fetch effect */);
    };

    return { state$, refresh };
  })
);

export default { tag: InboxViewVM, layer };
```

**Component Pattern**:
```tsx
"use client";

import { useVM } from "../../lib/VMRuntime";
import { useAtomValue } from "@effect-atom/atom-react";
import * as Result from "@effect-atom/atom/Result";
import InboxViewVM, { InboxState } from "./InboxView.vm";

export default function InboxView() {
  const vmResult = useVM(InboxViewVM.tag, InboxViewVM.layer);

  return Result.match(vmResult, {
    onInitial: () => <div>Loading...</div>,
    onSuccess: ({ value: vm }) => <InboxContent vm={vm} />,
    onFailure: ({ cause }) => <div>Failed: {String(cause)}</div>,
  });
}

function InboxContent({ vm }: { vm: InboxViewVM }) {
  const state = useAtomValue(vm.state$);

  return InboxState.$match(state, {
    Loading: () => <Skeleton />,
    Error: ({ message }) => <div>Error: {message}</div>,
    Loaded: ({ threads }) => <ThreadList threads={threads} />,
  });
}
```

**UI-Ready Transformations (VM responsibility)**:
```typescript
// ThreadItem interface - UI-ready
interface ThreadItem {
  readonly key: string;      // Thread ID
  readonly from: string;     // "John Doe" (formatted)
  readonly subject: string;  // "(No subject)" for null
  readonly date: string;     // "Jan 15" (formatted)
  readonly isUnread: boolean;
}

// Transform in VM, not component
const toThreadItem = (thread: ApiThread): ThreadItem => ({
  key: thread.id,
  from: thread.sender?.name ?? thread.sender?.email ?? "Unknown",
  subject: thread.subject ?? "(No subject)",
  date: formatRelativeDate(thread.receivedAt),
  isUnread: !thread.isRead,
});
```

### Reference Files

- Phase plan: `specs/zero-email-port/phases/P5-ui-components.md`
- VM pattern skill: `.claude/skills/react-vm/SKILL.md`
- UI components: `packages/ui/ui/src/components/`
- Effect patterns: `.claude/rules/effect-patterns.md`
- @effect-atom docs: Use `/mcp-researcher` for Effect-Atom documentation

### Implementation Order

1. Package setup - `package.json`, tsconfig, exports
2. `VMRuntime.ts` - Runtime configuration with `useVM` hook
3. `mail-client.ts` - RPC client wrappers
4. `InboxView` - Primary view, establishes patterns
5. `ComposeModal` - AI integration patterns
6. `ThreadView` - Message display with summary
7. `ConnectionManager` - OAuth flow UI
8. `SettingsPanel` - Preferences UI
9. `BrainSettings` - AI config UI

### Verification

After implementing each component:

```bash
# Check UI package
bun run check --filter @beep/comms-ui

# Lint
bun run lint --filter @beep/comms-ui
```

### Success Criteria

- [ ] `@beep/comms-ui` package structure created
- [ ] VMRuntime and mail client configured
- [ ] InboxView: VM + component with folder nav, search, thread list
- [ ] ComposeModal: VM + component with AI compose assist
- [ ] ThreadView: VM + component with messages, summary
- [ ] ConnectionManager: VM + component with OAuth flow
- [ ] SettingsPanel: VM + component with preferences
- [ ] BrainSettings: VM + component with label config
- [ ] All components use `Data.TaggedEnum` state machines
- [ ] All formatting happens in VMs (no Date/number in components)
- [ ] Type check passes
- [ ] Lint passes

### Handoff Document

Full context: `specs/zero-email-port/handoffs/HANDOFF_P5.md`

### Completion

After completing Phase 5:
1. Update `REFLECTION_LOG.md` with learnings
2. The Zero Email Port spec is complete
3. Integration testing can begin in the todox app
