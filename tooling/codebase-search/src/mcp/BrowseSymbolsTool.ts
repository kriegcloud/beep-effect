/**
 * MCP tool definition and handler for `browse_symbols`.
 *
 * @since 0.0.0
 * @module
 */

import { Effect } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import { Tool } from "effect/unstable/ai";
import type { IndexingError } from "../errors.js";
import { LanceDbWriter } from "../indexer/index.js";
import { McpErrorResponseSchema } from "./contracts.js";
import { type BrowseItem, type FormattedBrowseResult, formatBrowseResult } from "./formatters.js";

/** @internal */
const sortByName = (items: ReadonlyArray<BrowseItem>): ReadonlyArray<BrowseItem> =>
  [...items].sort((left, right) => left.name.localeCompare(right.name));

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
    const groups = new Map<string, { count: number; kinds: Record<string, number> }>();

    for (const row of rows) {
      const current = groups.get(row.package) ?? { count: 0, kinds: {} };
      current.count += 1;
      current.kinds[row.kind] = (current.kinds[row.kind] ?? 0) + 1;
      groups.set(row.package, current);
    }

    const items = A.fromIterable(groups.entries()).map(
      ([name, summary]): BrowseItem => ({
        name,
        count: summary.count,
        kinds: summary.kinds,
        description: `${summary.count} indexed symbols`,
      })
    );

    return formatBrowseResult("packages", sortByName(items));
  }

  if (params.module === undefined) {
    const rows = yield* lanceDb.list({
      package: params.package,
      kind: params.kind,
    });
    const groups = new Map<string, { count: number; kinds: Record<string, number>; description: string }>();

    for (const row of rows) {
      const current = groups.get(row.module) ?? { count: 0, kinds: {}, description: "" };
      current.count += 1;
      current.kinds[row.kind] = (current.kinds[row.kind] ?? 0) + 1;
      if (current.description.length === 0 && row.description.length > 0) {
        current.description = row.description;
      }
      groups.set(row.module, current);
    }

    const items = A.fromIterable(groups.entries()).map(
      ([name, summary]): BrowseItem => ({
        name,
        count: summary.count,
        kinds: summary.kinds,
        description: summary.description,
      })
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
