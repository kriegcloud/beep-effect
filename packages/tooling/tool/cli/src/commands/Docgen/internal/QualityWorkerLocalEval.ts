/**
 * Local Docker-backed JSDoc quality worker evaluation.
 *
 * This module keeps local GPU orchestration read-only: it launches an
 * ephemeral ROCm llama.cpp server, routes the existing worker eval through the
 * local OpenAI-compatible endpoint, and stops the container before returning a
 * sanitized wrapper report.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { layerNodeSdkServerTraces, ServerObservabilityConfig } from "@beep/observability/server";
import { hashPublicTextSha256 } from "@beep/repo-ai-metrics";
import { DomainError } from "@beep/repo-utils";
import { LiteralKit } from "@beep/schema";
import * as O from "@beep/utils/Option";
import {
  Console,
  DateTime,
  Duration,
  Effect,
  FileSystem,
  Layer,
  Path,
  pipe,
  Ref,
  Result,
  Schedule,
  Stream,
} from "effect";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import { ChildProcess } from "effect/unstable/process";
import * as jsonc from "jsonc-parser";
import { DocgenQualityReport } from "./Quality.js";
import {
  analyzeDocgenQualityWorkerEval,
  DocgenQualityWorkerEvalProvider,
  DocgenQualityWorkerEvalReport,
  DocgenQualityWorkerEvalScope,
} from "./QualityWorkerEval.js";
import type { ChildProcessSpawner } from "effect/unstable/process";

const $I = $RepoCliId.create("commands/Docgen/internal/QualityWorkerLocalEval");

const QUALITY_WORKER_LOCAL_EVAL_SCHEMA_VERSION = 2 as const;
const JSON_FORMAT_MAX_LENGTH = 500_000;
const DEFAULT_LOCAL_WORKER_PACKET_LIMIT = 10;
const DEFAULT_LOCAL_WORKER_DOCKER_IMAGE = "rocm/llama.cpp:llama.cpp-b6652.amd0_rocm7.0.0_ubuntu24.04_server";
const DEFAULT_LOCAL_WORKER_HOST = "127.0.0.1";
const DEFAULT_LOCAL_WORKER_PORT = 18_080;
const DEFAULT_LOCAL_WORKER_CONTAINER_PORT = 8_080;
const DEFAULT_LOCAL_WORKER_CONTEXT_SIZE = 40_960;
const DEFAULT_LOCAL_WORKER_PARALLEL = 1;
const DEFAULT_LOCAL_WORKER_GPU_LAYERS = "all";
const DEFAULT_LOCAL_WORKER_READINESS_TIMEOUT = Duration.minutes(30);
const DEFAULT_LOCAL_WORKER_PACKET_TIMEOUT = Duration.minutes(10);
const DEFAULT_LOCAL_WORKER_OTLP_BASE_URL = "http://localhost:6006";
const DEFAULT_LOCAL_WORKER_OTLP_PROJECT = "beep-docgen-local-worker-eval";
const CONTAINER_MODEL_ROOT = "/models";
const READINESS_PATH = "/v1/models";
const DEFAULT_CONTEXT_BUDGET_RATIO = 0.7;

const encodeJson = S.encodeUnknownEffect(S.UnknownFromJsonString);

const DocgenQualityWorkerLocalEvalSplitMode = LiteralKit(["layer", "tensor", "row", "none"]).pipe(
  $I.annoteSchema("DocgenQualityWorkerLocalEvalSplitMode", {
    description: "llama.cpp multi-GPU split mode used by a local worker eval container.",
  })
);
type LocalWorkerSplitMode = typeof DocgenQualityWorkerLocalEvalSplitMode.Type;
const DEFAULT_LOCAL_WORKER_SPLIT_MODE: LocalWorkerSplitMode = "layer";

const DocgenQualityWorkerLocalEvalCleanupStatus = LiteralKit(["completed", "failed", "skipped-debug-keep"]).pipe(
  $I.annoteSchema("DocgenQualityWorkerLocalEvalCleanupStatus", {
    description: "Cleanup outcome for a local worker eval Docker container.",
  })
);

const DocgenQualityWorkerLocalEvalOtlpStatus = LiteralKit(["disabled", "exported", "failed"]).pipe(
  $I.annoteSchema("DocgenQualityWorkerLocalEvalOtlpStatus", {
    description: "OTLP export outcome for a local worker eval wrapper report.",
  })
);

class DocgenQualityWorkerLocalEvalBootstrap extends S.Class<DocgenQualityWorkerLocalEvalBootstrap>(
  $I`DocgenQualityWorkerLocalEvalBootstrap`
)(
  {
    dockerRunArgsHash: S.String,
    model: S.String,
    modelFileName: S.String,
    modelPathHash: S.String,
    readinessPath: S.String,
  },
  $I.annote("DocgenQualityWorkerLocalEvalBootstrap", {
    description: "Sanitized llama.cpp bootstrap metadata for a local worker eval container.",
  })
) {}

class DocgenQualityWorkerLocalEvalContainer extends S.Class<DocgenQualityWorkerLocalEvalContainer>(
  $I`DocgenQualityWorkerLocalEvalContainer`
)(
  {
    codexBaseUrl: S.String,
    containerId: S.String,
    containerName: S.String,
    containerPort: S.Finite,
    ctxSize: S.Finite,
    dockerImage: S.String,
    gpuLayers: S.String,
    host: S.String,
    parallel: S.Finite,
    port: S.Finite,
    serverBaseUrl: S.String,
    splitMode: DocgenQualityWorkerLocalEvalSplitMode,
    tensorSplit: S.NullOr(S.String),
  },
  $I.annote("DocgenQualityWorkerLocalEvalContainer", {
    description: "Sanitized local Docker container metadata for a worker eval run.",
  })
) {}

class DocgenQualityWorkerLocalEvalCleanup extends S.Class<DocgenQualityWorkerLocalEvalCleanup>(
  $I`DocgenQualityWorkerLocalEvalCleanup`
)(
  {
    durationMs: S.Finite,
    error: S.NullOr(S.String),
    keepServer: S.Boolean,
    stopStatus: DocgenQualityWorkerLocalEvalCleanupStatus,
  },
  $I.annote("DocgenQualityWorkerLocalEvalCleanup", {
    description: "Stop outcome for the ephemeral local worker eval container.",
  })
) {}

class DocgenQualityWorkerLocalEvalOtlp extends S.Class<DocgenQualityWorkerLocalEvalOtlp>(
  $I`DocgenQualityWorkerLocalEvalOtlp`
)(
  {
    baseUrl: S.NullOr(S.String),
    error: S.NullOr(S.String),
    exportedSpans: S.Finite,
    project: S.String,
    serviceName: S.String,
    status: DocgenQualityWorkerLocalEvalOtlpStatus,
  },
  $I.annote("DocgenQualityWorkerLocalEvalOtlp", {
    description: "Phoenix-compatible OTLP export summary for a local worker eval.",
  })
) {}

class DocgenQualityWorkerLocalEvalRuntime extends S.Class<DocgenQualityWorkerLocalEvalRuntime>(
  $I`DocgenQualityWorkerLocalEvalRuntime`
)(
  {
    cleanupDurationMs: S.Finite,
    provisionDurationMs: S.Finite,
    totalDurationMs: S.Finite,
    workerDurationMs: S.Finite,
  },
  $I.annote("DocgenQualityWorkerLocalEvalRuntime", {
    description: "Runtime measurements for local worker eval orchestration.",
  })
) {}

/**
 * JSON wrapper report emitted by `docgen quality-worker-eval-local`.
 *
 * @example
 * ```ts
 * import { DocgenQualityWorkerLocalEvalReport } from "@beep/repo-cli/commands/Docgen/internal/QualityWorkerLocalEval"
 *
 * console.log(DocgenQualityWorkerLocalEvalReport)
 * ```
 * @category models
 * @since 0.0.0
 */
export class DocgenQualityWorkerLocalEvalReport extends S.Class<DocgenQualityWorkerLocalEvalReport>(
  $I`DocgenQualityWorkerLocalEvalReport`
)(
  {
    schemaVersion: S.Literal(QUALITY_WORKER_LOCAL_EVAL_SCHEMA_VERSION),
    bootstrap: DocgenQualityWorkerLocalEvalBootstrap,
    cleanup: DocgenQualityWorkerLocalEvalCleanup,
    container: DocgenQualityWorkerLocalEvalContainer,
    generatedAt: S.String,
    model: S.String,
    otlp: DocgenQualityWorkerLocalEvalOtlp,
    provider: DocgenQualityWorkerEvalProvider,
    recommendation: S.String,
    runId: S.String,
    runtime: DocgenQualityWorkerLocalEvalRuntime,
    scope: DocgenQualityWorkerEvalScope,
    sourceQualityReport: S.String,
    workerEval: DocgenQualityWorkerEvalReport,
  },
  $I.annote("DocgenQualityWorkerLocalEvalReport", {
    description: "Local Docker orchestration wrapper around a read-only JSDoc quality worker eval report.",
  })
) {}

/**
 * Options for a local Docker-backed quality worker eval run.
 *
 * @example
 * ```ts
 * import { QualityWorkerLocalEvalDefaults } from "@beep/repo-cli/commands/Docgen/internal/QualityWorkerLocalEval"
 *
 * console.log(QualityWorkerLocalEvalDefaults.port)
 * ```
 * @category models
 * @since 0.0.0
 */
export class RunDocgenQualityWorkerLocalEvalOptions extends S.Class<RunDocgenQualityWorkerLocalEvalOptions>(
  $I`RunDocgenQualityWorkerLocalEvalOptions`
)(
  {
    confirmLocalGpuEval: S.Boolean,
    containerName: S.optional(S.String),
    containerPort: S.optional(S.Finite),
    ctxSize: S.optional(S.Finite),
    dockerImage: S.optional(S.String),
    gpuLayers: S.optional(S.String),
    host: S.optional(S.String),
    keepServer: S.optional(S.Boolean),
    model: S.String,
    modelPath: S.String,
    otlpBaseUrl: S.optional(S.String),
    otlpEnabled: S.optional(S.Boolean),
    otlpProject: S.optional(S.String),
    packetLimit: S.optional(S.Finite),
    packetTimeoutMs: S.optional(S.Finite),
    parallel: S.optional(S.Finite),
    port: S.optional(S.Finite),
    provider: DocgenQualityWorkerEvalProvider,
    readinessTimeoutMs: S.optional(S.Finite),
    report: DocgenQualityReport,
    scope: DocgenQualityWorkerEvalScope,
    sourceQualityReport: S.String,
    splitMode: S.optional(DocgenQualityWorkerLocalEvalSplitMode),
    tensorSplit: S.optional(S.String),
  },
  $I.annote("RunDocgenQualityWorkerLocalEvalOptions", {
    description: "Options used to create an ephemeral local Docker server and execute a read-only worker eval.",
  })
) {}

type QualityWorkerLocalEvalDefaultsValue = {
  readonly containerPort: number;
  readonly ctxSize: number;
  readonly dockerImage: string;
  readonly gpuLayers: string;
  readonly host: string;
  readonly otlpBaseUrl: string;
  readonly otlpProject: string;
  readonly packetLimit: number;
  readonly packetTimeoutMs: number;
  readonly parallel: number;
  readonly port: number;
  readonly readinessTimeoutMs: number;
  readonly splitMode: LocalWorkerSplitMode;
};

/**
 * Default local Docker worker eval settings.
 *
 * @example
 * ```ts
 * import { QualityWorkerLocalEvalDefaults } from "@beep/repo-cli/commands/Docgen/internal/QualityWorkerLocalEval"
 *
 * console.log(QualityWorkerLocalEvalDefaults.splitMode)
 * ```
 * @category constants
 * @since 0.0.0
 */
export const QualityWorkerLocalEvalDefaults: QualityWorkerLocalEvalDefaultsValue = {
  containerPort: DEFAULT_LOCAL_WORKER_CONTAINER_PORT,
  ctxSize: DEFAULT_LOCAL_WORKER_CONTEXT_SIZE,
  dockerImage: DEFAULT_LOCAL_WORKER_DOCKER_IMAGE,
  gpuLayers: DEFAULT_LOCAL_WORKER_GPU_LAYERS,
  host: DEFAULT_LOCAL_WORKER_HOST,
  otlpBaseUrl: DEFAULT_LOCAL_WORKER_OTLP_BASE_URL,
  otlpProject: DEFAULT_LOCAL_WORKER_OTLP_PROJECT,
  packetLimit: DEFAULT_LOCAL_WORKER_PACKET_LIMIT,
  packetTimeoutMs: Duration.toMillis(DEFAULT_LOCAL_WORKER_PACKET_TIMEOUT),
  parallel: DEFAULT_LOCAL_WORKER_PARALLEL,
  port: DEFAULT_LOCAL_WORKER_PORT,
  readinessTimeoutMs: Duration.toMillis(DEFAULT_LOCAL_WORKER_READINESS_TIMEOUT),
  splitMode: DEFAULT_LOCAL_WORKER_SPLIT_MODE,
};

type DockerProcessRequest = {
  readonly args: ReadonlyArray<string>;
  readonly command: string;
};

type DockerProcessResult = {
  readonly exitCode: number;
  readonly output: string;
};

type DockerRunner = (
  request: DockerProcessRequest
) => Effect.Effect<DockerProcessResult, DomainError, ChildProcessSpawner.ChildProcessSpawner>;

type LocalDockerPlan = {
  readonly bootstrap: DocgenQualityWorkerLocalEvalBootstrap;
  readonly containerName: string;
  readonly containerPort: number;
  readonly ctxSize: number;
  readonly dockerImage: string;
  readonly gpuLayers: string;
  readonly host: string;
  readonly hostModelDirectory: string;
  readonly modelFileName: string;
  readonly modelPath: string;
  readonly parallel: number;
  readonly port: number;
  readonly runArgs: ReadonlyArray<string>;
  readonly splitMode: LocalWorkerSplitMode;
  readonly tensorSplit?: string;
};

type AcquiredLocalContainer = {
  readonly container: DocgenQualityWorkerLocalEvalContainer;
  readonly provisionDurationMs: number;
};

const timestampIso = (): string => DateTime.formatIso(DateTime.nowUnsafe());

const durationMsSince = (startedAtMs: number): number =>
  Math.max(0, Math.round(globalThis.performance.now() - startedAtMs));

const errorMessage = (error: unknown): string =>
  P.isObject(error) && P.hasProperty(error, "message") && P.isString(error.message)
    ? error.message
    : "Unknown local worker eval failure.";

const renderJson = Effect.fn("DocgenQualityWorkerLocalEval.renderJson")(function* (value: unknown) {
  const encoded = yield* encodeJson(value).pipe(
    Effect.mapError(DomainError.newCause("Failed to encode docgen local worker eval JSON."))
  );

  if (encoded.length > JSON_FORMAT_MAX_LENGTH) {
    return `${encoded}\n`;
  }

  const edits = jsonc.format(encoded, undefined, {
    tabSize: 2,
    insertSpaces: true,
  });
  return `${jsonc.applyEdits(encoded, edits)}\n`;
});

const hashPublicIdentifier = (value: string): Effect.Effect<string, DomainError> =>
  hashPublicTextSha256(value).pipe(Effect.mapError(DomainError.newCause("Failed to hash local eval metadata.")));

const collectProcessOutput = <E>(stream: Stream.Stream<Uint8Array, E>) =>
  stream.pipe(
    Stream.decodeText(),
    Stream.runFold(
      () => "",
      (acc, chunk) => `${acc}${chunk}`
    )
  );

const makeDefaultDockerRunner = (): DockerRunner =>
  Effect.fn("DocgenQualityWorkerLocalEval.defaultDockerRunner")(function* ({ args, command }: DockerProcessRequest) {
    return yield* Effect.scoped(
      Effect.gen(function* () {
        const handle = yield* ChildProcess.make(command, [...args], {
          stderr: "pipe",
          stdout: "pipe",
          stdin: "ignore",
        });
        const [output, exitCode] = yield* Effect.all([collectProcessOutput(handle.all), handle.exitCode], {
          concurrency: 2,
        });
        return {
          exitCode,
          output: Str.trim(output),
        };
      })
    ).pipe(Effect.mapError(DomainError.newCause(`Failed to spawn ${command}.`)));
  });

const dockerCommand = (args: ReadonlyArray<string>, dockerRunner: DockerRunner) =>
  dockerRunner({ command: "docker", args }).pipe(
    Effect.flatMap((result) =>
      result.exitCode === 0
        ? Effect.succeed(result)
        : DomainError.make({
            message: `docker ${A.join(args, " ")} failed with exit code ${result.exitCode}: ${Str.takeLeft(1200)(result.output)}`,
          })
    )
  );

const ensureDockerImage = Effect.fn("DocgenQualityWorkerLocalEval.ensureDockerImage")(function* ({
  dockerImage,
  dockerRunner,
}: {
  readonly dockerImage: string;
  readonly dockerRunner: DockerRunner;
}) {
  yield* dockerCommand(["version"], dockerRunner);
  const inspect = yield* dockerRunner({ command: "docker", args: ["image", "inspect", dockerImage] });
  if (inspect.exitCode === 0) {
    return;
  }

  yield* Console.log(`docgen: pulling local worker Docker image ${dockerImage}`);
  yield* dockerCommand(["pull", dockerImage], dockerRunner);
});

const codexBaseUrlFor = (serverBaseUrl: string): string => `${serverBaseUrl}/v1`;

const serverBaseUrlFor = (host: string, port: number): string => `http://${host}:${port}`;

const positiveInteger = (value: number): boolean => Number.isInteger(value) && value > 0;

const validPort = (value: number): boolean => Number.isInteger(value) && value > 0 && value <= 65_535;

const isLocalBindHost = (host: string): boolean => host === "127.0.0.1" || host === "localhost" || host === "::1";

const firstOutputToken = (output: string, fallback: string): string =>
  pipe(
    Str.split(/\s+/)(Str.trim(output)),
    A.findFirst(Str.isNonEmpty),
    O.getOrElse(() => fallback)
  );

/**
 * Build the Docker run arguments for a local llama.cpp worker eval server.
 *
 * @param input - Resolved model mount and server settings.
 * @returns Docker CLI arguments excluding the leading `docker` command.
 * @example
 * ```ts
 * import { makeQualityWorkerLocalEvalDockerRunArgs } from "@beep/repo-cli/commands/Docgen/internal/QualityWorkerLocalEval"
 *
 * const args = makeQualityWorkerLocalEvalDockerRunArgs({
 *   containerModelPath: "/models/model.gguf",
 *   containerName: "beep-docgen-local-worker-eval-test",
 *   containerPort: 8080,
 *   ctxSize: 40960,
 *   dockerImage: "rocm/llama.cpp:server",
 *   gpuLayers: "all",
 *   host: "127.0.0.1",
 *   hostModelDirectory: "/home/elpresidank/ai/models",
 *   model: "qwen3-coder-30b-a3b",
 *   parallel: 1,
 *   port: 18080,
 *   splitMode: "layer"
 * })
 * console.log(args.includes("--device=/dev/kfd"))
 * ```
 * @category constructors
 * @since 0.0.0
 */
export const makeQualityWorkerLocalEvalDockerRunArgs = ({
  containerModelPath,
  containerName,
  containerPort,
  ctxSize,
  dockerImage,
  gpuLayers,
  host,
  hostModelDirectory,
  model,
  parallel,
  port,
  splitMode,
  tensorSplit,
}: {
  readonly containerModelPath: string;
  readonly containerName: string;
  readonly containerPort: number;
  readonly ctxSize: number;
  readonly dockerImage: string;
  readonly gpuLayers: string;
  readonly host: string;
  readonly hostModelDirectory: string;
  readonly model: string;
  readonly parallel: number;
  readonly port: number;
  readonly splitMode: LocalWorkerSplitMode;
  readonly tensorSplit?: string;
}): ReadonlyArray<string> => [
  "run",
  "--rm",
  "--detach",
  "--name",
  containerName,
  "--privileged",
  "--device=/dev/kfd",
  "--device=/dev/dri",
  "--group-add",
  "video",
  "--cap-add=SYS_PTRACE",
  "--security-opt",
  "seccomp=unconfined",
  "--ipc=host",
  "--shm-size",
  "16G",
  "-p",
  `${host}:${port}:${containerPort}`,
  "-v",
  `${hostModelDirectory}:${CONTAINER_MODEL_ROOT}:ro`,
  dockerImage,
  "-m",
  containerModelPath,
  "--alias",
  model,
  "--host",
  "0.0.0.0",
  "--port",
  `${containerPort}`,
  "--ctx-size",
  `${ctxSize}`,
  "--parallel",
  `${parallel}`,
  "--gpu-layers",
  gpuLayers,
  "--split-mode",
  splitMode,
  ...(tensorSplit === undefined ? [] : ["--tensor-split", tensorSplit]),
];

/**
 * Build the Docker stop arguments for a local worker eval container.
 *
 * @param containerName - Container name created by the local wrapper.
 * @returns Docker CLI arguments excluding the leading `docker` command.
 * @example
 * ```ts
 * import { makeQualityWorkerLocalEvalDockerStopArgs } from "@beep/repo-cli/commands/Docgen/internal/QualityWorkerLocalEval"
 *
 * console.log(makeQualityWorkerLocalEvalDockerStopArgs("beep-docgen-local-worker-eval-test"))
 * ```
 * @category constructors
 * @since 0.0.0
 */
export const makeQualityWorkerLocalEvalDockerStopArgs = (containerName: string): ReadonlyArray<string> => [
  "stop",
  containerName,
];

const resolveLocalDockerPlan = Effect.fn("DocgenQualityWorkerLocalEval.resolveLocalDockerPlan")(function* ({
  options,
  runId,
}: {
  readonly options: RunDocgenQualityWorkerLocalEvalOptions;
  readonly runId: string;
}) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const modelPath = path.resolve(Str.trim(options.modelPath));
  const modelExists = yield* fs.exists(modelPath).pipe(Effect.orElseSucceed(() => false));
  if (!modelExists) {
    return yield* DomainError.make({ message: `--model-path does not exist: ${modelPath}` });
  }

  const hostModelDirectory = path.dirname(modelPath);
  const modelFileName = path.basename(modelPath);
  const model = Str.trim(options.model);
  const dockerImage = Str.trim(options.dockerImage ?? QualityWorkerLocalEvalDefaults.dockerImage);
  const host = Str.trim(options.host ?? QualityWorkerLocalEvalDefaults.host);
  const port = options.port ?? QualityWorkerLocalEvalDefaults.port;
  const containerPort = options.containerPort ?? QualityWorkerLocalEvalDefaults.containerPort;
  const ctxSize = options.ctxSize ?? QualityWorkerLocalEvalDefaults.ctxSize;
  const parallel = options.parallel ?? QualityWorkerLocalEvalDefaults.parallel;
  const gpuLayers = Str.trim(options.gpuLayers ?? QualityWorkerLocalEvalDefaults.gpuLayers);
  const splitMode = options.splitMode ?? QualityWorkerLocalEvalDefaults.splitMode;
  const tensorSplit = pipe(
    O.fromUndefinedOr(options.tensorSplit),
    O.map(Str.trim),
    O.filter(Str.isNonEmpty),
    O.getOrUndefined
  );
  const containerName = pipe(
    O.fromUndefinedOr(options.containerName),
    O.map(Str.trim),
    O.filter(Str.isNonEmpty),
    O.getOrElse(() => `beep-docgen-local-worker-eval-${pipe(runId, Str.takeLeft(12))}`)
  );
  const containerModelPath = `${CONTAINER_MODEL_ROOT}/${modelFileName}`;
  const runArgs = makeQualityWorkerLocalEvalDockerRunArgs({
    containerModelPath,
    containerName,
    containerPort,
    ctxSize,
    dockerImage,
    gpuLayers,
    host,
    hostModelDirectory,
    model,
    parallel,
    port,
    splitMode,
    ...O.getSomesStruct({ tensorSplit: O.fromUndefinedOr(tensorSplit) }),
  });

  return {
    bootstrap: DocgenQualityWorkerLocalEvalBootstrap.make({
      dockerRunArgsHash: yield* hashPublicIdentifier(A.join(runArgs, "\u0000")),
      model,
      modelFileName,
      modelPathHash: yield* hashPublicIdentifier(modelPath),
      readinessPath: READINESS_PATH,
    }),
    containerName,
    containerPort,
    ctxSize,
    dockerImage,
    gpuLayers,
    host,
    hostModelDirectory,
    modelFileName,
    modelPath,
    parallel,
    port,
    runArgs,
    splitMode,
    ...O.getSomesStruct({ tensorSplit: O.fromUndefinedOr(tensorSplit) }),
  } satisfies LocalDockerPlan;
});

const llamaCppReadyProbe = Effect.fn("DocgenQualityWorkerLocalEval.llamaCppReadyProbe")(function* ({
  serverBaseUrl,
}: {
  readonly serverBaseUrl: string;
}) {
  const client = yield* HttpClient.HttpClient;
  const response = yield* client
    .execute(HttpClientRequest.get(`${serverBaseUrl}${READINESS_PATH}`))
    .pipe(Effect.option);
  return pipe(
    response,
    O.exists((value) => value.status >= 200 && value.status < 300)
  );
});

const waitForLlamaCppReady = Effect.fn("DocgenQualityWorkerLocalEval.waitForLlamaCppReady")(function* ({
  serverBaseUrl,
  timeout,
}: {
  readonly serverBaseUrl: string;
  readonly timeout: Duration.Duration;
}) {
  const attempts = Math.max(1, Math.floor(Duration.toMillis(timeout) / Duration.toMillis(Duration.seconds(5))));
  return yield* llamaCppReadyProbe({ serverBaseUrl }).pipe(
    Effect.flatMap((ready) =>
      ready
        ? Effect.succeed(true)
        : Effect.fail(DomainError.make({ message: `llama.cpp is not ready at ${serverBaseUrl}${READINESS_PATH}.` }))
    ),
    Effect.retry(Schedule.both(Schedule.spaced(Duration.seconds(5)), Schedule.recurs(attempts))),
    Effect.timeoutOrElse({
      duration: timeout,
      orElse: () => Effect.fail(DomainError.make({ message: `Timed out waiting for llama.cpp at ${serverBaseUrl}.` })),
    })
  );
});

const acquireLocalContainer = Effect.fn("DocgenQualityWorkerLocalEval.acquireLocalContainer")(function* ({
  dockerRunner,
  plan,
}: {
  readonly dockerRunner: DockerRunner;
  readonly plan: LocalDockerPlan;
}) {
  const startedAtMs = globalThis.performance.now();
  yield* Console.log(
    `docgen: starting local llama.cpp Docker container ${plan.containerName} on ${plan.host}:${plan.port}`
  );
  const result = yield* dockerCommand(plan.runArgs, dockerRunner);
  const containerId = firstOutputToken(result.output, plan.containerName);
  const serverBaseUrl = serverBaseUrlFor(plan.host, plan.port);

  return {
    container: DocgenQualityWorkerLocalEvalContainer.make({
      codexBaseUrl: codexBaseUrlFor(serverBaseUrl),
      containerId,
      containerName: plan.containerName,
      containerPort: plan.containerPort,
      ctxSize: plan.ctxSize,
      dockerImage: plan.dockerImage,
      gpuLayers: plan.gpuLayers,
      host: plan.host,
      parallel: plan.parallel,
      port: plan.port,
      serverBaseUrl,
      splitMode: plan.splitMode,
      tensorSplit: plan.tensorSplit ?? null,
    }),
    provisionDurationMs: durationMsSince(startedAtMs),
  } satisfies AcquiredLocalContainer;
});

const cleanupSkipped = (keepServer: boolean): DocgenQualityWorkerLocalEvalCleanup =>
  DocgenQualityWorkerLocalEvalCleanup.make({
    durationMs: 0,
    error: keepServer ? null : "Local Docker cleanup did not run.",
    keepServer,
    stopStatus: keepServer ? "skipped-debug-keep" : "failed",
  });

const cleanupLocalContainer = Effect.fn("DocgenQualityWorkerLocalEval.cleanupLocalContainer")(function* ({
  containerName,
  dockerRunner,
  keepServer,
}: {
  readonly containerName: string;
  readonly dockerRunner: DockerRunner;
  readonly keepServer: boolean;
}) {
  const startedAtMs = globalThis.performance.now();

  if (keepServer) {
    yield* Console.log(`docgen: keeping local Docker container ${containerName} for debugging`);
    return DocgenQualityWorkerLocalEvalCleanup.make({
      durationMs: durationMsSince(startedAtMs),
      error: null,
      keepServer,
      stopStatus: "skipped-debug-keep",
    });
  }

  yield* Console.log(`docgen: stopping local Docker container ${containerName}`);
  const stopResult = yield* dockerCommand(makeQualityWorkerLocalEvalDockerStopArgs(containerName), dockerRunner).pipe(
    Effect.result
  );
  const stopStatus = Result.isSuccess(stopResult) ? "completed" : "failed";
  const error = Result.isFailure(stopResult) ? errorMessage(stopResult.failure) : null;

  return DocgenQualityWorkerLocalEvalCleanup.make({
    durationMs: durationMsSince(startedAtMs),
    error,
    keepServer,
    stopStatus,
  });
});

const disabledOtlp = (project: string): DocgenQualityWorkerLocalEvalOtlp =>
  DocgenQualityWorkerLocalEvalOtlp.make({
    baseUrl: null,
    error: null,
    exportedSpans: 0,
    project,
    serviceName: "beep.docgen.quality-worker-eval-local",
    status: "disabled",
  });

const runOtlpSpan = (spanName: string, attributes: Record<string, string | number | boolean>) =>
  Effect.void.pipe(Effect.withSpan(spanName, { attributes }));

const packetSpanAttributes = Effect.fn("DocgenQualityWorkerLocalEval.packetSpanAttributes")(function* ({
  model,
  packet,
  provider,
  runId,
}: {
  readonly model: string;
  readonly packet: DocgenQualityWorkerEvalReport["packets"][number];
  readonly provider: DocgenQualityWorkerEvalProvider;
  readonly runId: string;
}) {
  return {
    "beep.docgen.eval.duration_ms": packet.durationMs,
    "beep.docgen.eval.finding_count": A.length(packet.findingCodes),
    "beep.docgen.eval.context_budget_tokens": packet.contextBudgetTokens ?? 0,
    "beep.docgen.eval.estimated_prompt_tokens": packet.estimatedPromptTokens,
    "beep.docgen.eval.local_score": packet.localScore ?? 0,
    "beep.docgen.eval.model": model,
    "beep.docgen.eval.package_hash": yield* hashPublicIdentifier(packet.packageName),
    "beep.docgen.eval.packet_id_hash": yield* hashPublicIdentifier(packet.packetId),
    "beep.docgen.eval.policy_violation_count": A.length(packet.policyViolationCodes),
    "beep.docgen.eval.prompt_characters": packet.promptCharacters,
    "beep.docgen.eval.provider": provider,
    "beep.docgen.eval.review_disposition": packet.reviewDisposition,
    "beep.docgen.eval.run_id": runId,
    "beep.docgen.eval.status": packet.status,
    "beep.docgen.eval.subject_id_hash": yield* hashPublicIdentifier(packet.subjectId),
    "openinference.span.kind": "EVALUATOR",
  };
});

const emitLocalEvalOtlp = Effect.fn("DocgenQualityWorkerLocalEval.emitLocalEvalOtlp")(function* ({
  baseUrl,
  enabled,
  model,
  project,
  provider,
  runId,
  sourceQualityReport,
  workerEval,
}: {
  readonly baseUrl: string;
  readonly enabled: boolean;
  readonly model: string;
  readonly project: string;
  readonly provider: DocgenQualityWorkerEvalProvider;
  readonly runId: string;
  readonly sourceQualityReport: string;
  readonly workerEval: DocgenQualityWorkerEvalReport;
}) {
  if (!enabled) {
    return disabledOtlp(project);
  }

  const serviceName = "beep.docgen.quality-worker-eval-local";
  const spanCount = A.length(workerEval.packets) + 1;
  const exportResult = yield* Effect.scoped(
    Layer.build(
      layerNodeSdkServerTraces(
        ServerObservabilityConfig.make({
          devtoolsEnabled: false,
          devtoolsUrl: "ws://127.0.0.1:34437",
          environment: "eval",
          minLogLevel: "Info",
          otlpBaseUrl: baseUrl,
          otlpEnabled: true,
          otlpResourceAttributes: {
            "openinference.project.name": project,
            "service.namespace": "beep",
          },
          prometheusPrefix: "beep",
          serviceName,
          serviceVersion: "0.0.0",
        })
      )
    ).pipe(
      Effect.flatMap((context) =>
        Effect.gen(function* () {
          const sourceQualityReportHash = yield* hashPublicIdentifier(sourceQualityReport);
          yield* runOtlpSpan(`${serviceName}.summary`, {
            "beep.docgen.eval.completed": workerEval.summary.completed,
            "beep.docgen.eval.failed": workerEval.summary.failed,
            "beep.docgen.eval.model": model,
            "beep.docgen.eval.provider": provider,
            "beep.docgen.eval.run_id": runId,
            "beep.docgen.eval.scope": workerEval.scope,
            "beep.docgen.eval.selected_packets": workerEval.summary.selectedPackets,
            "beep.docgen.eval.source_quality_report_hash": sourceQualityReportHash,
            "beep.docgen.eval.skipped_context": workerEval.summary.skippedContext,
            "beep.docgen.eval.timed_out": workerEval.summary.timedOut,
            "openinference.span.kind": "EVALUATOR",
          });
          yield* Effect.forEach(
            workerEval.packets,
            (packet) =>
              packetSpanAttributes({ model, packet, provider, runId }).pipe(
                Effect.flatMap((attributes) => runOtlpSpan(`${serviceName}.packet`, attributes))
              ),
            { concurrency: 8, discard: true }
          );
        }).pipe(Effect.provide(context))
      )
    )
  ).pipe(Effect.result);

  if (Result.isFailure(exportResult)) {
    return DocgenQualityWorkerLocalEvalOtlp.make({
      baseUrl,
      error: errorMessage(exportResult.failure),
      exportedSpans: 0,
      project,
      serviceName,
      status: "failed",
    });
  }

  return DocgenQualityWorkerLocalEvalOtlp.make({
    baseUrl,
    error: null,
    exportedSpans: spanCount,
    project,
    serviceName,
    status: "exported",
  });
});

const validateOptions = Effect.fn("DocgenQualityWorkerLocalEval.validateOptions")(function* ({
  confirmLocalGpuEval,
  containerPort,
  ctxSize,
  dockerImage,
  gpuLayers,
  host,
  model,
  modelPath,
  packetLimit,
  packetTimeoutMs,
  parallel,
  port,
  provider,
  readinessTimeoutMs,
}: RunDocgenQualityWorkerLocalEvalOptions) {
  if (!confirmLocalGpuEval) {
    return yield* DomainError.make({
      message: "Local worker eval requires --confirm-local-gpu-eval because it uses local GPU resources.",
    });
  }

  if (provider !== "ollama") {
    return yield* DomainError.make({
      message: "Local worker eval v1 uses the Codex SDK Ollama-compatible local provider route.",
    });
  }

  if (Str.isEmpty(Str.trim(model))) {
    return yield* DomainError.make({ message: "--model is required for docgen quality-worker-eval-local." });
  }

  if (Str.isEmpty(Str.trim(modelPath))) {
    return yield* DomainError.make({ message: "--model-path is required for docgen quality-worker-eval-local." });
  }

  if (dockerImage !== undefined && Str.isEmpty(Str.trim(dockerImage))) {
    return yield* DomainError.make({ message: "--docker-image must not be empty." });
  }

  if (host !== undefined && !isLocalBindHost(Str.trim(host))) {
    return yield* DomainError.make({ message: "--host must bind to localhost for docgen quality-worker-eval-local." });
  }

  if (port !== undefined && !validPort(port)) {
    return yield* DomainError.make({ message: "--port must be an integer between 1 and 65535." });
  }

  if (containerPort !== undefined && !validPort(containerPort)) {
    return yield* DomainError.make({ message: "--container-port must be an integer between 1 and 65535." });
  }

  if (ctxSize !== undefined && !positiveInteger(ctxSize)) {
    return yield* DomainError.make({ message: "--ctx-size must be a positive integer." });
  }

  if (parallel !== undefined && !positiveInteger(parallel)) {
    return yield* DomainError.make({ message: "--parallel must be a positive integer." });
  }

  if (gpuLayers !== undefined && Str.isEmpty(Str.trim(gpuLayers))) {
    return yield* DomainError.make({ message: "--gpu-layers must not be empty." });
  }

  if (packetLimit !== undefined && packetLimit < 0) {
    return yield* DomainError.make({
      message: "--packet-limit must be zero or greater; use 0 to suppress worker packet turns.",
    });
  }

  if (packetTimeoutMs !== undefined && packetTimeoutMs <= 0) {
    return yield* DomainError.make({ message: "--packet-timeout-ms must be greater than zero." });
  }

  if (readinessTimeoutMs !== undefined && readinessTimeoutMs <= 0) {
    return yield* DomainError.make({ message: "--readiness-timeout-ms must be greater than zero." });
  }
});

const contextBudgetTokensFor = (ctxSize: number): number =>
  Math.max(1, Math.floor(ctxSize * DEFAULT_CONTEXT_BUDGET_RATIO));

const recommendationFor = (
  workerEval: DocgenQualityWorkerEvalReport,
  cleanup: DocgenQualityWorkerLocalEvalCleanup,
  otlp: DocgenQualityWorkerLocalEvalOtlp
): string => {
  if (cleanup.stopStatus !== "completed") {
    return "Review local Docker cleanup before more GPU eval runs; worker output remains read-only evidence.";
  }

  if (otlp.status === "failed") {
    return "Worker eval completed, but Phoenix export failed; keep the JSON report as the source of evidence.";
  }

  return workerEval.recommendation;
};

/**
 * Render a local worker eval wrapper report as formatted JSON.
 *
 * @param report - Local worker eval wrapper report.
 * @returns Stable JSON content.
 * @example
 * ```ts
 * import { generateQualityWorkerLocalEvalJson } from "@beep/repo-cli/commands/Docgen/internal/QualityWorkerLocalEval"
 *
 * console.log(generateQualityWorkerLocalEvalJson)
 * ```
 * @category formatters
 * @since 0.0.0
 */
export const generateQualityWorkerLocalEvalJson = renderJson;

/**
 * Run a read-only JSDoc quality worker eval on an ephemeral local Docker server.
 *
 * @effects
 * - Starts a ROCm llama.cpp Docker container after explicit confirmation.
 * - Waits for OpenAI-compatible readiness, runs the existing read-only worker
 *   eval, and stops the container unless debug keep mode is enabled.
 * - Optionally emits sanitized summary and hashed packet spans to Phoenix OTLP.
 * @example
 * ```ts
 * import { QualityWorkerLocalEvalDefaults } from "@beep/repo-cli/commands/Docgen/internal/QualityWorkerLocalEval"
 *
 * console.log(QualityWorkerLocalEvalDefaults.port)
 * ```
 * @category use-cases
 * @since 0.0.0
 */
export const runDocgenQualityWorkerLocalEval = Effect.fn(
  "DocgenQualityWorkerLocalEval.runDocgenQualityWorkerLocalEval"
)(function* (options: RunDocgenQualityWorkerLocalEvalOptions) {
  yield* validateOptions(options);

  const totalStartedAtMs = globalThis.performance.now();
  const generatedAt = timestampIso();
  const runId = yield* hashPublicIdentifier(`${generatedAt}\u0000${options.model}\u0000${options.sourceQualityReport}`);
  const dockerRunner = makeDefaultDockerRunner();
  const plan = yield* resolveLocalDockerPlan({ options, runId });
  yield* ensureDockerImage({ dockerImage: plan.dockerImage, dockerRunner });
  const keepServer = options.keepServer ?? false;
  const cleanupRef = yield* Ref.make(cleanupSkipped(keepServer));
  const { acquired, workerDurationMs, workerEval } = yield* Effect.acquireUseRelease(
    acquireLocalContainer({
      dockerRunner,
      plan,
    }),
    Effect.fnUntraced(function* (acquired) {
      const workerStartedAtMs = globalThis.performance.now();
      yield* Console.log(`docgen: waiting for local llama.cpp readiness at ${acquired.container.serverBaseUrl}`);
      yield* waitForLlamaCppReady({
        serverBaseUrl: acquired.container.serverBaseUrl,
        timeout: Duration.millis(options.readinessTimeoutMs ?? QualityWorkerLocalEvalDefaults.readinessTimeoutMs),
      });

      yield* Console.log("docgen: running read-only local worker eval packets");
      const workerEval = yield* analyzeDocgenQualityWorkerEval({
        baseUrl: acquired.container.codexBaseUrl,
        model: options.model,
        packetLimit: options.packetLimit ?? QualityWorkerLocalEvalDefaults.packetLimit,
        provider: options.provider,
        promptTokenBudget: contextBudgetTokensFor(plan.ctxSize),
        report: options.report,
        scope: options.scope,
        sourceQualityReport: options.sourceQualityReport,
        timeout: Duration.millis(options.packetTimeoutMs ?? QualityWorkerLocalEvalDefaults.packetTimeoutMs),
      });

      return {
        acquired,
        workerDurationMs: durationMsSince(workerStartedAtMs),
        workerEval,
      };
    }),
    (acquired) =>
      cleanupLocalContainer({ containerName: acquired.container.containerName, dockerRunner, keepServer }).pipe(
        Effect.flatMap((cleanup) => Ref.set(cleanupRef, cleanup))
      )
  );
  const cleanup = yield* Ref.get(cleanupRef);
  const otlp = yield* emitLocalEvalOtlp({
    baseUrl: options.otlpBaseUrl ?? QualityWorkerLocalEvalDefaults.otlpBaseUrl,
    enabled: options.otlpEnabled ?? false,
    model: options.model,
    project: options.otlpProject ?? QualityWorkerLocalEvalDefaults.otlpProject,
    provider: options.provider,
    runId,
    sourceQualityReport: options.sourceQualityReport,
    workerEval,
  });

  return DocgenQualityWorkerLocalEvalReport.make({
    schemaVersion: QUALITY_WORKER_LOCAL_EVAL_SCHEMA_VERSION,
    bootstrap: plan.bootstrap,
    cleanup,
    container: acquired.container,
    generatedAt,
    model: options.model,
    otlp,
    provider: options.provider,
    recommendation: recommendationFor(workerEval, cleanup, otlp),
    runId,
    runtime: DocgenQualityWorkerLocalEvalRuntime.make({
      cleanupDurationMs: cleanup.durationMs,
      provisionDurationMs: acquired.provisionDurationMs,
      totalDurationMs: durationMsSince(totalStartedAtMs),
      workerDurationMs,
    }),
    scope: options.scope,
    sourceQualityReport: options.sourceQualityReport,
    workerEval,
  });
});
