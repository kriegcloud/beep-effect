/**
 * A schema for a lexical node.
 *
 * @module @beep/editor/Domain/LexicalNode
 * @since 0.0.0
 */
import {$EditorId} from "@beep/identity";
import * as S from "effect/Schema";
import {NonEmptyTrimmedStr} from "@beep/schema";
import {thunk1} from "@beep/utils";
import * as lexical from "lexical";

const $I = $EditorId.create("Domain/LexicalNode");

/**
 * The base type for all serialized nodes
 */
export class SerializedLexicalNode extends S.Class<SerializedLexicalNode>($I`SerializedLexicalNode`)(
  {
    /** The type string used by the Node class */
    type: NonEmptyTrimmedStr.annotateKey({
      description: "The type string used by the Node class"
    }),
    /** A numeric version for this schema, defaulting to 1, but not generally recommended for use */
    version: S.Number.pipe(S.withDecodingDefaultKey(thunk1))
    .annotateKey({
      description: "A numeric version for this schema, defaulting to 1, but not generally recommended for use"
    }), /**
     * Any state persisted with the NodeState API that is not
     * configured for flat storage
     */
    ["$" as const]: S.optionalKey(S.Record(
      S.String,
      S.Unknown
    ))
    .annotateKey({
      description: "Any state persisted with the NodeState API that is not\nconfigured for flat storage"
    })
  },
  $I.annote(
    "SerializedLexicalNode",
    {
      description: "The base type for all serialized nodes"
    }
  )
) {
}


export const NodeKey = NonEmptyTrimmedStr.pipe(
  S.brand("NodeKey"),
  $I.annoteSchema(
    "NodeKey",
    {
      description: "Schema for node key"
    }
  )
);

export type NodeKey = typeof NodeKey.Type;

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
  "reconcileObservedMutation"
] as const;

// const l = S.instanceOf(lexical.LexicalNode)
