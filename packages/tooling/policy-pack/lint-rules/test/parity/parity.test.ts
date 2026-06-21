import { NodeServices } from "@effect/platform-node";
import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { provideScopedLayer } from "../harness.ts";
import { coverageDiff, newRuleViolations, oldCliViolations } from "./parity.ts";

// These proofs spawn the (ts-morph) beep CLI over the whole tree, so they are slow.
const PARITY_TIMEOUT = 120_000;

describe("parity: migrated CLI checks -> GritQL rules (no coverage loss on current tree)", () => {
  it("no-native-error covers `lint tooling-tagged-errors`", { timeout: PARITY_TIMEOUT }, () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const oldKeys = yield* oldCliViolations(["lint", "tooling-tagged-errors"]);
        // Match the old check's scope (tooling source roots only) and the biome.jsonc
        // override that registers this rule: packages/tooling/**/src/**.
        const newKeys = yield* newRuleViolations(
          "no-native-error",
          ["packages/tooling"],
          ["packages/tooling/**/src/**", "!**/dist/**", "!**/*.gen.*"]
        );
        const { missing, extra } = coverageDiff(oldKeys, newKeys);
        if (missing.length > 0 || extra.length > 0) {
          // Surface the diff for reviewers when parity drifts.
          yield* Effect.log("[parity] tooling-tagged-errors", { missing, extra });
        }
        // Old must be a subset of new (no coverage loss). new-only (extra) is triaged
        // separately; on the current clean tree both sets are empty.
        expect(extra).toEqual([]);
        expect(missing).toEqual([]);
      }).pipe(provideScopedLayer(NodeServices.layer))
    )
  );
});
