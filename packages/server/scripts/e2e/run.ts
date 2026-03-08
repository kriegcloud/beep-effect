import { Cause, Duration, Effect, Exit } from "effect"
import { mkdirSync } from "node:fs"
import { createServer } from "node:net"
import { join, resolve } from "node:path"
import { runFixture } from "./FixtureRunner.js"

interface CliOptions {
  readonly fixturePaths: ReadonlyArray<string>
  readonly baseUrl: string
  readonly dbPath: string | null
  readonly startServer: boolean
  readonly port: number
  readonly configPath: string | null
  readonly stateRoot: string | null
  readonly modelStub: boolean
  readonly reportPath: string | null
  readonly vars: Record<string, unknown>
  readonly healthTimeoutMs: number
}

interface ManagedServerRuntime {
  readonly baseUrl: string
  readonly dbPath: string
  readonly stateRoot: string
  readonly generatedConfigPath: string
  readonly stop: Effect.Effect<void, unknown>
}

const usage = () => {
  const lines = [
    "Fixture Runner",
    "",
    "Usage:",
    "  bun packages/server/scripts/e2e/run.ts --fixture fixtures/e2e/channel-smoke.yaml",
    "",
    "Options:",
    "  --fixture <path>          Fixture path (repeatable)",
    "  --base-url <url>          Base URL (default: http://localhost:3000)",
    "  --db-path <path>          SQLite DB path for SQL assertions",
    "  --start-server            Start isolated server for this run",
    "  --port <number>           Port for managed server (default: 3100)",
    "  --config-path <path>      Source agent config for managed server (default: agent.yaml)",
    "  --state-root <path>       Storage root override for managed server",
    "  --model-stub              Force deterministic model stub mode",
    "  --no-model-stub           Disable deterministic model stub mode",
    "  --health-timeout-ms <n>   Managed-server health wait timeout (default: 30000)",
    "  --var key=value           Inject runtime variable (repeatable)",
    "  --report <path>           Write JSON report",
    "  --help                    Show this help"
  ]

  console.log(lines.join("\n"))
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const parseVarValue = (raw: string): unknown => {
  if (raw === "true") {
    return true
  }
  if (raw === "false") {
    return false
  }
  if (/^-?\d+(\.\d+)?$/.test(raw)) {
    const parsed = Number(raw)
    if (!Number.isNaN(parsed)) {
      return parsed
    }
  }
  return raw
}

const parseCliArgs = (argv: ReadonlyArray<string>): CliOptions | "help" => {
  const fixturePaths: Array<string> = []
  let baseUrl = "http://localhost:3000"
  let dbPath: string | null = null
  let startServer = false
  let port = 3100
  let configPath: string | null = null
  let stateRoot: string | null = null
  let modelStub = true
  let reportPath: string | null = null
  let healthTimeoutMs = 30_000
  const vars: Record<string, unknown> = {}

  const nextValue = (args: ReadonlyArray<string>, index: number, flag: string): string => {
    const value = args[index + 1]
    if (value === undefined) {
      throw new Error(`Missing value for ${flag}`)
    }
    return value
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]!
    switch (arg) {
      case "--help":
      case "-h":
        return "help"
      case "--fixture": {
        const value = nextValue(argv, i, arg)
        fixturePaths.push(value)
        i += 1
        break
      }
      case "--base-url": {
        baseUrl = nextValue(argv, i, arg)
        i += 1
        break
      }
      case "--db-path": {
        dbPath = nextValue(argv, i, arg)
        i += 1
        break
      }
      case "--start-server": {
        startServer = true
        break
      }
      case "--port": {
        const value = Number(nextValue(argv, i, arg))
        if (!Number.isInteger(value) || value <= 0) {
          throw new Error(`Invalid port: ${argv[i + 1]}`)
        }
        port = value
        i += 1
        break
      }
      case "--config-path": {
        configPath = nextValue(argv, i, arg)
        i += 1
        break
      }
      case "--state-root": {
        stateRoot = nextValue(argv, i, arg)
        i += 1
        break
      }
      case "--model-stub": {
        modelStub = true
        break
      }
      case "--no-model-stub": {
        modelStub = false
        break
      }
      case "--health-timeout-ms": {
        const value = Number(nextValue(argv, i, arg))
        if (!Number.isInteger(value) || value < 1_000) {
          throw new Error(`Invalid health-timeout-ms: ${argv[i + 1]}`)
        }
        healthTimeoutMs = value
        i += 1
        break
      }
      case "--var": {
        const raw = nextValue(argv, i, arg)
        const eq = raw.indexOf("=")
        if (eq < 1) {
          throw new Error(`Invalid --var format '${raw}', expected key=value`)
        }
        const key = raw.slice(0, eq)
        const value = raw.slice(eq + 1)
        vars[key] = parseVarValue(value)
        i += 1
        break
      }
      case "--report": {
        reportPath = nextValue(argv, i, arg)
        i += 1
        break
      }
      default: {
        if (arg.startsWith("--")) {
          throw new Error(`Unknown option: ${arg}`)
        }
        fixturePaths.push(arg)
      }
    }
  }

  if (fixturePaths.length === 0) {
    throw new Error("At least one fixture path is required")
  }

  return {
    fixturePaths,
    baseUrl,
    dbPath,
    startServer,
    port,
    configPath,
    stateRoot,
    modelStub,
    reportPath,
    vars,
    healthTimeoutMs
  }
}

const checkPortAvailable = (port: number): Promise<boolean> =>
  new Promise((resolvePort) => {
    const probe = createServer()
    probe.once("error", () => resolvePort(false))
    probe.once("listening", () => {
      probe.close(() => resolvePort(true))
    })
    probe.listen(port, "127.0.0.1")
  })

const selectAvailablePort = (
  preferredPort: number
): Effect.Effect<number, unknown> =>
  Effect.gen(function*() {
    const candidates = [
      preferredPort,
      ...Array.from(
        { length: 20 },
        () => 20_000 + Math.floor(Math.random() * 20_000)
      )
    ]

    for (const candidate of candidates) {
      const available = yield* Effect.tryPromise({
        try: () => checkPortAvailable(candidate),
        catch: (error) => new Error(`port probe failed for ${candidate}: ${String(error)}`)
      })
      if (available) {
        return candidate
      }
    }

    return yield* Effect.fail(
      new Error(`No available port found (tried ${candidates.join(", ")})`)
    )
  })

const waitForHealthyServer = (
  baseUrl: string,
  timeoutMs: number
): Effect.Effect<void, unknown> =>
  Effect.gen(function*() {
    const startedAt = Date.now()
    let lastFailure: string | null = null

    while (Date.now() - startedAt <= timeoutMs) {
      const exit = yield* Effect.exit(
        Effect.tryPromise({
          try: () => fetch(`${baseUrl.replace(/\/$/, "")}/health`),
          catch: (error) => new Error(String(error))
        }).pipe(
          Effect.flatMap((response) =>
            response.status === 200
              ? Effect.tryPromise({
                  try: () => response.json() as Promise<unknown>,
                  catch: (error) => new Error(String(error))
                })
              : Effect.fail(new Error(`health status ${response.status}`))
          )
        )
      )

      if (Exit.isSuccess(exit)) {
        return
      }

      lastFailure = Cause.pretty(exit.cause)
      yield* Effect.sleep(Duration.millis(250))
    }

    return yield* Effect.fail(
      new Error(
        `Managed server did not become healthy within ${timeoutMs}ms`
        + (lastFailure ? `; last error: ${lastFailure}` : "")
      )
    )
  })

const startManagedServer = (options: CliOptions): Effect.Effect<ManagedServerRuntime, unknown> =>
  Effect.gen(function*() {
    const sourceConfigPath = resolve(options.configPath ?? process.env.PA_CONFIG_PATH ?? "agent.yaml")
    const sourceYaml = yield* Effect.tryPromise({
      try: () => Bun.file(sourceConfigPath).text(),
      catch: (error) => new Error(`Failed reading config ${sourceConfigPath}: ${String(error)}`)
    })

    const sourceConfigRaw = Bun.YAML.parse(sourceYaml)
    if (!isObject(sourceConfigRaw)) {
      return yield* Effect.fail(new Error("Source config must be a YAML object"))
    }

    const runtimeId = crypto.randomUUID()
    const runtimeRoot = resolve(process.cwd(), "tmp", `e2e-runtime-${runtimeId}`)
    mkdirSync(runtimeRoot, { recursive: true })

    const dbPath = resolve(options.dbPath ?? join(runtimeRoot, "personal-agent.e2e.sqlite"))
    const stateRoot = resolve(options.stateRoot ?? join(runtimeRoot, "state"))
    const promptsRoot = resolve(process.cwd(), "prompts")
    const selectedPort = yield* selectAvailablePort(options.port)

    const clonedConfig = structuredClone(sourceConfigRaw) as Record<string, unknown>
    const serverConfig = isObject(clonedConfig.server) ? clonedConfig.server : {}
    const serverStorage = isObject(serverConfig.storage) ? serverConfig.storage : {}
    const promptsConfig = isObject(clonedConfig.prompts) ? clonedConfig.prompts : {}

    serverConfig.port = selectedPort
    serverStorage.rootDir = stateRoot
    promptsConfig.rootDir = promptsRoot

    const agentsConfig = isObject(clonedConfig.agents) ? clonedConfig.agents : {}
    for (const [agentKey, rawProfile] of Object.entries(agentsConfig)) {
      if (!isObject(rawProfile)) {
        continue
      }

      const memoryRoutines = isObject(rawProfile.memoryRoutines)
        ? rawProfile.memoryRoutines
        : {}
      if (!Array.isArray(memoryRoutines.subroutines)) {
        memoryRoutines.subroutines = []
      }
      const transcriptsConfig = isObject(memoryRoutines.transcripts)
        ? memoryRoutines.transcripts
        : {}
      transcriptsConfig.enabled = true
      if (typeof transcriptsConfig.directory !== "string" || transcriptsConfig.directory.length === 0) {
        transcriptsConfig.directory = "transcripts"
      }
      memoryRoutines.transcripts = transcriptsConfig
      rawProfile.memoryRoutines = memoryRoutines
      agentsConfig[agentKey] = rawProfile
    }

    serverConfig.storage = serverStorage
    clonedConfig.server = serverConfig
    clonedConfig.prompts = promptsConfig
    clonedConfig.agents = agentsConfig

    const generatedConfigPath = join(runtimeRoot, "agent.e2e.yaml")
    const generatedYaml = Bun.YAML.stringify(clonedConfig)
    yield* Effect.tryPromise({
      try: () => Bun.write(generatedConfigPath, generatedYaml),
      catch: (error) => new Error(`Failed writing managed config ${generatedConfigPath}: ${String(error)}`)
    })

    const processHandle = Bun.spawn([
      "bun",
      "packages/server/src/server.ts"
    ], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PA_CONFIG_PATH: generatedConfigPath,
        PERSONAL_AGENT_DB_PATH: dbPath,
        PA_TEST_MODEL_STUB: options.modelStub ? "1" : "0"
      },
      stdout: "inherit",
      stderr: "inherit"
    })

    const baseUrl = `http://localhost:${selectedPort}`
    yield* waitForHealthyServer(baseUrl, options.healthTimeoutMs)

    const stop = Effect.gen(function*() {
      if (processHandle.exitCode === null) {
        processHandle.kill("SIGTERM")
      }

      const exited = yield* Effect.exit(
        Effect.promise(() => processHandle.exited).pipe(
          Effect.timeout(Duration.seconds(5))
        )
      )

      if (Exit.isFailure(exited) && processHandle.exitCode === null) {
        processHandle.kill("SIGKILL")
      }
    })

    return {
      baseUrl,
      dbPath,
      stateRoot,
      generatedConfigPath,
      stop
    }
  })

const main = Effect.gen(function*() {
  let parsed: CliOptions | "help"
  try {
    parsed = parseCliArgs(process.argv.slice(2))
  } catch (error) {
    usage()
    return yield* Effect.fail(error)
  }

  if (parsed === "help") {
    usage()
    return
  }

  const options = parsed

  const managed = options.startServer
    ? yield* startManagedServer(options)
    : null

  if (managed) {
    console.log("Managed server started", {
      baseUrl: managed.baseUrl,
      dbPath: managed.dbPath,
      stateRoot: managed.stateRoot,
      generatedConfigPath: managed.generatedConfigPath
    })
  }

  const effectiveBaseUrl = managed?.baseUrl ?? options.baseUrl
  const effectiveDbPath = managed?.dbPath ?? options.dbPath
  const effectiveStateRoot = managed?.stateRoot ?? options.stateRoot

  const results: Array<unknown> = []

  const runAll = Effect.gen(function*() {
    for (const fixturePath of options.fixturePaths) {
      console.log(`\nRunning fixture: ${fixturePath}`)
      const result = yield* runFixture({
        fixturePath,
        baseUrl: effectiveBaseUrl,
        dbPath: effectiveDbPath,
        initialVars: {
          state_root: effectiveStateRoot,
          ...options.vars
        }
      })

      results.push(result)
      console.log(`Completed ${result.fixtureName} in ${result.durationMs}ms (${result.steps.length} steps)`)
      for (const step of result.steps) {
        console.log(`  - [ok] ${step.name} (${step.durationMs}ms)`)
      }
    }
  })

  const exit = yield* Effect.exit(runAll)

  if (managed) {
    yield* managed.stop
  }

  if (options.reportPath !== null) {
    const reportJson = JSON.stringify({
      generatedAt: new Date().toISOString(),
      baseUrl: effectiveBaseUrl,
      dbPath: effectiveDbPath,
      stateRoot: effectiveStateRoot,
      fixtures: results
    }, null, 2)

    yield* Effect.tryPromise({
      try: () => Bun.write(options.reportPath!, reportJson),
      catch: (error) => new Error(`Failed writing report ${options.reportPath}: ${String(error)}`)
    })

    console.log(`Report written: ${options.reportPath}`)
  }

  if (Exit.isFailure(exit)) {
    return yield* Effect.fail(new Error(Cause.pretty(exit.cause)))
  }
})

Effect.runPromise(main).catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
