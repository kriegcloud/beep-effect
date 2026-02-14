import * as Effect from "effect/Effect"

export type DiagnosticStatus = "ok" | "missing" | "invalid" | "unknown"
export type DiagnosticSeverity = "error" | "warning"

export type DiagnosticCheck = {
  readonly status: DiagnosticStatus
  readonly message?: string
  readonly fix?: string
  readonly version?: string
  readonly path?: string
}

export type DiagnosticIssue = {
  readonly severity: DiagnosticSeverity
  readonly message: string
  readonly fix?: string
}

export type DiagnosticResult = {
  readonly valid: boolean
  readonly checks: Record<string, DiagnosticCheck>
  readonly issues: ReadonlyArray<DiagnosticIssue>
}

const checkApiKey = (): readonly [DiagnosticCheck, ReadonlyArray<DiagnosticIssue>] => {
  const apiKey = process.env.ANTHROPIC_API_KEY ?? process.env.API_KEY ?? ""
  if (apiKey.trim().length === 0) {
    return [
      {
        status: "missing",
        fix: "Set ANTHROPIC_API_KEY environment variable"
      },
      [{
        severity: "error",
        message: "Missing API key",
        fix: "Set ANTHROPIC_API_KEY environment variable"
      }]
    ]
  }
  if (!apiKey.startsWith("sk-ant-")) {
    return [
      {
        status: "invalid",
        fix: "API key should start with sk-ant-"
      },
      [{
        severity: "warning",
        message: "API key format looks invalid",
        fix: "API key should start with sk-ant-"
      }]
    ]
  }
  return [{ status: "ok" }, []]
}

const tryResolvePackageVersion = (specifier: string) =>
  Effect.tryPromise({
    try: async () => {
      const resolver = (import.meta as unknown as {
        resolve?: (input: string) => string
      }).resolve
      if (!resolver) return undefined
      const url = resolver(`${specifier}/package.json`)
      const bun = (globalThis as unknown as {
        Bun?: { file: (path: string | URL) => { text: () => Promise<string> } }
      }).Bun
      if (bun?.file) {
        const text = await bun.file(url).text()
        const json = JSON.parse(text) as { version?: string }
        return json.version
      }
      const response = await fetch(url)
      if (!response.ok) return undefined
      const json = await response.json() as { version?: string }
      return json.version
    },
    catch: () => undefined
  }).pipe(Effect.catchAll(() => Effect.succeed(undefined)))

const checkClaudeCodeCli = () =>
  Effect.tryPromise({
    try: async () => {
      const bun = (globalThis as unknown as {
        Bun?: { spawnSync?: (options: { cmd: string[] }) => { exitCode: number; stdout: Uint8Array } }
      }).Bun
      if (!bun?.spawnSync) {
        return {
          status: "unknown" as const,
          message: "Unable to detect Claude Code CLI in this runtime"
        }
      }
      const result = bun.spawnSync({ cmd: ["which", "claude"] })
      if (result.exitCode === 0) {
        const path = new TextDecoder().decode(result.stdout).trim()
        return {
          status: "ok" as const,
          path
        }
      }
      return {
        status: "missing" as const,
        fix: "Install Claude Code CLI (https://docs.anthropic.com/en/docs/claude-code)"
      }
    },
    catch: () => ({
      status: "unknown" as const,
      message: "Unable to detect Claude Code CLI"
    })
  }).pipe(
    Effect.catchAll(() =>
      Effect.succeed({
        status: "unknown" as const,
        message: "Unable to detect Claude Code CLI"
      })
    )
  )

/**
 * Validate the current environment and return actionable diagnostics.
 */
export const diagnose = (): Effect.Effect<DiagnosticResult> =>
  Effect.gen(function*() {
    const issues: Array<DiagnosticIssue> = []
    const checks: Record<string, DiagnosticCheck> = {}

    const [apiKeyCheck, apiIssues] = checkApiKey()
    checks.apiKey = apiKeyCheck
    issues.push(...apiIssues)

    const cliCheck = yield* checkClaudeCodeCli()
    checks.claudeCode = cliCheck
    if (cliCheck.status === "missing") {
      issues.push({
        severity: "warning",
        message: "Claude Code CLI not found",
        fix: cliCheck.fix
      })
    }

    const sdkVersion = yield* tryResolvePackageVersion("effect-claude-agent-sdk")
    checks.sdkVersion = sdkVersion
      ? { status: "ok", version: sdkVersion }
      : { status: "unknown", message: "Unable to resolve SDK version" }

    const effectVersion = yield* tryResolvePackageVersion("effect")
    checks.effectVersion = effectVersion
      ? { status: "ok", version: effectVersion }
      : { status: "unknown", message: "Unable to resolve Effect version" }

    return {
      valid: issues.filter((issue) => issue.severity === "error").length === 0,
      checks,
      issues
    }
  })
