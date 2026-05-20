/**
 * Installer server layer.
 *
 * @packageDocumentation
 * @category layers
 * @since 0.0.0
 */

import { AiProviderCli, type AiProviderCliProvider } from "@beep/ai-provider-cli";
import { Discord, DiscordChannelRequest, DiscordCreateMessageRequest } from "@beep/discord";
import { DiscordChannel } from "@beep/installer-domain/aggregates/DiscordChannel";
import {
  AIStackManifest,
  ManifestCapability,
  ManifestDiscordChannel,
  ManifestProvider,
  P1LiveProofSnapshot,
  ValidationEvent,
} from "@beep/installer-domain/aggregates/StackManifest";
import {
  DiscordChannelPlan,
  DiscordLiveValidationRequest,
  DiscordLiveValidationResult,
  HostDependencyPlan,
  HostDependencyValidationResult,
  P1A_DISCORD_CHANNEL_VERB_INPUTS,
  P1A_DRY_RUN_SNAPSHOT_INPUT,
  P1A_HOST_DEPENDENCY_VERB_INPUTS,
  P1A_PROVIDER_ACCOUNT_VERB_INPUTS,
  P1A_SECRET_REFERENCE_VERB_INPUTS,
  P1A_WORKSPACE_VERB_INPUTS,
  P1ManualProofRequest,
  P1ManualProofResult,
  ProviderAccountPlan,
  ProviderAuthValidationResult,
  SecretReferencePlan,
  SecretReferenceReadError,
  SecretReferenceValidationRequest,
  SecretReferenceValidationResult,
  WorkspaceDryRunPlan,
} from "@beep/installer-use-cases/public";
import {
  DiscordChannelUseCases,
  HostDependencyUseCases,
  P1ManualProofWorkflow,
  ProviderAccountUseCases,
  SecretReferenceUseCases,
  StackManifestUseCases,
} from "@beep/installer-use-cases/server";
import { OnePasswordCli } from "@beep/onepassword-cli";
import type { OnePasswordReference } from "@beep/shared-domain/values/OnePasswordReference";
import { Effect, Layer, pipe, type Redacted, Stream } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process";

const decodeHostDependencyPlan = S.decodeUnknownEffect(HostDependencyPlan);
const decodeSecretReferencePlan = S.decodeUnknownEffect(SecretReferencePlan);
const decodeSecretReferenceValidationRequest = S.decodeUnknownEffect(SecretReferenceValidationRequest);
const decodeProviderAccountPlan = S.decodeUnknownEffect(ProviderAccountPlan);
const decodeDiscordChannelPlan = S.decodeUnknownEffect(DiscordChannelPlan);
const decodeDiscordLiveValidationRequest = S.decodeUnknownEffect(DiscordLiveValidationRequest);
const decodeWorkspaceDryRunPlan = S.decodeUnknownEffect(WorkspaceDryRunPlan);
const decodeP1ManualProofRequest = S.decodeUnknownEffect(P1ManualProofRequest);

const p1aHostDependencyPlanInput = {
  dependencies: [
    {
      detectedVersion: "1.2.8",
      id: "git",
      installHint: "Use the platform package manager if Git is absent.",
      kind: "cli-tool",
      name: "Git",
      requiredVersion: ">=2.40",
      status: "present",
    },
    {
      id: "one-password-cli",
      installHint: "Install 1Password CLI and sign in before live credential validation.",
      kind: "cli-tool",
      name: "1Password CLI",
      requiredVersion: ">=2.20",
      status: "unknown",
    },
    {
      id: "discord-desktop",
      installHint: "Discord desktop is optional for the dry-run, but v1 validates Discord routing.",
      kind: "desktop-app",
      name: "Discord",
      status: "unknown",
    },
  ],
  notes: ["P1A records dependency intent only; no package manager commands are executed."],
  verbs: P1A_HOST_DEPENDENCY_VERB_INPUTS,
} as const;

const p1aSecretReferencePlanInput = {
  notes: ["P1A never resolves 1Password references and never stores plaintext secret values."],
  references: [
    {
      id: "discord-bot-token",
      notes: ["Used only by the Discord channel validator in later P1 work."],
      purpose: "discord-bot-token",
      reference: "op://Private/Discord Bot/token",
      status: "reference-valid",
      usedBy: "installer:discord-channel",
    },
    {
      id: "claude-auth",
      notes: ["Provider auth stays reference-shaped until live provider validation is approved."],
      purpose: "claude-auth",
      reference: "op://Private/Claude/token",
      status: "reference-unchecked",
      usedBy: "installer:provider-account",
    },
    {
      id: "codex-auth",
      notes: ["Provider auth stays reference-shaped until live provider validation is approved."],
      purpose: "codex-auth",
      reference: "op://Private/Codex/token",
      status: "reference-unchecked",
      usedBy: "installer:provider-account",
    },
  ],
  verbs: P1A_SECRET_REFERENCE_VERB_INPUTS,
} as const;

const p1aProviderAccountPlanInput = {
  accounts: [
    {
      authMode: "one-password-reference",
      credentialReference: "op://Private/Claude/token",
      displayName: "Claude",
      id: "claude",
      provider: "claude",
      status: "unchecked",
      workspaceHint: "Claude credentials are validated only after manual approval.",
    },
    {
      authMode: "one-password-reference",
      credentialReference: "op://Private/Codex/token",
      displayName: "Codex",
      id: "codex",
      provider: "codex",
      status: "unchecked",
      workspaceHint: "Codex credentials are validated only after manual approval.",
    },
  ],
  notes: ["P1A does not launch provider CLIs, exchange tokens, or call provider APIs."],
  verbs: P1A_PROVIDER_ACCOUNT_VERB_INPUTS,
} as const;

const p1aDiscordChannelPlanInput = {
  channels: [
    {
      botTokenReference: "op://Private/Discord Bot/token",
      channelId: "012345678901234567",
      displayName: "ai-stack-installer",
      guildId: "987654321098765432",
      id: "discord-ai-stack-installer",
      kind: "guild-text-channel",
      status: "unchecked",
    },
  ],
  notes: ["Discord is the only v1 channel; P1A does not send messages or update guild configuration."],
  verbs: P1A_DISCORD_CHANNEL_VERB_INPUTS,
} as const;

const p1aWorkspaceDryRunPlanInput = {
  notes: ["Workspace composition emits deterministic snapshots only; no OS files are written in P1A."],
  snapshot: P1A_DRY_RUN_SNAPSHOT_INPUT,
  verbs: P1A_WORKSPACE_VERB_INPUTS,
} as const;

type CommandProbe = {
  readonly args: ReadonlyArray<string>;
  readonly id: string;
  readonly installHint: string;
  readonly name: string;
};

const p1CommandProbes = [
  { args: ["--version"], id: "op-cli", installHint: "Install and sign in to the 1Password CLI.", name: "op" },
  {
    args: ["--version"],
    id: "claude-cli",
    installHint: "Install Claude Code and authenticate locally.",
    name: "claude",
  },
  { args: ["--version"], id: "codex-cli", installHint: "Install Codex CLI and authenticate locally.", name: "codex" },
  {
    args: ["--version"],
    id: "bun",
    installHint: "Install Bun before running the Stack Installer proof harness.",
    name: "bun",
  },
] as const satisfies ReadonlyArray<CommandProbe>;

const p1ProviderAuthProviders = ["claude", "codex"] as const satisfies ReadonlyArray<AiProviderCliProvider>;

const collectText = <E>(stream: Stream.Stream<Uint8Array, E>): Effect.Effect<string, E> =>
  stream.pipe(
    Stream.decodeText(),
    Stream.runFold(
      () => "",
      (acc, chunk) => `${acc}${chunk}`
    )
  );

const probeCommand = (
  spawner: ChildProcessSpawner.ChildProcessSpawner["Service"],
  probe: CommandProbe
): Effect.Effect<HostDependencyValidationResult> =>
  Effect.scoped(
    Effect.gen(function* () {
      const command = ChildProcess.make(probe.name, A.fromIterable(probe.args), {
        stdin: "ignore",
        stderr: "pipe",
        stdout: "pipe",
      });
      const handle = yield* spawner.spawn(command);
      const [stdout, stderr, exitCode] = yield* Effect.all(
        [collectText(handle.stdout), collectText(handle.stderr), handle.exitCode],
        { concurrency: "unbounded" }
      );
      const output = Str.trim(`${stdout}${stderr}`);
      const present = exitCode === 0;

      return new HostDependencyValidationResult({
        dependency: {
          detectedVersion: present && Str.isNonEmpty(output) ? O.some(output) : O.none(),
          id: probe.id,
          installHint: probe.installHint,
          kind: "cli-tool",
          name: probe.name,
          requiredVersion: O.none(),
          status: present ? "present" : "missing",
        },
        message: present ? `${probe.name} command is available.` : `${probe.name} command is missing or unavailable.`,
      });
    })
  ).pipe(
    Effect.catch(() =>
      Effect.succeed(
        new HostDependencyValidationResult({
          dependency: {
            detectedVersion: O.none(),
            id: probe.id,
            installHint: probe.installHint,
            kind: "cli-tool",
            name: probe.name,
            requiredVersion: O.none(),
            status: "missing",
          },
          message: `${probe.name} command is missing or unavailable.`,
        })
      )
    )
  );

const proofCapabilities = (discordSummary: string) =>
  [
    new ManifestCapability({
      id: "provider-claude",
      label: "Claude Provider",
      summary: "Claude local-session status was validated in Manual Mode.",
    }),
    new ManifestCapability({
      id: "provider-codex",
      label: "Codex Provider",
      summary: "Codex local-session status was validated in Manual Mode.",
    }),
    new ManifestCapability({
      id: "channel-discord",
      label: "Discord Channel",
      summary: discordSummary,
    }),
  ] as const;

const validationEvent = (
  id: string,
  tier: "existence" | "version" | "config" | "liveness" | "user-confirmation",
  status: "passed" | "failed" | "indeterminate",
  subject: string,
  message: string
) =>
  new ValidationEvent({
    id,
    message,
    status,
    subject,
    tier,
  });

const manifestForRequest = (
  request: P1ManualProofRequest,
  providers: ReadonlyArray<ManifestProvider>,
  options: {
    readonly discordSummary: string;
    readonly dryRunOnly: boolean;
  }
) =>
  new AIStackManifest({
    capabilities: proofCapabilities(options.discordSummary),
    credentialReferences: [request.discordBotTokenReference],
    discordChannel: new ManifestDiscordChannel({
      channelId: request.discordChannelId,
      displayName: request.discordChannelDisplayName,
      guildId: request.discordGuildId,
    }),
    dryRunOnly: options.dryRunOnly,
    manifestId: `stack-installer-p1-live-${request.targetPlatform}`,
    providers,
    targetPlatform: request.targetPlatform,
    version: "p1.live.0",
  });

/**
 * Build the host-dependency concept server.
 *
 * @category layers
 * @since 0.0.0
 */
export const makeHostDependencyServer = Effect.fn("InstallerServer.makeHostDependency")(function* () {
  const plan = yield* decodeHostDependencyPlan(p1aHostDependencyPlanInput);
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;

  return {
    previewHostDependencies: () => Effect.succeed(plan),
    validateRequiredCommands: () =>
      Effect.forEach(p1CommandProbes, (probe) => probeCommand(spawner, probe), { concurrency: 4 }),
  };
});

/**
 * Build the secret-reference concept server.
 *
 * @category layers
 * @since 0.0.0
 */
export const makeSecretReferenceServer = Effect.fn("InstallerServer.makeSecretReference")(function* () {
  const plan = yield* decodeSecretReferencePlan(p1aSecretReferencePlanInput);
  const onePassword = yield* OnePasswordCli;

  return {
    previewSecretReferences: () => Effect.succeed(plan),
    readSecretReference: Effect.fn("InstallerServer.readSecretReference")(function* (reference: OnePasswordReference) {
      return yield* onePassword.read(reference).pipe(
        Effect.mapError(
          () =>
            new SecretReferenceReadError({
              message: "Unable to resolve approved 1Password reference.",
              reference,
            })
        )
      );
    }),
    validateSecretReference: Effect.fn("InstallerServer.validateSecretReference")(function* (
      rawRequest: SecretReferenceValidationRequest
    ) {
      const request = yield* decodeSecretReferenceValidationRequest(rawRequest);

      return yield* onePassword.probeReference(request.reference).pipe(
        Effect.match({
          onFailure: () =>
            new SecretReferenceValidationResult({
              message: "1Password reference could not be resolved.",
              purpose: request.purpose,
              reference: request.reference,
              status: "reference-missing",
              usedBy: request.usedBy,
            }),
          onSuccess: (probe) =>
            new SecretReferenceValidationResult({
              message: "1Password reference resolved without exposing its value.",
              purpose: request.purpose,
              reference: request.reference,
              status: "reference-valid",
              usedBy: request.usedBy,
              ...R.getSomes({
                byteLength: S.decodeUnknownOption(S.Number)(probe.byteLength),
              }),
            }),
        })
      );
    }),
  };
});

/**
 * Build the provider-account concept server.
 *
 * @category layers
 * @since 0.0.0
 */
export const makeProviderAccountServer = Effect.fn("InstallerServer.makeProviderAccount")(function* () {
  const plan = yield* decodeProviderAccountPlan(p1aProviderAccountPlanInput);
  const providerCli = yield* AiProviderCli;

  const validateProvider = Effect.fn("InstallerServer.validateProvider")(function* (provider: AiProviderCliProvider) {
    return yield* providerCli.checkAuth(provider).pipe(
      Effect.match({
        onFailure: () =>
          new ProviderAuthValidationResult({
            authMode: "existing-local-session",
            command: provider,
            message: "Provider CLI status command could not run.",
            provider,
            status: "missing",
          }),
        onSuccess: (probe) =>
          new ProviderAuthValidationResult({
            authMode: "existing-local-session",
            command: probe.command,
            message:
              probe.status === "authenticated"
                ? "Provider CLI reports an authenticated local session."
                : "Provider CLI does not report an authenticated local session.",
            provider,
            status: probe.status === "authenticated" ? "configured" : "missing",
          }),
      })
    );
  });

  return {
    previewProviderAccounts: () => Effect.succeed(plan),
    validateProviderAuths: () => Effect.forEach(p1ProviderAuthProviders, validateProvider, { concurrency: 2 }),
  };
});

/**
 * Build the Discord-channel concept server.
 *
 * @category layers
 * @since 0.0.0
 */
export const makeDiscordChannelServer = Effect.fn("InstallerServer.makeDiscordChannel")(function* () {
  const plan = yield* decodeDiscordChannelPlan(p1aDiscordChannelPlanInput);
  const discord = yield* Discord;

  return {
    previewDiscordChannels: () => Effect.succeed(plan),
    validateDiscordChannel: Effect.fn("InstallerServer.validateDiscordChannel")(function* (
      rawRequest: DiscordLiveValidationRequest,
      botToken: Redacted.Redacted<string>
    ) {
      const request = yield* decodeDiscordLiveValidationRequest(rawRequest);

      return yield* Effect.gen(function* () {
        yield* discord.getChannel(new DiscordChannelRequest({ channelId: request.channel.channelId }), botToken);
        const message = yield* discord.createMessage(
          new DiscordCreateMessageRequest({
            channelId: request.channel.channelId,
            content: request.testMessageContent,
          }),
          botToken
        );

        return new DiscordLiveValidationResult({
          channel: {
            ...request.channel,
            status: "configured",
          },
          message: "Discord channel is live and accepted the P1 test message.",
          status: "configured",
          ...R.getSomes({
            messageId: S.decodeUnknownOption(S.String)(message.messageId),
          }),
        });
      }).pipe(
        Effect.match({
          onFailure: () =>
            new DiscordLiveValidationResult({
              channel: {
                ...request.channel,
                status: "missing",
              },
              message: "Discord channel liveness or test-message proof failed.",
              status: "missing",
            }),
          onSuccess: (result) => result,
        })
      );
    }),
  };
});

/**
 * Build the stack-manifest concept server.
 *
 * @category layers
 * @since 0.0.0
 */
export const makeStackManifestServer = Effect.fn("InstallerServer.makeStackManifest")(function* () {
  const plan = yield* decodeWorkspaceDryRunPlan(p1aWorkspaceDryRunPlanInput);

  return {
    previewWorkspace: () => Effect.succeed(plan),
  };
});

/**
 * Build the P1 Manual Mode proof workflow.
 *
 * @category workflows
 * @since 0.0.0
 */
export const makeP1ManualProofWorkflow = Effect.fn("InstallerServer.makeP1ManualProofWorkflow")(function* () {
  const hostDependencies = yield* HostDependencyUseCases;
  const secretReferences = yield* SecretReferenceUseCases;
  const providerAccounts = yield* ProviderAccountUseCases;
  const discordChannels = yield* DiscordChannelUseCases;

  const validateSharedInputs = Effect.fn("InstallerServer.validateSharedP1Inputs")(function* (
    rawRequest: P1ManualProofRequest
  ) {
    const request = yield* decodeP1ManualProofRequest(rawRequest);
    const dependencyValidations = yield* hostDependencies.validateRequiredCommands();
    const secretValidation = yield* secretReferences.validateSecretReference(
      new SecretReferenceValidationRequest({
        id: "discord-bot-token",
        purpose: "discord-bot-token",
        reference: request.discordBotTokenReference,
        usedBy: "installer:discord-channel",
      })
    );
    const providerValidations = yield* providerAccounts.validateProviderAuths();

    return { dependencyValidations, providerValidations, request, secretValidation };
  });

  const providersForManifest = (providerValidations: ReadonlyArray<ProviderAuthValidationResult>) =>
    A.map(
      providerValidations,
      (provider) =>
        new ManifestProvider({
          authMode: provider.authMode,
          provider: provider.provider,
          status: provider.status,
        })
    );

  const providerEvents = (providerValidations: ReadonlyArray<ProviderAuthValidationResult>) =>
    A.map(providerValidations, (provider) =>
      validationEvent(
        `provider-${provider.provider}-auth`,
        "liveness",
        provider.status === "configured" ? "passed" : "failed",
        `installer:provider:${provider.provider}`,
        provider.message
      )
    );

  const dependencyEvents = (dependencyValidations: ReadonlyArray<HostDependencyValidationResult>) =>
    A.map(dependencyValidations, (dependency) =>
      validationEvent(
        `dependency-${dependency.dependency.id}`,
        "existence",
        dependency.dependency.status === "present" ? "passed" : "failed",
        `installer:host-dependency:${dependency.dependency.name}`,
        dependency.message
      )
    );

  return {
    preview: Effect.fn("InstallerServer.previewP1ManualProof")(function* (rawRequest: P1ManualProofRequest) {
      const { dependencyValidations, providerValidations, request, secretValidation } =
        yield* validateSharedInputs(rawRequest);
      const channelPreview = yield* discordChannels.previewDiscordChannels();
      const previewNotes = pipe(channelPreview.notes, A.join(" "));
      const manifest = manifestForRequest(request, providersForManifest(providerValidations), {
        discordSummary: Str.isNonEmpty(previewNotes)
          ? previewNotes
          : "Discord routing was previewed without sending a live test message from the app.",
        dryRunOnly: true,
      });

      return new P1ManualProofResult({
        snapshot: new P1LiveProofSnapshot({
          generatedBy: `@beep/stack-installer:${request.operatorLabel}`,
          manifest,
          validationEvents: [
            ...dependencyEvents(dependencyValidations),
            validationEvent(
              "onepassword-discord-token-reference",
              "config",
              secretValidation.status === "reference-valid" ? "passed" : "failed",
              "installer:secret-reference:discord-bot-token",
              secretValidation.message
            ),
            ...providerEvents(providerValidations),
            validationEvent(
              "discord-route-preview",
              "config",
              "passed",
              "installer:channel:discord",
              Str.isNonEmpty(previewNotes)
                ? previewNotes
                : "Discord routing was previewed without sending a live test message from the app."
            ),
          ],
        }),
      });
    }),
    run: Effect.fn("InstallerServer.runP1ManualProof")(function* (rawRequest: P1ManualProofRequest) {
      const { dependencyValidations, providerValidations, request, secretValidation } =
        yield* validateSharedInputs(rawRequest);
      const botToken = yield* secretReferences.readSecretReference(request.discordBotTokenReference);
      const channel = new DiscordChannel({
        botTokenReference: request.discordBotTokenReference,
        channelId: request.discordChannelId,
        displayName: request.discordChannelDisplayName,
        guildId: request.discordGuildId,
        id: "discord-ai-stack-installer",
        kind: "guild-text-channel",
        status: "unchecked",
      });
      const discordValidation = yield* discordChannels.validateDiscordChannel(
        new DiscordLiveValidationRequest({
          channel,
          testMessageContent: request.testMessageContent,
        }),
        botToken
      );
      const discordMessage = pipe(
        O.fromUndefinedOr(discordValidation.messageId),
        O.match({
          onNone: () => discordValidation.message,
          onSome: (messageId) => `${discordValidation.message} Message ID: ${messageId}.`,
        })
      );
      const manifest = manifestForRequest(request, providersForManifest(providerValidations), {
        discordSummary: "Discord channel liveness and test-message delivery were validated.",
        dryRunOnly: false,
      });

      return new P1ManualProofResult({
        snapshot: new P1LiveProofSnapshot({
          generatedBy: `@beep/stack-installer:${request.operatorLabel}`,
          manifest,
          validationEvents: [
            ...dependencyEvents(dependencyValidations),
            validationEvent(
              "onepassword-discord-token-reference",
              "liveness",
              secretValidation.status === "reference-valid" ? "passed" : "failed",
              "installer:secret-reference:discord-bot-token",
              secretValidation.message
            ),
            ...providerEvents(providerValidations),
            validationEvent(
              "discord-test-message",
              "liveness",
              discordValidation.status === "configured" ? "passed" : "failed",
              "installer:channel:discord",
              discordMessage
            ),
          ],
        }),
      });
    }),
  };
});

/**
 * Host-dependency concept layer.
 *
 * @category layers
 * @since 0.0.0
 */
export const HostDependencyServerLive = Layer.effect(HostDependencyUseCases, makeHostDependencyServer());

/**
 * Secret-reference concept layer.
 *
 * @category layers
 * @since 0.0.0
 */
export const SecretReferenceServerLive = Layer.effect(SecretReferenceUseCases, makeSecretReferenceServer());

/**
 * Provider-account concept layer.
 *
 * @category layers
 * @since 0.0.0
 */
export const ProviderAccountServerLive = Layer.effect(ProviderAccountUseCases, makeProviderAccountServer());

/**
 * Discord-channel concept layer.
 *
 * @category layers
 * @since 0.0.0
 */
export const DiscordChannelServerLive = Layer.effect(DiscordChannelUseCases, makeDiscordChannelServer());

/**
 * Stack-manifest concept layer.
 *
 * @category layers
 * @since 0.0.0
 */
export const StackManifestServerLive = Layer.effect(StackManifestUseCases, makeStackManifestServer());

/**
 * Concept-local installer services.
 *
 * @category layers
 * @since 0.0.0
 */
export const InstallerConceptServerLive = Layer.mergeAll(
  HostDependencyServerLive,
  SecretReferenceServerLive,
  ProviderAccountServerLive,
  DiscordChannelServerLive,
  StackManifestServerLive
);

/**
 * P1 Manual Mode proof workflow layer.
 *
 * @category layers
 * @since 0.0.0
 */
export const P1ManualProofWorkflowLive = Layer.effect(P1ManualProofWorkflow, makeP1ManualProofWorkflow());

/**
 * Complete installer server layer.
 *
 * @category layers
 * @since 0.0.0
 */
export const InstallerServerLive = P1ManualProofWorkflowLive.pipe(Layer.provideMerge(InstallerConceptServerLive));

/**
 * Run the live P1 Manual Mode proof and return sanitized evidence.
 *
 * @category workflows
 * @since 0.0.0
 */
export const runP1ManualProof = Effect.fn("InstallerServer.runP1ManualProofExport")(function* (
  request: P1ManualProofRequest
) {
  const workflow = yield* P1ManualProofWorkflow;
  return yield* workflow.run(request);
});

/**
 * Preview the P1 Manual Mode proof without sending a Discord message.
 *
 * @category workflows
 * @since 0.0.0
 */
export const previewP1ManualProof = Effect.fn("InstallerServer.previewP1ManualProofExport")(function* (
  request: P1ManualProofRequest
) {
  const workflow = yield* P1ManualProofWorkflow;
  return yield* workflow.preview(request);
});
