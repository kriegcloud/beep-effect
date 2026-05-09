/**
 * Graphiti proxy operational helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { findRepoRoot } from "@beep/repo-utils";
import { TaggedErrorClass } from "@beep/schema";
import { thunkFalse } from "@beep/utils";
import { Clock, Console, Duration, Effect, FileSystem, Path, pipe, Stream } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { ChildProcess, type ChildProcessSpawner } from "effect/unstable/process";
import { QualityTaskStep } from "../../Quality/Tasks.js";

const $I = $RepoCliId.create("commands/Graphiti/internal/ProxyOps");

type GraphitiProxyOpsEnvironment = FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner;

/**
 * Typed failure for Graphiti proxy operational helpers.
 *
 * @example
 * ```ts
 * import { GraphitiProxyOpsError } from "@beep/repo-cli/commands/Graphiti/internal/ProxyOps"
 * const error = new GraphitiProxyOpsError({ message: "failed" })
 * ```
 * @category errors
 * @since 0.0.0
 */
export class GraphitiProxyOpsError extends TaggedErrorClass<GraphitiProxyOpsError>($I`GraphitiProxyOpsError`)(
  "GraphitiProxyOpsError",
  {
    message: S.String,
    command: S.optionalKey(S.String),
    exitCode: S.optionalKey(S.Number),
    cause: S.optionalKey(S.Defect),
  },
  $I.annote("GraphitiProxyOpsError", {
    description: "Failure raised while managing the local Graphiti proxy.",
  })
) {}

type ProxyEnsureConfig = {
  readonly falkorContainer: string;
  readonly graphitiContainer: string;
  readonly healthUrl: string;
  readonly logFile: string;
  readonly pidFile: string;
  readonly port: string;
  readonly recoverOnUnhealthy: boolean;
  readonly recoveryMcpUrl: string;
  readonly recoveryVerifyGroup: string;
  readonly stateDir: string;
  readonly timeoutSeconds: number;
  readonly waitSeconds: number;
};

type ProxyServiceConfig = {
  readonly serviceFile: string;
  readonly serviceName: string;
  readonly stateDir: string;
  readonly systemdUserDir: string;
};

const DEFAULT_PROXY_MCP_URL = "http://127.0.0.1:8123/mcp";
const emptyString = () => "";

const commandText = (command: string, args: ReadonlyArray<string>) => A.join([command, ...args], " ");

const shellQuote = (value: string): string => `'${value.replaceAll("'", "'\"'\"'")}'`;

const homeDirectory = (): string => process.env.HOME ?? process.cwd();

const envValue = (name: string, fallback: string): string =>
  pipe(
    O.fromUndefinedOr(process.env[name]),
    O.filter(Str.isNonEmpty),
    O.getOrElse(() => fallback)
  );

const intEnvValue = (name: string, fallback: number): number => {
  const parsed = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const booleanEnvValue = (name: string, fallback: boolean): boolean => {
  const normalized = Str.toLowerCase(Str.trim(process.env[name] ?? ""));
  if (normalized === "true" || normalized === "1" || normalized === "yes") {
    return true;
  }
  if (normalized === "false" || normalized === "0" || normalized === "no") {
    return false;
  }
  return fallback;
};

const proxyPortFromUrl = (healthUrl: string): string => {
  try {
    return new URL(healthUrl).port || "8123";
  } catch {
    return "8123";
  }
};

const proxyEnsureConfig = (path: Path.Path): ProxyEnsureConfig => {
  const healthUrl = envValue("GRAPHITI_PROXY_HEALTH_URL", "http://127.0.0.1:8123/healthz");
  const stateDir = path.join(envValue("XDG_STATE_HOME", path.join(homeDirectory(), ".local", "state")), "beep");
  const runtimeDir = envValue("XDG_RUNTIME_DIR", "/tmp");
  return {
    falkorContainer: envValue(
      "GRAPHITI_PROXY_FALKOR_CONTAINER",
      envValue("FALKOR_CONTAINER", "graphiti-mcp-falkordb-1")
    ),
    graphitiContainer: envValue(
      "GRAPHITI_PROXY_GRAPHITI_CONTAINER",
      envValue("GRAPHITI_CONTAINER", "graphiti-mcp-graphiti-mcp-1")
    ),
    healthUrl,
    logFile: path.join(stateDir, "graphiti-proxy.log"),
    pidFile: envValue("GRAPHITI_PROXY_PID_FILE", path.join(runtimeDir, "beep-graphiti-proxy.pid")),
    port: proxyPortFromUrl(healthUrl),
    recoverOnUnhealthy: booleanEnvValue("GRAPHITI_PROXY_RECOVER_ON_UNHEALTHY", true),
    recoveryMcpUrl: envValue("GRAPHITI_PROXY_RECOVERY_MCP_URL", "http://127.0.0.1:8000/mcp"),
    recoveryVerifyGroup: envValue("GRAPHITI_PROXY_RECOVERY_GROUP", "beep_dev"),
    stateDir,
    timeoutSeconds: intEnvValue("GRAPHITI_PROXY_START_TIMEOUT_SECONDS", 20),
    waitSeconds: intEnvValue("GRAPHITI_RECOVERY_WAIT_SECONDS", intEnvValue("WAIT_SECONDS", 180)),
  };
};

const proxyServiceConfig = (path: Path.Path): ProxyServiceConfig => {
  const serviceName = envValue("GRAPHITI_PROXY_SERVICE_NAME", "beep-graphiti-proxy.service");
  const systemdUserDir = path.join(
    envValue("XDG_CONFIG_HOME", path.join(homeDirectory(), ".config")),
    "systemd",
    "user"
  );
  const stateDir = path.join(envValue("XDG_STATE_HOME", path.join(homeDirectory(), ".local", "state")), "beep");
  return {
    serviceFile: path.join(systemdUserDir, serviceName),
    serviceName,
    stateDir,
    systemdUserDir,
  };
};

const collectStepOutput = (step: QualityTaskStep) =>
  Effect.scoped(
    Effect.gen(function* () {
      const handle = yield* ChildProcess.make(step.command, [...step.args], {
        cwd: step.cwd,
        stdout: "pipe",
        stderr: "pipe",
      });
      const output = yield* handle.all.pipe(
        Stream.decodeText(),
        Stream.runFold(emptyString, (acc, chunk) => acc + chunk)
      );
      const exitCode = yield* handle.exitCode;
      return {
        exitCode,
        output: Str.trim(output),
      };
    })
  );

const collectSuccessfulOutput = Effect.fn("GraphitiProxyOps.collectSuccessfulOutput")(function* (
  step: QualityTaskStep
): Effect.fn.Return<string, GraphitiProxyOpsError, ChildProcessSpawner.ChildProcessSpawner> {
  const result = yield* collectStepOutput(step).pipe(
    Effect.mapError(
      (cause) =>
        new GraphitiProxyOpsError({
          message: `Failed to run ${commandText(step.command, step.args)}.`,
          command: commandText(step.command, step.args),
          cause,
        })
    )
  );
  if (result.exitCode !== 0) {
    return yield* new GraphitiProxyOpsError({
      message: `${step.label} failed with exit code ${result.exitCode}.`,
      command: commandText(step.command, step.args),
      exitCode: result.exitCode,
    });
  }
  return result.output;
});

const runInheritedStep = Effect.fn("GraphitiProxyOps.runInheritedStep")(function* (
  step: QualityTaskStep
): Effect.fn.Return<void, GraphitiProxyOpsError, ChildProcessSpawner.ChildProcessSpawner> {
  yield* Console.log(`[graphiti-proxy] ${step.label}: ${commandText(step.command, step.args)}`);
  const exitCode = yield* Effect.scoped(
    Effect.gen(function* () {
      const handle = yield* ChildProcess.make(step.command, [...step.args], {
        cwd: step.cwd,
        env: step.env,
        extendEnv: true,
        stdin: "inherit",
        stdout: "inherit",
        stderr: "inherit",
      });
      return yield* handle.exitCode;
    })
  ).pipe(
    Effect.mapError(
      (cause) =>
        new GraphitiProxyOpsError({
          message: `Failed to spawn ${commandText(step.command, step.args)}.`,
          command: commandText(step.command, step.args),
          cause,
        })
    )
  );

  if (exitCode !== 0) {
    return yield* new GraphitiProxyOpsError({
      message: `${step.label} failed with exit code ${exitCode}.`,
      command: commandText(step.command, step.args),
      exitCode,
    });
  }
});

const checkProxyHealth = Effect.fn("GraphitiProxyOps.checkProxyHealth")(function* (
  config: ProxyEnsureConfig
): Effect.fn.Return<boolean, never, ChildProcessSpawner.ChildProcessSpawner> {
  const exitCode = yield* Effect.scoped(
    Effect.gen(function* () {
      const handle = yield* ChildProcess.make("curl", ["-fsS", "-m", "2", config.healthUrl], {
        stdout: "ignore",
        stderr: "ignore",
      });
      return yield* handle.exitCode;
    })
  ).pipe(Effect.orElseSucceed(() => 1));

  return exitCode === 0;
});

const collectOptionalOutput = (step: QualityTaskStep) =>
  collectStepOutput(step).pipe(Effect.orElseSucceed(() => ({ exitCode: 1, output: "" }) as const));

const dockerAvailable = Effect.fn("GraphitiProxyOps.dockerAvailable")(function* (
  repoRoot: string
): Effect.fn.Return<boolean, never, ChildProcessSpawner.ChildProcessSpawner> {
  const result = yield* collectOptionalOutput(
    new QualityTaskStep({
      label: "graphiti-recover:docker-version",
      command: "docker",
      args: ["--version"],
      cwd: repoRoot,
    })
  );
  return result.exitCode === 0;
});

const containerExists = Effect.fn("GraphitiProxyOps.containerExists")(function* (
  repoRoot: string,
  container: string
): Effect.fn.Return<boolean, never, ChildProcessSpawner.ChildProcessSpawner> {
  const result = yield* collectOptionalOutput(
    new QualityTaskStep({
      label: "graphiti-recover:docker-inspect",
      command: "docker",
      args: ["inspect", container],
      cwd: repoRoot,
    })
  );
  return result.exitCode === 0;
});

const containerHealth = Effect.fn("GraphitiProxyOps.containerHealth")(function* (
  repoRoot: string,
  container: string
): Effect.fn.Return<string, never, ChildProcessSpawner.ChildProcessSpawner> {
  const result = yield* collectOptionalOutput(
    new QualityTaskStep({
      label: "graphiti-recover:container-health",
      command: "docker",
      args: ["inspect", "--format", "{{.State.Health.Status}}", container],
      cwd: repoRoot,
    })
  );
  return result.exitCode === 0 && Str.isNonEmpty(result.output) ? result.output : "unknown";
});

const waitForHealthyContainers = Effect.fn("GraphitiProxyOps.waitForHealthyContainers")(function* (
  repoRoot: string,
  config: ProxyEnsureConfig
): Effect.fn.Return<void, GraphitiProxyOpsError, ChildProcessSpawner.ChildProcessSpawner> {
  const start = yield* Clock.currentTimeMillis;
  const deadline = start + config.waitSeconds * 1000;

  while ((yield* Clock.currentTimeMillis) <= deadline) {
    const falkor = yield* containerHealth(repoRoot, config.falkorContainer);
    const graphiti = yield* containerHealth(repoRoot, config.graphitiContainer);
    yield* Console.log(`[graphiti-recover] health falkor=${falkor} graphiti=${graphiti}`);

    if (falkor === "healthy" && graphiti === "healthy") {
      return;
    }

    yield* Effect.sleep(Duration.seconds(5));
  }

  return yield* new GraphitiProxyOpsError({
    message: "Timed out waiting for Graphiti backing containers to become healthy.",
    exitCode: 1,
  });
});

const recoverGraphitiStackInternal = Effect.fn("GraphitiProxyOps.recoverGraphitiStackInternal")(function* (
  repoRoot: string,
  config: ProxyEnsureConfig,
  force: boolean,
  dryRun: boolean
): Effect.fn.Return<void, GraphitiProxyOpsError, ChildProcessSpawner.ChildProcessSpawner> {
  if (dryRun) {
    yield* Console.log("[graphiti-recover] Dry-run mode enabled; no containers or MCP services will be mutated.");
    yield* Console.log(
      `[graphiti-recover] Planned restart targets: ${config.falkorContainer}, ${config.graphitiContainer}`
    );
    yield* Console.log(`[graphiti-recover] Planned MCP endpoint: ${config.recoveryMcpUrl}`);
    yield* Console.log(`[graphiti-recover] Planned verify group: ${config.recoveryVerifyGroup}`);
    return;
  }

  if (!force && !config.recoverOnUnhealthy) {
    yield* Console.log("[graphiti-recover] Recovery disabled by GRAPHITI_PROXY_RECOVER_ON_UNHEALTHY.");
    return;
  }

  if (!(yield* dockerAvailable(repoRoot))) {
    yield* Console.log("[graphiti-recover] docker is unavailable; skipping backing stack recovery.");
    return;
  }

  const falkorExists = yield* containerExists(repoRoot, config.falkorContainer);
  const graphitiExists = yield* containerExists(repoRoot, config.graphitiContainer);
  if (!falkorExists || !graphitiExists) {
    yield* Console.log("[graphiti-recover] Graphiti backing containers were not found; skipping recovery.");
    return;
  }

  const falkor = yield* containerHealth(repoRoot, config.falkorContainer);
  const graphiti = yield* containerHealth(repoRoot, config.graphitiContainer);
  if (
    !shouldRecoverGraphitiStackForTesting({
      falkor,
      force,
      graphiti,
      recoverOnUnhealthy: config.recoverOnUnhealthy,
    })
  ) {
    yield* Console.log("[graphiti-recover] Backing containers are already healthy.");
    return;
  }

  yield* Console.log(`[graphiti-recover] Restarting ${config.falkorContainer} and ${config.graphitiContainer}.`);
  yield* runInheritedStep(
    new QualityTaskStep({
      label: "graphiti-recover:docker-restart",
      command: "docker",
      args: ["restart", config.falkorContainer, config.graphitiContainer],
      cwd: repoRoot,
    })
  );
  yield* waitForHealthyContainers(repoRoot, config);
});

const readLivePid = Effect.fn("GraphitiProxyOps.readLivePid")(function* (
  config: ProxyEnsureConfig
): Effect.fn.Return<O.Option<string>, never, FileSystem.FileSystem> {
  const fs = yield* FileSystem.FileSystem;
  const exists = yield* fs.exists(config.pidFile).pipe(Effect.orElseSucceed(thunkFalse));
  if (!exists) {
    return O.none<string>();
  }

  const pid = yield* fs.readFileString(config.pidFile).pipe(Effect.orElseSucceed(emptyString), Effect.map(Str.trim));
  if (Str.isEmpty(pid)) {
    yield* fs.remove(config.pidFile).pipe(Effect.ignore);
    return O.none<string>();
  }

  const alive = yield* Effect.sync(() => {
    try {
      process.kill(Number(pid), 0);
      return true;
    } catch {
      return false;
    }
  });
  if (!alive) {
    yield* fs.remove(config.pidFile).pipe(Effect.ignore);
    return O.none<string>();
  }

  return O.some(pid);
});

const startProxyDetached = Effect.fn("GraphitiProxyOps.startProxyDetached")(function* (
  repoRoot: string,
  config: ProxyEnsureConfig
): Effect.fn.Return<
  void,
  GraphitiProxyOpsError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  yield* fs.makeDirectory(config.stateDir, { recursive: true }).pipe(
    Effect.mapError(
      (cause) =>
        new GraphitiProxyOpsError({
          message: `Failed to create ${config.stateDir}.`,
          cause,
        })
    )
  );
  yield* fs.makeDirectory(path.dirname(config.pidFile), { recursive: true }).pipe(Effect.ignore);

  yield* Console.log(
    `[graphiti-proxy:ensure] Starting proxy via 'bun run beep graphiti proxy' (log: ${config.logFile}).`
  );
  const launchScript = [
    `mkdir -p ${shellQuote(config.stateDir)} ${shellQuote(path.dirname(config.pidFile))}`,
    "if command -v setsid >/dev/null 2>&1; then",
    `  setsid bun run beep graphiti proxy >> ${shellQuote(config.logFile)} 2>&1 < /dev/null &`,
    "else",
    `  nohup bun run beep graphiti proxy >> ${shellQuote(config.logFile)} 2>&1 < /dev/null &`,
    "fi",
    `echo "$!" > ${shellQuote(config.pidFile)}`,
  ].join("\n");

  yield* runInheritedStep(
    new QualityTaskStep({
      label: "graphiti-proxy:start-detached",
      command: "sh",
      args: ["-c", launchScript],
      cwd: repoRoot,
    })
  );
});

const tailLog = Effect.fn("GraphitiProxyOps.tailLog")(function* (
  config: ProxyEnsureConfig
): Effect.fn.Return<void, never, FileSystem.FileSystem> {
  const fs = yield* FileSystem.FileSystem;
  const exists = yield* fs.exists(config.logFile).pipe(Effect.orElseSucceed(thunkFalse));
  if (!exists) {
    return;
  }

  const text = yield* fs.readFileString(config.logFile).pipe(Effect.orElseSucceed(emptyString));
  const tail = pipe(Str.split(text, "\n"), A.takeRight(40), A.join("\n"));
  if (Str.isNonEmpty(tail)) {
    yield* Console.error("[graphiti-proxy:ensure] Recent proxy log tail:");
    yield* Console.error(tail);
  }
});

/**
 * Ensure the local Graphiti proxy is healthy, starting it in the background when needed.
 *
 * @returns Effect that exits successfully once the health endpoint responds.
 * @example
 * ```ts
 * import { ensureGraphitiProxy } from "@beep/repo-cli/commands/Graphiti/internal/ProxyOps"
 * const program = ensureGraphitiProxy()
 * ```
 * @category use-cases
 * @since 0.0.0
 */
export const ensureGraphitiProxy = Effect.fn("GraphitiProxyOps.ensureGraphitiProxy")(function* (): Effect.fn.Return<
  void,
  GraphitiProxyOpsError,
  GraphitiProxyOpsEnvironment
> {
  const path = yield* Path.Path;
  const fs = yield* FileSystem.FileSystem;
  const repoRoot = yield* findRepoRoot().pipe(
    Effect.mapError((cause) => new GraphitiProxyOpsError({ message: "Failed to locate repository root.", cause }))
  );
  const config = proxyEnsureConfig(path);
  const start = yield* Clock.currentTimeMillis;
  const deadline = start + config.timeoutSeconds * 1000;

  yield* fs
    .makeDirectory(config.stateDir, { recursive: true })
    .pipe(
      Effect.mapError((cause) => new GraphitiProxyOpsError({ message: `Failed to create ${config.stateDir}.`, cause }))
    );
  yield* fs.makeDirectory(path.dirname(config.pidFile), { recursive: true }).pipe(Effect.ignore);

  yield* recoverGraphitiStackInternal(repoRoot, config, false, false).pipe(
    Effect.catchTag(
      "GraphitiProxyOpsError",
      Effect.fn(function* (error) {
        yield* Console.error(`[graphiti-proxy:ensure] ${error.message}; continuing ensure loop.`);
      })
    )
  );

  while ((yield* Clock.currentTimeMillis) <= deadline) {
    const healthy = yield* checkProxyHealth(config);
    if (healthy) {
      const trackedPid = yield* readLivePid(config);
      const pidSuffix = O.isSome(trackedPid) ? ` (pid ${trackedPid.value})` : "";
      yield* Console.log(`[graphiti-proxy:ensure] Proxy is healthy at ${config.healthUrl}${pidSuffix}.`);
      return;
    }

    const livePid = yield* readLivePid(config);
    if (O.isNone(livePid)) {
      yield* startProxyDetached(repoRoot, config);
    }

    yield* Effect.sleep(Duration.seconds(1));
  }

  yield* Console.error(`[graphiti-proxy:ensure] Proxy did not become healthy within ${config.timeoutSeconds}s.`);
  yield* tailLog(config);
  return yield* new GraphitiProxyOpsError({
    message: `Graphiti proxy is not healthy at ${config.healthUrl}.`,
    exitCode: 1,
  });
});

/**
 * Run a knowledge-graph CLI command with the local Graphiti proxy ensured first.
 *
 * @param args - Arguments forwarded to `bun run beep kg`.
 * @returns Effect that runs the forwarded knowledge-graph command.
 * @example
 * ```ts
 * import { runKgWithGraphitiProxy } from "@beep/repo-cli/commands/Graphiti/internal/ProxyOps"
 * const program = runKgWithGraphitiProxy(["verify", "--target", "both"])
 * ```
 * @category use-cases
 * @since 0.0.0
 */
export const runKgWithGraphitiProxy = Effect.fn("GraphitiProxyOps.runKgWithGraphitiProxy")(function* (
  args: ReadonlyArray<string>
): Effect.fn.Return<void, GraphitiProxyOpsError, GraphitiProxyOpsEnvironment> {
  const repoRoot = yield* findRepoRoot().pipe(
    Effect.mapError((cause) => new GraphitiProxyOpsError({ message: "Failed to locate repository root.", cause }))
  );

  yield* ensureGraphitiProxy();
  yield* runInheritedStep(
    new QualityTaskStep({
      label: "kg:proxy",
      command: "bun",
      args: ["run", "beep", "kg", ...args],
      cwd: repoRoot,
      env: {
        BEEP_GRAPHITI_URL: envValue("BEEP_GRAPHITI_URL", DEFAULT_PROXY_MCP_URL),
      },
    })
  );
});

/**
 * Recover the local Graphiti backing stack by restarting unhealthy containers.
 *
 * @param options - Recovery execution options.
 * @returns Effect that restarts unhealthy Graphiti backing containers.
 * @example
 * ```ts
 * import { recoverGraphitiStack } from "@beep/repo-cli/commands/Graphiti/internal/ProxyOps"
 * const program = recoverGraphitiStack({ dryRun: true })
 * ```
 * @category use-cases
 * @since 0.0.0
 */
export const recoverGraphitiStack = Effect.fn("GraphitiProxyOps.recoverGraphitiStack")(function* (options?: {
  readonly dryRun?: boolean;
  readonly force?: boolean;
}): Effect.fn.Return<void, GraphitiProxyOpsError, GraphitiProxyOpsEnvironment> {
  const path = yield* Path.Path;
  const repoRoot = yield* findRepoRoot().pipe(
    Effect.mapError((cause) => new GraphitiProxyOpsError({ message: "Failed to locate repository root.", cause }))
  );
  const config = proxyEnsureConfig(path);
  yield* recoverGraphitiStackInternal(repoRoot, config, options?.force ?? false, options?.dryRun ?? false);
});

/**
 * Decide whether Graphiti recovery should restart the backing containers.
 *
 * @internal
 * @param options - Recovery decision inputs.
 * @returns Whether the recovery routine should restart the backing containers.
 * @example
 * ```ts
 * import { shouldRecoverGraphitiStackForTesting } from "@beep/repo-cli/commands/Graphiti/internal/ProxyOps"
 * const shouldRecover = shouldRecoverGraphitiStackForTesting({
 *   falkor: "unhealthy",
 *   force: false,
 *   graphiti: "healthy",
 *   recoverOnUnhealthy: true
 * })
 * ```
 * @category testing
 * @since 0.0.0
 */
export const shouldRecoverGraphitiStackForTesting = (options: {
  readonly recoverOnUnhealthy: boolean;
  readonly force: boolean;
  readonly falkor: string;
  readonly graphiti: string;
}): boolean =>
  options.force || (options.recoverOnUnhealthy && (options.falkor !== "healthy" || options.graphiti !== "healthy"));

const renderServiceUnit = (repoRoot: string, bunBin: string, config: ProxyServiceConfig): string =>
  [
    "[Unit]",
    "Description=beep Graphiti MCP queue proxy",
    "After=network-online.target",
    "Wants=network-online.target",
    "",
    "[Service]",
    "Type=simple",
    `WorkingDirectory=${repoRoot}`,
    `ExecStart=${bunBin} run beep graphiti proxy`,
    "Restart=always",
    "RestartSec=2",
    `Environment=PATH=/usr/local/bin:/usr/bin:/bin:${homeDirectory()}/.bun/bin`,
    "Environment=GRAPHITI_PROXY_HOST=127.0.0.1",
    "Environment=GRAPHITI_PROXY_PORT=8123",
    "Environment=GRAPHITI_PROXY_UPSTREAM=http://127.0.0.1:8000/mcp",
    `StandardOutput=append:${config.stateDir}/graphiti-proxy.log`,
    `StandardError=append:${config.stateDir}/graphiti-proxy.err.log`,
    "",
    "[Install]",
    "WantedBy=default.target",
    "",
  ].join("\n");

/**
 * Install and start the user-level systemd unit for the Graphiti proxy.
 *
 * @returns Effect that writes, enables, starts, and displays the user unit status.
 * @example
 * ```ts
 * import { installGraphitiProxyService } from "@beep/repo-cli/commands/Graphiti/internal/ProxyOps"
 * const program = installGraphitiProxyService()
 * ```
 * @category use-cases
 * @since 0.0.0
 */
export const installGraphitiProxyService = Effect.fn("GraphitiProxyOps.installGraphitiProxyService")(
  function* (): Effect.fn.Return<void, GraphitiProxyOpsError, GraphitiProxyOpsEnvironment> {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const repoRoot = yield* findRepoRoot().pipe(
      Effect.mapError((cause) => new GraphitiProxyOpsError({ message: "Failed to locate repository root.", cause }))
    );
    const config = proxyServiceConfig(path);
    const bunBin = yield* collectSuccessfulOutput(
      new QualityTaskStep({ label: "which:bun", command: "which", args: ["bun"], cwd: repoRoot })
    );

    yield* fs.makeDirectory(config.systemdUserDir, { recursive: true }).pipe(
      Effect.mapError(
        (cause) =>
          new GraphitiProxyOpsError({
            message: `Failed to create ${config.systemdUserDir}.`,
            cause,
          })
      )
    );
    yield* fs.makeDirectory(config.stateDir, { recursive: true }).pipe(
      Effect.mapError(
        (cause) =>
          new GraphitiProxyOpsError({
            message: `Failed to create ${config.stateDir}.`,
            cause,
          })
      )
    );
    yield* fs.writeFileString(config.serviceFile, renderServiceUnit(repoRoot, bunBin, config)).pipe(
      Effect.mapError(
        (cause) =>
          new GraphitiProxyOpsError({
            message: `Failed to write ${config.serviceFile}.`,
            cause,
          })
      )
    );
    yield* Console.log(`[graphiti-proxy:service] Wrote user unit: ${config.serviceFile}`);

    yield* runInheritedStep(
      new QualityTaskStep({
        label: "systemctl:daemon-reload",
        command: "systemctl",
        args: ["--user", "daemon-reload"],
        cwd: repoRoot,
      })
    );
    yield* runInheritedStep(
      new QualityTaskStep({
        label: "systemctl:enable-now",
        command: "systemctl",
        args: ["--user", "enable", "--now", config.serviceName],
        cwd: repoRoot,
      })
    );
    yield* runInheritedStep(
      new QualityTaskStep({
        label: "systemctl:is-active",
        command: "systemctl",
        args: ["--user", "is-active", "--quiet", config.serviceName],
        cwd: repoRoot,
      })
    );
    yield* runInheritedStep(
      new QualityTaskStep({
        label: "systemctl:status",
        command: "systemctl",
        args: ["--user", "--no-pager", "--full", "status", config.serviceName],
        cwd: repoRoot,
      })
    );
    yield* Console.log("[graphiti-proxy:service] Service enabled and started.");
  }
);
