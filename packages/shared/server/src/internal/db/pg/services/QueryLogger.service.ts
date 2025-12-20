import { $SharedServerId } from "@beep/identity/packages";
import { thunk } from "@beep/utils/thunk";
import type { Logger as DrizzleLogger } from "drizzle-orm";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import type * as Layer from "effect/Layer";
import * as Str from "effect/String";
import { BOX, QueryType, SqlString } from "../formatter.ts";

const $I = $SharedServerId.create("internal/db/pg/services/LoggerService");

export type Shape = {
  readonly logQuery: (query: string, params: Array<unknown>) => void;
};

export type ServiceEffect = Effect.Effect<Shape, never, never>;

const serviceEffect: ServiceEffect = F.pipe(
  Effect.Do,
  Effect.bind(
    "logQuery",
    thunk(
      Effect.gen(function* () {
        const logQuery: DrizzleLogger["logQuery"] = (query, params) => {
          const queryType = QueryType.getQueryType(query);
          const { badge, color: boxColor } = QueryType.getQueryTypeStyle(queryType);
          // For simple transaction control, keep it minimal
          if (QueryType.is.BEGIN(queryType) || QueryType.is.COMMIT(queryType) || QueryType.is.ROLLBACK(queryType)) {
            console.log(`${boxColor(BOX.topLeft + BOX.horizontal)} ${badge}`);
            return;
          }

          const highlightedSQL = SqlString.highlightSql(query);
          const hasParams = A.length(params) > 0;
          // Build the log output with proper box drawing
          const lines: string[] = A.empty<string>();

          // Header with query type badge
          lines.push(`${boxColor(BOX.topLeft + BOX.horizontal)} ${badge}`);
          // SQL lines with vertical bar
          const sqlLines = F.pipe(highlightedSQL, Str.split("\n"));
          A.forEach(sqlLines, (line) => lines.push(`${boxColor(BOX.vertical)} ${line}`));

          // Params section (if any)
          if (hasParams) {
            lines.push(SqlString.formatParamsBlock(params, boxColor));
          }

          // Footer
          lines.push(`${boxColor(BOX.bottomLeft + BOX.horizontal)}`);

          F.pipe(lines, A.join("\n"), console.log);
        };

        return logQuery;
      })
    )
  )
);

export class QueryLogger extends Effect.Service<QueryLogger>()($I`QueryLogger`, {
  accessors: true,
  dependencies: [],
  effect: serviceEffect,
}) {}

export const layer: Layer.Layer<QueryLogger, never, never> = QueryLogger.Default;
