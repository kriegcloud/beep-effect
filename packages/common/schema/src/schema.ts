import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";

/**
 * Public exports for all schemas and utilities.
 * Keep this as the single import surface for consumers.
 *
 * @since 0.1.0
 */
export * from "effect/Schema";
export * from "./annotations";
export * from "./custom";
export * from "./EntityId";
export * from "./EntityId";
// export * from "./extended-schemas";
export {
  Array,
  deriveAndAttachProperty,
  NonEmptyArray,
  NullOr,
  ReadonlyMap,
  ReadonlySet,
  Struct,
  Tuple,
} from "./extended-schemas";
export * from "./form";
export { TaggedStruct } from "./generics";
export * from "./kits";
export * from "./sql";
export * from "./utils";

const DeprecatedId = Symbol.for("@beep/schema/DeprecatedId");
export type DeprecatedId = typeof DeprecatedId;

export const isDeprecated = <A, I, R>(schema: S.Schema<A, I, R>): boolean =>
  AST.getAnnotation<boolean>(DeprecatedId)(schema.ast).pipe(
    O.getOrElse(F.constFalse),
  );
