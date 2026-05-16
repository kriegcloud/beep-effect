import { InstallerWorkspaceServerTest } from "@beep/installer-workspace-server/test";
import { InstallerWorkspaceUseCases } from "@beep/installer-workspace-use-cases/server";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import * as A from "effect/Array";

describe("Installer workspace dry-run server", () => {
  it.effect("provides a deterministic manifest snapshot", () =>
    Effect.gen(function* () {
      const workspace = yield* InstallerWorkspaceUseCases;
      const plan = yield* workspace.previewWorkspace();

      expect(plan.snapshot.manifest.dryRunOnly).toBe(true);
      expect(A.map(plan.snapshot.manifest.providers, (provider) => provider.provider)).toEqual(["claude", "codex"]);
      expect(plan.snapshot.manifest.discordChannel.displayName).toBe("ai-stack-installer");
      expect(plan.snapshot.validationEvents).toHaveLength(4);
    }).pipe(Effect.provide(InstallerWorkspaceServerTest))
  );
});
