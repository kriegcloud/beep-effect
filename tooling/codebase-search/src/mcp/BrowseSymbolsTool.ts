/**
 * MCP tool definition and handler for `browse_symbols`.
 *
 * @since 0.0.0
 * @module
 */

import { Effect, Order } from "effect";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { Tool } from "effect/unstable/ai";
import type { IndexingError } from "../errors.js";
import { LanceDbWriter } from "../indexer/index.js";
import { McpErrorResponseSchema } from "./contracts.js";
import { type BrowseItem, type FormattedBrowseResult, formatBrowseResult } from "./formatters.js";

/**
 * @param items items parameter value.
 * @internal
 * @returns Returns the computed value.
 */
const byNameAscending: Order.Order<BrowseItem> = Order.mapInput(Order.String, (item: BrowseItem) => item.name);

/**
 * @param items items parameter value.
 * @internal
 * @returns Returns the computed value.
 */
const sortByName = (items: ReadonlyArray<BrowseItem>): ReadonlyArray<BrowseItem> => A.sort(items, byNameAscending);

const makePackageGroup = (): { count: number; kinds: Record<string, number> } => ({
  count: 0,
  kinds: {},
});

const makeModuleGroup = (): { count: number; kinds: Record<string, number>; description: string } => ({
  count: 0,
  kinds: {},
  description: "",
});

/**
 * Handle `browse_symbols` invocation.
 *
 * @since 0.0.0
 * @category handlers
 */
export const handleBrowseSymbols: (params: {
  readonly package?: string | undefined;
  readonly module?: string | undefined;
  readonly kind?: string | undefined;
}) => Effect.Effect<FormattedBrowseResult, IndexingError, LanceDbWriter> = Effect.fn(function* (params: {
  readonly package?: string | undefined;
  readonly module?: string | undefined;
  readonly kind?: string | undefined;
}) {
  const lanceDb = yield* LanceDbWriter;

  if (params.package === undefined) {
    const rows = yield* lanceDb.list({ kind: params.kind });
    const groups = MutableHashMap.empty<string, { count: number; kinds: Record<string, number> }>();

    for (const row of rows) {
      const current = pipe(MutableHashMap.get(groups, row.package), O.getOrElse(makePackageGroup));
      current.count += 1;
      current.kinds[row.kind] = (current.kinds[row.kind] ?? 0) + 1;
      MutableHashMap.set(groups, row.package, current);
    }

    const items = pipe(
      A.fromIterable(groups),
      A.map(
        ([name, summary]): BrowseItem => ({
          name,
          count: summary.count,
          kinds: summary.kinds,
          description: `${summary.count} indexed symbols`,
        })
      )
    );

    return formatBrowseResult("packages", sortByName(items));
  }

  if (params.module === undefined) {
    const rows = yield* lanceDb.list({
      package: params.package,
      kind: params.kind,
    });
    const groups = MutableHashMap.empty<
      string,
      { count: number; kinds: Record<string, number>; description: string }
    >();

    for (const row of rows) {
      const current = pipe(MutableHashMap.get(groups, row.module), O.getOrElse(makeModuleGroup));
      current.count += 1;
      current.kinds[row.kind] = (current.kinds[row.kind] ?? 0) + 1;
      if (current.description.length === 0 && row.description.length > 0) {
        current.description = row.description;
      }
      MutableHashMap.set(groups, row.module, current);
    }

    const items = pipe(
      A.fromIterable(groups),
      A.map(
        ([name, summary]): BrowseItem => ({
          name,
          count: summary.count,
          kinds: summary.kinds,
          description: summary.description,
        })
      )
    );

    return formatBrowseResult("modules", sortByName(items));
  }

  const rows = yield* lanceDb.list({
    package: params.package,
    module: params.module,
    kind: params.kind,
  });

  const items = A.map(
    rows,
    (row): BrowseItem => ({
      name: row.name,
      count: 1,
      kinds: { [row.kind]: 1 },
      description: row.description,
    })
  );

  return formatBrowseResult("symbols", sortByName(items));
});

/**
 * MCP tool: browse index hierarchy by package/module/symbol level.
 *
 * @since 0.0.0
 * @category tools
 */
export const BrowseSymbolsTool = Tool.make("browse_symbols", {
  description: "Browse indexed packages, modules, or symbols without a search query.",
  parameters: S.Struct({
    package: S.optionalKey(
      S.String.annotate({
        description: "Optional package filter (for example, @beep/repo-utils).",
      })
    ),
    module: S.optionalKey(
      S.String.annotate({
        description: "Optional module filter; requires package when provided.",
      })
    ),
    kind: S.optionalKey(
      S.String.annotate({
        description: "Optional symbol kind filter.",
      })
    ),
  }),
  success: S.Unknown,
  failure: McpErrorResponseSchema,
  dependencies: [LanceDbWriter],
});
