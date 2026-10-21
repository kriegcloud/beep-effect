import { ResearchCommandServiceLive, ResearchStatusOptions, researchStatus } from "@beep/repo-cli/commands/Research";
import { provideScopedLayer } from "@beep/test-utils";
import { NodeServices } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as FetchHttpClient from "effect/http/FetchHttpClient";
import * as Layer from "effect/Layer";

const testLayer = Layer.mergeAll(
  ResearchCommandServiceLive.pipe(
    Layer.provideMerge(FetchHttpClient.layer.pipe(Layer.provideMerge(NodeServices.layer)))
  ),
  NodeServices.layer
);

const provideTestLayer = provideScopedLayer(testLayer);

const makeVault = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  return yield* fs.makeTempDirectoryScoped({ prefix: "research-vault-" });
});

describe("research status", () => {
  it.effect("reports an empty summary for a vault without a catalog", () =>
    provideTestLayer(
      Effect.gen(function* () {
        const vaultRoot = yield* makeVault;
        const status = yield* researchStatus(ResearchStatusOptions.make({ vaultRoot }));
        expect(status.totalCards).toBe(0);
        expect(status.seenUrls).toBe(0);
        expect(A.length(status.bySourceType)).toBe(0);
      })
    )
  );
});
