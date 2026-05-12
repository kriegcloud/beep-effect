import { WorkItemConfig } from "@beep/architecture-lab-config/layer";
import { ArchitectureLabConfigTest } from "@beep/architecture-lab-config/test";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";

describe("WorkItem configuration", () => {
  it.effect("provides client-safe and server configuration", () =>
    Effect.gen(function* () {
      const config = yield* WorkItemConfig;
      expect(config.publicConfig.assignmentEnabled).toBe(true);
      expect(config.serverConfig.migrationSchemaName).toBe("architecture_lab");
    }).pipe(Effect.provide(ArchitectureLabConfigTest))
  );
});
