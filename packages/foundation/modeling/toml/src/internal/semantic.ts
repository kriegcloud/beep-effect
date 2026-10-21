import { $TomlId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema/LiteralKit";
// Sets keys as own data properties, `__proto__` included (yaml/jsonc precedent).
import { setOwnProperty } from "@beep/utils/Record";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as Match from "effect/Match";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";

// The provenance state machine: every defined name records HOW it came
// to exist (value, inline, static-array, table-explicit, table-implicit,
// table-dotted, array-tables) and — for dotted-created tables — WHICH
// document section created it. Each expression either legally extends the
// tree or throws RawTomlError at the offending key, first violation wins.
//
// One corpus-driven refinement of the provenance rules:
// header navigation PASSES THROUGH `table-dotted` intermediates (the spec's
// "[table] form can be used to define sub-tables within tables defined via
// dotted keys" — valid/spec-1.1.0/common-46.toml, valid/table/
// array-within-dotted.toml); only landing the FINAL header segment on an
// existing `table-dotted` is an error (invalid/table/redefine-02, -03).
//
// Header and dotted-key navigation is ITERATIVE — path depth is data, never
// recursion. Only value materialization recurses, and inline values are
// already depth-capped by the parser.

import { RawTomlError } from "./diagnostics.ts";
import type {
  TomlArrayTableHeader,
  TomlExpression,
  TomlInlineTable,
  TomlKey,
  TomlKeyValue,
  TomlTableHeader,
  TomlValueNode,
} from "../TomlNode.ts";
import type { TomlSemanticErrorCodeRaw } from "./diagnostics.ts";

const $I = $TomlId.create("internal/semantic");

class TomlSemanticInvariantError extends S.TaggedError<TomlSemanticInvariantError, { readonly brand: unique symbol }>(
  $I`TomlSemanticInvariantError`
)(
  "TomlSemanticInvariantError",
  {
    message: S.String.pipe(
      $I.annoteKey("TomlSemanticInvariantError.message", {
        description: "Explanation of the violated semantic engine invariant.",
      })
    ),
  },
  $I.annoteError<TomlSemanticInvariantError>("TomlSemanticInvariantError", {
    description: "An impossible state in the TOML semantic engine.",
  })
) {}

/**
 * Semantic-pass callbacks, fired in document order after each expression validates.
 *
 * @category models
 * @since 0.0.0
 */
export interface SemanticVisitor {
  /**
   * A `[[t]]` header appends element `index` (0-based) and makes it current.
   *
   * @since 0.0.0
   */
  readonly onArrayTableStart?: (path: ReadonlyArray<string>, index: number, header: TomlArrayTableHeader) => void;
  /**
   * A key-value assigns; `path` is the full path from the root, final key included.
   *
   * @since 0.0.0
   */
  readonly onKeyValue?: (path: ReadonlyArray<string>, expr: TomlKeyValue) => void;
  /**
   * A table becomes current: the root (header `undefined`, once, first) or a `[t]` header.
   *
   * @since 0.0.0
   */
  readonly onTableStart?: (path: ReadonlyArray<string>, header: TomlTableHeader | undefined) => void;
}

/** How a defined name came to exist. */
const Provenance = LiteralKit([
  "value",
  "inline",
  "static-array",
  "table-explicit",
  "table-implicit",
  "table-dotted",
  "array-tables",
]).pipe(
  $I.annoteSchema("Provenance", {
    description: "How a defined name came to exist in the TOML semantic provenance tree.",
  })
);
type Provenance = typeof Provenance.Type;

/** One name in the provenance tree. `elements` is used by `array-tables` only; `sectionId` by `table-dotted` only. */
interface SemNode {
  readonly elements: Array<SemNode>;
  kind: Provenance;
  readonly sectionId: number;
  readonly table: MutableHashMap.MutableHashMap<string, SemNode>;
}

const makeNode: {
  (kind: Provenance, sectionId?: number): SemNode;
  (sectionId?: number): (kind: Provenance) => SemNode;
} = dual(
  (args) => P.isString(args[0]),
  (kind: Provenance, sectionId = 0): SemNode => ({
    kind,
    table: MutableHashMap.empty<string, SemNode>(),
    elements: [],
    sectionId,
  })
);

const raise: {
  (code: TomlSemanticErrorCodeRaw, message: string, key: TomlKey): never;
  (message: string, key: TomlKey): (code: TomlSemanticErrorCodeRaw) => never;
} = dual(3, (code: TomlSemanticErrorCodeRaw, message: string, key: TomlKey): never => {
  throw RawTomlError.make({ code, message, offset: key.offset, length: key.length });
});

/** Per-analysis counter: document sections and inline-table scopes draw distinct ids from the same sequence. */
interface Context {
  nextId: number;
}

/** Element `i` of a key path; the parser never yields a path shorter than the walk requests. */
const keyAt = <K>(keys: ReadonlyArray<K>, i: number): K => {
  const key = keys[i];
  if (key === undefined) {
    throw TomlSemanticInvariantError.make({ message: "missing TOML key" });
  }
  return key;
};

/** Key `i` of `keyPath` together with the node it currently names in `node`'s table, if any. */
const segmentAt = (
  node: SemNode,
  keyPath: ReadonlyArray<TomlKey>,
  i: number
): { readonly existing: SemNode | undefined; readonly key: TomlKey } => {
  const key = keyAt(keyPath, i);
  return { existing: O.getOrUndefined(MutableHashMap.get(node.table, key.value)), key };
};

/**
 * Header navigation (rules 1 and 2, shared prefix): walk every segment but
 * the last, creating `table-implicit` for absent names, passing through
 * tables (dotted included — the corpus deviation) and descending into the
 * last element of an array of tables.
 */
const navigateHeaderPrefix: {
  (root: SemNode, keyPath: ReadonlyArray<TomlKey>): SemNode;
  (keyPath: ReadonlyArray<TomlKey>): (root: SemNode) => SemNode;
} = dual(2, (root: SemNode, keyPath: ReadonlyArray<TomlKey>): SemNode => {
  let current = root;
  for (let i = 0; i < keyPath.length - 1; i++) {
    const { existing, key } = segmentAt(current, keyPath, i);
    if (existing === undefined) {
      const child = makeNode("table-implicit");
      MutableHashMap.set(current.table, key.value, child);
      current = child;
      continue;
    }
    current = Match.value(existing.kind).pipe(
      Match.whenOr("table-explicit", "table-implicit", "table-dotted", () => existing),
      // openArrayTable inserts before publishing; later headers only append.
      Match.when("array-tables", () => A.getUnsafe(existing.elements, existing.elements.length - 1)),
      Match.when("inline", () => raise("InlineTableExtended", `inline table "${key.value}" cannot be extended`, key)),
      Match.when("static-array", () =>
        raise("ArrayOfTablesConflict", `"${key.value}" is a static array, not an array of tables`, key)
      ),
      Match.when("value", () => raise("TableRedefined", `"${key.value}" is already defined as a value`, key)),
      Match.exhaustive
    );
  }
  return current;
});

/** Rule 1, final segment: create `table-explicit`, promote `table-implicit`, or error. */
const openTable: {
  (root: SemNode, keyPath: ReadonlyArray<TomlKey>): SemNode;
  (keyPath: ReadonlyArray<TomlKey>): (root: SemNode) => SemNode;
} = dual(2, (root: SemNode, keyPath: ReadonlyArray<TomlKey>): SemNode => {
  const parent = navigateHeaderPrefix(root, keyPath);
  const { existing, key } = segmentAt(parent, keyPath, keyPath.length - 1);
  if (existing === undefined) {
    const node = makeNode("table-explicit");
    MutableHashMap.set(parent.table, key.value, node);
    return node;
  }
  if (existing.kind === "table-implicit") {
    existing.kind = "table-explicit";
    return existing;
  }
  return raise("TableRedefined", `table "${key.value}" is already defined`, key);
});

/** Rule 2, final segment: create the array and its first element, append to an existing one, or error. */
const openArrayTable: {
  (root: SemNode, keyPath: ReadonlyArray<TomlKey>): { readonly element: SemNode; readonly index: number };
  (keyPath: ReadonlyArray<TomlKey>): (root: SemNode) => { readonly element: SemNode; readonly index: number };
} = dual(2, (root: SemNode, keyPath: ReadonlyArray<TomlKey>): { readonly element: SemNode; readonly index: number } => {
  const parent = navigateHeaderPrefix(root, keyPath);
  const { existing, key } = segmentAt(parent, keyPath, keyPath.length - 1);
  if (existing === undefined) {
    const array = makeNode("array-tables");
    const element = makeNode("table-explicit");
    array.elements.push(element);
    MutableHashMap.set(parent.table, key.value, array);
    return { element, index: 0 };
  }
  if (existing.kind === "array-tables") {
    const element = makeNode("table-explicit");
    existing.elements.push(element);
    return { element, index: existing.elements.length - 1 };
  }
  return raise("ArrayOfTablesConflict", `"${key.value}" cannot be redefined as an array of tables`, key);
});

/**
 * Rule 3, intermediate segment `i`: create an absent `table-dotted`, reuse a
 * `table-dotted` from the same section, or error.
 */
const descendDotted = (current: SemNode, keyPath: ReadonlyArray<TomlKey>, i: number, sectionId: number): SemNode => {
  const { existing, key } = segmentAt(current, keyPath, i);
  if (existing === undefined) {
    const child = makeNode("table-dotted", sectionId);
    MutableHashMap.set(current.table, key.value, child);
    return child;
  }
  if (existing.kind === "table-dotted" && existing.sectionId === sectionId) {
    return existing;
  }
  if (existing.kind === "inline") {
    raise("InlineTableExtended", `inline table "${key.value}" cannot be extended`, key);
  }
  return raise("DottedKeyConflict", `dotted key cannot extend "${key.value}"`, key);
};

/**
 * Rule 3: a (possibly dotted) key assignment scoped to `table` under
 * `sectionId`. Intermediates must be absent (create `table-dotted`) or
 * `table-dotted` from the same section; the final key must be absent.
 */
const assignEntry: {
  (table: SemNode, sectionId: number, keyPath: ReadonlyArray<TomlKey>, value: TomlValueNode, context: Context): void;
  (
    sectionId: number,
    keyPath: ReadonlyArray<TomlKey>,
    value: TomlValueNode,
    context: Context
  ): (table: SemNode) => void;
} = dual(
  5,
  (
    table: SemNode,
    sectionId: number,
    keyPath: ReadonlyArray<TomlKey>,
    value: TomlValueNode,
    context: Context
  ): void => {
    let current = table;
    for (let i = 0; i < keyPath.length - 1; i++) {
      current = descendDotted(current, keyPath, i, sectionId);
    }
    const key = keyAt(keyPath, keyPath.length - 1);
    if (MutableHashMap.has(current.table, key.value)) {
      raise("DuplicateKey", `duplicate key "${key.value}"`, key);
    }
    MutableHashMap.set(current.table, key.value, nodeForValue(value, context));
  }
);

/** The provenance node for an assigned value; validates inline tables (arrays included) on the way. */
const nodeForValue: {
  (value: TomlValueNode, context: Context): SemNode;
  (context: Context): (value: TomlValueNode) => SemNode;
} = dual(2, (value: TomlValueNode, context: Context): SemNode => {
  if (P.isTagged(value, "TomlInlineTable")) {
    return inlineNode(value, context);
  }
  if (P.isTagged(value, "TomlArray")) {
    for (const item of value.items) {
      checkArrayItem(item, context);
    }
    return makeNode("static-array");
  }
  return makeNode("value");
});

/** Inline tables hide anywhere inside a static array; validate them all. Depth is parser-capped. */
const checkArrayItem: {
  (item: TomlValueNode, context: Context): void;
  (context: Context): (item: TomlValueNode) => void;
} = dual(2, (item: TomlValueNode, context: Context): void => {
  if (P.isTagged(item, "TomlInlineTable")) {
    inlineNode(item, context);
    return;
  }
  if (P.isTagged(item, "TomlArray")) {
    for (const inner of item.items) {
      checkArrayItem(inner, context);
    }
  }
});

/**
 * Rule 4: build an inline table's own scope (dotted keys follow rule 3
 * inside it), then freeze it — the returned node's `inline` kind makes every
 * later navigation through it an `InlineTableExtended` error.
 */
const inlineNode: {
  (node: TomlInlineTable, context: Context): SemNode;
  (context: Context): (node: TomlInlineTable) => SemNode;
} = dual(2, (node: TomlInlineTable, context: Context): SemNode => {
  const scopeId = context.nextId++;
  const sem = makeNode("table-dotted", scopeId);
  for (const entry of node.entries) {
    assignEntry(sem, scopeId, entry.keyPath, entry.value, context);
  }
  sem.kind = "inline";
  return sem;
});

/**
 * Walk the expressions through the provenance state machine, firing the visitor after
 * each expression validates.
 *
 * **Gotchas**
 *
 * Throws `RawTomlError` at the first violation.
 *
 * **Example** (Observe validated key paths)
 *
 * ```ts
 * import { parseExpressions } from "@beep/toml/internal/parser"
 * import { analyze } from "@beep/toml/internal/semantic"
 *
 * const paths: Array<string> = []
 * analyze(parseExpressions("[server]\nport = 8080\n"), {
 *   onKeyValue: (path) => { paths.push(path.join(".")) }
 * })
 * console.log(paths.join(", ")) // server.port
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const analyze: {
  (expressions: ReadonlyArray<TomlExpression>, visitor?: SemanticVisitor): void;
  (visitor?: SemanticVisitor): (expressions: ReadonlyArray<TomlExpression>) => void;
} = dual(
  (args) => A.isArray(args[0]),
  (expressions: ReadonlyArray<TomlExpression>, visitor?: SemanticVisitor): void => {
    const root = makeNode("table-explicit");
    const context: Context = { nextId: 1 };
    let currentTable = root;
    let currentSectionId = 0;
    let currentPrefix: ReadonlyArray<string> = [];
    visitor?.onTableStart?.([], undefined);
    for (const expression of expressions) {
      if (P.isTagged(expression, "TomlTrivia")) {
        continue;
      }
      if (P.isTagged(expression, "TomlTableHeader")) {
        currentTable = openTable(root, expression.keyPath);
        currentSectionId = context.nextId++;
        currentPrefix = A.map(expression.keyPath, (key) => key.value);
        visitor?.onTableStart?.(currentPrefix, expression);
        continue;
      }
      if (P.isTagged(expression, "TomlArrayTableHeader")) {
        const { element, index } = openArrayTable(root, expression.keyPath);
        currentTable = element;
        currentSectionId = context.nextId++;
        currentPrefix = A.map(expression.keyPath, (key) => key.value);
        visitor?.onArrayTableStart?.(currentPrefix, index, expression);
        continue;
      }
      assignEntry(currentTable, currentSectionId, expression.keyPath, expression.value, context);
      visitor?.onKeyValue?.([...currentPrefix, ...A.map(expression.keyPath, (key) => key.value)], expression);
    }
  }
);

/** Own-property read that never leaks through the prototype chain (`__proto__` included). */
const getOwnProperty: {
  (target: Record<string, unknown>, key: string): unknown;
  (key: string): (target: Record<string, unknown>) => unknown;
} = dual(2, (target: Record<string, unknown>, key: string): unknown => (R.has(target, key) ? target[key] : undefined));

/**
 * Navigate `path` in the output tree, creating plain objects for absent names
 * and descending into the LAST element of arrays (mirrors the array-of-tables
 * rule — `analyze` has already proven every step legal). Iterative.
 */
const navigateOutput: {
  (target: Record<string, unknown>, path: ReadonlyArray<string>): Record<string, unknown>;
  (path: ReadonlyArray<string>): (target: Record<string, unknown>) => Record<string, unknown>;
} = dual(2, (target: Record<string, unknown>, path: ReadonlyArray<string>): Record<string, unknown> => {
  let current = target;
  for (const segment of path) {
    let child = getOwnProperty(current, segment);
    if (child === undefined) {
      child = {};
      setOwnProperty(current, segment, child);
    }
    if (A.isArray(child)) {
      child = child[child.length - 1];
    }
    if (!P.isObject(child)) {
      throw TomlSemanticInvariantError.make({ message: "expected TOML output table" });
    }
    current = child;
  }
  return current;
});

/** Materialize a CST value node into a plain value. Recursion is parser-depth-capped. */
const materialize = (value: TomlValueNode): unknown => {
  if (P.isTagged(value, "TomlArray")) {
    return A.map(value.items, materialize);
  }
  if (P.isTagged(value, "TomlInlineTable")) {
    const output: Record<string, unknown> = {};
    for (const entry of value.entries) {
      const parent = navigateOutput(
        output,
        A.map(entry.keyPath.slice(0, -1), (key) => key.value)
      );
      const key = keyAt(entry.keyPath, entry.keyPath.length - 1);
      setOwnProperty(parent, key.value, materialize(entry.value));
    }
    return output;
  }
  return value.value;
};

/**
 * `analyze` + plain-value construction in a single pass: the value builder is
 * the default visitor riding the same walk.
 *
 * **Details**
 *
 * Scalars materialize to their
 * decoded values (`TomlInteger` → number | bigint, `TomlDateTimeLiteral` →
 * its date-time class instance), arrays to plain arrays, tables and inline
 * tables to plain objects with `__proto__` as an own data property.
 *
 * **Example** (Build nested plain values)
 *
 * ```ts
 * import { parseExpressions } from "@beep/toml/internal/parser"
 * import { buildValue } from "@beep/toml/internal/semantic"
 *
 * const value = buildValue(parseExpressions("[server]\nport = 8080\n"))
 * console.log(JSON.stringify(value)) // {"server":{"port":8080}}
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const buildValue = (expressions: ReadonlyArray<TomlExpression>): unknown => {
  const result: Record<string, unknown> = {};
  analyze(expressions, {
    onTableStart: (path, _header) => {
      navigateOutput(result, path);
    },
    onArrayTableStart: (path, _index, _header) => {
      const parent = navigateOutput(result, path.slice(0, -1));
      const key = keyAt(path, path.length - 1);
      const existing = getOwnProperty(parent, key);
      if (A.isArray(existing)) {
        existing.push({});
      } else {
        setOwnProperty(parent, key, [{}]);
      }
    },
    onKeyValue: (path, expr) => {
      const parent = navigateOutput(result, path.slice(0, -1));
      const key = keyAt(path, path.length - 1);
      setOwnProperty(parent, key, materialize(expr.value));
    },
  });
  return result;
};
