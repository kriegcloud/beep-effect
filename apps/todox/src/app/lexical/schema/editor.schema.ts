import { $TodoxId } from "@beep/identity/packages";
import { hasProperties } from "@beep/todox/app/lexical/commenting";
import { SerializedEditorState } from "@beep/todox/app/lexical/schema/schemas";
import * as A from "effect/Array";
import * as Match from "effect/Match";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type { LexicalEditor } from "lexical";

const properties = [
  "version",
  "isComposing",
  "registerUpdateListener",
  "registerEditableListener",
  "registerDecoratorListener",
  "registerTextContentListener",
  "registerRootListener",
  "registerCommand",
  "registerMutationListener",
  "registerNodeTransform",
  "hasNode",
  "hasNodes",
  "dispatchCommand",
  "getDecorators",
  "getRootElement",
  "setRootElement",
  "getElementByKey",
  "getEditorState",
  "parseEditorState",
  "read",
  "update",
  "focus",
  "blur",
  "isEditable",
  "setEditable",
  "toJSON",
] as const;

const $I = $TodoxId.create("app/lexical/schema/editor.schema");
const isEditor = (u: unknown): u is LexicalEditor =>
  P.isObject(u) &&
  hasProperties(...properties)(u) &&
  P.struct({
    version: P.or(P.isString, P.isUndefined),
    ...A.reduce(
      properties,
      {} as {
        readonly [K in Exclude<(typeof properties)[number], "version">]: typeof P.isFunction;
      },
      (acc, prop) =>
        Match.value(prop).pipe(
          Match.when("version", () => acc),
          Match.orElse((prop) => ({
            ...acc,
            [prop]: P.isFunction,
          }))
        )
    ),
  })(u);

export class Editor extends S.declare((u: unknown): u is LexicalEditor => isEditor(u)).annotations(
  $I.annotations("Editor", {
    description: "Lexical editor",
  })
) {}

export declare namespace Editor {
  export type Type = typeof Editor.Type;
}

export class SerializedEditor extends S.Class<SerializedEditor>("SerializedEditor")(
  {
    editorState: SerializedEditorState,
  },
  $I.annotations("SerializedEditor", {
    description: "Serialized editor state",
  })
) {}
