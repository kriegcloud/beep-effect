/**
 * @since 0.1.0
 */

import { $WrapId } from "@beep/identity/packages";
import type { UnsafeTypes } from "@beep/types";
import type * as Chunk from "effect/Chunk";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import { hasProperty } from "effect/Predicate";
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";
import * as Stream_ from "effect/Stream";

const $I = $WrapId.create("schema/schema");

/**
 * @since 0.1.0
 * @category Stream
 */
export const StreamSchemaId: unique symbol = Symbol.for($I`Stream`);

/**
 * @since 0.1.0
 * @category Stream
 */
export const isStreamSchema = (schema: S.Schema.All): schema is Stream<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny> =>
  schema.ast.annotations[AST.SchemaIdAnnotationId] === StreamSchemaId;

/**
 * @since 0.1.0
 * @category Stream
 */
export const isStreamSerializable = (schema: S.WithResult.Any): boolean => isStreamSchema(S.successSchema(schema));

/**
 * @since 0.1.0
 * @category Stream
 */
export const getStreamSchemas = (
  ast: AST.AST
): O.Option<{
  readonly success: S.Schema.Any;
  readonly failure: S.Schema.All;
}> => (ast.annotations[StreamSchemaId] ? O.some(ast.annotations[StreamSchemaId] as UnsafeTypes.UnsafeAny) : O.none());

/**
 * @since 0.1.0
 * @category Stream
 */
export interface Stream<A extends S.Schema.Any, E extends S.Schema.All>
  extends S.Schema<
    Stream_.Stream<A["Type"], E["Type"]>,
    Stream_.Stream<A["Encoded"], E["Encoded"]>,
    A["Context"] | E["Context"]
  > {
  readonly success: A;
  readonly failure: E;
}

/**
 * @since 0.1.0
 * @category Stream
 */
export const Stream = <A extends S.Schema.Any, E extends S.Schema.All>({
  failure,
  success,
}: {
  readonly failure: E;
  readonly success: A;
}): Stream<A, E> =>
  Object.assign(
    S.declare(
      [success, failure],
      {
        decode: (success, failure) =>
          parseStream(ParseResult.decodeUnknown(S.ChunkFromSelf(success)), ParseResult.decodeUnknown(failure)),
        encode: (success, failure) =>
          parseStream(ParseResult.encodeUnknown(S.ChunkFromSelf(success)), ParseResult.encodeUnknown(failure)),
      },
      {
        schemaId: StreamSchemaId,
        [StreamSchemaId]: { success, failure },
      }
    ),
    {
      success,
      failure,
    }
  );

const isStream = (u: unknown): u is Stream_.Stream<unknown, unknown> => hasProperty(u, Stream_.StreamTypeId);

const parseStream =
  <A, E, RA, RE>(
    decodeSuccess: (
      u: Chunk.Chunk<unknown>,
      overrideOptions?: AST.ParseOptions
    ) => Effect.Effect<Chunk.Chunk<A>, ParseResult.ParseIssue, RA>,
    decodeFailure: (u: unknown, overrideOptions?: AST.ParseOptions) => Effect.Effect<E, ParseResult.ParseIssue, RE>
  ) =>
  (u: unknown, options: AST.ParseOptions, ast: AST.AST) =>
    Effect.flatMap(Effect.context<RA | RE>(), (context) => {
      if (!isStream(u)) return Effect.fail(new ParseResult.Type(ast, u));
      return Effect.succeed(
        u.pipe(
          Stream_.mapChunksEffect((value) => decodeSuccess(value, options)),
          Stream_.catchAll((error) => {
            if (ParseResult.isParseError(error)) return Stream_.die(error);
            return Effect.matchEffect(decodeFailure(error, options), {
              onFailure: Effect.die,
              onSuccess: Effect.fail,
            });
          }),
          Stream_.provideContext(context)
        )
      );
    });
