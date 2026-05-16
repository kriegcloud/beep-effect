import { AiProviderCli, AiProviderCliProcessResult, type AiProviderCliProvider } from "@beep/ai-provider-cli";
import { BunCli, BunCliProcessResult } from "@beep/bun-cli";
import { Discord, DiscordConfigInput } from "@beep/discord";
import { InstallerChannelsServerLive } from "@beep/installer-channels-server";
import {
  BunRuntimeHealthResult,
  BunRuntimeRepairResult,
  HostDependencyPlan,
  HostDependencyValidationResult,
} from "@beep/installer-dependencies-use-cases";
import { InstallerDependenciesUseCases } from "@beep/installer-dependencies-use-cases/server";
import { InstallerProvidersServerLive } from "@beep/installer-providers-server";
import { InstallerSecurityServerLive } from "@beep/installer-security-server";
import { P1ManualProofRequest, P1ManualProofResult } from "@beep/installer-workspace-use-cases";
import { OnePasswordCli, OnePasswordCliProcessResult } from "@beep/onepassword-cli";
import { OnePasswordReference } from "@beep/shared-domain/values/OnePasswordReference";
import { BunChildProcessSpawner } from "@effect/platform-bun";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import { previewP1ManualProof, runP1ManualProof } from "../src/proof/P1ManualProof.js";
import {
  isP1ProofArtifactStatusFileName,
  isP1ProofEvidenceFileName,
  p1ProofBundleExtractionCommand,
  p1ProofBundleExtractionProcess,
  p1ProofBundleFileNameForPlatform,
  p1ProofMissingRequiredArtifactFiles,
} from "../src/proof/P1ProofArtifacts.js";
import { buildP1ProofCommandsText, p1ProofCommandsTextMatchesPlatform } from "../src/proof/P1ProofCommands.js";

const encodeProofResult = S.encodeUnknownEffect(S.fromJsonString(P1ManualProofResult));
const decodeOnePasswordReference = S.decodeUnknownEffect(OnePasswordReference);

const onePasswordRunner = () =>
  Effect.succeed(
    new OnePasswordCliProcessResult({
      exitCode: 0,
      stderr: "",
      stdout: "raw-secret-value",
    })
  );

const providerRunner = (provider: AiProviderCliProvider) =>
  Effect.succeed(
    new AiProviderCliProcessResult({
      exitCode: 0,
      stderr: "",
      stdout: `${provider}-raw-provider-status-output`,
    })
  );

const bunRunner = () =>
  Effect.succeed(
    new BunCliProcessResult({
      exitCode: 0,
      stderr: "",
      stdout: "1.3.14\n",
    })
  );

const TestHttpClientLayer = Layer.succeed(
  HttpClient.HttpClient,
  HttpClient.make((request) =>
    Effect.succeed(
      HttpClientResponse.fromWeb(
        request,
        request.method === "GET"
          ? Response.json({ guild_id: "guild-1", id: "channel-1", name: "proof-channel" })
          : Response.json({ channel_id: "channel-1", id: "message-1", timestamp: "2026-05-14T15:00:00.000Z" })
      )
    )
  )
);

const DriverLayer = Layer.mergeAll(
  OnePasswordCli.makeLayerFromRunner(onePasswordRunner),
  AiProviderCli.makeLayerFromRunner(providerRunner),
  BunCli.makeLayerFromRunner(bunRunner),
  Discord.makeLayer(new DiscordConfigInput({ baseUrl: "https://discord.example.test/api/v10" })).pipe(
    Layer.provide(TestHttpClientLayer)
  )
);

const TestDependenciesLayer = Layer.succeed(
  InstallerDependenciesUseCases,
  InstallerDependenciesUseCases.of({
    inspectBunRuntime: Effect.fn("TestDependencies.inspectBunRuntime")(function* () {
      return yield* Effect.succeed(
        new BunRuntimeHealthResult({
          dependency: {
            detectedVersion: O.some("1.0.0"),
            id: "bun",
            installHint: "Run repair.",
            kind: "runtime",
            name: "Bun",
            requiredVersion: O.some("1.0.0"),
            status: "present",
          },
          state: "healthy",
          summary: "Bun satisfies the requested version.",
        })
      );
    }),
    previewHostDependencies: Effect.fn("TestDependencies.previewHostDependencies")(function* () {
      return yield* Effect.succeed(new HostDependencyPlan({ dependencies: [], notes: ["test"], verbs: [] }));
    }),
    repairBunRuntime: Effect.fn("TestDependencies.repairBunRuntime")(function* () {
      return yield* Effect.succeed(
        new BunRuntimeRepairResult({
          after: new BunRuntimeHealthResult({
            dependency: {
              detectedVersion: O.some("1.0.0"),
              id: "bun",
              installHint: "Run repair.",
              kind: "runtime",
              name: "Bun",
              requiredVersion: O.some("1.0.0"),
              status: "present",
            },
            state: "healthy",
            summary: "Bun satisfies the requested version.",
          }),
          before: new BunRuntimeHealthResult({
            dependency: {
              detectedVersion: O.some("0.9.0"),
              id: "bun",
              installHint: "Run repair.",
              kind: "runtime",
              name: "Bun",
              requiredVersion: O.some("1.0.0"),
              status: "present",
            },
            state: "repair-required",
            summary: "Bun requires repair.",
          }),
          changed: true,
          command: "bun upgrade",
          summary: "Bun repaired.",
        })
      );
    }),
    validateRequiredCommands: Effect.fn("TestDependencies.validateRequiredCommands")(function* () {
      return yield* Effect.succeed([
        new HostDependencyValidationResult({
          dependency: {
            detectedVersion: O.some("1.0.0"),
            id: "bun",
            installHint: "Install Bun.",
            kind: "cli-tool",
            name: "bun",
            requiredVersion: O.none(),
            status: "present",
          },
          message: "bun command is available.",
        }),
      ]);
    }),
  })
);

const TestSliceLayer = Layer.mergeAll(
  TestDependenciesLayer,
  InstallerSecurityServerLive,
  InstallerProvidersServerLive,
  InstallerChannelsServerLive
);

const TestLayer = TestSliceLayer.pipe(
  Layer.provideMerge(DriverLayer),
  Layer.provideMerge(BunChildProcessSpawner.layer),
  Layer.provideMerge(BunFileSystem.layer),
  Layer.provideMerge(BunPath.layer)
);

describe("P1 Manual Mode proof harness", () => {
  it.effect("returns a sanitized live proof snapshot without exposing raw secret or provider CLI output", () =>
    Effect.gen(function* () {
      const discordBotTokenReference = yield* decodeOnePasswordReference("op://Private/Discord Bot/token");
      const result = yield* runP1ManualProof(
        new P1ManualProofRequest({
          discordBotTokenReference,
          discordChannelDisplayName: "proof-channel",
          discordChannelId: "channel-1",
          discordGuildId: "guild-1",
          operatorLabel: "test",
          targetPlatform: "macos",
          testMessageContent: "Stack Installer P1 proof",
        })
      );
      const encoded = yield* encodeProofResult(result);

      expect(result.snapshot.manifest.dryRunOnly).toBe(false);
      expect(A.every(result.snapshot.validationEvents, (event) => event.status === "passed")).toBe(true);
      expect(encoded).not.toContain("raw-secret-value");
      expect(encoded).not.toContain("claude-raw-provider-status-output");
      expect(encoded).not.toContain("codex-raw-provider-status-output");
      expect(encoded).toContain("message-1");
    }).pipe(Effect.provide(TestLayer))
  );

  it.effect("keeps the app-local preview dry-run and avoids recording a Discord message id", () =>
    Effect.gen(function* () {
      const discordBotTokenReference = yield* decodeOnePasswordReference("op://Private/Discord Bot/token");
      const result = yield* previewP1ManualProof(
        new P1ManualProofRequest({
          discordBotTokenReference,
          discordChannelDisplayName: "proof-channel",
          discordChannelId: "channel-1",
          discordGuildId: "guild-1",
          operatorLabel: "test",
          targetPlatform: "macos",
          testMessageContent: "Stack Installer P1 proof",
        })
      );
      const encoded = yield* encodeProofResult(result);

      expect(result.snapshot.manifest.dryRunOnly).toBe(true);
      expect(
        A.some(
          result.snapshot.validationEvents,
          (event) => event.id === "discord-route-preview" && event.status === "passed"
        )
      ).toBe(true);
      expect(A.some(result.snapshot.validationEvents, (event) => event.id === "discord-test-message")).toBe(false);
      expect(encoded).not.toContain("message-1");
      expect(encoded).not.toContain("raw-secret-value");
    }).pipe(Effect.provide(TestLayer))
  );

  it.effect("records Bash commands for macOS proof artifacts", () =>
    Effect.gen(function* () {
      const discordBotTokenReference = yield* decodeOnePasswordReference("op://Private/Discord Bot/token");
      const commands = buildP1ProofCommandsText(
        new P1ManualProofRequest({
          discordBotTokenReference,
          discordChannelDisplayName: "proof-channel",
          discordChannelId: "channel-1",
          discordGuildId: "guild-1",
          operatorLabel: "operator-macos-001",
          targetPlatform: "macos",
          testMessageContent: "Stack Installer P1 macOS proof",
        }),
        {
          outputDir: "/repo/output/stack-installer/p1-live/macos",
          requestJson: '{"targetPlatform":"macos"}',
        }
      );

      expect(commands).toContain("command -v op");
      expect(commands).toContain("(cd apps/stack-installer && bun run p1:proof:capture");
      expect(commands).toContain("--output-dir '/repo/output/stack-installer/p1-live/macos'");
      expect(commands).not.toContain("Get-Command op");
      expect(p1ProofCommandsTextMatchesPlatform(commands, "macos")).toBe(true);
      expect(p1ProofCommandsTextMatchesPlatform(commands, "windows")).toBe(false);
    }).pipe(Effect.provide(TestLayer))
  );

  it.effect("records PowerShell commands for Windows proof artifacts", () =>
    Effect.gen(function* () {
      const discordBotTokenReference = yield* decodeOnePasswordReference("op://Private/Discord Bot/token");
      const commands = buildP1ProofCommandsText(
        new P1ManualProofRequest({
          discordBotTokenReference,
          discordChannelDisplayName: "proof-channel",
          discordChannelId: "channel-1",
          discordGuildId: "guild-1",
          operatorLabel: "operator-windows-001",
          targetPlatform: "windows",
          testMessageContent: "Stack Installer P1 Windows proof",
        }),
        {
          outputDir: "C:\\repo\\output\\stack-installer\\p1-live\\windows",
          requestJson: '{"targetPlatform":"windows"}',
        }
      );

      expect(commands).toContain("Get-Command op");
      expect(commands).toContain("Push-Location apps/stack-installer");
      expect(commands).toContain("$stackInstallerOutputDir = 'C:\\repo\\output\\stack-installer\\p1-live\\windows'");
      expect(commands).toContain('--output-dir "$stackInstallerOutputDir"');
      expect(commands).not.toContain("command -v op");
      expect(commands).not.toContain("(cd apps/stack-installer");
      expect(p1ProofCommandsTextMatchesPlatform(commands, "windows")).toBe(true);
      expect(p1ProofCommandsTextMatchesPlatform(commands, "macos")).toBe(false);
    }).pipe(Effect.provide(TestLayer))
  );
});

describe("P1 proof artifact helpers", () => {
  it("classifies evidence and status artifact file names", () => {
    expect(isP1ProofEvidenceFileName("proof.json")).toBe(true);
    expect(isP1ProofEvidenceFileName("commands.txt")).toBe(true);
    expect(isP1ProofEvidenceFileName("screencast.webm")).toBe(true);
    expect(isP1ProofEvidenceFileName("sha256sums.txt")).toBe(false);
    expect(isP1ProofArtifactStatusFileName("sha256sums.txt")).toBe(true);
    expect(isP1ProofArtifactStatusFileName("notes.txt")).toBe(false);
  });

  it("names returned platform bundles and extraction commands", () => {
    expect(p1ProofBundleFileNameForPlatform("macos")).toBe("stack-installer-p1-macos.tgz");
    expect(p1ProofBundleFileNameForPlatform("windows")).toBe("stack-installer-p1-windows.zip");
    expect(
      p1ProofBundleExtractionCommand("macos", {
        bundlePath: "/proof root/stack-installer-p1-macos.tgz",
        outputRoot: "/proof root",
      })
    ).toBe("tar -xzf '/proof root/stack-installer-p1-macos.tgz' -C '/proof root'");
    expect(
      p1ProofBundleExtractionCommand("windows", {
        bundlePath: "/proof root/stack-installer-p1-windows.zip",
        outputRoot: "/proof root",
      })
    ).toBe("unzip -o '/proof root/stack-installer-p1-windows.zip' -d '/proof root'");
    expect(
      p1ProofBundleExtractionProcess("macos", {
        bundlePath: "/proof root/stack-installer-p1-macos.tgz",
        outputRoot: "/proof root",
      })
    ).toEqual({
      args: ["-xzf", "/proof root/stack-installer-p1-macos.tgz", "-C", "/proof root"],
      command: "tar",
    });
    expect(
      p1ProofBundleExtractionProcess("windows", {
        bundlePath: "/proof root/stack-installer-p1-windows.zip",
        outputRoot: "/proof root",
      })
    ).toEqual({
      args: ["-o", "/proof root/stack-installer-p1-windows.zip", "-d", "/proof root"],
      command: "unzip",
    });
  });

  it("reports the missing required artifact files for a platform directory", () => {
    expect(p1ProofMissingRequiredArtifactFiles([])).toEqual([
      "proof.json",
      "commands.txt",
      "sha256sums.txt",
      "screencast.*",
    ]);
    expect(p1ProofMissingRequiredArtifactFiles(["commands.txt", "proof.json", "screencast.mp4"])).toEqual([
      "sha256sums.txt",
    ]);
    expect(
      p1ProofMissingRequiredArtifactFiles(["commands.txt", "proof.json", "screencast.mp4", "sha256sums.txt"])
    ).toEqual([]);
  });
});
