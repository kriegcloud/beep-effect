# @beep/shared-ui AGENTS.md

Cross-cutting UI utilities for file uploads, dropzones, and React hooks used across the beep-effect monorepo.

## Overview

`@beep/shared-ui` provides Effect-first utilities and React hooks for file handling, upload workflows, and client-side UI interactions. This package bridges the gap between the Effect runtime and browser-based file operations, offering dropzone state management, file validation utilities, and stable React event handlers.

Unlike `@beep/ui/ui` (component library) or `@beep/ui/core` (design tokens), this package focuses on:
- File upload route configuration and validation
- Dropzone state reducers and file acceptance logic
- React hooks for clipboard paste, stable callbacks, and data fetching
- Next.js SSR plugins for upload metadata hydration

## Key Exports

| Export | Description |
|--------|-------------|
| **Tagged Errors** | |
| `InvalidRouteConfigError` | Route config missing required fields |
| `UnknownFileTypeError` | File type cannot be determined |
| `InvalidFileTypeError` | File type not allowed for upload |
| `InvalidFileSizeError` | Invalid file size format |
| `InvalidURLError` | Failed to parse URL |
| `RetryError` | Generic retry error |
| `FetchError` | HTTP fetch failure with request metadata |
| `InvalidJsonError` | JSON parsing failure |
| `BadRequestError<T>` | HTTP 4xx error with typed JSON payload |
| `UploadPausedError` | Upload paused by user |
| `UploadAbortedError` | Upload aborted by user |
| **Dropzone Utilities** | |
| `isFileAccepted` | Check if file matches accept pattern |
| `isValidSize` | Validate file size within min/max bounds |
| `isValidQuantity` | Validate file count vs. multiple/maxFiles |
| `allFilesAccepted` | Batch validation for all files |
| `acceptPropAsAcceptAttr` | Convert `AcceptProp` to HTML accept attribute |
| `reducer` | Dropzone state reducer (focus, drag, file selection) |
| `initialState` | Default dropzone state |
| **File Route Config** | |
| `fillInputRouteConfig` | Backfill route config with defaults |
| `matchFileType` | Match file to allowed type (image/video/audio/pdf/blob) |
| `getDefaultSizeForType` | Get default max size for file type |
| `fileSizeToBytes` | Convert "4MB" → bytes (Effect) |
| `bytesToFileSize` | Convert bytes → "4.00MB" |
| **Component Utilities** | |
| `generateMimeTypes` | Generate MIME type list from route config |
| `generateClientDropzoneAccept` | Generate dropzone accept object |
| `generatePermittedFileTypes` | Extract fileTypes + multiple flag from config |
| `allowedContentTextLabelGenerator` | Human-readable upload label ("images up to 4MB") |
| `getFilesFromClipboardEvent` | Extract files from ClipboardEvent |
| **URL Helpers** | |
| `getRequestUrl` | Extract full URL from Request (respects x-forwarded-*) |
| `getFullApiUrl` | Resolve upload endpoint URL (VERCEL_URL aware) |
| `resolveMaybeUrlArg` | Convert string/URL to full URL |
| **React Hooks** | |
| `useEvent` | Stable callback ref (like useCallback but always stable) |
| `usePaste` | Listen for clipboard paste events |
| `useFetch` | Simple data fetcher with caching |
| **Next.js** | |
| `NextSSRPlugin` | Hydrate upload route config to client globalThis (next-ssr-plugin.tsx) |
| **Types** | |
| `FileRouterInputConfig` | Route config input (array or object) |
| `ExpandedRouteConfig` | Normalized route config with defaults |
| `RouteConfig<T>` | Per-type config (maxFileSize, maxFileCount, etc.) |
| `FileProperties` | Minimal file interface (name, size, type) |
| `DropzoneOptions` | Dropzone configuration |
| `DropzoneState` | Dropzone UI state |

## Dependencies

- `@beep/schema` — `BS.FileType`, `BS.MimeType`, mime-type lookups
- `@beep/shared-domain` — `ValidACLs`, `ValidContentDispositions`
- `@beep/utils` — `noOp`, `nullOp`
- `@beep/errors` — Logging and error utilities (peerDep)
- `effect` — Effect runtime, Array, String, Struct, Record, Match

## Usage Patterns

### File Type Validation

```typescript
import * as Effect from "effect/Effect";
import { matchFileType, InvalidFileTypeError, UnknownFileTypeError } from "@beep/shared-ui";

const program = matchFileType(
  { name: "photo.jpg", size: 1024, type: "image/jpeg" },
  ["image", "video"]
);
// Effect<"image", InvalidFileTypeError | UnknownFileTypeError>

Effect.runPromise(program); // "image"
```

### Dropzone State Management

```typescript
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

  return <div>{state.isDragActive ? "Drop here!" : "Drag files"}</div>;
}
```

### Route Config Normalization

```typescript
import * as Effect from "effect/Effect";
import { fillInputRouteConfig, type FileRouterInputConfig } from "@beep/shared-ui";

// Array shorthand
const config1: FileRouterInputConfig = ["image", "video"];
const expanded1 = fillInputRouteConfig(config1);
// Effect<ExpandedRouteConfig, InvalidRouteConfigError>
// { image: { maxFileSize: "4MB", maxFileCount: 1, ... }, video: { ... } }

// Explicit config
const config2: FileRouterInputConfig = {
  image: { maxFileSize: "8MB", maxFileCount: 5 },
};
const expanded2 = fillInputRouteConfig(config2);
// Backfills minFileCount, contentDisposition defaults
```

### File Size Conversion

```typescript
import * as Effect from "effect/Effect";
import { fileSizeToBytes, bytesToFileSize } from "@beep/shared-ui";

const program = fileSizeToBytes("4MB");
// Effect<number, InvalidFileSizeError>

Effect.runSync(program); // 4194304

bytesToFileSize(4194304); // "4.00MB"
```

### Stable Callbacks with useEvent

```typescript
import { useEvent } from "@beep/shared-ui";

function MyComponent({ onSave }: { onSave: (data: string) => void }) {
  const [count, setCount] = useState(0);

  // ❌ WRONG: Creates new function every render
  const handleClick = () => {
    onSave(`Clicked ${count} times`);
  };

  // ✅ CORRECT: Stable reference, always sees latest count
  const handleClickStable = useEvent(() => {
    onSave(`Clicked ${count} times`);
  });

  return <button onClick={handleClickStable}>Click</button>;
}
```

### Clipboard Paste Integration

```typescript
import { usePaste } from "@beep/shared-ui";
import { getFilesFromClipboardEvent } from "@beep/shared-ui";

function MyUploader() {
  usePaste((event) => {
    const files = getFilesFromClipboardEvent(event);
    if (files && files.length > 0) {
      console.log("Pasted files:", files);
      // Handle files
    }
  });

  return <div>Paste files here (Ctrl+V)</div>;
}
```

### Next.js Upload Metadata Hydration

```typescript
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

### Generate User-Facing Upload Labels

```typescript
import { allowedContentTextLabelGenerator, type ExpandedRouteConfig } from "@beep/shared-ui";

const config: ExpandedRouteConfig = {
  image: { maxFileSize: "4MB", maxFileCount: 1 },
};

const label = allowedContentTextLabelGenerator(config);
// "Image (4MB)"

const multiConfig: ExpandedRouteConfig = {
  image: { maxFileSize: "8MB", maxFileCount: 5 },
  video: { maxFileSize: "16MB", maxFileCount: 3 },
};

const multiLabel = allowedContentTextLabelGenerator(multiConfig);
// "Images and videos"
```

## Integration Points

### With @beep/schema
- Uses `BS.FileType.Type` and `BS.MimeType.Type` for file type discrimination
- Calls `BS.lookup(filename)` for extension-based MIME type fallback
- Imports MIME type catalogs from `@beep/schema/integrations/files/mime-types/*`

### With @beep/shared-domain
- References `ValidACLs.Type` for S3 ACL settings
- References `ValidContentDispositions.Type` for HTTP Content-Disposition headers

### With @beep/ui
- Provides utility hooks (`useEvent`, `usePaste`) for UI components
- Dropzone state management used by upload components in `@beep/ui`

### With Feature Slices
- `packages/documents/ui` — File upload flows use `fillInputRouteConfig`, `matchFileType`, `generateClientDropzoneAccept`
- `packages/iam/ui` — May use `useEvent` for stable auth callbacks

## Effect-First Guardrails

### Always Use Effect for Validation

```typescript
// ❌ FORBIDDEN: Throwing errors
function parseFileSize(size: FileSize): number {
  const bytes = /* ... */;
  if (!bytes) throw new Error("Invalid size");
  return bytes;
}

// ✅ REQUIRED: Effect with tagged errors
const parseFileSize = (size: FileSize): Effect.Effect<number, InvalidFileSizeError> =>
  fileSizeToBytes(size);
```

### Use Effect Array/String Utilities

```typescript
// ❌ FORBIDDEN
const types = ["image/png", "image/jpeg"];
const joined = types.join(", ");

// ✅ REQUIRED
import * as A from "effect/Array";
const joined = pipe(types, A.join(", "));
```

### Tagged Error Construction

All errors extend `Data.TaggedError`:

```typescript
import * as Data from "effect/Data";

export class InvalidFileTypeError extends Data.TaggedError("InvalidFileType")<{
  readonly reason: string;
}> {
  constructor(fileType: string, fileName: string) {
    const reason = `File type ${fileType} not allowed for ${fileName}`;
    super({ reason });
  }
}

// Usage
const error = new InvalidFileTypeError("video", "my-file.mp4");
```

## React Patterns

### useEvent Over useCallback

```typescript
// ❌ AVOID: useCallback with dependency arrays
const handleSave = useCallback(() => {
  saveData(userId, formData);
}, [userId, formData]); // Easy to forget dependencies

// ✅ PREFER: useEvent (always stable, no deps)
const handleSave = useEvent(() => {
  saveData(userId, formData); // Always sees latest values
});
```

### Dropzone Reducer Pattern

Always use the provided `reducer` and `initialState`:

```typescript
import { reducer, initialState } from "@beep/shared-ui";

const [state, dispatch] = useReducer(reducer, initialState);

// Supported actions:
dispatch({ type: "focus" });
dispatch({ type: "blur" });
dispatch({ type: "openDialog" });
dispatch({ type: "closeDialog" });
dispatch({ type: "setDraggedFiles", payload: { isDragActive: true, ... } });
dispatch({ type: "setFiles", payload: { acceptedFiles: [...] } });
dispatch({ type: "reset" });
```

## File Upload Pipeline

### Route Config Flow

1. **Define config**: `FileRouterInputConfig` (array or object)
2. **Normalize**: `fillInputRouteConfig` → `ExpandedRouteConfig`
3. **Generate accept**: `generateClientDropzoneAccept` → `AcceptProp`
4. **Validate files**: `matchFileType`, `isValidSize`, `isValidQuantity`
5. **Handle upload**: Use `@beep/documents/server/StorageService`

### File Validation Pipeline

```typescript
import * as Effect from "effect/Effect";
import { matchFileType, isValidSize } from "@beep/shared-ui";

const validateFile = (file: File, allowedTypes: string[], maxSize: number) =>
  Effect.gen(function* () {
    const fileType = yield* matchFileType(file, allowedTypes);
    if (!isValidSize(file, 0, maxSize)) {
      return yield* Effect.fail(new InvalidFileSizeError(`${file.size}`));
    }
    return { file, fileType };
  });
```

## Common Pitfalls

### Don't Mix Route Config Formats

```typescript
// ❌ INVALID: Can't mix array and object
const config = ["image", { video: { maxFileSize: "8MB" } }];

// ✅ CORRECT: Pick one
const arrayConfig = ["image", "video"];
const objectConfig = { image: {}, video: { maxFileSize: "8MB" } };
```

### Always Await Effect Results

```typescript
// ❌ WRONG: Effect is lazy, won't run
const bytes = fileSizeToBytes("4MB");

// ✅ CORRECT: Run the effect
const bytes = Effect.runSync(fileSizeToBytes("4MB"));

// ✅ BETTER: Compose with other effects
const program = Effect.gen(function* () {
  const bytes = yield* fileSizeToBytes("4MB");
  // ...
});
```

### Don't Access Latest State in useCallback

```typescript
// ❌ STALE: userId captured at creation time
const handleSave = useCallback(() => {
  saveData(userId); // userId might be stale
}, []); // Empty deps = stale closure

// ✅ CORRECT: useEvent always sees latest
const handleSave = useEvent(() => {
  saveData(userId); // Always current
});
```

## Type Safety Notes

- `FileRouterInputKey` = `BS.FileType.Type | BS.MimeType.Type` (supports both "image" and "image/png")
- `FileSize` = `${1|2|4|8|16|32|64|128|256|512|1024}${"B"|"KB"|"MB"|"GB"}` (compile-time validated)
- `ExpandedRouteConfig` adds `ImageProperties` (`width`, `height`, `aspectRatio`) for `image` types
- `BadRequestError<T>` is generic to type the JSON error payload

## Testing Notes

- Use `@beep/testkit` for Effect testing
- Mock `BS.lookup` for MIME type resolution
- Use `initialState` for dropzone test setup
- Test file validation with `FileProperties` instead of real `File` objects

## Build Notes

- Generates ESM and CJS builds (Babel transform for "use client" directives)
- `babel-plugin-transform-next-use-client` preserves Next.js client boundaries
- No external runtime dependencies (all peer dependencies)
- Pure utility package — no state or side effects at module scope
