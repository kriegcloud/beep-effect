# Phase 5 Handoff: Repository Best Practices & Effect Patterns

## Phase 4 Completion Summary

**Date**: 2025-01-27
**Phase**: 4 - Runtime Error Fixes
**Status**: COMPLETE

### Changes Made

1. **Editor.tsx** - Added SSR guard for window access
2. **App.tsx** - Fixed logo SVG import to use public path
3. **TableHoverActionsV2Plugin** - Removed invalid elements config from useFloating
4. **CSS files** - Updated all icon paths to absolute public paths
5. **public/lexical/** - Copied all images for static serving

### Quality Verification

All commands pass:
- `bunx turbo run lint --filter=@beep/todox` ✅
- `bunx turbo run check --filter=@beep/todox` ✅
- `bunx turbo run build --filter=@beep/todox` ✅

### Core Functionality Verified

- [x] Editor loads without crashes
- [x] Lexical logo displays
- [x] Can type text
- [x] Bold formatting (Ctrl+B)
- [x] Italic formatting (Ctrl+I)
- [x] TreeView debug panel works
- [x] Toolbar dropdowns functional

### Known Issues (Acceptable for MVP)

1. **WebSocket Timeout** - "Timeout" unhandled rejection in console
   - Cause: Collaboration plugin tries to connect to Yjs server
   - Impact: None - collaboration disabled by default
   - Fix: Not needed for MVP

2. **7 Circular Dependencies** (from Phase 2)
   - Located in Lexical nodes
   - Impact: Build warnings only, no runtime issues
   - Fix: Can address in future optimization phase

---

## Phase 5 & 6: Repository Best Practices & Effect Patterns

### Scope Analysis

**Phase 5 - Type Assertions (78 instances)**:
- DOM element casts
- Lexical node casts
- Event target casts
- YJS types
- Initial value casts

**Phase 6 - Effect Patterns**:
| Issue | Count | Files |
|-------|-------|-------|
| `try {` blocks | 7 | commenting/models.ts (2), PrettierButton, CopyButton, TestRecorderPlugin, setupEnv.ts, TweetNode.tsx |
| `new Promise` | 3 | validation.ts, AutocompletePlugin, ImageComponent.tsx |
| `JSON.parse` | 7 | ImagesPlugin, setupEnv.ts, PollNode.tsx, ExcalidrawNode, DateTimeNode.tsx (2) |
| `throw new Error` | 46 | TableCellResizer (12), CollapsiblePlugin (4), context hooks (2), ColorPicker, EmojisPlugin, etc. |

---

## CRITICAL: Two Effect Runtime Patterns

There are **TWO DISTINCT patterns** for handling async operations in React components. Choose based on operation type:

| Operation Type | Pattern | When to Use |
|----------------|---------|-------------|
| **Network calls (HTTP)** | Effect.Service + `makeAtomRuntime` + `runtime.fn` | API requests, RPC calls, server communication |
| **Non-network promises** | `useRuntime()` + `makeRunClientPromise(runtime)` | Browser APIs, clipboard, DOM, local operations |

### Canonical Reference: `ActionsPlugin/index.tsx`

This file demonstrates BOTH patterns. Study it before implementing conversions.

---

## Pattern A: Network Calls (Effect.Service + effect-atom)

**Use for**: HTTP requests, API calls, any server communication.

**Key dependencies**:
```typescript
import * as HttpClient from "@effect/platform/HttpClient";
import * as HttpClientRequest from "@effect/platform/HttpClientRequest";
import * as HttpClientResponse from "@effect/platform/HttpClientResponse";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import { makeAtomRuntime } from "@beep/runtime-client";
import { useAtomSet } from "@effect-atom/atom-react";
import { withToast } from "@beep/ui/common";
import * as Layer from "effect/Layer";
import * as F from "effect/Function";
```

### Step 1: Create Effect.Service with HTTP methods

```typescript
import { $TodoxId } from "@beep/identity/packages";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const $I = $TodoxId.create("app/lexical/index");

// Define tagged error
class SendEditorStateError extends S.TaggedError<SendEditorStateError>()($I`SendEditorStateError`)(
  "SendEditorStateError",
  {
    cause: S.Defect,
  },
  $I.annotations("SendEditorStateError", {
    description: "An error which occurred while sending the editor state to the server.",
  })
) {}

// Create Effect.Service
export class EditorHttpClient extends Effect.Service<EditorHttpClient>()(
  $I`EditorHttpClient`,
  {
    accessors: true,
    dependencies: [],
    effect: Effect.gen(function* () {
      const httpClient = yield* HttpClient.HttpClient;

      // Use Effect.fn for parameterized effects
      const sendEditorState = Effect.fn("EditorHttpClient.sendEditorState")(function* (editor: LexicalEditor) {
        const state = yield* S.decode(SerializedEditorState)(editor.getEditorState().toJSON());
        const request = yield* HttpClientRequest.post("/api/lexical/set-state").pipe(
          HttpClientRequest.setHeaders({
            Accept: "application/json",
            "Content-type": "application/json",
          }),
          HttpClientRequest.schemaBodyJson(SerializedEditorState)(state),
        );

        yield* httpClient.execute(request);
      }, Effect.tapError(Effect.logError), Effect.catchTags({
        ParseError: Effect.die,
        HttpBodyError: Effect.die,
      }));

      return {
        sendEditorState,
      };
    })
  }
) {}
```

### Step 2: Create atom runtime with Layer

```typescript
const atomRuntime = makeAtomRuntime(
  () => EditorHttpClient.Default.pipe(
    Layer.provide(FetchHttpClient.layer)
  )
);
```

### Step 3: Create function atom with toast feedback

```typescript
const sendEditorStateAtom = atomRuntime.fn(
  F.flow(EditorHttpClient.sendEditorState, withToast({
    onFailure: (error) => error.message,
    onDefect: () => "An unknown error occurred while sending the editor state to the server.",
    onSuccess: () => "Editor state sent successfully.",
    onWaiting: () => "Sending editor state...",
  }))
);
```

### Step 4: Create hook for components

```typescript
const useEditorClient = () => {
  const sendEditorState = useAtomSet(sendEditorStateAtom);
  return { sendEditorState };
};
```

### Step 5: Use in component

```tsx
function MyComponent() {
  const { sendEditorState } = useEditorClient();
  const [editor] = useLexicalComposerContext();

  return (
    <button onClick={() => sendEditorState(editor)}>
      Send State
    </button>
  );
}
```

---

## Pattern B: Non-Network Promises (useRuntime + makeRunClientPromise)

**Use for**: Browser APIs (clipboard, DOM), local async operations, third-party SDKs.

**Key dependencies**:
```typescript
import { makeRunClientPromise, useRuntime } from "@beep/runtime-client";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { $TodoxId } from "@beep/identity/packages";
```

### Complete Pattern

```tsx
"use client";

import { $TodoxId } from "@beep/identity/packages";
import { makeRunClientPromise, useRuntime } from "@beep/runtime-client";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as Clipboard from "@effect/platform-browser/Clipboard";
import { useCallback } from "react";

const $I = $TodoxId.create("app/lexical/feature");

// Define tagged error
class ShareDocError extends S.TaggedError<ShareDocError>()($I`ShareDocError`, {
  cause: S.Defect,
}) {}

// Define Effect function using Effect.fn
const shareDoc = Effect.fn("shareDoc")(function* (doc: SerializedDocument) {
  const url = yield* S.decode(S.URL)(window.location.toString());
  const clipboard = yield* Clipboard.Clipboard;
  url.hash = yield* docToHash(doc);
  const newUrl = url.toString();
  window.history.replaceState({}, "", newUrl);
  yield* clipboard.writeString(newUrl);
});

function ShareButton({ editor }: { editor: LexicalEditor }) {
  const runtime = useRuntime();
  const runClientPromise = makeRunClientPromise(runtime);

  const handleShare = useCallback(
    () =>
      runClientPromise(
        shareDoc(serializedDocumentFromEditorState(editor.getEditorState(), {
          source: "Playground",
        })).pipe(
          Effect.tap(() => Effect.succeed(showFlashMessage("URL copied to clipboard"))),
          Effect.mapError((e) =>
            P.isTagged("ClipboardError")(e)
              ? Effect.sync(() => showFlashMessage("URL could not be copied to clipboard"))
              : Effect.die(e)
          ),
        )
      ),
    [editor, runClientPromise]
  );

  return <button type="button" onClick={handleShare}>Share</button>;
}
```

---

## Pattern C: Effect.fn for Parameterized Effects

**CRITICAL**: NEVER use arrow functions returning `Effect.gen`.

```typescript
// ❌ WRONG - Arrow function returning Effect.gen
const myEffect = (param: string) => Effect.gen(function* () {
  // ...
});

// ✅ CORRECT - Use Effect.fn with span name (adds tracing)
const myEffect = Effect.fn("myEffect")(function* (param: string) {
  // ...
});

// ✅ CORRECT - Use Effect.fnUntraced for internal helpers without tracing
const helperEffect = Effect.fnUntraced(function* (param: string) {
  // ...
});
```

---

## Pattern D: Tagged Errors (NEVER use native Error)

**CRITICAL**: NEVER use native `Error` constructor or `throw`.

```typescript
// ❌ WRONG - Native Error
throw new Error("Something went wrong");
new Error("Failed to load");

// ✅ CORRECT - S.TaggedError
import * as S from "effect/Schema";
import { $TodoxId } from "@beep/identity/packages";

const $I = $TodoxId.create("app/lexical/feature");

class MyFeatureError extends S.TaggedError<MyFeatureError>()($I`MyFeatureError`, {
  message: S.String,
  cause: S.optional(S.Defect),
}) {}

// Use with Effect.fail
yield* Effect.fail(new MyFeatureError({ message: "Something went wrong" }));
```

**Error Class Location**: Define error classes in the module where they're used, or in a shared `schema/errors.ts` file if reused across modules.

---

## Reference Implementations

| File | Pattern | Purpose |
|------|---------|---------|
| `apps/todox/src/app/lexical/plugins/ActionsPlugin/index.tsx` | Both A & B | **CANONICAL** - Shows both network and non-network patterns |
| `apps/todox/src/app/lexical/utils/docSerialization.ts` | Pure Effect | Effect.gen, Effect.try, Effect.tryPromise, tagged errors |
| `packages/runtime/client/src/runtime.ts` | Infrastructure | `makeAtomRuntime`, `useRuntime`, `makeRunClientPromise` |
| `.claude/skills/effect-atom.md` | Documentation | Complete effect-atom patterns reference |

---

## Files to Convert

### Phase 6 Priority Order

1. **TweetNode.tsx** - Simple example, use Pattern B
2. ~~**ActionsPlugin/index.tsx**~~ - ALREADY CONVERTED (reference implementation)
3. **PrettierButton/index.tsx** - Prettier formatting, use Pattern B
4. **CopyButton/index.tsx** - Clipboard, use Pattern B with `@effect/platform-browser/Clipboard`
5. **url.ts** - Already partially converted, needs Effect.fn
6. **commenting/models.ts** - YJS operations (complex)
7. **setupEnv.ts** - URL param parsing + JSON.parse
8. **ImagesPlugin** - JSON.parse for drag data
9. **DateTimeNode.tsx** - JSON.parse (2 instances)
10. **PollNode.tsx** - JSON.parse for options
11. **ExcalidrawNode** - JSON.parse for data
12. **validation.ts** - Promise to Effect
13. **AutocompletePlugin** - Promise to Effect
14. **ImageComponent.tsx** - Promise cache to Effect

### Phase 5 (Type Assertions)

Address after Phase 6. Focus areas:
- DOM element casts → proper type guards
- Lexical node casts → `$isXNode()` type guards
- Event target casts → `P.isHTMLInputElement()` etc.

---

## Decision Guide: Which Pattern to Use?

| Question | Answer | Pattern |
|----------|--------|---------|
| Does it make HTTP requests? | Yes | **Pattern A** (Effect.Service + effect-atom) |
| Does it use browser APIs (clipboard, DOM, etc.)? | Yes | **Pattern B** (useRuntime + makeRunClientPromise) |
| Does it call third-party SDKs (Twitter, etc.)? | Yes | **Pattern B** |
| Does it need toast notifications? | Yes | **Pattern A** with `withToast` |
| Is it a pure synchronous operation? | Yes | Regular Effect.gen, no runtime exit needed |
| Does it accept parameters? | Yes | Use `Effect.fn` or `Effect.fnUntraced` |

---

## Commands Reference

```bash
# Development
bun run dev --filter=@beep/todox

# Quality checks
bunx turbo run lint --filter=@beep/todox
bunx turbo run check --filter=@beep/todox
bunx turbo run build --filter=@beep/todox

# Access editor
http://localhost:3000/lexical
```

---

## Success Criteria

### Phase 5 (Type Assertions)
- [ ] `grep -r " as " apps/todox/src/app/lexical/ | grep -v "import"` returns 0 matches
- [ ] No non-null assertions (`!`) except where absolutely necessary

### Phase 6 (Effect Patterns)
- [ ] `grep -r "try {" apps/todox/src/app/lexical/` returns 0 matches
- [ ] `grep -r "new Promise" apps/todox/src/app/lexical/` returns 0 matches
- [ ] `grep -r "JSON.parse" apps/todox/src/app/lexical/` returns 0 matches (use S.parseJson)
- [ ] `grep -r "new Error" apps/todox/src/app/lexical/` returns 0 matches (use S.TaggedError)
- [ ] `grep -r "throw new" apps/todox/src/app/lexical/` returns 0 matches (use Effect.fail)
- [ ] Network calls use Effect.Service + `makeAtomRuntime` + `runtime.fn` + `useAtomSet`
- [ ] Non-network promises use `useRuntime()` + `makeRunClientPromise()`
- [ ] All parameterized effects use `Effect.fn` or `Effect.fnUntraced`

### Final
- [ ] All quality commands pass
- [ ] Editor functional validation using MCP tools (REQUIRED):
  - [ ] Use **next-devtools MCP** to navigate to `/lexical` and inspect editor state
  - [ ] Use **playwright MCP** for automated regression testing:
    - [ ] Editor loads without crashes
    - [ ] Can type text in editor
    - [ ] Bold formatting (Ctrl+B) works
    - [ ] Italic formatting (Ctrl+I) works
    - [ ] Toolbar dropdowns are functional
    - [ ] TreeView debug panel renders
    - [ ] Share button copies URL to clipboard
    - [ ] Import/Export buttons trigger file dialogs
    - [ ] Lock/Unlock (read-only mode) toggle works
