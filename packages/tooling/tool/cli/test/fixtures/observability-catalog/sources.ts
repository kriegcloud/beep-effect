/**
 * Source-text fixtures for the observability catalog harvester tests.
 */

export const literalSpans = `
import * as Effect from "effect/Effect";

const SPAN = "Parcels.list";

export const read = Effect.fn("Parcels.read")(function* () {});
export const write = Effect.fnUntraced("Parcels.write")(function* () {});
export const listed = Effect.succeed(1).pipe(Effect.withSpan(SPAN));
export const piped = Effect.withSpan(Effect.succeed(1), "db.query", { attributes: { "db.system": "duckdb" } });
export const dataLast = Effect.succeed(1).pipe(Effect.withSpan("Parcels.count", { attributes: { n: 1 } }));
export const unnamed = Effect.fn(function* () {});
export const untracedUnnamed = Effect.fnUntraced(function* () {});
`;

export const dynamicSpans = `
import * as Effect from "effect/Effect";

export const call = (method: string, name: string) =>
  Effect.succeed(1).pipe(Effect.withSpan(\`box.\${method}\`), Effect.withSpan(name));
export const traced = (prefix: string) => Effect.fn(\`\${prefix}.execute\`)(function* () {});
`;
