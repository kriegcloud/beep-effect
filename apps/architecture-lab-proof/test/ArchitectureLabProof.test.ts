import { runArchitectureLabProof } from "@beep/architecture-lab-proof";
import { ArchitectureLabServerLive } from "@beep/architecture-lab-server/layer";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";

describe("architecture lab proof app", () => {
  it.effect("runs through the composed app layer", () =>
    runArchitectureLabProof.pipe(
      Effect.provide(ArchitectureLabServerLive),
      Effect.map((result) => {
        expect(result.created.status).toBe("open");
        expect(result.summary.visibleActions).toContain("assign");
      })
    )
  );
});
