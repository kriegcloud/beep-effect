/**
 * A schema for a lexical node.
 *
 * @module @beep/editor/Domain/LexicalNode
 * @since 0.0.0
 */
import { $EditorId } from "@beep/identity";
import { NonEmptyTrimmedStr } from "@beep/schema";
import { thunk1 } from "@beep/utils";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type * as lexical from "lexical";

const $I = $EditorId.create("Domain/LexicalNode");

const isPropertyOwner = (
  input: unknown
): input is Record<string, unknown> | ((...args: ReadonlyArray<unknown>) => unknown) =>
  P.isObject(input) || P.isFunction(input);

/**
 * The base type for all serialized nodes
 *
 * @since 0.0.0
 */
export class SerializedLexicalNode extends S.Class<SerializedLexicalNode>($I`SerializedLexicalNode`)(
  {
    /** The type string used by the Node class */
    type: NonEmptyTrimmedStr.annotateKey({
      description: "The type string used by the Node class",
    }),
    /** A numeric version for this schema, defaulting to 1, but not generally recommended for use */
    version: S.Number.pipe(S.withDecodingDefaultKey(thunk1)).annotateKey({
      description: "A numeric version for this schema, defaulting to 1, but not generally recommended for use",
    }) /**
     * Any state persisted with the NodeState API that is not
     * configured for flat storage
     */,
    $: S.optionalKey(S.Record(S.String, S.Unknown)).annotateKey({
      description: "Any state persisted with the NodeState API that is not\nconfigured for flat storage",
    }),
  },
  $I.annote("SerializedLexicalNode", {
    description: "The base type for all serialized nodes",
  })
) {}

/**
 * @since 0.0.0
 */
export const NodeKey = NonEmptyTrimmedStr.pipe(
  S.brand("NodeKey"),
  $I.annoteSchema("NodeKey", {
    description: "Schema for node key",
  })
);

/**
 * @since 0.0.0
 */
export type NodeKey = typeof NodeKey.Type;

/**
 * @since 0.0.0
 */
export const LexicalNodeKeys = [
  "getType",
  "errorOnInsertTextNodeOnRoot",
  "clone",
  "$config",
  "config",
  "afterCloneFrom",
  "resetOnCopyNodeFrom",
  "importDOM",
  "isInline",
  "isAttached",
  "isSelected",
  "getKey",
  "getIndexWithinParent",
  "getParent",
  "getParentOrThrow",
  "getTopLevelElement",
  "getTopLevelElementOrThrow",
  "getParents",
  "getParentKeys",
  "getPreviousSibling",
  "getPreviousSiblings",
  "getNextSibling",
  "getNextSiblings",
  "is",
  "isBefore",
  "isParentOf",
  "getNodesBetween",
  "isDirty",
  "getLatest",
  "getWritable",
  "getTextContent",
  "getTextContentSize",
  "createDOM",
  "updateDOM",
  "exportDOM",
  "exportJSON",
  "importJSON",
  "updateFromJSON",

  "transform",
  "remove",
  "replace",
  "insertAfter",
  "insertBefore",
  "isParentRequired",
  "createParentElementNode",
  "selectStart",
  "selectEnd",
  "selectPrevious",
  "selectNext",
  "markDirty",
  "reconcileObservedMutation",
] as const;

const hasFunctionProperty = (input: unknown, key: string): boolean =>
  isPropertyOwner(input) && P.hasProperty(input, key) && P.isFunction(input[key]);

const hasStringProperty = (input: Record<string, unknown>, key: string): boolean =>
  P.hasProperty(input, key) && P.isString(input[key]);

/**
 * lexical does not expose the base LexicalNode constructor as a runtime export,
 * so we validate against the shared instance surface instead of S.instanceOf(...).
 *
 * @since 0.0.0
 */
export const isLexicalNode = (input: unknown): input is lexical.LexicalNode => {
  if (!P.isObject(input)) return false;

  const lexicalNode = input;
  const constructorValue = lexicalNode.constructor;

  if (!P.isFunction(constructorValue)) return false;

  const lexicalNodeConstructor = constructorValue;

  return (
    hasStringProperty(lexicalNode, "__type") &&
    hasStringProperty(lexicalNode, "__key") &&
    hasFunctionProperty(lexicalNode, "getType") &&
    hasFunctionProperty(lexicalNode, "getKey") &&
    hasFunctionProperty(lexicalNode, "getLatest") &&
    hasFunctionProperty(lexicalNode, "getWritable") &&
    hasFunctionProperty(lexicalNode, "exportJSON") &&
    hasFunctionProperty(lexicalNodeConstructor, "getType") &&
    hasFunctionProperty(lexicalNodeConstructor, "clone")
  );
};

/**
 * @since 0.0.0
 */
export const LexicalNode = S.declare(isLexicalNode).pipe(
  S.annotate(
    $I.annote("LexicalNode", {
      description: "Runtime Lexical node instance.",
      jsonSchema: {},
    })
  )
);

/**
 * @since 0.0.0
 */
export type LexicalNode = typeof LexicalNode.Type;
