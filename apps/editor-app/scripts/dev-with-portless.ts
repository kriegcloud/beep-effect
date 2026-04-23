import { fileURLToPath } from "node:url";
import { $I } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { BunRuntime } from "@effect/platform-bun";
import * as BunHttpClient from "@effect/platform-bun/BunHttpClient";
import * as BunServices from "@effect/platform-bun/BunServices";
import { Config, Deferred, Duration, Effect, FileSystem, Layer, Path, Runtime, Schedule } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import type * as PlatformError from "effect/PlatformError";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { HttpClient, HttpClientRequest } from "effect/unstable/http";
import { ChildProcess } from "effect/unstable/process";
import type { ChildProcessHandle } from "effect/unstable/process/ChildProcessSpawner";

const $EditorDevId = $I.create("apps/editor-app/scripts/dev-with-portless");

class DevWithPortlessError extends TaggedErrorClass<DevWithPortlessError>($EditorDevId`DevWithPortlessError`)(
  "DevWithPortlessError",
  {
    message: S.String,
  },
  $EditorDevId.annote("DevWithPortlessError", {
    description: "Raised when the editor dev script cannot complete a required setup step.",
  })
) {}

class ManagedChildExitError extends TaggedErrorClass<ManagedChildExitError>($EditorDevId`ManagedChildExitError`)(
  "ManagedChildExitError",
  {
    child: S.String,
    message: S.String,
    exitCode: S.Number,
  },
  $EditorDevId.annote("ManagedChildExitError", {
    description: "Raised when a managed dev child exits and should determine the parent process exit code.",
  })
) {
  override readonly [Runtime.errorExitCode] = this.exitCode;
}

const sidecarHost = "editor-sidecar.localhost";
const frontendRouteName = "editor";
const sidecarRouteName = "editor-sidecar";
const sidecarEntrypoint = "packages/editor/runtime/src/main.ts";
const sidecarHealthPath = "/api/v0/health";
const sidecarStartupPollInterval = Duration.millis(250);
const sidecarStartupRetries = 60;
const managedChildKillTimeout = Duration.seconds(3);
const portlessPidFile = "proxy.pid";
const portlessRoutesFile = "routes.json";
const portlessTlsMarkerFile = "proxy.tls";

class PortlessRoute extends S.Class<PortlessRoute>($EditorDevId`PortlessRoute`)(
  {
    hostname: S.String,
    port: S.Int,
    pid: S.Int,
  },
  $EditorDevId.annote("PortlessRoute", {
    description: "A portless route entry persisted in the local proxy state directory.",
  })
) {}

const PortlessRoutes = S.Array(PortlessRoute).annotate(
  $EditorDevId.annote("PortlessRoutes", {
    description: "The persisted list of active portless routes.",
  })
);

const decodePortlessRoutes = S.decodeUnknownEffect(S.fromJsonString(PortlessRoutes));
const decodeNumberFromString = S.decodeUnknownEffect(S.NumberFromString);

const makeManagedChildExitError = (child: string, message: string, exitCode: number) =>
  new ManagedChildExitError({
    child,
    message,
    exitCode,
  });

const mapManagedChildPlatformError = (child: string, error: PlatformError.PlatformError) =>
  makeManagedChildExitError(
    child,
    error.message,
    Str.includes("SIGINT")(error.message) || Str.includes("SIGTERM")(error.message) ? 130 : 1
  );

const makePortlessCommand = (
  routeName: string,
  args: ReadonlyArray<string>,
  environment: Readonly<Record<string, string>> = {},
  currentWorkingDirectory?: string
) =>
  ChildProcess.make("portless", [routeName, ...args], {
    cwd: currentWorkingDirectory,
    env: {
      PORTLESS_HTTPS: "1",
      ...environment,
    },
    extendEnv: true,
    killSignal: "SIGTERM",
    forceKillAfter: managedChildKillTimeout,
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });

const directRouteStatus = Effect.fn("EditorDev.directRouteStatus")(function* (
  targetPort: number,
  targetPath: string,
  method: "GET" | "HEAD"
) {
  const request = HttpClientRequest.make(method)(`http://127.0.0.1:${targetPort}${targetPath}`);
  const responseOption = yield* HttpClient.execute(request).pipe(Effect.option);

  if (O.isNone(responseOption)) {
    return O.none<number>();
  }

  const response = responseOption.value;
  const status = response.status;

  if (method === "GET") {
    yield* response.arrayBuffer.pipe(Effect.ignore);
  }

  return O.some(status);
});

const isProcessAlive = Effect.fn("EditorDev.isProcessAlive")(function* (pid: number) {
  return yield* Effect.sync(() => {
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  });
});

const runRequiredCommand = Effect.fn("EditorDev.runRequiredCommand")(function* (
  command: ChildProcess.Command,
  commandLabel: string
) {
  const exitCode = yield* Effect.scoped(
    Effect.gen(function* () {
      const handle = yield* command;
      return yield* handle.exitCode.pipe(Effect.mapError((error) => mapManagedChildPlatformError(commandLabel, error)));
    })
  );

  if (exitCode !== 0) {
    return yield* makeManagedChildExitError(commandLabel, `${commandLabel} exited with code ${exitCode}.`, exitCode);
  }
});

const resolvePortlessStateDirectory = Effect.fn("EditorDev.resolvePortlessStateDirectory")(function* (
  portlessProxyPort: number
) {
  const path = yield* Path.Path;
  const configuredPortlessStateDirectory = yield* Config.option(Config.string("PORTLESS_STATE_DIR"));

  if (O.isSome(configuredPortlessStateDirectory)) {
    return configuredPortlessStateDirectory.value;
  }

  if (portlessProxyPort < 1024) {
    return "/tmp/portless";
  }

  const homeDirectory = yield* Config.string("HOME");
  return path.resolve(homeDirectory, ".portless");
});

const readNumericFile = Effect.fn("EditorDev.readNumericFile")(function* (filePath: string) {
  const fs = yield* FileSystem.FileSystem;
  const fileExists = yield* fs.exists(filePath).pipe(Effect.orElseSucceed(() => false));

  if (!fileExists) {
    return O.none<number>();
  }

  return yield* fs.readFileString(filePath).pipe(
    Effect.map(Str.trim),
    Effect.flatMap(
      Effect.fnUntraced(function* (input) {
        return yield* decodeNumberFromString(input);
      })
    ),
    Effect.option
  );
});

const loadPortlessRoutes = Effect.fn("EditorDev.loadPortlessRoutes")(function* (portlessStateDirectory: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const routesPath = path.resolve(portlessStateDirectory, portlessRoutesFile);
  const routesPathExists = yield* fs.exists(routesPath).pipe(Effect.orElseSucceed(() => false));

  if (!routesPathExists) {
    return A.empty<PortlessRoute>();
  }

  return yield* fs.readFileString(routesPath).pipe(
    Effect.flatMap(
      Effect.fnUntraced(function* (input) {
        return yield* decodePortlessRoutes(input);
      })
    ),
    Effect.orElseSucceed(A.empty<PortlessRoute>)
  );
});

const findPortlessRoute = Effect.fn("EditorDev.findPortlessRoute")(function* (
  portlessStateDirectory: string,
  host: string
) {
  const routes = yield* loadPortlessRoutes(portlessStateDirectory);
  return A.findFirst(routes, (route) => route.hostname === host);
});

const ensurePortlessHttps = Effect.fn("EditorDev.ensurePortlessHttps")(function* (portlessStateDirectory: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const proxyPidPath = path.resolve(portlessStateDirectory, portlessPidFile);
  const tlsMarkerPath = path.resolve(portlessStateDirectory, portlessTlsMarkerFile);
  const proxyPidOption = yield* readNumericFile(proxyPidPath);
  const tlsMarkerExists = yield* fs.exists(tlsMarkerPath).pipe(Effect.orElseSucceed(() => false));
  const proxyIsRunning = yield* O.match(proxyPidOption, {
    onNone: () => Effect.succeed(false),
    onSome: isProcessAlive,
  });

  if (tlsMarkerExists && proxyIsRunning) {
    return;
  }

  yield* runRequiredCommand(
    ChildProcess.make("portless", ["proxy", "stop"], {
      extendEnv: true,
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
    }),
    "portless proxy stop"
  ).pipe(Effect.ignore);

  yield* runRequiredCommand(
    ChildProcess.make("portless", ["proxy", "start", "--https"], {
      env: {
        PORTLESS_HTTPS: "1",
      },
      extendEnv: true,
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
    }),
    "portless proxy start --https"
  );
});

const awaitSidecarHealth = Effect.fn("EditorDev.awaitSidecarHealth")(function* (
  portlessStateDirectory: string,
  portlessProxyPort: number
) {
  const timeoutMessage = `Timed out waiting for https://${sidecarHost}:${portlessProxyPort}${sidecarHealthPath} to become healthy.`;

  yield* Effect.gen(function* () {
    const sidecarRouteOption = yield* findPortlessRoute(portlessStateDirectory, sidecarHost);

    if (O.isNone(sidecarRouteOption)) {
      return yield* new DevWithPortlessError({ message: timeoutMessage });
    }

    const status = yield* directRouteStatus(sidecarRouteOption.value.port, sidecarHealthPath, "GET");

    if (O.isSome(status) && status.value === 200) {
      return;
    }

    return yield* new DevWithPortlessError({ message: timeoutMessage });
  }).pipe(
    Effect.retry(
      Schedule.spaced(sidecarStartupPollInterval).pipe(Schedule.both(Schedule.recurs(sidecarStartupRetries)))
    )
  );
});

const awaitManagedChildStartupExit = Effect.fn("EditorDev.awaitManagedChildStartupExit")(function* (child: {
  readonly label: string;
  readonly handle: ChildProcessHandle;
}) {
  const exitCode = yield* child.handle.exitCode.pipe(
    Effect.mapError((error) => mapManagedChildPlatformError(child.label, error))
  );

  if (exitCode === 0) {
    return yield* makeManagedChildExitError(child.label, `${child.label} exited before becoming healthy.`, 1);
  }

  return yield* makeManagedChildExitError(
    child.label,
    `${child.label} exited with code ${exitCode} before becoming healthy.`,
    exitCode
  );
});

const watchManagedChild = Effect.fn("EditorDev.watchManagedChild")(function* (
  child: {
    readonly label: string;
    readonly handle: ChildProcessHandle;
  },
  exitDeferred: Deferred.Deferred<void, ManagedChildExitError>
) {
  const exitResult = yield* child.handle.exitCode.pipe(
    Effect.match({
      onFailure: (error) => O.some(mapManagedChildPlatformError(child.label, error)),
      onSuccess: (exitCode) =>
        exitCode === 0
          ? O.none<ManagedChildExitError>()
          : O.some(makeManagedChildExitError(child.label, `${child.label} exited with code ${exitCode}.`, exitCode)),
    })
  );

  if (O.isNone(exitResult)) {
    yield* Deferred.succeed(exitDeferred, void 0).pipe(Effect.ignore);
    return;
  }

  yield* Deferred.fail(exitDeferred, exitResult.value).pipe(Effect.ignore);
});

const runDevWithPortless = Effect.fn("EditorDev.runWithPortless")(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const portlessProxyPort = yield* Config.number("PORTLESS_PORT").pipe(Config.withDefault(1355));
  const portlessStateDirectory = yield* resolvePortlessStateDirectory(portlessProxyPort);
  const currentDirectory = fileURLToPath(new URL(".", import.meta.url));
  const repoRoot = path.resolve(currentDirectory, "../../..");
  const sidecarEntrypointAbsolute = path.resolve(repoRoot, sidecarEntrypoint);
  const sidecarEntrypointExists = yield* fs.exists(sidecarEntrypointAbsolute).pipe(Effect.orElseSucceed(() => false));

  if (!sidecarEntrypointExists) {
    return yield* new DevWithPortlessError({
      message: `Could not find the sidecar entrypoint at ${sidecarEntrypointAbsolute}.`,
    });
  }

  yield* ensurePortlessHttps(portlessStateDirectory);

  const existingSidecarRouteOption = yield* findPortlessRoute(portlessStateDirectory, sidecarHost);
  const existingSidecarStatus = yield* O.match(existingSidecarRouteOption, {
    onNone: () => Effect.succeed(O.none<number>()),
    onSome: (route) => directRouteStatus(route.port, sidecarHealthPath, "GET"),
  });
  const spawnSidecar = Effect.gen(function* () {
    return O.some(
      yield* makePortlessCommand(
        sidecarRouteName,
        ["bun", "run", sidecarEntrypoint],
        {
          BEEP_EDITOR_DEVTOOLS_ENABLED: "false",
          BEEP_EDITOR_HOST: "127.0.0.1",
          BEEP_EDITOR_OTLP_ENABLED: "false",
        },
        repoRoot
      )
    );
  });

  const sidecarHandleOption = yield* O.match(existingSidecarStatus, {
    onNone: () => spawnSidecar,
    onSome: (status) => (status === 200 ? Effect.succeed(O.none()) : spawnSidecar),
  });

  if (O.isSome(sidecarHandleOption)) {
    yield* Effect.raceFirst(
      awaitSidecarHealth(portlessStateDirectory, portlessProxyPort),
      awaitManagedChildStartupExit({
        label: sidecarRouteName,
        handle: sidecarHandleOption.value,
      })
    );
  }

  const frontendHandle = yield* makePortlessCommand(frontendRouteName, ["vite"]);
  const managedChildren = O.isSome(sidecarHandleOption)
    ? [
        { label: frontendRouteName, handle: frontendHandle },
        { label: sidecarRouteName, handle: sidecarHandleOption.value },
      ]
    : [{ label: frontendRouteName, handle: frontendHandle }];
  const exitDeferred = yield* Deferred.make<void, ManagedChildExitError>();

  yield* Effect.forEach(managedChildren, (child) => Effect.forkScoped(watchManagedChild(child, exitDeferred)), {
    concurrency: 2,
    discard: true,
  });

  yield* Deferred.await(exitDeferred);
});

const main = Layer.effectDiscard(
  Effect.scoped(runDevWithPortless()).pipe(Effect.withSpan("EditorDev.runWithPortless"))
).pipe(Layer.provide(Layer.mergeAll(BunServices.layer, BunHttpClient.layer)));

BunRuntime.runMain(Layer.launch(main));
