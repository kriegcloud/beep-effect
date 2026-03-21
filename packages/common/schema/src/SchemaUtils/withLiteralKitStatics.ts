/**
 * Reattach LiteralKit statics after a schema transformation or annotation.
 *
 * @module @beep/schema/utils/withLiteralKitStatics
 * @since 0.0.0
 */

import type { SchemaAST } from "effect";
import type * as A from "effect/Array";
import type { LiteralKit as LiteralKitSchema } from "../LiteralKit.ts";
import { withStatics } from "./withStatics.ts";

type LiteralKitStatics<L extends A.NonEmptyReadonlyArray<SchemaAST.LiteralValue>> = Pick<
  LiteralKitSchema<L>,
  "Options" | "is" | "Enum" | "pickOptions" | "omitOptions" | "$match" | "thunk" | "toTaggedUnion"
>;

/**
 * `LiteralKit` augments the underlying schema object with runtime helpers like
 * `Enum`, `Options`, and `pickOptions`. Schema annotations rebuild the schema,
 * so those helpers need to be copied back onto the annotated value.
 * @since 0.0.0
 */
export const withLiteralKitStatics = <const L extends A.NonEmptyReadonlyArray<SchemaAST.LiteralValue>>(
  literalKit: LiteralKitSchema<L>
): (<S extends object>(schema: S) => S & LiteralKitStatics<L>) =>
  withStatics(
    (): LiteralKitStatics<L> => ({
      Options: literalKit.Options,
      is: literalKit.is,
      Enum: literalKit.Enum,
      pickOptions: literalKit.pickOptions,
      omitOptions: literalKit.omitOptions,
      $match: literalKit.$match,
      thunk: literalKit.thunk,
      toTaggedUnion: literalKit.toTaggedUnion,
    })
  );
