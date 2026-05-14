import { AiProviderCli, AiProviderCliProcessResult, type AiProviderCliProvider } from "@beep/ai-provider-cli";
import { Discord, DiscordConfigInput } from "@beep/discord";
import { InstallerChannelsServerLive } from "@beep/installer-channels-server";
import { HostDependencyPlan, HostDependencyValidationResult } from "@beep/installer-dependencies-use-cases";
import { InstallerDependenciesUseCases } from "@beep/installer-dependencies-use-cases/server";
import { InstallerProvidersServerLive } from "@beep/installer-providers-server";
import { InstallerSecurityServerLive } from "@beep/installer-security-server";
import { P1ManualProofRequest, P1ManualProofResult } from "@beep/installer-workspace-use-cases";
import { OnePasswordCli, OnePasswordCliProcessResult } from "@beep/onepassword-cli";
import { OnePasswordReference } from "@beep/shared-domain/values/OnePasswordReference";
import { describe, expect, layer } from "@effect/vitest";
import { Effect, Layer } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import { runP1ManualProof } from "../src/proof/P1ManualProof.js";
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
  Discord.makeLayer(new DiscordConfigInput({ baseUrl: "https://discord.example.test/api/v10" })).pipe(
    Layer.provide(TestHttpClientLayer)
  )
);

const TestDependenciesLayer = Layer.succeed(
  InstallerDependenciesUseCases,
  InstallerDependenciesUseCases.of({
    previewHostDependencies: Effect.fn("TestDependencies.previewHostDependencies")(function* () {
      return yield* Effect.succeed(new HostDependencyPlan({ dependencies: [], notes: ["test"], verbs: [] }));
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

const TestLayer = TestSliceLayer.pipe(Layer.provideMerge(DriverLayer));

describe("P1 Manual Mode proof harness", () => {
  layer(TestLayer)((it) => {
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
      })
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
          '{"targetPlatform":"macos"}',
          "/repo/output/stack-installer/p1-live/macos"
        );

        expect(commands).toContain("command -v op");
        expect(commands).toContain("(cd apps/stack-installer && bun run p1:proof:capture");
        expect(commands).toContain("--output-dir '/repo/output/stack-installer/p1-live/macos'");
        expect(commands).not.toContain("Get-Command op");
        expect(p1ProofCommandsTextMatchesPlatform("macos", commands)).toBe(true);
        expect(p1ProofCommandsTextMatchesPlatform("windows", commands)).toBe(false);
      })
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
          '{"targetPlatform":"windows"}',
          "C:\\repo\\output\\stack-installer\\p1-live\\windows"
        );

        expect(commands).toContain("Get-Command op");
        expect(commands).toContain("Push-Location apps/stack-installer");
        expect(commands).toContain("$stackInstallerOutputDir = 'C:\\repo\\output\\stack-installer\\p1-live\\windows'");
        expect(commands).toContain('--output-dir "$stackInstallerOutputDir"');
        expect(commands).not.toContain("command -v op");
        expect(commands).not.toContain("(cd apps/stack-installer");
        expect(p1ProofCommandsTextMatchesPlatform("windows", commands)).toBe(true);
        expect(p1ProofCommandsTextMatchesPlatform("macos", commands)).toBe(false);
      })
    );
  });
});
