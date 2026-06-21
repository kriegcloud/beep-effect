import { RULE_NAMES, RULES } from "@beep/lint-rules";
import { NodeServices } from "@effect/platform-node";
import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { provideScopedLayer, runRule } from "./harness.ts";
import { SOURCES } from "./sources.ts";

const run = <A, E>(program: Effect.Effect<A, E, NodeServices.NodeServices>): Promise<A> =>
  Effect.runPromise(program.pipe(provideScopedLayer(NodeServices.layer)));

describe("GritQL rules", () => {
  for (const rule of RULE_NAMES) {
    const { invalid, invalidCount, valid, messageIncludes } = SOURCES[rule];
    // Rules ship advisory: severity matches the registry value ("warn" -> "warning").
    const expectedSeverity = RULES[rule].severity === "error" ? "error" : "warning";

    describe(rule, () => {
      it("flags the invalid source", () =>
        run(
          Effect.gen(function* () {
            const { diagnostics } = yield* runRule(rule, invalid);
            expect(diagnostics.length).toBe(invalidCount);
            expect(diagnostics.every((d) => d.message.includes(messageIncludes))).toBe(true);
            expect(diagnostics.every((d) => d.severity === expectedSeverity)).toBe(true);
          })
        ));

      it("ignores the valid source", () =>
        run(
          Effect.gen(function* () {
            const { diagnostics } = yield* runRule(rule, valid);
            expect(diagnostics.length).toBe(0);
          })
        ));
    });
  }
});
