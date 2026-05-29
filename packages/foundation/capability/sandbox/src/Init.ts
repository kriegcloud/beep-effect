/**
 * Init scaffolding for sandbox configuration directories.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import { A, Str } from "@beep/utils";
import { Effect, FileSystem, Path, pipe } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { ConfigDirError, InitError } from "./Sandbox.errors.ts";
import {
  renderSandboxTemplateFiles,
  SandboxTemplateName,
  SandboxTemplateRenderContext,
  sandboxTemplateNextSteps,
} from "./Template.ts";

const $I = $SandboxId.create("Init");

/**
 * Config directory created by {@link initSandbox}.
 *
 * @category utilities
 * @since 0.0.0
 */
export const SANDBOX_CONFIG_DIR = ".sandcastle" as const;

/**
 * Supported init-time agent choices.
 *
 * @category schemas
 * @since 0.0.0
 */
export const SandboxAgentName = LiteralKit(["claude-code", "codex", "opencode", "pi"]).pipe(
  $I.annoteSchema("SandboxAgentName", {
    description: "Supported init-time agent choices.",
  })
);

/**
 * Runtime type for {@link SandboxAgentName}.
 *
 * @category models
 * @since 0.0.0
 */
export type SandboxAgentName = typeof SandboxAgentName.Type;

/**
 * Supported local container providers for generated configuration.
 *
 * @category schemas
 * @since 0.0.0
 */
export const SandboxInitProviderName = LiteralKit(["docker", "podman"]).pipe(
  $I.annoteSchema("SandboxInitProviderName", {
    description: "Supported local container providers for generated configuration.",
  })
);

/**
 * Runtime type for {@link SandboxInitProviderName}.
 *
 * @category models
 * @since 0.0.0
 */
export type SandboxInitProviderName = typeof SandboxInitProviderName.Type;

/**
 * Agent registry entry used by init scaffolding.
 *
 * @example
 * ```ts
 * import { listSandboxAgents } from "@beep/sandbox"
 *
 * console.log(listSandboxAgents()[0]?.name)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SandboxAgentEntry extends S.Class<SandboxAgentEntry>($I`SandboxAgentEntry`)(
  {
    defaultModel: S.String,
    dockerfileInstall: S.String,
    envExample: S.String,
    factoryImport: S.String,
    label: S.String,
    name: SandboxAgentName,
  },
  $I.annote("SandboxAgentEntry", {
    description: "Agent registry entry used by init scaffolding.",
  })
) {}

/**
 * Provider registry entry used by init scaffolding.
 *
 * @example
 * ```ts
 * import { listSandboxInitProviders } from "@beep/sandbox"
 *
 * console.log(listSandboxInitProviders()[0]?.containerfileName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SandboxInitProviderEntry extends S.Class<SandboxInitProviderEntry>($I`SandboxInitProviderEntry`)(
  {
    containerfileName: S.String,
    factoryImport: S.String,
    label: S.String,
    name: SandboxInitProviderName,
  },
  $I.annote("SandboxInitProviderEntry", {
    description: "Provider registry entry used by init scaffolding.",
  })
) {}

/**
 * Options for initializing a sandbox config directory.
 *
 * @example
 * ```ts
 * import { InitSandboxOptions } from "@beep/sandbox"
 *
 * const options = InitSandboxOptions.make({ repoDir: process.cwd() })
 * console.log(options.templateName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class InitSandboxOptions extends S.Class<InitSandboxOptions>($I`InitSandboxOptions`)(
  {
    agentName: SandboxAgentName.pipe(S.withConstructorDefault(Effect.succeed("claude-code"))),
    imageName: S.optionalKey(S.String),
    model: S.optionalKey(S.String),
    providerName: SandboxInitProviderName.pipe(S.withConstructorDefault(Effect.succeed("docker"))),
    repoDir: S.String,
    templateName: SandboxTemplateName.pipe(S.withConstructorDefault(Effect.succeed("blank"))),
  },
  $I.annote("InitSandboxOptions", {
    description: "Options for initializing a sandbox config directory.",
  })
) {}

/**
 * Result returned after sandbox init scaffolding completes.
 *
 * @example
 * ```ts
 * import { InitSandboxResult } from "@beep/sandbox"
 *
 * const result = InitSandboxResult.make({
 *   configDir: "/repo/.sandcastle",
 *   imageName: "beep-sandbox:repo",
 *   mainFilename: "main.ts",
 *   nextSteps: [],
 *   providerName: "docker",
 *   templateName: "blank"
 * })
 * console.log(result.configDir)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class InitSandboxResult extends S.Class<InitSandboxResult>($I`InitSandboxResult`)(
  {
    configDir: S.String,
    imageName: S.String,
    mainFilename: S.String,
    nextSteps: S.Array(S.String),
    providerName: SandboxInitProviderName,
    templateName: SandboxTemplateName,
  },
  $I.annote("InitSandboxResult", {
    description: "Result returned after sandbox init scaffolding completes.",
  })
) {}

class PackageJsonModuleType extends S.Class<PackageJsonModuleType>($I`PackageJsonModuleType`)(
  {
    type: S.optionalKey(S.String),
  },
  $I.annote("PackageJsonModuleType", {
    description: "Subset of package.json used to choose a generated entrypoint extension.",
  })
) {}

const decodePackageJsonModuleType = S.decodeUnknownEffect(S.fromJsonString(PackageJsonModuleType));

const containerfileTemplate = `FROM node:22-bookworm

RUN apt-get update && apt-get install -y \\
  git \\
  curl \\
  jq \\
  && rm -rf /var/lib/apt/lists/*

RUN usermod -d /home/agent -m -l agent node

{{INSTALL_AGENT}}

USER agent
WORKDIR /home/agent
ENV PATH="/home/agent/.local/bin:$PATH"

ENTRYPOINT ["sleep", "infinity"]
`;

const claudeCodeInstall = `RUN curl -fsSL https://claude.ai/install.sh | bash`;
const codexInstall = `RUN npm install -g @openai/codex`;
const opencodeInstall = `RUN npm install -g opencode-ai@latest`;
const piInstall = `RUN npm install -g @mariozechner/pi-coding-agent`;

const sandboxAgents: ReadonlyArray<SandboxAgentEntry> = [
  SandboxAgentEntry.make({
    defaultModel: "claude-opus-4-6",
    dockerfileInstall: claudeCodeInstall,
    envExample: "# Anthropic API key\nANTHROPIC_API_KEY=",
    factoryImport: "claudeCode",
    label: "Claude Code",
    name: "claude-code",
  }),
  SandboxAgentEntry.make({
    defaultModel: "gpt-5.4-mini",
    dockerfileInstall: codexInstall,
    envExample: "# OpenAI API key\nOPENAI_API_KEY=",
    factoryImport: "codex",
    label: "Codex",
    name: "codex",
  }),
  SandboxAgentEntry.make({
    defaultModel: "opencode/big-pickle",
    dockerfileInstall: opencodeInstall,
    envExample: "# OpenCode API key\nOPENCODE_API_KEY=",
    factoryImport: "opencode",
    label: "OpenCode",
    name: "opencode",
  }),
  SandboxAgentEntry.make({
    defaultModel: "claude-sonnet-4-6",
    dockerfileInstall: piInstall,
    envExample: "# Anthropic API key\nANTHROPIC_API_KEY=",
    factoryImport: "pi",
    label: "Pi",
    name: "pi",
  }),
];

const sandboxInitProviders: ReadonlyArray<SandboxInitProviderEntry> = [
  SandboxInitProviderEntry.make({
    containerfileName: "Dockerfile",
    factoryImport: "docker",
    label: "Docker",
    name: "docker",
  }),
  SandboxInitProviderEntry.make({
    containerfileName: "Containerfile",
    factoryImport: "podman",
    label: "Podman",
    name: "podman",
  }),
];

const gitignore = `.env
logs/
worktrees/
`;

const envExample = (agent: SandboxAgentEntry): string => `${agent.envExample}

# GitHub personal access token, used when prompts call gh.
GH_TOKEN=
`;

const containerfileForAgent = (agent: SandboxAgentEntry): string =>
  pipe(containerfileTemplate, Str.replaceAll("{{INSTALL_AGENT}}", agent.dockerfileInstall));

const detectMainFilename = Effect.fn("Init.detectMainFilename")(function* (repoDir: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const packageJsonPath = path.join(repoDir, "package.json");
  const exists = yield* fs.exists(packageJsonPath).pipe(Effect.orElseSucceed(() => false));

  if (!exists) {
    return "main.mts";
  }

  const packageJson = yield* fs.readFileString(packageJsonPath).pipe(
    Effect.flatMap(decodePackageJsonModuleType),
    Effect.orElseSucceed(() => PackageJsonModuleType.make({}))
  );

  return packageJson.type === "module" ? "main.ts" : "main.mts";
});

const requireSandboxAgent = Effect.fn("Init.requireSandboxAgent")(function* (name: SandboxAgentName) {
  const agent = getSandboxAgent(name);

  if (O.isNone(agent)) {
    return yield* InitError.new("unknown sandbox agent", `Unknown sandbox agent: ${name}`);
  }

  return agent.value;
});

const requireSandboxInitProvider = Effect.fn("Init.requireSandboxInitProvider")(function* (
  name: SandboxInitProviderName
) {
  const provider = getSandboxInitProvider(name);

  if (O.isNone(provider)) {
    return yield* InitError.new("unknown sandbox provider", `Unknown sandbox provider: ${name}`);
  }

  return provider.value;
});

/**
 * Derive the default local container image name for a repository.
 *
 * @example
 * ```ts
 * import { defaultSandboxImageName } from "@beep/sandbox"
 *
 * console.log(defaultSandboxImageName("/workspace/example"))
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const defaultSandboxImageName = (repoDir: string): string => {
  const dirName = pipe(
    repoDir,
    Str.replace(/[\\/]+$/gu, ""),
    Str.split(/[\\/]+/u),
    A.last,
    O.getOrElse(() => "local")
  );
  const sanitized = pipe(dirName, Str.toLowerCase, Str.replace(/[^a-z0-9_.-]/gu, "-"));

  return `beep-sandbox:${Str.isEmpty(sanitized) ? "local" : sanitized}`;
};

/**
 * List init-time agent registry entries.
 *
 * @example
 * ```ts
 * import { listSandboxAgents } from "@beep/sandbox"
 *
 * console.log(listSandboxAgents().length)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const listSandboxAgents = (): ReadonlyArray<SandboxAgentEntry> => sandboxAgents;

/**
 * Look up an init-time agent registry entry.
 *
 * @example
 * ```ts
 * import { getSandboxAgent } from "@beep/sandbox"
 * import * as O from "effect/Option"
 *
 * console.log(O.isSome(getSandboxAgent("codex")))
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const getSandboxAgent = (name: string): O.Option<SandboxAgentEntry> =>
  A.findFirst(sandboxAgents, (agent) => agent.name === name);

/**
 * List init-time sandbox provider registry entries.
 *
 * @example
 * ```ts
 * import { listSandboxInitProviders } from "@beep/sandbox"
 *
 * console.log(listSandboxInitProviders().length)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const listSandboxInitProviders = (): ReadonlyArray<SandboxInitProviderEntry> => sandboxInitProviders;

/**
 * Look up an init-time sandbox provider registry entry.
 *
 * @example
 * ```ts
 * import { getSandboxInitProvider } from "@beep/sandbox"
 * import * as O from "effect/Option"
 *
 * console.log(O.isSome(getSandboxInitProvider("docker")))
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const getSandboxInitProvider = (name: string): O.Option<SandboxInitProviderEntry> =>
  A.findFirst(sandboxInitProviders, (provider) => provider.name === name);

/**
 * Require an existing `.sandcastle` config directory.
 *
 * @example
 * ```ts
 * import { ensureSandboxConfigDir } from "@beep/sandbox"
 *
 * const configDir = ensureSandboxConfigDir(process.cwd())
 * console.log(configDir)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const ensureSandboxConfigDir: (
  repoDir: string
) => Effect.Effect<string, ConfigDirError, FileSystem.FileSystem | Path.Path> = Effect.fn(
  "Init.ensureSandboxConfigDir"
)(function* (repoDir) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const configDir = path.join(repoDir, SANDBOX_CONFIG_DIR);
  const exists = yield* fs.exists(configDir).pipe(Effect.orElseSucceed(() => false));

  if (!exists) {
    return yield* ConfigDirError.new(
      "missing sandbox config directory",
      `No ${SANDBOX_CONFIG_DIR}/ found. Run \`beep-sandbox init\` first.`
    );
  }

  return configDir;
});

/**
 * Scaffold the `.sandcastle` config directory for a repository.
 *
 * @example
 * ```ts
 * import { initSandbox, InitSandboxOptions } from "@beep/sandbox"
 *
 * const program = initSandbox(InitSandboxOptions.make({ repoDir: process.cwd() }))
 * console.log(program)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const initSandbox: (
  options: InitSandboxOptions
) => Effect.Effect<InitSandboxResult, InitError, FileSystem.FileSystem | Path.Path> = Effect.fn("Init.initSandbox")(
  function* (options) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const agent = yield* requireSandboxAgent(options.agentName);
    const provider = yield* requireSandboxInitProvider(options.providerName);
    const mainFilename = yield* detectMainFilename(options.repoDir);
    const configDir = path.join(options.repoDir, SANDBOX_CONFIG_DIR);
    const exists = yield* fs.exists(configDir).pipe(Effect.orElseSucceed(() => false));

    if (exists) {
      return yield* InitError.new(
        "sandbox config directory already exists",
        `${SANDBOX_CONFIG_DIR}/ directory already exists. Remove it first if you want to re-initialize.`
      );
    }

    const imageName = options.imageName ?? defaultSandboxImageName(options.repoDir);
    const model = options.model ?? agent.defaultModel;
    const renderedFiles = yield* renderSandboxTemplateFiles(
      SandboxTemplateRenderContext.make({
        agentFactory: agent.factoryImport,
        agentModel: model,
        imageName,
        mainFilename,
        providerFactory: provider.factoryImport,
        templateName: options.templateName,
      })
    );

    yield* fs.makeDirectory(configDir, { recursive: false }).pipe(
      Effect.mapError((cause) =>
        InitError.make({
          cause,
          message: `Failed to create ${SANDBOX_CONFIG_DIR}/.`,
        })
      )
    );

    yield* Effect.forEach(
      [
        {
          content: containerfileForAgent(agent),
          path: provider.containerfileName,
        },
        {
          content: gitignore,
          path: ".gitignore",
        },
        {
          content: envExample(agent),
          path: ".env.example",
        },
        ...renderedFiles,
      ],
      (file) =>
        fs.writeFileString(path.join(configDir, file.path), file.content).pipe(
          Effect.mapError((cause) =>
            InitError.make({
              cause,
              message: `Failed to write ${SANDBOX_CONFIG_DIR}/${file.path}.`,
            })
          )
        ),
      { discard: true }
    );

    return InitSandboxResult.make({
      configDir,
      imageName,
      mainFilename,
      nextSteps: sandboxTemplateNextSteps(options.templateName, mainFilename),
      providerName: options.providerName,
      templateName: options.templateName,
    });
  }
);
