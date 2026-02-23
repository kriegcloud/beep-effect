/**
 * MCP tool definition and handler for `find_related`.
 *
 * @since 0.0.0
 * @module
 */

import { Effect } from "effect";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { Tool } from "effect/unstable/ai";
import { type IndexingError, SymbolNotFoundError } from "../errors.js";
import { LanceDbWriter } from "../indexer/index.js";
import { RelationResolver, type RelationResolverConfig, type RelationType } from "../search/index.js";
import { McpErrorResponseSchema } from "./contracts.js";
import { type FormattedRelatedResult, formatRelatedResults } from "./formatters.js";

/** @internal */
const VALID_RELATIONS: ReadonlyArray<RelationType> = [
  "imports",
  "imported-by",
  "same-module",
  "similar",
  "provides",
  "depends-on",
];

/**
 * Handle `find_related` invocation.
 *
 * @since 0.0.0
 * @category handlers
 */
export const handleFindRelated: (params: {
  readonly symbolId: string;
  readonly relation?: string | undefined;
  readonly limit?: number | undefined;
}) => Effect.Effect<FormattedRelatedResult, IndexingError | SymbolNotFoundError, RelationResolver | LanceDbWriter> =
  Effect.fn(function* (params: {
    readonly symbolId: string;
    readonly relation?: string | undefined;
    readonly limit?: number | undefined;
  }) {
    const relationResolver = yield* RelationResolver;
    const lanceDb = yield* LanceDbWriter;

    const relation = pipe(
      O.fromNullishOr(params.relation),
      O.filter((value): value is RelationType => A.contains(value)(VALID_RELATIONS)),
      O.getOrElse<RelationType>(() => "similar")
    );

    const limit = pipe(
      O.fromNullishOr(params.limit),
      O.map((value) => Math.max(1, Math.min(10, value))),
      O.getOrElse(() => 5)
    );

    const source = yield* pipe(
      lanceDb.getById(params.symbolId),
      Effect.flatMap((sourceOpt) =>
        pipe(
          sourceOpt,
          O.match({
            onNone: () =>
              Effect.fail(
                new SymbolNotFoundError({
                  message: `Symbol not found: ${params.symbolId}`,
                  symbolId: params.symbolId,
                })
              ),
            onSome: Effect.succeed,
          })
        )
      )
    );

    const config: RelationResolverConfig = {
      symbolId: params.symbolId,
      relation,
      limit,
    };

    const related = yield* relationResolver.resolve(config);
    return formatRelatedResults({ id: source.id, name: source.name, kind: source.kind }, relation, related);
  });

/**
 * MCP tool: navigate symbol relationships.
 *
 * @since 0.0.0
 * @category tools
 */
export const FindRelatedTool = Tool.make("find_related", {
  description:
    "Find symbols related to a known symbol via imports, module scope, dependency tags, or vector similarity.",
  parameters: S.Struct({
    symbolId: S.String.annotate({
      description: "The source symbol ID to traverse from.",
    }),
    relation: S.optionalKey(
      S.Literals(["imports", "imported-by", "same-module", "similar", "provides", "depends-on"]).annotate({
        description: "Relationship type (default: similar).",
      })
    ),
    limit: S.optionalKey(
      S.Number.annotate({
        description: "Maximum number of related symbols (1-10, default 5).",
      })
    ),
  }),
  success: S.Unknown,
  failure: McpErrorResponseSchema,
  dependencies: [RelationResolver, LanceDbWriter],
});
