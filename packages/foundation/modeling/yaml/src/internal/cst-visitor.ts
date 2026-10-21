// SAX-style CST visitor for YAML documents.
//
// `cstEvents()` walks YAML source text and yields CstVisitorEvent values in
// document order. All content is delivered as raw source strings — no type
// resolution occurs at the CST level. CST-level parse errors are surfaced as
// CstErrorEvent records rather than thrown failures.
//
// CST structure notes:
//
// The parser produces a CST where block-map nodes do NOT include their first
// key scalar. Instead, the first key of a block mapping appears as a sibling
// node (at the parent level) immediately before the block-map node that holds
// the `:` indicator and value. This means:
//
// For `name: John`, the document children are:
// - `flow-scalar("name")` — the key (outside the block-map)
// - `block-map(": John")` — children start with whitespace(":") then the value
//
// The visitor detects this "scalar → block-map" sibling pattern and emits the
// scalar as a `CstKeyEvent`. Inside a block-map, the first non-trivia scalar
// is a value when the first key is external. Compact mappings in sequences
// contain their first key; indicators also delimit omitted values.

import { $YamlId } from "@beep/identity/packages";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { parseCSTAll } from "./cst-parser.ts";
import type { CstNode } from "./cst.ts";

// ---------------------------------------------------------------------------
// Internal path type
// ---------------------------------------------------------------------------

const $I = $YamlId.create("internal/cst-visitor");
const Path = S.Array(S.Union([S.String, S.Finite])).pipe(
  $I.annoteSchema("Path", {
    description: "Ordered mapping names and sequence indices locating a CST event.",
  })
);
type Path = typeof Path.Type;

const eventFields = {
  path: Path.pipe(
    $I.annoteKey("CstVisitorEvent.path", { description: "Location of the event in document traversal." })
  ),
  depth: S.Finite.pipe(
    $I.annoteKey("CstVisitorEvent.depth", { description: "Nesting depth, with the document at zero." })
  ),
};
const sourceEventFields = {
  ...eventFields,
  source: S.String.pipe(
    $I.annoteKey("CstVisitorEvent.source", { description: "Raw source content associated with the event." })
  ),
};
const CstVisitorEvent = S.TaggedUnion({
  CstDocumentStartEvent: eventFields,
  CstDocumentEndEvent: eventFields,
  CstMapStartEvent: sourceEventFields,
  CstMapEndEvent: eventFields,
  CstSeqStartEvent: sourceEventFields,
  CstSeqEndEvent: eventFields,
  CstKeyEvent: sourceEventFields,
  CstValueEvent: sourceEventFields,
  CstScalarEvent: sourceEventFields,
  CstAliasEvent: sourceEventFields,
  CstCommentEvent: sourceEventFields,
  CstDirectiveEvent: sourceEventFields,
  CstErrorEvent: sourceEventFields,
}).pipe(
  $I.annoteSchema("CstVisitorEvent", {
    description: "Thirteen tagged SAX event payloads emitted in raw document order.",
  })
);

/** Normalize optional CST children without inventing sparse entries. */
const childrenOf = (node: CstNode): ReadonlyArray<CstNode> => O.fromNullishOr(node.children).pipe(O.getOrElse(A.empty));

// ---------------------------------------------------------------------------
// Event records
// ---------------------------------------------------------------------------

/**
 * Emitted when the CST visitor enters a document node.
 *
 * @category type-level
 * @since 0.0.0
 */
export type CstDocumentStartEvent = typeof CstVisitorEvent.cases.CstDocumentStartEvent.Type;

/**
 * Emitted when the CST visitor exits a document node.
 *
 * @category type-level
 * @since 0.0.0
 */
export type CstDocumentEndEvent = typeof CstVisitorEvent.cases.CstDocumentEndEvent.Type;

/**
 * Emitted when the CST visitor enters a block-map or flow-map node.
 *
 * @category type-level
 * @since 0.0.0
 */
export type CstMapStartEvent = typeof CstVisitorEvent.cases.CstMapStartEvent.Type;

/**
 * Emitted when the CST visitor exits a block-map or flow-map node.
 *
 * @category type-level
 * @since 0.0.0
 */
export type CstMapEndEvent = typeof CstVisitorEvent.cases.CstMapEndEvent.Type;

/**
 * Emitted when the CST visitor enters a block-seq or flow-seq node.
 *
 * @category type-level
 * @since 0.0.0
 */
export type CstSeqStartEvent = typeof CstVisitorEvent.cases.CstSeqStartEvent.Type;

/**
 * Emitted when the CST visitor exits a block-seq or flow-seq node.
 *
 * @category type-level
 * @since 0.0.0
 */
export type CstSeqEndEvent = typeof CstVisitorEvent.cases.CstSeqEndEvent.Type;

/**
 * Emitted when the CST visitor encounters a scalar that is a map key.
 *
 * @category type-level
 * @since 0.0.0
 */
export type CstKeyEvent = typeof CstVisitorEvent.cases.CstKeyEvent.Type;

/**
 * Emitted when the CST visitor encounters a scalar that is a map value.
 *
 * @category type-level
 * @since 0.0.0
 */
export type CstValueEvent = typeof CstVisitorEvent.cases.CstValueEvent.Type;

/**
 * Emitted when the CST visitor encounters a standalone scalar (not a map key
 * or value — e.g., a sequence item or bare document scalar).
 *
 * @category type-level
 * @since 0.0.0
 */
export type CstScalarEvent = typeof CstVisitorEvent.cases.CstScalarEvent.Type;

/**
 * Emitted when the CST visitor encounters an alias reference node (including the leading `*`).
 *
 * @category type-level
 * @since 0.0.0
 */
export type CstAliasEvent = typeof CstVisitorEvent.cases.CstAliasEvent.Type;

/**
 * Emitted when the CST visitor encounters a comment node (including the leading `#`).
 *
 * @category type-level
 * @since 0.0.0
 */
export type CstCommentEvent = typeof CstVisitorEvent.cases.CstCommentEvent.Type;

/**
 * Emitted when the CST visitor encounters a directive node (e.g., `%YAML 1.2`).
 *
 * @category type-level
 * @since 0.0.0
 */
export type CstDirectiveEvent = typeof CstVisitorEvent.cases.CstDirectiveEvent.Type;

/**
 * Emitted when the CST visitor encounters an error node in the CST.
 *
 * @category type-level
 * @since 0.0.0
 */
export type CstErrorEvent = typeof CstVisitorEvent.cases.CstErrorEvent.Type;

/**
 * A discriminated union of all thirteen SAX-style YAML CST visitor events.
 *
 * @category type-level
 * @since 0.0.0
 */
export type CstVisitorEvent = typeof CstVisitorEvent.Type;

// ---------------------------------------------------------------------------
// Node classification helpers
// ---------------------------------------------------------------------------

/**
 * Test whether a CST node is structural trivia (whitespace, newline, anchor, or tag).
 *
 * **Details**
 *
 * Trivia nodes are skipped during traversal — they carry no semantic content
 * and are only meaningful for source fidelity. Anchors and tags are classified
 * as trivia here because they are metadata attached to the following content
 * node rather than standalone events.
 */
function isTriviaCstNode(node: CstNode): boolean {
  return node.type === "whitespace" || node.type === "newline" || node.type === "anchor" || node.type === "tag";
}

/**
 * Test whether a CST node is a scalar (flow-scalar or block-scalar).
 *
 * **Details**
 *
 * Both flow and block scalars carry raw source text. The distinction matters
 * for the parser but not for the visitor's key/value classification logic.
 */
function isScalarCstNode(node: CstNode): boolean {
  return node.type === "flow-scalar" || node.type === "block-scalar";
}

/**
 * Test whether a CST node is specifically a block-map.
 *
 * **Details**
 *
 * Distinguished from {@link isMapCstNode} because the "scalar followed by
 * block-map" sibling pattern only applies to block maps, not flow maps.
 */
function isBlockMapCstNode(node: CstNode): boolean {
  return node.type === "block-map";
}

/**
 * Test whether a CST node is any kind of map (block-map or flow-map).
 *
 * **Details**
 *
 * Used when the traversal needs to emit MapStart/MapEnd events regardless
 * of the map's block vs flow representation.
 */
function isMapCstNode(node: CstNode): boolean {
  return node.type === "block-map" || node.type === "flow-map";
}

/**
 * Test whether a CST node is any kind of sequence (block-seq or flow-seq).
 *
 * **Details**
 *
 * Sequences are walked via {@link walkSiblings} for their children, as
 * sequence entries do not have the key/value alternation of maps.
 */
function isSeqCstNode(node: CstNode): boolean {
  return node.type === "block-seq" || node.type === "flow-seq";
}

/** True when `source` contains a line break. */
function hasLineBreak(source: string): boolean {
  return Str.includes("\n")(source) || Str.includes("\r")(source);
}

/** True when `node` is a structural-punctuation leaf whose raw source is `indicator`. */
function isIndicatorNode(node: CstNode, indicator: string): boolean {
  return node.type === "whitespace" && node.source === indicator;
}

/** The tag of a source-carrying leaf event. */
type LeafEventTag = (CstCommentEvent | CstDirectiveEvent | CstErrorEvent | CstAliasEvent)["_tag"];

/** Leaf events among sibling nodes (document-level and sequence-entry content). */
const siblingLeafTags: Readonly<Partial<Record<CstNode["type"], LeafEventTag>>> = {
  comment: "CstCommentEvent",
  directive: "CstDirectiveEvent",
  error: "CstErrorEvent",
  alias: "CstAliasEvent",
};

/** Leaf events among block-map children once comments and trivia are handled. */
const blockMapLeafTags: Readonly<Partial<Record<CstNode["type"], LeafEventTag>>> = {
  directive: "CstDirectiveEvent",
  error: "CstErrorEvent",
};

/** A source-carrying leaf event for `node`. */
function leafEvent(tag: LeafEventTag, node: CstNode, path: Path, depth: number): CstVisitorEvent {
  return { _tag: tag, path, depth, source: node.source };
}

/**
 * Key/value alternation state while walking a mapping's children: whether
 * the next scalar is a key, whether the open key already has content, and
 * (block maps) whether an entry boundary was crossed since the last `:`.
 */
const MapWalkState = S.Struct({
  expectingKey: S.mutableKey(S.Boolean).pipe(
    $I.annoteKey("MapWalkState.expectingKey", { description: "Whether the next scalar is a key." })
  ),
  keyHasContent: S.mutableKey(S.Boolean).pipe(
    $I.annoteKey("MapWalkState.keyHasContent", { description: "Whether the open key already has content." })
  ),
  crossedNewline: S.mutableKey(S.Boolean).pipe(
    $I.annoteKey("MapWalkState.crossedNewline", {
      description: "Whether a physical entry boundary was crossed since the last value indicator.",
    })
  ),
}).pipe(
  $I.annoteSchema("MapWalkState", {
    description: "Writable key/value alternation state of a mapping walk, constructed without per-step validation.",
  })
);
type MapWalkState = typeof MapWalkState.Type;

/** Expect a key with no content yet. */
function openKey(walk: MapWalkState): void {
  walk.expectingKey = true;
  walk.keyHasContent = false;
}

/** A value collection or alias filled the open key, if one is expected. */
function markKeyContent(walk: MapWalkState): void {
  if (walk.expectingKey) walk.keyHasContent = true;
}

/** Close the open key at a `:`; true when it had no content, so an empty key event is due. */
function closeKey(walk: MapWalkState): boolean {
  const emptyKey = walk.expectingKey && !walk.keyHasContent;
  walk.expectingKey = false;
  walk.keyHasContent = false;
  return emptyKey;
}

/** The key or value event for a scalar in a mapping; a key marks the open key as filled. */
function scalarRoleEvent(
  isKey: boolean,
  node: CstNode,
  ...[path, depth, walk]: [path: Path, depth: number, walk: MapWalkState]
): CstVisitorEvent {
  if (!isKey) return { _tag: "CstValueEvent", path, depth, source: node.source };
  walk.keyHasContent = true;
  return { _tag: "CstKeyEvent", path, depth, source: node.source };
}

/**
 * Walk a collection node: map start/end events around its children
 * (block-map children by {@link walkBlockMapChildren} outside flow context,
 * otherwise by {@link walkFlowMapChildren}), or sequence start/end events
 * around its entries via {@link walkSiblings}.
 */
function* walkCollection(node: CstNode, path: Path, depth: number, inFlow: boolean): Generator<CstVisitorEvent> {
  if (!isMapCstNode(node)) {
    yield { _tag: "CstSeqStartEvent", path, depth, source: node.source };
    yield* walkSiblings(childrenOf(node), path, depth + 1);
    yield { _tag: "CstSeqEndEvent", path, depth };
    return;
  }
  yield { _tag: "CstMapStartEvent", path, depth, source: node.source };
  const walkChildren = !inFlow && isBlockMapCstNode(node) ? walkBlockMapChildren : walkFlowMapChildren;
  yield* walkChildren(childrenOf(node), path, depth + 1);
  yield { _tag: "CstMapEndEvent", path, depth };
}

/** Walk a mapping's collection value, or emit an alias value for any other node. */
function* walkCollectionOrAlias(node: CstNode, path: Path, depth: number, inFlow: boolean): Generator<CstVisitorEvent> {
  if (isMapCstNode(node) || isSeqCstNode(node)) yield* walkCollection(node, path, depth, inFlow);
  else yield { _tag: "CstAliasEvent", path, depth, source: node.source };
}

// ---------------------------------------------------------------------------
// walkSiblings — walk a flat list of sibling nodes, handling the
// "scalar → block-map" pattern for block mapping key detection
// ---------------------------------------------------------------------------

/**
 * Walk an ordered list of sibling CST nodes, emitting events.
 *
 * **Details**
 *
 * This is the core traversal used for document-level children and for
 * sequence entry content. It detects the "scalar immediately followed by a
 * block-map sibling" pattern and emits the scalar as a {@link CstKeyEvent},
 * then walks the block-map as a continuation of the same mapping pair.
 *
 * All other scalars in this context are emitted as {@link CstScalarEvent}.
 *
 * This function is the entry point for both document-level and sequence-level
 * children. It does not maintain key/value alternation state — that logic
 * lives in {@link walkBlockMapChildren} and {@link walkFlowMapChildren}. The
 * look-ahead via {@link findNextContent} is intentionally limited to one node
 * because the CST guarantees that a block-map immediately follows its key
 * scalar without intervening content nodes.
 */
function* walkSiblings(nodes: ReadonlyArray<CstNode>, path: Path, depth: number): Generator<CstVisitorEvent> {
  for (const [i, node] of nodes.entries()) {
    // Skip trivia
    if (!isTriviaCstNode(node)) yield* walkSibling(nodes, i, path, depth);
  }
}

/** Walk the non-trivia sibling at index `i`. */
function* walkSibling(nodes: ReadonlyArray<CstNode>, i: number, path: Path, depth: number): Generator<CstVisitorEvent> {
  const node = A.getUnsafe(nodes, i);
  const leafTag = siblingLeafTags[node.type];
  if (leafTag !== undefined) {
    yield leafEvent(leafTag, node, path, depth);
    return;
  }
  if (isScalarCstNode(node)) {
    // Look ahead: if the next non-trivia sibling is a block-map, this
    // scalar is the key for that mapping (the block-map is picked up next).
    const nextContent = findNextContent(nodes, i + 1);
    const isKey = nextContent !== undefined && isBlockMapCstNode(nextContent);
    yield { _tag: isKey ? "CstKeyEvent" : "CstScalarEvent", path, depth, source: node.source };
    return;
  }
  // Every remaining parser-produced sibling is a collection; a block-map's
  // walker derives whether the first key was a sibling or is included in
  // this compact mapping's children.
  yield* walkCollection(node, path, depth, false);
}

// ---------------------------------------------------------------------------
// findNextContent — look ahead past trivia to the next content node
// ---------------------------------------------------------------------------

/**
 * Look ahead past trivia and comment nodes to find the next content node.
 *
 * **Details**
 *
 * Used by {@link walkSiblings} and {@link walkBlockMapChildren} to detect
 * the "scalar followed by block-map" pattern. Returns `undefined` when no
 * content node exists after `startIdx`, which means the scalar is a
 * standalone value rather than a mapping key.
 */
const findNextContent: {
  (nodes: ReadonlyArray<CstNode>, startIdx: number): CstNode | undefined;
  (startIdx: number): (nodes: ReadonlyArray<CstNode>) => CstNode | undefined;
} = dual(2, (nodes: ReadonlyArray<CstNode>, startIdx: number): CstNode | undefined => {
  for (let i = startIdx; i < nodes.length; i++) {
    const node = A.getUnsafe(nodes, i);
    if (!isTriviaCstNode(node) && node.type !== "comment") {
      return node;
    }
  }
  return undefined;
});

/** Trivia that crosses a physical line boundary. */
function isLineBreakTrivia(node: CstNode): boolean {
  return isTriviaCstNode(node) && hasLineBreak(node.source);
}

/** Whether `node` ends a same-line map-content scan: a line-break trivia, a `:`/`?` indicator, or content. */
function endsMapContentScan(node: CstNode): boolean {
  if (isLineBreakTrivia(node) || isIndicatorNode(node, ":") || isIndicatorNode(node, "?")) return true;
  return !isTriviaCstNode(node) && node.type !== "comment";
}

/**
 * Find content or an indicator without crossing a physical entry boundary.
 * A scalar or collection can absorb the newline terminating an entry, so the
 * source span preceding `startIdx` is included in the same-line lookahead.
 */
const findMapContent: {
  (nodes: ReadonlyArray<CstNode>, startIdx: number): CstNode | undefined;
  (startIdx: number): (nodes: ReadonlyArray<CstNode>) => CstNode | undefined;
} = dual(2, (nodes: ReadonlyArray<CstNode>, startIdx: number): CstNode | undefined => {
  if (startIdx > 0 && hasLineBreak(A.getUnsafe(nodes, startIdx - 1).source)) return undefined;
  for (let i = startIdx; i < nodes.length; i++) {
    const node = A.getUnsafe(nodes, i);
    if (endsMapContentScan(node)) return isLineBreakTrivia(node) ? undefined : node;
  }
  return undefined;
});

// ---------------------------------------------------------------------------
// walkBlockMapChildren — the block-map's own children
// ---------------------------------------------------------------------------

/**
 * Apply a block-map entry indicator to the walk state; true when a `:`
 * closes a key without content, so an empty key event is due. Entry
 * indicators determine state even when the preceding value was omitted: a
 * `:` after an entry boundary (with no key expected) opens a new key first.
 */
function applyBlockMapIndicator(child: CstNode, walk: MapWalkState): boolean {
  if (child.type === "newline") walk.crossedNewline = true;
  if (isIndicatorNode(child, "?")) openKey(walk);
  if (!isIndicatorNode(child, ":")) return false;
  if (walk.crossedNewline && !walk.expectingKey) openKey(walk);
  walk.crossedNewline = false;
  return closeKey(walk);
}

/**
 * The event for a scalar inside a block map. A separator after this scalar
 * identifies the next entry's key even when the previous entry had no value
 * to toggle the state. A scalar followed by a block-map is the key for that
 * nested mapping, whose first value will be the value for this key.
 */
function blockMapScalarEvent(
  children: ReadonlyArray<CstNode>,
  i: number,
  ...[path, depth, walk]: [path: Path, depth: number, walk: MapWalkState]
): CstVisitorEvent {
  const child = A.getUnsafe(children, i);
  const nextContent = findMapContent(children, i + 1);
  if (!walk.expectingKey && nextContent?.source === ":") openKey(walk);
  walk.crossedNewline = false;
  const isKey = walk.expectingKey || (nextContent !== undefined && isBlockMapCstNode(nextContent));
  return scalarRoleEvent(isKey, child, path, depth, walk);
}

/** Walk the block-map child at index `i`. */
function* walkBlockMapChild(
  children: ReadonlyArray<CstNode>,
  i: number,
  ...[path, depth, walk]: [path: Path, depth: number, walk: MapWalkState]
): Generator<CstVisitorEvent> {
  const child = A.getUnsafe(children, i);
  // Always emit comments
  if (child.type === "comment") {
    yield { _tag: "CstCommentEvent", path, depth, source: child.source };
    return;
  }
  if (applyBlockMapIndicator(child, walk)) yield { _tag: "CstKeyEvent", path, depth, source: "" };
  if (isTriviaCstNode(child)) return;
  const leafTag = blockMapLeafTags[child.type];
  if (leafTag !== undefined) {
    yield leafEvent(leafTag, child, path, depth);
    return;
  }
  if (isScalarCstNode(child)) {
    yield blockMapScalarEvent(children, i, path, depth, walk);
    return;
  }
  // A nested collection or (every remaining parser-produced child) an alias
  // is the value for the key just emitted.
  yield* walkCollectionOrAlias(child, path, depth, false);
  markKeyContent(walk);
}

/**
 * Walk children of a `block-map` node.
 *
 * **Details**
 *
 * A leading ':' means the first key was emitted by the parent as a sibling;
 * compact sequence mappings include that key in their children instead.
 * Mapping indicators and the separator after a scalar identify entry roles,
 * so omitted values do not shift subsequent key/value events. The sibling
 * scalar → block-map pattern still identifies nested mappings.
 */
function* walkBlockMapChildren(
  children: ReadonlyArray<CstNode>,
  path: Path,
  depth: number
): Generator<CstVisitorEvent> {
  // A leading ':' continues a sibling key. Compact sequence mappings
  // instead contain their first key, so start by expecting that key.
  const firstKeyExternal = findMapContent(children, 0)?.source === ":";
  const walk: MapWalkState = { expectingKey: !firstKeyExternal, keyHasContent: false, crossedNewline: false };

  for (let i = 0; i < children.length; i++) {
    // The preceding child may contain the boundary instead of leaving a
    // separate newline sibling, including inside a nested collection.
    if (i > 0 && hasLineBreak(A.getUnsafe(children, i - 1).source)) walk.crossedNewline = true;
    yield* walkBlockMapChild(children, i, path, depth, walk);
  }
}

// ---------------------------------------------------------------------------
// walkFlowMapChildren — flow-map children (key/value start with key)
// ---------------------------------------------------------------------------

/**
 * Apply a flow-map separator to the walk state; true when a `:` closes a key
 * without content, so an empty key event is due. Separators delimit entries,
 * including entries with omitted values.
 */
function applyFlowMapIndicator(child: CstNode, walk: MapWalkState): boolean {
  if (isIndicatorNode(child, ",") || isIndicatorNode(child, "?")) openKey(walk);
  return isIndicatorNode(child, ":") && closeKey(walk);
}

/** Walk one child of a flow map. */
function* walkFlowMapChild(child: CstNode, path: Path, depth: number, walk: MapWalkState): Generator<CstVisitorEvent> {
  // Always emit comments
  if (child.type === "comment") {
    yield { _tag: "CstCommentEvent", path, depth, source: child.source };
    return;
  }
  if (applyFlowMapIndicator(child, walk)) yield { _tag: "CstKeyEvent", path, depth, source: "" };
  // Skip trivia (includes structural whitespace like "{", "}", ":", ",")
  if (isTriviaCstNode(child)) return;
  if (child.type === "error") {
    yield { _tag: "CstErrorEvent", path, depth, source: child.source };
    return;
  }
  if (isScalarCstNode(child)) {
    yield scalarRoleEvent(walk.expectingKey, child, path, depth, walk);
    return;
  }
  // Flow lexing cannot produce directive or document children. Every
  // remaining child is a collection or an alias value.
  yield* walkCollectionOrAlias(child, path, depth, true);
  markKeyContent(walk);
}

/**
 * Walk children of a `flow-map` node.
 *
 * **Details**
 *
 * Flow maps contain their keys, separators, and delimiters as children.
 * Structural punctuation is typed as `whitespace`; ':' starts a value and
 * ',' starts the next key. Scalar fragments and nested collections retain
 * their role until an indicator changes it, including multiline plain text.
 */
function* walkFlowMapChildren(children: ReadonlyArray<CstNode>, path: Path, depth: number): Generator<CstVisitorEvent> {
  const walk: MapWalkState = { expectingKey: true, keyHasContent: false, crossedNewline: false };
  for (const child of children) {
    yield* walkFlowMapChild(child, path, depth, walk);
  }
}

// ---------------------------------------------------------------------------
// walkDocument — generator that yields all events for a single document node
// ---------------------------------------------------------------------------

/**
 * Generator that yields all CST visitor events for a single document node.
 *
 * **Details**
 *
 * Wraps the document's children in CstDocumentStartEvent / CstDocumentEndEvent
 * and delegates child traversal to {@link walkSiblings}. The root path is an
 * empty array, and child depth starts at 1 (the document itself is at depth 0).
 */
function* walkDocument(doc: CstNode): Generator<CstVisitorEvent> {
  const path: Path = [];
  const depth = 0;

  yield { _tag: "CstDocumentStartEvent", path, depth };
  yield* walkSiblings(childrenOf(doc), path, depth + 1);
  yield { _tag: "CstDocumentEndEvent", path, depth };
}

// ---------------------------------------------------------------------------
// cstEvents — engine API
// ---------------------------------------------------------------------------

/**
 * Walks YAML source text at the CST level and yields {@link CstVisitorEvent}
 * values in document order.
 *
 * **Details**
 *
 * Events are emitted for every CST node encountered during traversal,
 * including `CstDocumentStartEvent`/`CstDocumentEndEvent` pairs, collection
 * open/close events, and leaf-node events for scalars, aliases, comments, and
 * directives.
 *
 * All content is delivered as raw source strings — `true` is still the string
 * `"true"`. CST-level errors are surfaced as {@link CstErrorEvent} records;
 * the generator never throws.
 *
 * **Example** (Observe document boundaries around a scalar)
 *
 * ```ts
 * import { cstEvents } from "@beep/yaml/internal/cst-visitor"
 *
 * const tags = Array.from(cstEvents("true"), event => event._tag)
 * console.log(tags.join(",")) // CstDocumentStartEvent,CstScalarEvent,CstDocumentEndEvent
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export function* cstEvents(text: string): IterableIterator<CstVisitorEvent> {
  for (const doc of parseCSTAll(text)) {
    yield* walkDocument(doc);
  }
}
