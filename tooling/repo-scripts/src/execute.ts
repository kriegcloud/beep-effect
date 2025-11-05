#!/usr/bin/env node
import { generateLocalesContent } from "@beep/repo-scripts/i18n/index.js";
import { FsUtilsLive } from "@beep/tooling-utils/FsUtils";
import { RepoUtilsLive } from "@beep/tooling-utils/RepoUtils";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

const fetchLayer = Layer.sync(FetchHttpClient.Fetch, () => globalThis.fetch.bind(globalThis));

const repoServicesLayer = Layer.provideMerge(FsUtilsLive)(RepoUtilsLive);

const program = Effect.gen(function* () {
  const content = yield* generateLocalesContent;
  yield* Console.log(content);
}).pipe(
  Effect.provide(repoServicesLayer),
  Effect.provide(fetchLayer),
  Effect.provide(FetchHttpClient.layer),
  Effect.provide(BunFileSystem.layer),
  Effect.provide(BunPath.layerPosix),
  Effect.provide(BunContext.layer),
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      yield* Console.log("\n💥 Program failed:", String(error));
      const cause = Cause.fail(error);
      yield* Console.log("\n🔍 Error details:", Cause.pretty(cause));
      return yield* Effect.fail(error);
    })
  )
);

BunRuntime.runMain(program);
