import { Effect } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

/**
 * @since 0.0.0
 */
export type DiagnosticStatus = "ok" | "missing" | "invalid" | "unknown";
/**
 * @since 0.0.0
 */
export type DiagnosticSeverity = "error" | "warning";

/**
 * @since 0.0.0
 */
export type DiagnosticCheck = {
  readonly status: DiagnosticStatus;
  readonly message?: string;
  readonly fix?: string;
  readonly version?: string;
  readonly path?: string;
};

/**
 * @since 0.0.0
 */
export type DiagnosticIssue = {
  readonly severity: DiagnosticSeverity;
  readonly message: string;
  readonly fix?: string;
};

/**
 * @since 0.0.0
 */
export type DiagnosticResult = {
  readonly valid: boolean;
  readonly checks: Record<string, DiagnosticCheck>;
  readonly issues: ReadonlyArray<DiagnosticIssue>;
};

const PackageVersion = S.Struct({
  version: S.optional(S.String),
});

const PackageVersionFromJson = S.fromJsonString(PackageVersion);

type BunLike = {
  readonly file?: (path: string | URL) => {
    readonly text: () => Promise<string>;
  };
  readonly spawnSync?: (options: { readonly cmd: Array<string> }) => {
    readonly exitCode: number;
    readonly stdout: Uint8Array | undefined;
  };
};

const resolveImport = (specifier: string): string | undefined => {
  const resolver = Reflect.get(import.meta, "resolve");
  if (!P.isFunction(resolver)) {
    return undefined;
  }
  const resolved = resolver(specifier);
  return P.isString(resolved) ? resolved : undefined;
};

const getBun = (): BunLike | undefined => {
  const bun = Reflect.get(globalThis, "Bun");
  return P.isObject(bun) ? bun : undefined;
};

const checkApiKey = (): readonly [DiagnosticCheck, ReadonlyArray<DiagnosticIssue>] => {
  const apiKey = process.env.ANTHROPIC_API_KEY ?? process.env.API_KEY ?? "";
  if (apiKey.trim().length === 0) {
    return [
      {
        status: "missing",
        fix: "Set ANTHROPIC_API_KEY environment variable",
      },
      [
        {
          severity: "error",
          message: "Missing API key",
          fix: "Set ANTHROPIC_API_KEY environment variable",
        },
      ],
    ];
  }
  if (!apiKey.startsWith("sk-ant-")) {
    return [
      {
        status: "invalid",
        fix: "API key should start with sk-ant-",
      },
      [
        {
          severity: "warning",
          message: "API key format looks invalid",
          fix: "API key should start with sk-ant-",
        },
      ],
    ];
  }
  return [{ status: "ok" }, []];
};

const tryResolvePackageVersion = (specifier: string) =>
  Effect.tryPromise({
    try: async () => {
      const url = resolveImport(`${specifier}/package.json`);
      if (!url) return undefined;
      const bun = getBun();
      if (bun?.file) {
        const text = await bun.file(url).text();
        const decoded = S.decodeUnknownOption(PackageVersionFromJson)(text);
        return O.isSome(decoded) ? decoded.value.version : undefined;
      }
      const response = await fetch(url);
      if (!response.ok) return undefined;
      const json = await response.json();
      const decoded = S.decodeUnknownOption(PackageVersion)(json);
      return O.isSome(decoded) ? decoded.value.version : undefined;
    },
    catch: () => undefined,
  }).pipe(Effect.catch(() => Effect.void));

const checkClaudeCodeCli = () =>
  Effect.tryPromise({
    try: async () => {
      const bun = getBun();
      if (!bun?.spawnSync) {
        const check: DiagnosticCheck = {
          status: "unknown",
          message: "Unable to detect Claude Code CLI in this runtime",
        };
        return check;
      }
      const result = bun.spawnSync({ cmd: ["which", "claude"] });
      if (result.exitCode === 0) {
        const path = new TextDecoder().decode(result.stdout ?? new Uint8Array()).trim();
        const check: DiagnosticCheck = {
          status: "ok",
          path,
        };
        return check;
      }
      const check: DiagnosticCheck = {
        status: "missing",
        fix: "Install Claude Code CLI (https://docs.anthropic.com/en/docs/claude-code)",
      };
      return check;
    },
    catch: () => {
      const check: DiagnosticCheck = {
        status: "unknown",
        message: "Unable to detect Claude Code CLI",
      };
      return check;
    },
  }).pipe(
    Effect.catch(() => {
      const check: DiagnosticCheck = {
        status: "unknown",
        message: "Unable to detect Claude Code CLI",
      };
      return Effect.succeed(check);
    })
  );

/**
 * Validate the current environment and return actionable diagnostics.
 */
/**
 * @since 0.0.0
 */
export const diagnose = (): Effect.Effect<DiagnosticResult> =>
  Effect.gen(function* () {
    const issues: Array<DiagnosticIssue> = [];
    const checks: Record<string, DiagnosticCheck> = {};

    const [apiKeyCheck, apiIssues] = checkApiKey();
    checks.apiKey = apiKeyCheck;
    issues.push(...apiIssues);

    const cliCheck = yield* checkClaudeCodeCli();
    checks.claudeCode = cliCheck;
    if (cliCheck.status === "missing") {
      issues.push({
        severity: "warning",
        message: "Claude Code CLI not found",
        ...(cliCheck.fix !== undefined ? { fix: cliCheck.fix } : {}),
      });
    }

    const sdkVersion = yield* tryResolvePackageVersion("effect-claude-agent-sdk");
    checks.sdkVersion = sdkVersion
      ? { status: "ok", version: sdkVersion }
      : { status: "unknown", message: "Unable to resolve SDK version" };

    const effectVersion = yield* tryResolvePackageVersion("effect");
    checks.effectVersion = effectVersion
      ? { status: "ok", version: effectVersion }
      : { status: "unknown", message: "Unable to resolve Effect version" };

    return {
      valid: issues.filter((issue) => issue.severity === "error").length === 0,
      checks,
      issues,
    };
  });
