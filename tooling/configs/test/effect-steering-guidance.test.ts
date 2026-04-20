import { fileURLToPath } from "node:url";
import { NodeServices } from "@effect/platform-node";
import { describe, expect, layer } from "@effect/vitest";
import { Effect, FileSystem } from "effect";

const skillFilePath = fileURLToPath(
  new URL("../../../.agents/skills/effect-first-development/SKILL.md", import.meta.url)
);

const readText = Effect.fn(function* (path: string) {
  const fs = yield* FileSystem.FileSystem;
  return yield* fs.readFileString(path);
});

layer(NodeServices.layer)("effect steering guidance", (it) => {
  describe("effect steering guidance", () => {
    it.effect(
      "aligns the canonical skill with flat control flow guidance",
      Effect.fn(function* () {
        const source = yield* readText(skillFilePath);

        expect(source).toContain("Prefer the flattest equivalent form first");
        expect(source).toContain("Before I keep an `O.match(...)`");
        expect(source).toContain(
          "Before keeping `O.match(...)`, check whether `O.map(...)`, `O.flatMap(...)`, `O.liftPredicate(...)`, and `O.getOrElse(...)` express the same control flow more flatly."
        );
        expect(source.includes("Prefer `effect/Boolean` `Bool.match(...)` over `Match.when(true/false)`.")).toBe(false);
      })
    );
  });
});
