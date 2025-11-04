import { describe } from "bun:test";
import { __iconifyCliTestExports } from "@beep/repo-scripts/iconify/cli";
import type { IconifyClientService } from "@beep/repo-scripts/iconify/client";
import { IconifyClient, IconifyClientError } from "@beep/repo-scripts/iconify/client";
import { assertTrue, scoped, strictEqual } from "@beep/testkit";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import * as BunTerminal from "@effect/platform-bun/BunTerminal";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Ref from "effect/Ref";
import * as Str from "effect/String";

const { handleCollections, handleSearch } = __iconifyCliTestExports;

const stubCollections = {
  mdi: {
    name: "Material",
    total: 2,
    samples: ["mdi:account"],
  },
};

const stubSearchResponse = {
  icons: ["mdi:account"],
  total: 1,
  limit: 10,
  start: 0,
  collections: stubCollections,
  request: {
    query: "account",
  },
};

const stubClient: IconifyClientService = {
  config: {
    baseUrl: "https://example.invalid",
    maxRetries: 0,
    initialRetryDelayMillis: 0,
    maxRetryDelayMillis: 0,
  },
  request: () =>
    Effect.fail(
      new IconifyClientError({
        message: "request should not be invoked",
        method: "GET",
        url: "n/a",
      })
    ),
  requestJson: (request) => {
    if (request.path === "/collections") {
      return Effect.succeed(stubCollections);
    }
    if (request.path === "/search") {
      return Effect.succeed(stubSearchResponse);
    }
    return Effect.fail(
      new IconifyClientError({
        message: `unexpected path: ${request.path}`,
        method: request.method ?? "GET",
        url: request.path,
      })
    );
  },
  requestText: () =>
    Effect.fail(
      new IconifyClientError({
        message: "requestText should not be invoked",
        method: "GET",
        url: "n/a",
      })
    ),
};

const iconifyTestLayer = Layer.mergeAll(
  Layer.succeed(IconifyClient, stubClient),
  BunTerminal.layer,
  BunFileSystem.layer,
  BunPath.layerPosix
);

const makeTestConsole = (logsRef: Ref.Ref<ReadonlyArray<string>>): Console.Console => {
  const record = (args: ReadonlyArray<any>) => {
    const message = F.pipe(
      args,
      A.get(0),
      O.flatMap((value) => (typeof value === "string" ? O.some(value) : O.fromNullable(JSON.stringify(value)))),
      O.getOrElse(() => Str.empty)
    );
    return Effect.flatMap(
      Ref.update(logsRef, (current) => F.pipe(current, A.append(message))),
      () => Effect.void
    );
  };

  const noOp =
    <Args extends ReadonlyArray<any>>() =>
    (..._args: Args) =>
      Effect.void;

  return {
    [Console.TypeId]: Console.TypeId,
    assert: noOp<[boolean, ...ReadonlyArray<any>]>(),
    clear: Effect.void,
    count: noOp<[string | undefined]>(),
    countReset: noOp<[string | undefined]>(),
    debug: noOp<ReadonlyArray<any>>(),
    dir: noOp<[any, any]>(),
    dirxml: noOp<ReadonlyArray<any>>(),
    error: noOp<ReadonlyArray<any>>(),
    group: noOp<[{ readonly label?: string; readonly collapsed?: boolean } | undefined]>(),
    groupEnd: Effect.void,
    info: noOp<ReadonlyArray<any>>(),
    log: (...args: ReadonlyArray<any>) => record(args),
    table: noOp<[any, ReadonlyArray<string> | undefined]>(),
    time: () => Effect.void,
    timeEnd: () => Effect.void,
    timeLog: noOp<[string | undefined, ...ReadonlyArray<any>]>(),
    trace: noOp<ReadonlyArray<any>>(),
    warn: noOp<ReadonlyArray<any>>(),
    unsafe: globalThis.console,
  };
};

const captureLogs = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  Effect.gen(function* () {
    const logsRef = yield* Ref.make<ReadonlyArray<string>>([]);
    const consoleService = makeTestConsole(logsRef);
    yield* effect.pipe(Console.withConsole(consoleService));
    return yield* Ref.get(logsRef);
  });

const firstLog = (logs: ReadonlyArray<string>): string =>
  F.pipe(
    logs,
    A.get(0),
    O.getOrElse(() => Str.empty)
  );

describe("iconify CLI handlers", () => {
  scoped("emits collections JSON when requested", () =>
    Effect.gen(function* () {
      const program = handleCollections({
        prefix: O.none(),
        filter: O.none(),
        json: true,
      }).pipe(Effect.provide(iconifyTestLayer));

      const logs = yield* captureLogs(program);
      strictEqual(A.length(logs), 1);
      const logLine = firstLog(logs);
      const parsed = JSON.parse(logLine) as ReadonlyArray<{
        readonly prefix: string;
      }>;
      const firstEntry = O.fromNullable(parsed[0]);
      assertTrue(O.isSome(firstEntry));
      strictEqual(firstEntry.value.prefix, "mdi");
    })
  );

  scoped("emits search results JSON when requested", () =>
    Effect.gen(function* () {
      const program = handleSearch({
        query: O.some("account"),
        limit: O.none(),
        prefix: O.none(),
        json: true,
      }).pipe(Effect.provide(iconifyTestLayer));

      const logs = yield* captureLogs(program);
      strictEqual(A.length(logs), 1);
      const logLine = firstLog(logs);
      const parsed = JSON.parse(logLine) as ReadonlyArray<{
        readonly icon: string;
      }>;
      const firstResult = O.fromNullable(parsed[0]);
      assertTrue(O.isSome(firstResult));
      strictEqual(firstResult.value.icon, "mdi:account");
    })
  );
});
