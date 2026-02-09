# Evidence Offset and Version Pinning Patterns

## Non-Negotiable Invariants

- Evidence spans must always be version-pinned:
  - `{ documentId, documentVersionId, startChar, endChar }`
- Offsets use JS UTF-16 string indices:
  - 0-indexed
  - end-exclusive `[startChar, endChar)`
- Offset drift is forbidden:
  - Never highlight against "latest" content.
  - Always resolve and highlight against the cited `documentVersionId` content.

## Highlight Semantics

Given the immutable content string for the cited version:

```ts
const highlightedText = content.slice(startChar, endChar);
```

Validation must be performed against the immutable version string:

```ts
if (startChar < 0) throw new Error("startChar < 0");
if (endChar < startChar) throw new Error("endChar < startChar");
if (endChar > content.length) throw new Error("endChar > content.length");
```

## Common Failure Modes

- Using Postgres `length(content)` (codepoint length) to validate bounds while the UI slices a JS string (UTF-16 code units).
- Resolving evidence spans through optional join paths (dead links) instead of storing `(documentVersionId, startChar, endChar)` directly on evidence-of-record rows.

