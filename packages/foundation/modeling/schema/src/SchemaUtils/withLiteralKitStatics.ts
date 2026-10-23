/**
 * Reattach LiteralKit keyed helpers after a schema derivation that builds a new schema.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { withStatics } from "./withStatics.ts";
import type { A } from "@beep/utils";
import type * as SchemaAST from "effect/SchemaAST";
import type { LiteralKit as LiteralKitSchema } from "../LiteralKit/index.ts";

/**
 * The keyed helpers {@link withLiteralKitStatics} copies from a kit.
 *
 * **Details**
 *
 * This is a named interface rather than a `Pick` alias so that declaration
 * emit writes `LiteralKitStatics<readonly [...]>` instead of expanding every
 * `match` and `matchOrElse` overload at each decorated schema.
 *
 * @category type-level
 * @since 0.0.0
 */
export interface LiteralKitStatics<L extends A.NonEmptyReadonlyArray<SchemaAST.LiteralValue>>
  extends LiteralKitStaticsRecord<L> {}

// `withStatics` takes a record type, and an interface has no implicit index
// signature, so the implementation builds the alias and the signature names
// the interface.
type LiteralKitStaticsRecord<L extends A.NonEmptyReadonlyArray<SchemaAST.LiteralValue>> = Pick<
  LiteralKitSchema<L>,
  "is" | "Enum" | "match" | "matchOrElse" | "toTaggedUnion"
>;

/**
 * Copies a kit's keyed helpers (`is`, `Enum`, `match`, `matchOrElse`, `toTaggedUnion`) onto
 * a schema derived from it.
 *
 * **Details**
 *
 * A `LiteralKit` keeps its helpers across `annotate`, `annotateKey`, and
 * `check` on its own. This decorator is for derivations that build a new
 * schema, such as `S.brand(...)`, where the result is no longer the kit. The
 * literal tuple is not copied: read it from the kit, `Base.literals`.
 *
 * **Example** (Reattach helpers after a brand)
 *
 * ```ts
 * import { LiteralKit } from "@beep/schema/LiteralKit"
 * import { withLiteralKitStatics } from "@beep/schema/SchemaUtils/withLiteralKitStatics"
 * import * as S from "effect/Schema"
 *
 * const StatusBase = LiteralKit(["draft", "published"])
 * const Status = StatusBase.pipe(S.brand("Status"), withLiteralKitStatics(StatusBase))
 *
 * console.log(Status.is.published("published"), StatusBase.literals.length)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const withLiteralKitStatics = <const L extends A.NonEmptyReadonlyArray<SchemaAST.LiteralValue>>(
  literalKit: LiteralKitSchema<L>
): (<S extends object>(schema: S) => S & LiteralKitStatics<L>) =>
  withStatics(
    (): LiteralKitStaticsRecord<L> => ({
      is: literalKit.is,
      Enum: literalKit.Enum,
      match: literalKit.match,
      matchOrElse: literalKit.matchOrElse,
      toTaggedUnion: literalKit.toTaggedUnion,
    })
  );
