/**
 * Pandoc JSON wire codecs for the schema-first Pandoc AST model.
 *
 * @packageDocumentation \@beep/pandoc-ast/Pandoc.codec
 * @since 0.0.0
 */

import { $PandocAstId } from "@beep/identity";
import { A } from "@beep/utils";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import {
  BlockQuote,
  BulletList,
  Code,
  CodeBlock,
  Div,
  Emph,
  Header,
  HorizontalRule,
  Image,
  LineBreak,
  Link,
  Math,
  Note,
  OrderedList,
  PandocApiVersion,
  PandocAttr,
  PandocDocument,
  PandocKeyValue,
  PandocMeta,
  PandocTarget,
  Para,
  Plain,
  SoftBreak,
  Space,
  Span,
  Str,
  Strikeout,
  Strong,
  Table,
  UnknownBlock,
  UnknownInline,
} from "./Pandoc.model.ts";
import type { PandocBlock, PandocInline } from "./Pandoc.model.ts";

const $I = $PandocAstId.create("Pandoc.codec");

/**
 * Generic Pandoc constructor wire shape.
 *
 * @category wire
 * @since 0.0.0
 */
export const PandocConstructorWire = S.Struct({
  c: S.optionalKey(S.Unknown),
  t: S.String,
}).pipe(
  $I.annoteSchema("PandocConstructorWire", {
    description: "Generic Pandoc constructor wire shape.",
  })
);

/**
 * Runtime type for {@link PandocConstructorWire}.
 *
 * @category wire
 * @since 0.0.0
 */
export type PandocConstructorWire = typeof PandocConstructorWire.Type;

/**
 * Pandoc JSON document wire shape.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { PandocJsonWire } from "@beep/pandoc-ast/Pandoc.codec"
 *
 * const decode = S.decodeUnknownSync(PandocJsonWire)
 * console.log(decode({ "pandoc-api-version": [1, 23, 1], meta: {}, blocks: [] }).blocks.length)
 * ```
 *
 * @category wire
 * @since 0.0.0
 */
export const PandocJsonWire = S.Struct({
  "pandoc-api-version": PandocApiVersion,
  blocks: S.Array(S.Unknown),
  meta: PandocMeta,
}).pipe(
  $I.annoteSchema("PandocJsonWire", {
    description: "Pandoc JSON document wire shape.",
  })
);

/**
 * Runtime type for {@link PandocJsonWire}.
 *
 * @category wire
 * @since 0.0.0
 */
export type PandocJsonWire = typeof PandocJsonWire.Type;

/**
 * Pandoc JSON string codec.
 *
 * @category wire
 * @since 0.0.0
 */
export const PandocJsonFromString = S.fromJsonString(PandocJsonWire).pipe(
  $I.annoteSchema("PandocJsonFromString", {
    description: "Pandoc JSON string codec.",
  })
);

/**
 * Runtime type for {@link PandocJsonFromString}.
 *
 * @category wire
 * @since 0.0.0
 */
export type PandocJsonFromString = typeof PandocJsonFromString.Type;

const AttrWire = S.Tuple([S.String, S.Array(S.String), S.Array(PandocKeyValue)]);
const TargetWire = S.Tuple([S.String, S.String]);
const HeaderPayloadWire = S.Tuple([S.Int, AttrWire, S.Array(S.Unknown)]);
const CodePayloadWire = S.Tuple([AttrWire, S.String]);
const DivPayloadWire = S.Tuple([AttrWire, S.Array(S.Unknown)]);
const LinkPayloadWire = S.Tuple([AttrWire, S.Array(S.Unknown), TargetWire]);
const NotePayloadWire = S.Array(S.Unknown);
const MathPayloadWire = S.Tuple([PandocConstructorWire, S.String]);
const OrderedListPayloadWire = S.Tuple([
  S.Tuple([S.Int, PandocConstructorWire, PandocConstructorWire]),
  S.Unknown.pipe(S.Array, S.Array),
]);

const decodeConstructor = S.decodeUnknownEffect(PandocConstructorWire);
const decodeWire = S.decodeUnknownEffect(PandocJsonWire);
const decodeWireFromString = S.decodeUnknownEffect(PandocJsonFromString);
const encodeWireToString = S.encodeEffect(PandocJsonFromString);
const decodeString = S.decodeUnknownEffect(S.String);
const decodeAttrWire = S.decodeUnknownEffect(AttrWire);
const decodeTargetWire = S.decodeUnknownEffect(TargetWire);
const decodeUnknownArray = S.decodeUnknownEffect(S.Array(S.Unknown));
const decodeUnknownBlockList = S.decodeUnknownEffect(S.Array(S.Unknown));
const decodeUnknownBlockItems = S.decodeUnknownEffect(S.Unknown.pipe(S.Array, S.Array));
const decodeHeaderPayloadWire = S.decodeUnknownEffect(HeaderPayloadWire);
const decodeCodePayloadWire = S.decodeUnknownEffect(CodePayloadWire);
const decodeDivPayloadWire = S.decodeUnknownEffect(DivPayloadWire);
const decodeLinkPayloadWire = S.decodeUnknownEffect(LinkPayloadWire);
const decodeNotePayloadWire = S.decodeUnknownEffect(NotePayloadWire);
const decodeMathPayloadWire = S.decodeUnknownEffect(MathPayloadWire);
const decodeOrderedListPayloadWire = S.decodeUnknownEffect(OrderedListPayloadWire);

const attrFromWire = (input: unknown): Effect.Effect<PandocAttr, S.SchemaError> =>
  Effect.map(decodeAttrWire(input), ([id, classes, keyValues]) => PandocAttr.make({ classes, id, keyValues }));

const targetFromWire = (input: unknown): Effect.Effect<PandocTarget, S.SchemaError> =>
  Effect.map(decodeTargetWire(input), ([url, title]) => PandocTarget.make({ title, url }));

const decodeInlines = (input: unknown): Effect.Effect<ReadonlyArray<PandocInline.Type>, S.SchemaError> =>
  Effect.flatMap(decodeUnknownArray(input), (values) => Effect.forEach(values, decodeInline));

const decodeBlockList = (input: unknown): Effect.Effect<ReadonlyArray<PandocBlock.Type>, S.SchemaError> =>
  Effect.flatMap(decodeUnknownBlockList(input), (values) => Effect.forEach(values, decodeBlock));

const decodeBlockItems = (
  input: unknown
): Effect.Effect<ReadonlyArray<ReadonlyArray<PandocBlock.Type>>, S.SchemaError> =>
  Effect.flatMap(decodeUnknownBlockItems(input), (items) =>
    Effect.forEach(items, (item) => Effect.forEach(item, decodeBlock))
  );

const unknownInline = (constructor: string, payload: unknown): UnknownInline =>
  UnknownInline.make({ constructor, payload });

const unknownBlock = (constructor: string, payload: unknown): UnknownBlock =>
  UnknownBlock.make({ constructor, payload });

const decodeInline = (input: unknown): Effect.Effect<PandocInline.Type, S.SchemaError> =>
  Effect.flatMap(decodeConstructor(input), (wire): Effect.Effect<PandocInline.Type, S.SchemaError> => {
    if (wire.t === "Str") {
      return Effect.map(decodeString(wire.c), (text) => Str.make({ text }));
    }
    if (wire.t === "Space") {
      return Effect.succeed(Space.make({}));
    }
    if (wire.t === "SoftBreak") {
      return Effect.succeed(SoftBreak.make({}));
    }
    if (wire.t === "LineBreak") {
      return Effect.succeed(LineBreak.make({}));
    }
    if (wire.t === "Emph") {
      return Effect.map(decodeInlines(wire.c), (children) => Emph.make({ children }));
    }
    if (wire.t === "Strong") {
      return Effect.map(decodeInlines(wire.c), (children) => Strong.make({ children }));
    }
    if (wire.t === "Strikeout") {
      return Effect.map(decodeInlines(wire.c), (children) => Strikeout.make({ children }));
    }
    if (wire.t === "Code") {
      return Effect.flatMap(decodeCodePayloadWire(wire.c), ([attrWire, text]) =>
        Effect.map(attrFromWire(attrWire), (attr) => Code.make({ attr, text }))
      );
    }
    if (wire.t === "Link") {
      return Effect.flatMap(decodeLinkPayloadWire(wire.c), ([attrWire, childrenWire, targetWire]) =>
        Effect.flatMap(attrFromWire(attrWire), (attr) =>
          Effect.flatMap(decodeInlines(childrenWire), (children) =>
            Effect.map(targetFromWire(targetWire), (target) => Link.make({ attr, children, target }))
          )
        )
      );
    }
    if (wire.t === "Image") {
      return Effect.flatMap(decodeLinkPayloadWire(wire.c), ([attrWire, childrenWire, targetWire]) =>
        Effect.flatMap(attrFromWire(attrWire), (attr) =>
          Effect.flatMap(decodeInlines(childrenWire), (children) =>
            Effect.map(targetFromWire(targetWire), (target) => Image.make({ attr, children, target }))
          )
        )
      );
    }
    if (wire.t === "Span") {
      return Effect.flatMap(decodeDivPayloadWire(wire.c), ([attrWire, childrenWire]) =>
        Effect.flatMap(attrFromWire(attrWire), (attr) =>
          Effect.map(decodeInlines(childrenWire), (children) => Span.make({ attr, children }))
        )
      );
    }
    if (wire.t === "Note") {
      return Effect.map(
        Effect.flatMap(decodeNotePayloadWire(wire.c), (blocks) => Effect.forEach(blocks, decodeBlock)),
        (blocks) => Note.make({ blocks })
      );
    }
    if (wire.t === "Math") {
      return Effect.map(decodeMathPayloadWire(wire.c), ([mathTypeWire, text]) =>
        Math.make({ mathType: mathTypeWire.t === "DisplayMath" ? "DisplayMath" : "InlineMath", text })
      );
    }
    return Effect.succeed(unknownInline(wire.t, wire.c));
  });

const decodeBlock = (input: unknown): Effect.Effect<PandocBlock.Type, S.SchemaError> =>
  Effect.flatMap(decodeConstructor(input), (wire): Effect.Effect<PandocBlock.Type, S.SchemaError> => {
    if (wire.t === "Plain") {
      return Effect.map(decodeInlines(wire.c), (children) => Plain.make({ children }));
    }
    if (wire.t === "Para") {
      return Effect.map(decodeInlines(wire.c), (children) => Para.make({ children }));
    }
    if (wire.t === "Header") {
      return Effect.flatMap(decodeHeaderPayloadWire(wire.c), ([level, attrWire, childrenWire]) =>
        Effect.flatMap(attrFromWire(attrWire), (attr) =>
          Effect.map(decodeInlines(childrenWire), (children) => Header.make({ attr, children, level }))
        )
      );
    }
    if (wire.t === "BlockQuote") {
      return Effect.map(decodeBlockList(wire.c), (children) => BlockQuote.make({ children }));
    }
    if (wire.t === "CodeBlock") {
      return Effect.flatMap(decodeCodePayloadWire(wire.c), ([attrWire, text]) =>
        Effect.map(attrFromWire(attrWire), (attr) => CodeBlock.make({ attr, text }))
      );
    }
    if (wire.t === "BulletList") {
      return Effect.map(decodeBlockItems(wire.c), (items) => BulletList.make({ items }));
    }
    if (wire.t === "OrderedList") {
      return Effect.flatMap(decodeOrderedListPayloadWire(wire.c), ([[start, style, delimiter], itemWire]) =>
        Effect.map(decodeBlockItems(itemWire), (items) =>
          OrderedList.make({ delimiter: delimiter.t, items, start, style: style.t })
        )
      );
    }
    if (wire.t === "HorizontalRule") {
      return Effect.succeed(HorizontalRule.make({}));
    }
    if (wire.t === "Div") {
      return Effect.flatMap(decodeDivPayloadWire(wire.c), ([attrWire, childrenWire]) =>
        Effect.flatMap(attrFromWire(attrWire), (attr) =>
          Effect.map(decodeBlockList(childrenWire), (children) => Div.make({ attr, children }))
        )
      );
    }
    if (wire.t === "Table") {
      return Effect.succeed(Table.make({ attr: PandocAttr.empty, caption: [], payload: wire.c }));
    }
    return Effect.succeed(unknownBlock(wire.t, wire.c));
  });

const encodeAttr = (
  attr: PandocAttr.Type
): Readonly<[string, ReadonlyArray<string>, ReadonlyArray<PandocKeyValue>]> => [attr.id, attr.classes, attr.keyValues];

const encodeTarget = (target: PandocTarget.Type): Readonly<[string, string]> => [target.url, target.title];

const encodeInlines = (inlines: ReadonlyArray<PandocInline.Type>): ReadonlyArray<unknown> =>
  A.map(inlines, encodeInline);

const encodeBlocks = (blocks: ReadonlyArray<PandocBlock.Type>): ReadonlyArray<unknown> => A.map(blocks, encodeBlock);

const encodeBlockItems = (
  items: ReadonlyArray<ReadonlyArray<PandocBlock.Type>>
): ReadonlyArray<ReadonlyArray<unknown>> => A.map(items, encodeBlocks);

const encodeInline = (inline: PandocInline.Type): unknown => {
  if (inline._tag === "str") {
    return { c: inline.text, t: "Str" };
  }
  if (inline._tag === "space") {
    return { t: "Space" };
  }
  if (inline._tag === "softbreak") {
    return { t: "SoftBreak" };
  }
  if (inline._tag === "linebreak") {
    return { t: "LineBreak" };
  }
  if (inline._tag === "emph") {
    return { c: encodeInlines(inline.children), t: "Emph" };
  }
  if (inline._tag === "strong") {
    return { c: encodeInlines(inline.children), t: "Strong" };
  }
  if (inline._tag === "strikeout") {
    return { c: encodeInlines(inline.children), t: "Strikeout" };
  }
  if (inline._tag === "code") {
    return { c: [encodeAttr(inline.attr), inline.text], t: "Code" };
  }
  if (inline._tag === "link") {
    return { c: [encodeAttr(inline.attr), encodeInlines(inline.children), encodeTarget(inline.target)], t: "Link" };
  }
  if (inline._tag === "image") {
    return { c: [encodeAttr(inline.attr), encodeInlines(inline.children), encodeTarget(inline.target)], t: "Image" };
  }
  if (inline._tag === "span") {
    return { c: [encodeAttr(inline.attr), encodeInlines(inline.children)], t: "Span" };
  }
  if (inline._tag === "note") {
    return { c: encodeBlocks(inline.blocks), t: "Note" };
  }
  if (inline._tag === "math") {
    return { c: [{ t: inline.mathType }, inline.text], t: "Math" };
  }
  return { c: inline.payload, t: inline.constructor };
};

const encodeBlock = (block: PandocBlock.Type): unknown => {
  if (block._tag === "plain") {
    return { c: encodeInlines(block.children), t: "Plain" };
  }
  if (block._tag === "para") {
    return { c: encodeInlines(block.children), t: "Para" };
  }
  if (block._tag === "header") {
    return { c: [block.level, encodeAttr(block.attr), encodeInlines(block.children)], t: "Header" };
  }
  if (block._tag === "blockquote") {
    return { c: encodeBlocks(block.children), t: "BlockQuote" };
  }
  if (block._tag === "codeblock") {
    return { c: [encodeAttr(block.attr), block.text], t: "CodeBlock" };
  }
  if (block._tag === "bulletlist") {
    return { c: encodeBlockItems(block.items), t: "BulletList" };
  }
  if (block._tag === "orderedlist") {
    return {
      c: [[block.start, { t: block.style }, { t: block.delimiter }], encodeBlockItems(block.items)],
      t: "OrderedList",
    };
  }
  if (block._tag === "horizontalrule") {
    return { t: "HorizontalRule" };
  }
  if (block._tag === "div") {
    return { c: [encodeAttr(block.attr), encodeBlocks(block.children)], t: "Div" };
  }
  if (block._tag === "table") {
    return { c: block.payload, t: "Table" };
  }
  return { c: block.payload, t: block.constructor };
};

/**
 * Decodes a Pandoc JSON object into the internal schema-first document model.
 *
 * @example
 * ```ts
 * import * as Effect from "effect/Effect"
 * import { decodePandocJson } from "@beep/pandoc-ast/Pandoc.codec"
 *
 * const document = Effect.runSync(decodePandocJson({ "pandoc-api-version": [1, 23, 1], meta: {}, blocks: [] }))
 * console.log(document.blocks.length)
 * ```
 *
 * @category codecs
 * @since 0.0.0
 */
export const decodePandocJson = (input: unknown): Effect.Effect<PandocDocument, S.SchemaError> =>
  Effect.flatMap(decodeWire(input), (wire) =>
    Effect.map(Effect.forEach(wire.blocks, decodeBlock), (blocks) =>
      PandocDocument.make({ apiVersion: wire["pandoc-api-version"], blocks, meta: wire.meta })
    )
  );

/**
 * Decodes a Pandoc JSON string into the internal schema-first document model.
 *
 * @example
 * ```ts
 * import * as Effect from "effect/Effect"
 * import { decodePandocJsonString } from "@beep/pandoc-ast/Pandoc.codec"
 *
 * const document = Effect.runSync(decodePandocJsonString(`{"pandoc-api-version":[1,23,1],"meta":{},"blocks":[]}`))
 * console.log(document.apiVersion[0])
 * ```
 *
 * @category codecs
 * @since 0.0.0
 */
export const decodePandocJsonString = (input: string): Effect.Effect<PandocDocument, S.SchemaError> =>
  Effect.flatMap(decodeWireFromString(input), decodePandocJson);

/**
 * Encodes an internal Pandoc document model to Pandoc JSON object form.
 *
 * @example
 * ```ts
 * import * as Effect from "effect/Effect"
 * import { encodePandocJson } from "@beep/pandoc-ast/Pandoc.codec"
 * import { PandocDocument } from "@beep/pandoc-ast/Pandoc.model"
 *
 * const wire = Effect.runSync(encodePandocJson(PandocDocument.make({ apiVersion: [1, 23, 1], blocks: [], meta: {} })))
 * console.log(wire.blocks.length)
 * ```
 *
 * @category codecs
 * @since 0.0.0
 */
export const encodePandocJson = (document: PandocDocument.Type): Effect.Effect<PandocJsonWire, S.SchemaError> =>
  Effect.succeed({
    "pandoc-api-version": document.apiVersion,
    blocks: encodeBlocks(document.blocks),
    meta: document.meta,
  });

/**
 * Encodes an internal Pandoc document model to a Pandoc JSON string.
 *
 * @example
 * ```ts
 * import * as Effect from "effect/Effect"
 * import { encodePandocJsonString } from "@beep/pandoc-ast/Pandoc.codec"
 * import { PandocDocument } from "@beep/pandoc-ast/Pandoc.model"
 *
 * const text = Effect.runSync(encodePandocJsonString(PandocDocument.make({ apiVersion: [1, 23, 1], blocks: [], meta: {} })))
 * console.log(text.includes("pandoc-api-version"))
 * ```
 *
 * @category codecs
 * @since 0.0.0
 */
export const encodePandocJsonString = (document: PandocDocument.Type): Effect.Effect<string, S.SchemaError> =>
  Effect.flatMap(encodePandocJson(document), encodeWireToString);
