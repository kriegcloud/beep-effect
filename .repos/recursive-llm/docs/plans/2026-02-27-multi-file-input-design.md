# Multi-File Input: Filesystem-First Design

**Date:** 2026-02-27
**Status:** Approved (Rev 3 — addresses second review pass)

## Problem

The RLM CLI accepts a single context source: `--context` (inline string) or `--context-file` (one file path). Both funnel into a single `context: string` field that gets injected into `__vars.context` via IPC.

This creates three problems:
1. **No multi-file support.** Users with separate datasets (users.ndjson + posts.ndjson) must pre-merge externally.
2. **32MB IPC frame limit.** Large files exceed the SetVar frame size and fail silently.
3. **Single-source metadata.** `analyzeContext()` assumes one input, so format detection and field heuristics don't compose across sources.

## Design: Filesystem-First with Input Manifest

### Principle

Files belong on the filesystem. The model already knows `readFile()` and `shell()`. Instead of serializing file contents through IPC, stage files into the sandbox directory and give the model a metadata manifest describing what's available.

### CLI Interface

```bash
# Repeatable --input flag with optional naming
rlm "analyze these datasets" \
  --input users=data/users.ndjson \
  --input posts=data/posts.ndjson \
  --input spec=docs/schema.md

# Auto-naming from basename (no = means use filename stem as name)
rlm "compare these" --input data/report-q3.csv --input data/report-q4.csv

# Inline context still works for simple cases
rlm "summarize this" --context "Some inline text here"

# Combined: inline context + input files
rlm "analyze with instructions" \
  --context "Focus on sentiment" \
  --input corpus=data/articles.ndjson
```

**Naming rules:** Same as existing `--media` flag. If `=` is present, the left side is the logical name. Otherwise, the basename without extension becomes the name. Duplicate logical names are a CLI validation error.

**Hard limits:** Maximum 50 input files and 2 GB total staged bytes per run. Exceeding either is a CLI validation error.

**Validation rules:**
- Each path must point to a regular file (no directories, no device files).
- Symlinks are resolved at validation time (`fs.realpathSync`) and the resolved path must be a regular file.
- Unreadable files produce a deterministic `CliInputError` before the run starts.
- Logical names must match `[A-Za-z][A-Za-z0-9_-]*` (same regex as `--media`).
- Logical names longer than 128 characters are rejected.
- Staged filenames are `<logicalName>.<originalExtension>` — uniqueness follows from logical name uniqueness.

### --context-file Deprecation

`--context-file` is **retained as a deprecated alias** that maps to `--input context=<path>`. When used:
1. The file is staged to the sandbox directory as `context.<ext>` (same as any `--input`).
2. A stderr warning is emitted: `⚠ --context-file is deprecated and its behavior has changed. File is staged to sandbox directory; use readFile('context.<ext>') to access contents. Migrate to --input instead.`
3. Cannot be combined with an `--input` that also uses the logical name `context`.

**Behavioral break (accepted):** Unlike the old behavior, `--context-file` no longer populates `__vars.context` with file contents. The file is staged to the sandbox directory only. The deprecation warning communicates this clearly.

**Precedence with --context:** When both `--context` (inline string) and `--context-file` (deprecated alias) are provided, both take effect independently:
- `--context` populates `__vars.context` with the inline string.
- `--context-file` stages the file to the sandbox directory as `context.<ext>` and adds it to `__vars.inputs`.

This differs from the old behavior (where `--context-file` overrode `--context`). The warning message should note this.

### Programmatic API

```typescript
interface InputFile {
  readonly name: string              // Logical name (e.g., "users")
  readonly path: string              // Filesystem path to source file
  readonly metadata?: ContextMetadata // Pre-computed or auto-detected
}

interface CompleteOptionsBase {
  readonly query: string
  readonly context?: string          // Optional inline context (was required)
  readonly inputs?: ReadonlyArray<InputFile>  // NEW
  readonly contextMetadata?: ContextMetadata  // For inline context only
  readonly mediaAttachments?: ReadonlyArray<MediaAttachment>
  readonly depth?: number
  readonly tools?: ReadonlyArray<RlmToolAny>
  readonly outputJsonSchema?: object
}
```

- `context` becomes optional (`string | undefined`, was required `string`).
- **Normalization contract:** At the API boundary (`Rlm.stream` / `Rlm.complete`), `undefined` context is normalized to `""` before passing to the Scheduler. Internal code continues to use `context.length` safely. The `context` field in `CompletionOptions` (internal) remains `string`, never `undefined`.
- New `inputs` array carries file-based data sources.
- `context`, `inputs`, or both may be provided. Query-only calls (neither context nor inputs) are valid — the model just has no data to work with.
- `contextMetadata` applies only to inline `context`. Each input carries its own metadata.

### Data Flow

```
CLI (--input users=data/users.ndjson --input posts=data/posts.ndjson)
  │
  ├─ Normalize.ts: parse --input specs, resolve symlinks, validate files
  │  exist as regular files, check 50-file/2GB limits
  │
  ├─ Run.ts: for each InputFile, run analyzeContext() on a prefix
  │  read (first 250KB) to detect format/fields/recordCount.
  │  Metadata values from prefix analysis are estimates, marked as such.
  │
  ├─ Rlm.stream({ query, inputs: [...], context?: "..." })
  │       ↓ context normalized to "" if undefined
  │
  ├─ Scheduler handleStartCall (ROOT CALL ONLY):
  │    1. Copy each input file into sandbox working directory.
  │       Destination: <sandboxDir>/<logicalName>.<originalExtension>
  │    2. Inject __vars.inputs manifest (metadata only, not content).
  │    3. If inline context provided (non-empty), inject __vars.context.
  │    4. Inject __vars.query as before.
  │
  └─ Sandbox: model accesses files via readFile("users.ndjson")
              or shell("jq '.[] | .name' users.ndjson")
              Metadata available in __vars.inputs
```

**Key property:** File contents never cross the IPC boundary. They're copied at the filesystem level. The IPC frame limit (32MB) applies only to the `__vars.inputs` manifest, which is lightweight metadata (~1-2KB per file, well under the limit even at 50 files).

### Sandbox Lifecycle and Sub-calls

Each `StartCall` creates a fresh sandbox with its own working directory. Sub-calls spawned by `llm_query()` get their **own** sandbox and do NOT share the root call's working directory. This is existing behavior and this design does not change it.

**Consequence: input files are available only in the root call's sandbox.** Sub-calls receive their context through the `llm_query(query, context)` second argument, which the root-call model must provide from data it has already read. This is the correct pattern — the root call reads input files, extracts relevant data, and passes subsets to sub-calls via their context argument.

**Root-call only staging:** File staging happens only when `inputs` is non-empty AND `depth === 0`. The `inputs` array is NOT forwarded to sub-call `StartCall` commands.

### __vars.inputs Manifest Schema

```typescript
// Injected as __vars.inputs — array of InputManifestEntry
interface InputManifestEntry {
  readonly name: string          // Logical name
  readonly path: string          // Relative path in sandbox dir (e.g., "users.ndjson")
  readonly bytes: number         // File size in bytes (exact, from stat)
  readonly format: string        // Detected format: "ndjson" | "json" | "csv" | etc.
  readonly lines: number | null  // Line count. null if unknown.
  readonly linesEstimated: boolean // true if lines was estimated from prefix
  readonly recordCount: number | null  // Record count. null for non-structured.
  readonly recordCountEstimated: boolean
  readonly fields: string[] | null     // Detected field names (first record). null if non-structured.
  readonly sampleRecord: string | null // First record as string (up to 220 chars). null if non-structured.
}
```

**Accuracy contract:** `bytes` is always exact (from `stat`). `lines` and `recordCount` are exact for files where the full content was analyzed (≤ 250KB), and estimated for larger files (derived from the first 250KB prefix). The `*Estimated` boolean flags distinguish exact from approximate values. `fields` and `sampleRecord` always come from the first record regardless of file size.

### File Staging Safety

**Copy semantics:** Files are copied with `Bun.write(destPath, Bun.file(srcPath))`. This is not transactional — a crash during copy can leave a partial file. However, if the copy call itself returns an error (source disappeared, permission denied, disk full), the error propagates as a `SandboxError` that terminates the `StartCall`. The sandbox directory is cleaned up by the existing scope close logic.

**Post-copy size check:** After all files are copied, the total staged bytes are re-checked against the 2GB limit. If a file grew between CLI validation and copy (TOCTOU), and the total now exceeds the limit, the `StartCall` fails with a `SandboxError`. This is a best-effort safeguard — not a hard guarantee against concurrent modification.

**Symlink handling:** Symlinks in `--input` paths are resolved at CLI validation time (`fs.realpathSync`). The resolved path is used for both validation (must be a regular file) and copying. The staged file in the sandbox directory is always a regular file, never a symlink.

**Collision prevention:** Staged filename is `<logicalName>.<extension>`. Since logical names are unique (enforced at CLI validation), collisions between input files cannot occur. If a staged filename collides with a sandbox-internal file (unlikely but possible), the copy overwrites it; sandbox-internal files are ephemeral.

### System Prompt Changes

When `inputs` are present, the system prompt adds an "Input Files" section.

**Prompt budget:** The input files table is capped at **20 entries**. If more than 20 inputs are provided, the first 20 are shown in the table and a summary line follows: `(and N more files — see __vars.inputs for full manifest)`. This prevents unbounded prompt growth.

```
## Input Files
The following data files are available in your working directory:

| File | Format | Size | Records | Fields |
|------|--------|------|---------|--------|
| users.ndjson | ndjson | 15.0 MB | ~15,000 | id, name, email, ... |
| posts.ndjson | ndjson | 8.2 MB | ~8,200 | id, author, text, topics |
| schema.md | markdown | 4.2 KB | — | — |

(Record counts marked ~ are estimated from a file prefix.)

Access with `await readFile("users.ndjson")` or process with shell tools.
File metadata is also available in `__vars.inputs`.

For large files, avoid reading the entire file into a single variable.
Use shell tools, read in chunks, or process line-by-line.
```

**Prompt sanitization:** All metadata strings are sanitized before interpolation into the system prompt markdown table:
- Newlines (`\n`, `\r`), backticks, and **pipe characters** (`|`) are stripped or replaced with spaces to prevent markdown table/code injection.
- Field names are truncated to 64 chars each, capped at 24 fields shown.
- Sample records are truncated to 220 chars.
- File names longer than 128 chars are rejected at CLI validation (never reach the prompt).
- All interpolated strings are passed through a shared `sanitizePromptString(s: string, maxLen: number)` helper.

The existing "Variable Space" section continues to describe `__vars.context` (if inline context is provided) and `__vars.query`.

### Backward Compatibility

| Before | After | Notes |
|--------|-------|-------|
| `--context "string"` | `--context "string"` | Unchanged |
| `--context-file path` | `--context-file path` | Deprecated alias → `--input context=path`. **Behavioral break:** no longer populates __vars.context. Stderr warning emitted. |
| `--context "s" --context-file p` | `--context "s" --context-file p` | **Changed:** Both now take effect (context→__vars.context, file→staged). Old behavior: context-file overrode context. |
| `Rlm.stream({ context: "..." })` | `Rlm.stream({ context: "..." })` | `context` is now optional externally, normalized to `""` internally |
| `__vars.context` | `__vars.context` | Still populated for inline `--context` only |
| `__vars.contextMeta` | `__vars.contextMeta` | Still populated for inline `--context` only |
| — | `__vars.inputs` | New: array of input file metadata |

### What This Does NOT Change

- **Media attachments** (`--media`, `--media-url`): unchanged. These are for binary blobs sent to multimodal LLM calls, not for sandbox data processing.
- **Sandbox filesystem API** (`readFile`, `writeFile`, `shell`, etc.): unchanged. Input files are just regular files in the working directory.
- **Sandbox lifecycle:** Each call still gets its own sandbox and working directory. Input file staging is additive to the root call's sandbox only.
- **IPC protocol**: unchanged. Only the `__vars.inputs` manifest goes through IPC — metadata only, well within frame limits.
- **Bridge calls** (`llm_query`, `llm_query_batched`): unchanged.

## Files Modified (Estimated)

| File | Change |
|------|--------|
| `src/cli/Command.ts` | Add `--input` option, keep `--context-file` as deprecated |
| `src/cli/Normalize.ts` | Parse `--input` specs with symlink resolution, file validation, size/count limits. Map `--context-file` to `--input context=path` with warning. |
| `src/CliLayer.ts` | Update `CliArgs` interface: add `inputs`, keep `contextFile` mapped internally |
| `src/cli/Run.ts` | Analyze input file metadata (prefix read), pass `inputs` to Rlm |
| `src/Rlm.ts` | Update `CompleteOptionsBase`: make `context` optional, add `inputs`, normalize `undefined` to `""` |
| `src/RlmTypes.ts` | Add `InputFile`, `InputManifestEntry` types, update `CompletionOptions` |
| `src/Scheduler.ts` | Stage files to sandbox dir (root call only, depth===0), inject `__vars.inputs` manifest, post-copy size check |
| `src/SystemPrompt.ts` | Add "Input Files" section with sanitized metadata table, 20-entry cap, `sanitizePromptString` helper |
| `src/ContextMetadata.ts` | Support partial analysis (first 250KB) with estimated flags |

## Test Plan

| Test File | Cases |
|-----------|-------|
| `test/CliCommand.test.ts` | `--input` parsing (named, auto-named), `--context-file` deprecation alias emits warning, `--context-file` maps to input, unknown flag rejection unchanged |
| `test/CliNormalize.test.ts` | Validation: duplicate names, name regex, symlink resolution, unreadable files, 50-file limit, 2GB limit, malformed specs (missing path, empty name), `--context-file` + `--input context=` conflict |
| `test/Scheduler.test.ts` | File staging at depth=0, no staging at depth>0, manifest injection shape, post-copy size re-check, copy failure → SandboxError, sandbox cleanup on staging failure |
| `test/SystemPrompt.test.ts` | Input files table rendering, 20-entry cap with summary, sanitization (pipe chars, newlines, backticks in field names), estimated vs exact record counts |
| `test/Rlm.test.ts` | `context: undefined` normalized to `""`, query-only calls (no context, no inputs), `inputs` forwarded to scheduler |
| `test/CliCommand.test.ts` | Precedence: `--context` + `--context-file` both take effect independently |
