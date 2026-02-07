# Phase 5 & 6 Orchestrator Prompt

Copy-paste this prompt to start Phase 5 & 6 implementation.

---

## Prompt

You are implementing Phases 5 & 6 of the `lexical-playground-port` spec: **Repository Best Practices & Effect Patterns**.

### Context

Phases 1-4 are complete:
- All quality commands pass (lint, check, build)
- CSS files reduced from 32 to 5
- UI components wrapped with shadcn equivalents
- Page accessible at `/lexical` with dynamic import
- API routes at `/api/lexical/set-state` and `/api/lexical/validate`
- Runtime errors fixed, editor functional

### Your Mission

Convert the Lexical codebase to use Effect patterns and repository best practices.

### Scope Analysis

**Phase 6 - Effect Patterns (Do First)**:
| Issue | Count |
|-------|-------|
| `try {` blocks | 7 |
| `new Promise` | 3 |
| `JSON.parse` | 7 |
| `throw new Error` | 46 |

**Phase 5 - Type Assertions (Do Second)**:
| Issue | Count |
|-------|-------|
| Type assertions (`as`) | 78 |
| Non-null assertions (`!`) | TBD |

---

## CRITICAL: Two Distinct Effect Runtime Patterns

There are **TWO DISTINCT patterns** for async operations. You MUST choose correctly based on operation type:

| Operation Type | Pattern | When to Use |
|----------------|---------|-------------|
| **Network calls (HTTP)** | Effect.Service + `makeAtomRuntime` + `runtime.fn` | API requests, RPC calls, server communication |
| **Non-network promises** | `useRuntime()` + `makeRunClientPromise(runtime)` | Browser APIs, clipboard, DOM, third-party SDKs |

### Canonical Reference: `ActionsPlugin/index.tsx`

**STUDY THIS FILE FIRST**: `apps/todox/src/app/lexical/plugins/ActionsPlugin/index.tsx`

It demonstrates BOTH patterns in production code.

---

## Pattern A: Network Calls (Effect.Service + effect-atom)

**Use for**: HTTP requests, API calls, any server communication.

```tsx
"use client";

import * as HttpClient from "@effect/platform/HttpClient";
import * as HttpClientRequest from "@effect/platform/HttpClientRequest";
import * as HttpClientResponse from "@effect/platform/HttpClientResponse";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import { makeAtomRuntime } from "@beep/runtime-client";
import { useAtomSet } from "@effect-atom/atom-react";
import { withToast } from "@beep/ui/common";
import { $TodoxId } from "@beep/identity/packages";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as Layer from "effect/Layer";
import * as F from "effect/Function";

const $I = $TodoxId.create("app/lexical/feature");

// 1. Define tagged error
class MyApiError extends S.TaggedError<MyApiError>()($I`MyApiError`)(
  "MyApiError",
  { cause: S.Defect },
  $I.annotations("MyApiError", { description: "API call failed" })
) {}

// 2. Create Effect.Service
class MyApiClient extends Effect.Service<MyApiClient>()(
  $I`MyApiClient`,
  {
    accessors: true,
    dependencies: [],
    effect: Effect.gen(function* () {
      const httpClient = yield* HttpClient.HttpClient;

      // Use Effect.fn for parameterized effects
      const sendData = Effect.fn("MyApiClient.sendData")(function* (data: MyData) {
        const request = yield* HttpClientRequest.post("/api/endpoint").pipe(
          HttpClientRequest.setHeaders({ "Content-type": "application/json" }),
          HttpClientRequest.schemaBodyJson(MyDataSchema)(data),
        );
        yield* httpClient.execute(request);
      }, Effect.tapError(Effect.logError));

      return { sendData };
    })
  }
) {}

// 3. Create atom runtime with Layer
const atomRuntime = makeAtomRuntime(
  () => MyApiClient.Default.pipe(Layer.provide(FetchHttpClient.layer))
);

// 4. Create function atom with toast feedback
const sendDataAtom = atomRuntime.fn(
  F.flow(MyApiClient.sendData, withToast({
    onFailure: (error) => error.message,
    onDefect: () => "An unknown error occurred.",
    onSuccess: () => "Data sent successfully.",
    onWaiting: () => "Sending data...",
  }))
);

// 5. Create hook for components
const useMyApi = () => {
  const sendData = useAtomSet(sendDataAtom);
  return { sendData };
};

// 6. Use in component
function MyComponent() {
  const { sendData } = useMyApi();
  return <button onClick={() => sendData(myData)}>Send</button>;
}
```

---

## Pattern B: Non-Network Promises (useRuntime + makeRunClientPromise)

**Use for**: Browser APIs (clipboard, DOM), third-party SDKs (Twitter, etc.), local async operations.

```tsx
"use client";

import { $TodoxId } from "@beep/identity/packages";
import { makeRunClientPromise, useRuntime } from "@beep/runtime-client";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as Clipboard from "@effect/platform-browser/Clipboard";
import { useCallback } from "react";

const $I = $TodoxId.create("app/lexical/nodes/ComponentName");

// Define tagged error class
class MyOperationError extends S.TaggedError<MyOperationError>()($I`MyOperationError`, {
  cause: S.Defect,
}) {}

// Define Effect function using Effect.fn
const myAsyncOperation = Effect.fn("myAsyncOperation")(function* (param: string) {
  const clipboard = yield* Clipboard.Clipboard;
  yield* clipboard.writeString(param);
});

function MyComponent({ onError, onSuccess }: Props) {
  const runtime = useRuntime();
  const runPromise = makeRunClientPromise(runtime);

  const handleAsyncOperation = useCallback(
    async () =>
      runPromise(
        Effect.gen(function* () {
          yield* Effect.tryPromise({
            try: async () => await someAsyncOperation(),
            catch: (cause) => new MyOperationError({ cause }),
          });
          if (onSuccess) onSuccess();
        })
      ),
    [onSuccess, runPromise]
  );

  return <button onClick={handleAsyncOperation}>Do Thing</button>;
}
```

---

## Pattern C: Effect.fn for Parameterized Effects (MANDATORY)

**NEVER** use arrow functions returning `Effect.gen`. **ALWAYS** use `Effect.fn`:

```typescript
// ❌ WRONG - Arrow function returning Effect.gen
const myEffect = (param: string) => Effect.gen(function* () {
  // ...
});

// ✅ CORRECT - Use Effect.fn with span name
const myEffect = Effect.fn("myEffect")(function* (param: string) {
  // ...
});

// ✅ CORRECT - Use Effect.fnUntraced for internal helpers without tracing
const helperEffect = Effect.fnUntraced(function* (param: string) {
  // ...
});
```

---

## Pattern D: S.TaggedError (NEVER use native Error)

**NEVER** use native `Error` constructor or `throw`. **ALWAYS** use `S.TaggedError`:

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

---

## Pattern E: Synchronous Operations with Either (NO runtime needed)

**Use for**: Synchronous operations outside React lifecycle - Lexical DOM conversions, node static methods, JSON parsing, useMemo.

**PREFERRED for pure synchronous code** - no runtime, no hooks, works anywhere.

```tsx
import * as Either from "effect/Either";
import * as S from "effect/Schema";

// Safe JSON parsing with Either - no runtime needed
const parseJsonSafe = <T>(jsonString: string, schema: S.Schema<T>): Either.Either<T, Error> =>
  Either.try({
    try: () => JSON.parse(jsonString),
    catch: (e) => new Error(`JSON parse failed: ${String(e)}`),
  }).pipe(
    Either.flatMap((parsed) =>
      Either.try({
        try: () => S.decodeUnknownSync(schema)(parsed),
        catch: (e) => new Error(`Schema validation failed: ${String(e)}`),
      })
    )
  );

// For Lexical DOM conversion callbacks (static methods, no React hooks):
function $convertPollElement(domNode: HTMLSpanElement): DOMConversionOutput | null {
  const question = domNode.getAttribute("data-lexical-poll-question");
  const optionsAttr = domNode.getAttribute("data-lexical-poll-options");
  if (question === null || optionsAttr === null) return null;

  return Either.match(parseJsonSafe(optionsAttr, OptionsSchema), {
    onLeft: () => null,  // Parse failed, return null
    onRight: (options) => ({ node: $createPollNode(question, options) }),
  });
}

// For useMemo with fallback:
const { elements, files, appState } = useMemo(() =>
  Either.match(parseJsonSafe(data, ExcalidrawDataSchema), {
    onLeft: () => ({ elements: [], files: {}, appState: {} }),
    onRight: (parsed) => parsed,
  }),
  [data]
);

// For event handlers with Either:
function getDragImageData(event: DragEvent): InsertImagePayload | null {
  const dragData = event.dataTransfer?.getData("application/x-lexical-drag");
  if (!dragData) return null;

  return Either.match(parseJsonSafe(dragData, DragImageSchema), {
    onLeft: () => null,
    onRight: ({ type, data }) => (type === "image" ? data : null),
  });
}
```

**Either utilities**:
- `Either.try({ try, catch })` - Wrap throwing operations
- `Either.flatMap` - Chain operations
- `Either.map` - Transform success value
- `Either.match({ onLeft, onRight })` - Handle both cases
- `Either.getOrElse(() => fallback)` - Get value or fallback
- `Either.isRight(either)` / `Either.isLeft(either)` - Type guards

---

## Pattern F: Synchronous Effects with Runtime (when services needed)

**Use for**: Synchronous operations in React components that need Effect services.

**CRITICAL REFERENCE**: `packages/runtime/client/src/runtime.ts#L35-52`

**IMPORTANT**: Synchronous effects CANNOT use `yield*` or `Effect.gen`. You MUST use `Effect.pipe` with `Effect.flatMap` or `Effect.andThen`. No async code can run in a sync boundary.

```tsx
"use client";

import { makeRunClientSync, useRuntime } from "@beep/runtime-client";
import * as Effect from "effect/Effect";

function MyComponent() {
  const runtime = useRuntime();
  const runSync = makeRunClientSync(runtime);

  const handleSyncOperation = () => {
    return runSync(
      Effect.try({
        try: () => someOperation(),
        catch: (e) => new MyError({ cause: e }),
      }).pipe(
        Effect.flatMap((result) => Effect.succeed(transform(result))),
        Effect.catchAll(() => Effect.succeed(fallbackValue))
      )
    );
  };

  return <button onClick={handleSyncOperation}>Do</button>;
}
```

**Available synchronous runners** (from `@beep/runtime-client`):
- `runClientSync(runtime, effect)` - Run and get result (throws on error)
- `runClientSyncExit(runtime, effect)` - Run and get Exit (never throws)
- `makeRunClientSync(runtime)` - Create reusable sync runner
- `makeRunClientSyncExit(runtime)` - Create reusable sync Exit runner

**Key constraints for sync effects**:
- ❌ NO `yield*` or `Effect.gen`
- ❌ NO `Effect.tryPromise` or any async operations
- ✅ Use `Effect.try` for synchronous try/catch
- ✅ Use `Effect.pipe` with `Effect.flatMap` / `Effect.andThen` / `Effect.map`

---

## Decision Guide: Which Pattern to Use?

| Question | Answer | Pattern |
|----------|--------|---------|
| Does it make HTTP requests? | Yes | **Pattern A** (Effect.Service + effect-atom) |
| Does it use browser APIs (clipboard, DOM, etc.)? | Yes | **Pattern B** (useRuntime + makeRunClientPromise) |
| Does it call third-party SDKs (Twitter, etc.)? | Yes | **Pattern B** |
| Does it need toast notifications? | Yes | **Pattern A** with `withToast` |
| Is it synchronous (JSON.parse, DOM conversion, event handlers)? | Yes | **Pattern E** (useRuntime + makeRunClientSync) |
| Does it accept parameters? | Yes | Use `Effect.fn` or `Effect.fnUntraced` |

**IMPORTANT**: Use the `/effect-atom` skill for complete effect-atom documentation and patterns.

---

## Reference Implementations

| File | Pattern | Purpose |
|------|---------|---------|
| `apps/todox/src/app/lexical/plugins/ActionsPlugin/index.tsx` | Both A & B | **CANONICAL** - Shows both patterns |
| `apps/todox/src/app/lexical/utils/docSerialization.ts` | Pure Effect | Effect.gen, Effect.try, tagged errors |
| `packages/runtime/client/src/runtime.ts` | Infrastructure | Runtime helpers |
| `.claude/skills/effect-atom.md` | Documentation | Complete effect-atom reference |

---

## Implementation Steps

### Phase 6: Effect Patterns

1. **Study ActionsPlugin/index.tsx** first (canonical reference)
2. **Convert TweetNode.tsx** (Pattern B - third-party SDK)
3. **Convert PrettierButton/index.tsx** (Pattern B - local async)
4. **Convert CopyButton/index.tsx** (Pattern B - clipboard)
5. **Convert remaining try/catch files** (commenting/models.ts, setupEnv.ts, etc.)
6. **Convert Promises to Effects** (validation.ts, AutocompletePlugin, ImageComponent)
7. **Convert JSON.parse calls** to S.parseJson
8. **Convert all throw new Error** (46 instances) to S.TaggedError + Effect.fail

### Phase 5: Type Assertions

1. **DOM element casts** → proper type guards
2. **Lexical node casts** → use `$isXNode()` type guards
3. **Event target casts** → use Effect predicates (`P.isHTMLInputElement`, etc.)

---

## Verification Commands

```bash
# After each file conversion
bunx turbo run lint --filter=@beep/todox
bunx turbo run check --filter=@beep/todox

# Final verification
bunx turbo run build --filter=@beep/todox

# Success criteria checks
grep -r "try {" apps/todox/src/app/lexical/ | wc -l  # Should be 0
grep -r "new Promise" apps/todox/src/app/lexical/ | wc -l  # Should be 0
grep -r "JSON.parse" apps/todox/src/app/lexical/ | wc -l  # Should be 0
grep -rn "throw new Error\|new Error" apps/todox/src/app/lexical/ | wc -l  # Should be 0
grep -r " as " apps/todox/src/app/lexical/ | grep -v "import" | wc -l  # Should be 0
```

---

## Success Criteria

### Phase 6 (Effect Patterns)
- [ ] All `try {` blocks replaced with Effect patterns (7 → 0)
- [ ] All `new Promise` replaced with Effect (3 → 0)
- [ ] All `JSON.parse` replaced with S.parseJson (7 → 0)
- [ ] All `throw new Error` replaced with S.TaggedError + Effect.fail (46 → 0)
- [ ] All parameterized effects use `Effect.fn` or `Effect.fnUntraced`
- [ ] Network calls use Effect.Service + `makeAtomRuntime` + `runtime.fn` + `useAtomSet`
- [ ] Non-network promises use `useRuntime()` + `makeRunClientPromise()`

### Phase 5 (Type Assertions)
- [ ] All type assertions (`as`) removed or replaced with type guards (78 → 0)
- [ ] Non-null assertions minimized

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

---

## Files Reference

| File | Purpose |
|------|---------|
| `handoffs/HANDOFF_P5.md` | Detailed patterns and examples |
| `plugins/ActionsPlugin/index.tsx` | Canonical reference for both patterns |
| `utils/docSerialization.ts` | Effect pattern reference implementation |
| `packages/runtime/client/src/runtime.ts` | Runtime helpers (`makeRunClientPromise`, etc.) |
| `.claude/skills/effect-atom.md` | Complete effect-atom documentation |
| `schema/errors.ts` | Existing tagged errors for lexical |

---

## Notes

- **ActionsPlugin is the canonical reference** - study it first before converting other files
- Start with Phase 6 (Effect patterns) before Phase 5 (type assertions)
- Test after each file conversion to catch issues early
- Some `throw new Error` in React context hooks are invariants for missing context - these may need special handling
- For clipboard operations, use `@effect/platform-browser/Clipboard` service
