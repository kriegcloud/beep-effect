import {
  ProbeMissing,
  ProbeResult,
  ProbeSatisfied,
  SetupRequirement,
  SetupRequirementId,
} from "@beep/law-practice-domain";
import {
  makeSetupApprovals,
  SetupApprovals,
  SetupDoctor,
  SetupProbes,
  SetupProbeUnavailable,
  SetupRepairFailed,
  SetupRepairRefused,
} from "@beep/law-practice-use-cases/PracticeSetup";
import { ElicitedApprovals } from "@beep/practice-gateway/Approvals";
import { CLAUDE_UNINSTALL_KEY, GatewaySetupProbes } from "@beep/practice-gateway/Probes";
import { requirementFromCatalog, requirementsFor } from "@beep/practice-gateway/Requirements";
import { it } from "@beep/test-runner";
import { provideScopedLayer } from "@beep/test-utils";
import * as MemoryFileSystem from "@beep/test-utils/MemoryFileSystem";
import { WindowsSecretStore } from "@beep/windows-secrets";
import * as BunPath from "@effect/platform-bun/BunPath";
import { describe, expect } from "@effect/vitest";
import * as A from "effect/Array";
import * as McpSchema from "effect/ai/McpSchema";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { fakeHost, fullProfile, settingsLayer } from "./fixtures.ts";
import type { GatewayRequirementId } from "@beep/practice-gateway/Requirements";
import type { FakeMachine } from "./fixtures.ts";

const Platform = Layer.mergeAll(MemoryFileSystem.layer, BunPath.layer);

const probesFor = (
  machine: FakeMachine,
  settings: Parameters<typeof settingsLayer>[0] = {},
  secrets: Layer.Layer<WindowsSecretStore> | Layer.Layer<never> = WindowsSecretStore.layerMemory
) =>
  GatewaySetupProbes.pipe(Layer.provide(Layer.mergeAll(fakeHost(machine), settingsLayer(settings), Platform, secrets)));

const probeRequirement = (requirement: SetupRequirement, layer: Layer.Layer<SetupProbes>) =>
  SetupProbes.use((probes) => probes.probe(requirement)).pipe(provideScopedLayer(layer));

const probe = (id: GatewayRequirementId, layer: Layer.Layer<SetupProbes>) =>
  probeRequirement(requirementFromCatalog(id, "documents"), layer);

const layerTimeout = "30 seconds";

const satisfied = ProbeSatisfied.make({});

describe("gateway probes", () => {
  it.effect("finds Claude Desktop by executable or by its uninstall entry", () =>
    Effect.gen(function* () {
      expect(
        yield* probe("claude-desktop-installed", probesFor({ files: ["/local/AnthropicClaude/claude.exe"] }))
      ).toEqual(satisfied);
      expect(
        yield* probe(
          "claude-desktop-installed",
          probesFor({ registry: [[`${CLAUDE_UNINSTALL_KEY}|DisplayVersion`, "0.14.10"]] })
        )
      ).toEqual(satisfied);
      expect(yield* probe("claude-desktop-installed", probesFor({}))).toEqual(
        ProbeMissing.make({ detail: "Claude Desktop is not installed for this Windows account." })
      );
    })
  );

  it.effect("reports a failed registry query as an unavailable probe", () =>
    Effect.gen(function* () {
      const error = yield* probe("claude-desktop-installed", probesFor({ registryFails: true })).pipe(Effect.flip);
      expect(error).toBeInstanceOf(SetupProbeUnavailable);
      expect(error.reason).toBe("reg.exe could not be run.");
    })
  );

  it.effect("counts a calling MCP client as a signed-in Claude session", () =>
    Effect.gen(function* () {
      const layer = probesFor({});
      expect(yield* probe("claude-signed-in", layer)).toEqual(
        ProbeMissing.make({ detail: "No signed-in Claude session is using the practice gateway right now." })
      );
      const inSession = yield* probe("claude-signed-in", layer).pipe(
        Effect.provideService(
          McpSchema.McpRequestContext,
          McpSchema.McpRequestContext.of({ clientId: 1, protocolVersion: "2026-07-28", clientCapabilities: {} })
        )
      );
      expect(inSession).toEqual(satisfied);
    })
  );

  it.effect("probes Box Drive install, process and folder", () =>
    Effect.gen(function* () {
      const ready = probesFor({ files: ["/pf/Box/Box/Box.exe", "/home/lawyer/Box"], processes: ["Box.exe"] });
      expect(yield* probe("box-drive-installed", ready)).toEqual(satisfied);
      expect(yield* probe("box-drive-signed-in", ready)).toEqual(satisfied);
      expect(yield* probe("box-drive-folder-available", ready)).toEqual(satisfied);
      const bare = probesFor({});
      expect(yield* probe("box-drive-installed", bare)).toEqual(
        ProbeMissing.make({ detail: "Box Drive is not installed." })
      );
      expect(yield* probe("box-drive-signed-in", bare)).toEqual(
        ProbeMissing.make({ detail: "Box Drive is not running, so it cannot be signed in." })
      );
    })
  );

  it.effect("checks the Microsoft 365 token cache with the secret store", () =>
    Effect.gen(function* () {
      const cache = "/data/m365/token-cache.dpapi";
      const cached = probesFor({ fileBytes: [[cache, new Uint8Array([1, 2, 3])]] });
      expect(yield* probe("m365-consented", cached)).toEqual(satisfied);
      expect(yield* probe("m365-token-cached", cached)).toEqual(satisfied);
      expect(yield* probe("m365-token-cached", probesFor({}))).toEqual(
        ProbeMissing.make({ detail: "No saved Microsoft 365 sign-in was found." })
      );
      const noStore = yield* probe(
        "m365-token-cached",
        probesFor({ fileBytes: [[cache, new Uint8Array([1])]] }, {}, Layer.empty)
      ).pipe(Effect.flip);
      expect(noStore.reason).toBe("The Windows secret store could not be opened.");
    })
  );

  it.effect("reads BitLocker protection", () =>
    Effect.gen(function* () {
      expect(yield* probe("bitlocker-on", probesFor({ bitLocker: "on" }))).toEqual(satisfied);
      expect(yield* probe("bitlocker-on", probesFor({ bitLocker: "off" }))).toEqual(
        ProbeMissing.make({ detail: "BitLocker is off for drive C:." })
      );
    })
  );

  it.effect("answers 'only on Windows' for Windows facts elsewhere", () =>
    Effect.gen(function* () {
      const linux = probesFor({ isWindows: false, bitLocker: "on" }, { isWindows: false });
      const onlyWindows = ProbeMissing.make({ detail: "This check runs only on Windows." });
      for (const id of [
        "claude-desktop-installed",
        "box-drive-installed",
        "m365-token-cached",
        "bitlocker-on",
      ] as const) {
        expect(yield* probe(id, linux)).toEqual(onlyWindows);
      }
    })
  );

  it.effect("checks the practice knowledge-graph bundle", () =>
    Effect.gen(function* () {
      expect(yield* probe("practice-kg-bundle-present", probesFor({}))).toEqual(
        ProbeMissing.make({ detail: "No knowledge-graph bundle folder is set in the extension settings." })
      );
      const configured = probesFor({ files: ["/bundle/bundle.manifest.json"] }, { bundleDir: "/bundle" });
      expect(yield* probe("practice-kg-bundle-present", configured)).toEqual(satisfied);
      // The real self-check reads the file system, where /bundle does not exist.
      const selfCheck = yield* probe("practice-kg-self-check", configured);
      expect(ProbeResult.guards.broken(selfCheck)).toBe(true);
    })
  );

  it.effect("has no probe for an id outside the catalog", () =>
    Effect.gen(function* () {
      const requirement = requirementFromCatalog("bitlocker-on", "workstation");
      const error = yield* probeRequirement(
        SetupRequirement.make({ ...requirement, id: SetupRequirementId.make("unknown-thing") }),
        probesFor({})
      ).pipe(Effect.flip);
      expect(error.reason).toBe("The practice gateway has no check for this requirement.");
    })
  );
});

const doctorWith = (approvals: Layer.Layer<SetupApprovals>) =>
  SetupDoctor.layer.pipe(Layer.provide(Layer.merge(probesFor({ bitLocker: "on" }), approvals)));

const repairBoxDrive = SetupDoctor.use((doctor) =>
  doctor.repair({
    requirements: requirementsFor(fullProfile),
    requirement: SetupRequirementId.make("box-drive-installed"),
  })
);

const approveAll = Layer.succeed(
  SetupApprovals,
  makeSetupApprovals(() => Effect.succeed("approved"))
);

describe("setup doctor over the gateway probes", () => {
  it.layer(doctorWith(ElicitedApprovals), { timeout: layerTimeout })(
    "with approvals elicited from the client",
    (it) => {
      it.effect("reports the full profile with the lawyer's steps batched", () =>
        Effect.gen(function* () {
          const report = yield* SetupDoctor.use((doctor) => doctor.check(requirementsFor(fullProfile)));
          expect(report.complete).toBe(false);
          expect(A.map(report.checks, (check) => `${check.requirement}:${check.state}`)).toContain(
            "box-drive-signed-in:blocked"
          );
          expect(A.map(report.humanSteps, (step) => step.requirement)).toContain("claude-signed-in");
        })
      );

      it.effect("declines a repair when no MCP client can show the approval prompt", () =>
        Effect.gen(function* () {
          const error = yield* repairBoxDrive.pipe(Effect.flip);
          expect(error).toBeInstanceOf(SetupRepairRefused);
          expect(error._tag === "SetupRepairRefused" && error.refusal).toBe("declined");
        })
      );
    }
  );

  it.layer(doctorWith(approveAll), { timeout: layerTimeout })("with every repair approved", (it) => {
    it.effect("fails the approved Box Drive install with a plain reason", () =>
      Effect.gen(function* () {
        const error = yield* repairBoxDrive.pipe(Effect.flip);
        expect(error).toBeInstanceOf(SetupRepairFailed);
        expect(error._tag === "SetupRepairFailed" && error.reason).toContain("box.com/drive");
      })
    );
  });
});
