# HANDOFF P1 — Lexical Schemas: Domain Envelope + Application Union

<!-- Context Budget VERIFIED (926 words, ~3,700 tokens): Working ~2,200 | Episodic ~400 | Semantic ~600 | Procedural: links | Total ~3,200 / 4,000 -->

## Mission

Replace `S.Unknown` at `packages/documents/domain/src/entities/document/document.model.ts:25` with a proper Effect Schema for Lexical `SerializedEditorState`. This is a two-layer implementation: structural envelope at domain, discriminated union at application.

## Critical Constraints

- Domain layer (`@beep/documents-domain`) MUST NOT import from `lexical` or any `@lexical/*` package
- Domain envelope validates tree structure only (recursive `{ type, version, children? }`)
- Application schemas (`apps/todox/src/app/lexical/schema/`) handle per-node-type validation
- All schemas use Effect Schema (`import * as S from "effect/Schema"`)
- Recursive types use `S.suspend(() => Schema)`
- NEVER use native methods (`.map`, `.filter`, etc.) — use Effect utilities

## Source Verification

| Source | Location | Version | Verified |
|--------|----------|---------|----------|
| SerializedLexicalNode | `node_modules/lexical/LexicalNode.d.ts` | v0.40.0 | Yes - `{ type: string, version: number, $?: Record<string, unknown> }` |
| SerializedElementNode | `node_modules/lexical/LexicalElementNode.d.ts` | v0.40.0 | Yes - adds children, direction, format, indent |
| SerializedTextNode | `node_modules/lexical/LexicalTextNode.d.ts` | v0.40.0 | Yes - adds text, format bitmask, detail, mode, style |
| SerializedRootNode | `node_modules/lexical/LexicalRootNode.d.ts` | v0.40.0 | Yes - extends SerializedElementNode |
| NodeState `$` key | Lexical NodeState docs | v0.40.0 | Yes - `$` holds Record for Effect/Zod/ArkType/Valibot validation |
| Existing schemas | `apps/todox/src/app/lexical/schema/schemas.ts` | local | Yes - `$` -> `state` mapping via `S.fromKey` |
| PlaygroundNodes | `apps/todox/src/app/lexical/nodes/PlaygroundNodes.ts` | local | Yes - 34 node types registered |

## Existing Code State

### Domain Model (THE TARGET)
`packages/documents/domain/src/entities/document/document.model.ts`
```typescript
contentRich: BS.FieldOptionOmittable(S.Unknown),  // Line 25 — REPLACE THIS
```

### Existing Base Schemas (EXTEND THESE)
`apps/todox/src/app/lexical/schema/schemas.ts`
- `SerializedLexicalNode`: `{ type: S.String, version: S.Number, state: Option<Record> }` ($ -> state via fromKey)
- `SerializedEditorState`: `{ root: SerializedLexicalNode }` — needs recursive children support

### Existing Node Schema (PATTERN TO FOLLOW)
`apps/todox/src/app/lexical/schema/nodes.schema.ts`
- `SerializedImageNode extends SerializedLexicalNode.extend(...)` — proven pattern for node extension

### Registered Nodes (~30 types)
`apps/todox/src/app/lexical/nodes/PlaygroundNodes.ts`

## Lexical Type Reference (from node_modules v0.40.0)

```typescript
// Base
SerializedLexicalNode = { type: string, version: number, $?: Record<string, unknown> }

// Element (has children — recursive)
SerializedElementNode = SerializedLexicalNode & {
  children: SerializedLexicalNode[],
  direction: 'ltr' | 'rtl' | null,
  format: ElementFormatType,    // '' | 'left' | 'start' | 'center' | 'right' | 'end' | 'justify'
  indent: number,
  textFormat?: number,          // optional bitmask
  textStyle?: string,           // optional CSS
}

// Root (just an element node)
SerializedRootNode = SerializedElementNode

// Text
SerializedTextNode = SerializedLexicalNode & {
  detail: number,
  format: number,  // bitmask: bold=1, italic=2, strikethrough=4, underline=8, code=16, subscript=32, superscript=64, highlight=128
  mode: 'normal' | 'token' | 'segmented',
  style: string,
  text: string,
}

// Specific nodes (extend element or text):
SerializedHeadingNode    = SerializedElementNode & { tag: 'h1'|'h2'|'h3'|'h4'|'h5'|'h6' }
SerializedQuoteNode      = SerializedElementNode
SerializedListNode       = SerializedElementNode & { listType: 'bullet'|'number'|'check', start: number, tag: 'ol'|'ul' }
SerializedListItemNode   = SerializedElementNode & { checked: boolean|undefined, value: number }
SerializedCodeNode       = SerializedElementNode & { language: string|null|undefined }
SerializedCodeHighlight  = SerializedTextNode & { highlightType: string|null|undefined }
SerializedLinkNode       = SerializedElementNode & { url: string, rel?: string, target?: string, title?: string }
SerializedAutoLinkNode   = SerializedLinkNode & { isUnlinked: boolean }
SerializedTableNode      = SerializedElementNode & { colWidths?: number[], rowStriping?: boolean }
SerializedTableRowNode   = SerializedElementNode & { height?: number }
SerializedTableCellNode  = SerializedElementNode & { colSpan: number, rowSpan: number, headerState: number, width?: number, backgroundColor?: string }
SerializedMarkNode       = SerializedElementNode & { ids: string[] }
SerializedLineBreakNode  = SerializedLexicalNode  (no children, no text)
SerializedTabNode        = SerializedTextNode
SerializedHorizontalRule = SerializedLexicalNode  (no children, no text)
SerializedParagraphNode  = SerializedElementNode & { textFormat?: number, textStyle?: string }
```

## Work Items

### WI-1: Create domain envelope schemas (new file)

Location: `packages/documents/domain/src/value-objects/SerializedEditorState.ts`

Create schemas for:
- `SerializedLexicalNodeEnvelope` — base node with `type`, `version`, optional `$`
- `SerializedTextNodeEnvelope` — extends base with `text`, `format` (number), `detail`, `mode`, `style`
- `SerializedElementNodeEnvelope` — extends base with `children` (recursive via `S.suspend`), `direction`, `format`, `indent`
- `SerializedRootNodeEnvelope` — element node specifically typed as `type: "root"`
- `SerializedEditorStateEnvelope` — `{ root: SerializedRootNodeEnvelope }`

The envelope schemas validate structural correctness without knowing specific node types. Any `type` string is accepted — the discriminated union at application layer handles specifics.

### WI-2: Update Document model

Location: `packages/documents/domain/src/entities/document/document.model.ts`

Change line 25 from:
```typescript
contentRich: BS.FieldOptionOmittable(S.Unknown),
```
To:
```typescript
contentRich: BS.FieldOptionOmittable(SerializedEditorStateEnvelope),
```

### WI-3: Export from value-objects barrel

Update `packages/documents/domain/src/value-objects/index.ts` to export the new schemas.

### WI-4: Create application-layer node schemas

Location: `apps/todox/src/app/lexical/schema/`

Extend the existing `SerializedLexicalNode` with per-node-type schemas:
- Extend `schemas.ts` with `SerializedElementNode` and `SerializedTextNode` (adding children, format, etc.)
- Add new file `node-types.schema.ts` with schemas for all 30+ node types
- Create `SerializedLexicalNodeUnion` discriminated union on `type` field
- Update `SerializedEditorState` to use the recursive union

### WI-5: Write tests

- Domain: Test that valid Lexical JSON passes envelope validation, invalid structures fail
- Application: Test encode/decode round-trips for each node type schema

## Verification

```bash
bun run check --filter=@beep/documents-domain
bun run check --filter=@beep/documents-tables
bun run check --filter=@beep/todox
bun run lint:fix --filter=@beep/documents-domain
bun run lint:fix --filter=@beep/todox
```

## Phase Completion Protocol

Phase 1 is **NOT complete** until ALL of the following are done:

1. All work items (WI-1 through WI-5) are implemented and verified
2. Quality gates pass (check, lint) for all affected packages
3. `REFLECTION_LOG.md` updated with Phase 1 learnings:
   - What worked / what didn't
   - Patterns discovered (e.g., `S.suspend` behavior, recursive schema gotchas)
   - Research gaps resolved or confirmed
4. `handoffs/HANDOFF_P2.md` created with full context for Phase 2
5. `handoffs/P2_ORCHESTRATOR_PROMPT.md` created as copy-paste prompt for Phase 2
6. Learnings relevant to Phase 2 (e.g., discriminated union patterns, schema extension gotchas) MUST be incorporated into `HANDOFF_P2.md` under a "Learnings from Phase 1" section
