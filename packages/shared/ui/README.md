# @beep/shared-ui — Cross-cutting UI utilities

Effect-first utilities and React hooks for file handling, upload workflows, and client-side UI interactions. Provides dropzone state management, file validation, and stable event handlers used across the beep-effect monorepo.

## Purpose and fit
- Effect-based file validation with tagged errors (file type matching, size conversion, route config normalization).
- React hooks for stable callbacks, clipboard paste events, and data fetching with built-in caching.
- Dropzone state reducer and file acceptance logic for upload components.
- Next.js SSR plugin for hydrating upload metadata to client globalThis.
- Domain-agnostic utilities that bridge Effect runtime and browser file APIs.

## Public surface map
- **Tagged Errors** — `InvalidRouteConfigError`, `UnknownFileTypeError`, `InvalidFileTypeError`, `InvalidFileSizeError`, `InvalidURLError`, `RetryError`, `FetchError`, `InvalidJsonError`, `BadRequestError<T>`, `UploadPausedError`, `UploadAbortedError` — schema-backed error taxonomy extending `Data.TaggedError` for file validation and upload workflows.
- **File Route Config** — `fillInputRouteConfig`, `matchFileType`, `getDefaultSizeForType`, `fileSizeToBytes`, `bytesToFileSize` — Effect-based validation and normalization for upload route configurations.
- **Dropzone Utilities** — `isFileAccepted`, `isValidSize`, `isValidQuantity`, `allFilesAccepted`, `acceptPropAsAcceptAttr`, `reducer`, `initialState` — state management and validation logic for drag-and-drop file uploads.
- **Component Utilities** — `generateMimeTypes`, `generateClientDropzoneAccept`, `generatePermittedFileTypes`, `allowedContentTextLabelGenerator`, `getFilesFromClipboardEvent` — helpers for building upload UI components.
- **URL Helpers** — `getRequestUrl`, `getFullApiUrl`, `resolveMaybeUrlArg` — VERCEL_URL-aware URL resolution for upload endpoints with `x-forwarded-*` header support.
- **React Hooks** — `useEvent`, `usePaste`, `useFetch` — stable callback references, clipboard event listeners, and simple data fetching with caching.
- **Next.js** — `NextSSRPlugin` — hydrates upload route config to client globalThis via `useServerInsertedHTML`.
- **Types** — `FileRouterInputConfig`, `ExpandedRouteConfig`, `RouteConfig<T>`, `FileProperties`, `DropzoneOptions`, `DropzoneState`, `FileSize`, `AcceptProp` — TypeScript definitions for upload workflows.

## Core behaviors and guardrails
- **Effect-first validation**: All file validation returns `Effect<T, E>` with tagged errors (never throws). Use `Effect.runSync`/`Effect.runPromise` or compose with `Effect.gen`.
- **Route config normalization**: `fillInputRouteConfig` accepts array shorthand (`["image", "video"]`) or explicit object config and backfills defaults (maxFileSize, maxFileCount, minFileCount, contentDisposition).
- **File type matching**: `matchFileType` resolves files to `BS.FileType.Type` (image/video/audio/pdf/text/blob) using MIME type first, then extension fallback via `BS.lookup`.
- **Dropzone state**: Use provided `reducer` and `initialState` for consistent state management across upload components. Actions include focus/blur, drag events, file selection, and reset.
- **Stable callbacks**: `useEvent` provides always-stable function references that see latest props/state (prefer over `useCallback` to avoid stale closures and dependency array bugs).
- **Effect Array/String utilities**: All collection and string operations use `effect/Array` and `effect/String` (never native array/string methods).

## Usage snapshots

Validate file type with Effect
```ts
import * as Effect from "effect/Effect";
import { matchFileType, InvalidFileTypeError, UnknownFileTypeError } from "@beep/shared-ui";

const program = matchFileType(
  { name: "photo.jpg", size: 1024, type: "image/jpeg" },
  ["image", "video"]
);
// Effect<"image", InvalidFileTypeError | UnknownFileTypeError>

const fileType = Effect.runSync(program); // "image"
```

Normalize route config and convert file sizes
```ts
import * as Effect from "effect/Effect";
import { fillInputRouteConfig, fileSizeToBytes, bytesToFileSize } from "@beep/shared-ui";
import type { FileRouterInputConfig } from "@beep/shared-ui";

// Array shorthand with defaults
const config1: FileRouterInputConfig = ["image", "video"];
const expanded1 = Effect.runSync(fillInputRouteConfig(config1));
// { image: { maxFileSize: "4MB", maxFileCount: 1, minFileCount: 1, contentDisposition: "inline" }, video: { ... } }

// Explicit config with backfill
const config2: FileRouterInputConfig = {
  image: { maxFileSize: "8MB", maxFileCount: 5 },
};
const expanded2 = Effect.runSync(fillInputRouteConfig(config2));
// Backfills minFileCount, contentDisposition

// Convert file sizes
const bytes = Effect.runSync(fileSizeToBytes("4MB")); // 4194304
const human = bytesToFileSize(4194304); // "4.00MB"
```

Manage dropzone state with reducer
```ts
import { useReducer } from "react";
import { reducer, initialState, type DropzoneState } from "@beep/shared-ui";

function MyDropzone() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const onDragEnter = () => {
    dispatch({
      type: "setDraggedFiles",
      payload: { isDragActive: true, isDragAccept: true, isDragReject: false },
    });
  };

  const onDrop = (files: File[]) => {
    dispatch({ type: "setFiles", payload: { acceptedFiles: files } });
  };

  return (
    <div>
      {state.isDragActive ? "Drop here!" : "Drag files"}
      {state.acceptedFiles.length > 0 && <p>Selected: {state.acceptedFiles.length}</p>}
    </div>
  );
}
```

Use stable callbacks with useEvent
```ts
import { useState } from "react";
import { useEvent } from "@beep/shared-ui";

function MyComponent({ onSave }: { onSave: (data: string) => void }) {
  const [count, setCount] = useState(0);

  // ✅ CORRECT: Stable reference, always sees latest count
  const handleClickStable = useEvent(() => {
    onSave(`Clicked ${count} times`);
  });

  // ❌ WRONG: Creates new function every render
  const handleClick = () => {
    onSave(`Clicked ${count} times`);
  };

  return <button onClick={handleClickStable}>Click</button>;
}
```

Listen for clipboard paste events
```ts
import { usePaste, getFilesFromClipboardEvent } from "@beep/shared-ui";

function MyUploader() {
  usePaste((event) => {
    const files = getFilesFromClipboardEvent(event);
    if (files && files.length > 0) {
      console.log("Pasted files:", files);
      // Handle file upload
    }
  });

  return <div>Paste files here (Ctrl+V or Cmd+V)</div>;
}
```

Generate user-facing upload labels
```ts
import { allowedContentTextLabelGenerator, type ExpandedRouteConfig } from "@beep/shared-ui";

const singleConfig: ExpandedRouteConfig = {
  image: { maxFileSize: "4MB", maxFileCount: 1, minFileCount: 1, contentDisposition: "inline" },
};

const label = allowedContentTextLabelGenerator(singleConfig);
// "Image (4MB)"

const multiConfig: ExpandedRouteConfig = {
  image: { maxFileSize: "8MB", maxFileCount: 5, minFileCount: 1, contentDisposition: "inline" },
  video: { maxFileSize: "16MB", maxFileCount: 3, minFileCount: 1, contentDisposition: "inline" },
};

const multiLabel = allowedContentTextLabelGenerator(multiConfig);
// "Images and videos"
```

Hydrate upload metadata in Next.js SSR
```ts
"use client";
import { NextSSRPlugin } from "@beep/shared-ui";
import type { EndpointMetadata } from "@beep/shared-ui/types";

const routerConfig: EndpointMetadata = [
  { slug: "imageUploader", config: { image: { maxFileSize: "4MB" } } },
];

export default function UploadProvider({ children }) {
  return (
    <>
      <NextSSRPlugin routerConfig={routerConfig} />
      {children}
    </>
  );
}
```

Compose file validation pipeline
```ts
import * as Effect from "effect/Effect";
import { matchFileType, fileSizeToBytes, InvalidFileSizeError } from "@beep/shared-ui";

const validateFile = (file: File, allowedTypes: string[], maxSizeStr: string) =>
  Effect.gen(function* () {
    const fileType = yield* matchFileType(file, allowedTypes);
    const maxBytes = yield* fileSizeToBytes(maxSizeStr);

    if (file.size > maxBytes) {
      return yield* Effect.fail(new InvalidFileSizeError(`${file.size}B`));
    }

    return { file, fileType, validated: true };
  });

// Usage
const program = validateFile(myFile, ["image", "pdf"], "4MB");
Effect.runPromise(program).then(console.log).catch(console.error);
```

## Verification and scripts
- `bun run --filter @beep/shared-ui lint`
- `bun run --filter @beep/shared-ui lint:fix`
- `bun run --filter @beep/shared-ui check`
- `bun run --filter @beep/shared-ui build`
- `bun run --filter @beep/shared-ui test`
- `bun run --filter @beep/shared-ui coverage`
- Optional: `bun run --filter @beep/shared-ui lint:circular`

## Contributor checklist
- Use Effect for all validation and error handling (never throw errors or use try/catch).
- Use `effect/Array` and `effect/String` utilities instead of native array/string methods.
- Always use uppercase Schema constructors (`S.Struct`, `S.Array`, `S.String`).
- Tagged errors must extend `Data.TaggedError` with descriptive `reason` field.
- React hooks should follow React guidelines (stable references, proper cleanup).
- Use `useEvent` instead of `useCallback` for stable callbacks that need latest props/state.
- Dropzone state changes must use the provided `reducer` (don't create custom reducers).
- Update both README.md and AGENTS.md when adding new exports or changing APIs.
- Run lint + check before committing; run tests when modifying validation logic.
- Keep package pure (no side effects at module scope, no global state).
