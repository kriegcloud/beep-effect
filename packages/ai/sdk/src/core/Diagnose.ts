import { $AiSdkId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import { thunkEmptyStr } from "@beep/utils";
import * as BunHttpClient from "@effect/platform-bun/BunHttpClient";
import { Config, Effect, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {
  Headers,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
  HttpMethod,
  UrlParams,
} from "effect/unstable/http";

const $I = $AiSdkId.create("core/Diagnose");

/**
 * @since 0.0.0
 * @category Validation
 */
export const DiagnosticStatus = LiteralKit(["ok", "missing", "invalid", "unknown"]).annotate(
  $I.annote("DiagnosticStatus", {
    description: "Diagnostic status value for a single environment check.",
  })
);

/**
 * @since 0.0.0
 * @category Validation
 */
export type DiagnosticStatus = typeof DiagnosticStatus.Type;

/**
 * @since 0.0.0
 * @category Validation
 */
export const DiagnosticSeverity = LiteralKit(["error", "warning"]).annotate(
  $I.annote("DiagnosticSeverity", {
    description: "Diagnostic issue severity.",
  })
);

/**
 * @since 0.0.0
 * @category Validation
 */
export type DiagnosticSeverity = typeof DiagnosticSeverity.Type;

/**
 * @since 0.0.0
 * @category Validation
 */
export class DiagnosticCheck extends S.Class<DiagnosticCheck>($I`DiagnosticCheck`)(
  {
    status: DiagnosticStatus,
    message: S.optionalKey(S.UndefinedOr(S.String)),
    fix: S.optionalKey(S.UndefinedOr(S.String)),
    version: S.optionalKey(S.UndefinedOr(S.String)),
    path: S.optionalKey(S.UndefinedOr(S.String)),
  },
  $I.annote("DiagnosticCheck", {
    description: "Outcome for a single SDK diagnostic check.",
  })
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export class DiagnosticIssue extends S.Class<DiagnosticIssue>($I`DiagnosticIssue`)(
  {
    severity: DiagnosticSeverity,
    message: S.String,
    fix: S.optionalKey(S.UndefinedOr(S.String)),
  },
  $I.annote("DiagnosticIssue", {
    description: "Actionable issue emitted by diagnose.",
  })
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export class DiagnosticResult extends S.Class<DiagnosticResult>($I`DiagnosticResult`)(
  {
    valid: S.Boolean,
    checks: S.Record(S.String, DiagnosticCheck),
    issues: S.Array(DiagnosticIssue),
  },
  $I.annote("DiagnosticResult", {
    description: "Aggregate diagnostic report for current runtime environment.",
  })
) {}

class PackageVersion extends S.Class<PackageVersion>($I`PackageVersion`)(
  {
    version: S.optionalKey(S.UndefinedOr(S.String)),
  },
  $I.annote("PackageVersion", {
    description: "Minimal package.json payload containing optional version.",
  })
) {}

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

const readApiKey = Effect.gen(function* () {
  const apiKey = yield* Config.option(Config.string("ANTHROPIC_API_KEY"));
  const fallback = yield* Config.option(Config.string("API_KEY"));
  return O.isSome(apiKey) ? apiKey.value : O.getOrElse(fallback, thunkEmptyStr);
});

const checkApiKey = () =>
  Effect.gen(function* () {
    const apiKey = yield* readApiKey;
    if (Str.isEmpty(Str.trim(apiKey))) {
      return [
        new DiagnosticCheck({
          status: "missing",
          fix: "Set ANTHROPIC_API_KEY environment variable",
        }),
        [
          new DiagnosticIssue({
            severity: "error",
            message: "Missing API key",
            fix: "Set ANTHROPIC_API_KEY environment variable",
          }),
        ],
      ] as const;
    }
    if (!Str.startsWith("sk-ant-")(apiKey)) {
      return [
        new DiagnosticCheck({
          status: "invalid",
          fix: "API key should start with sk-ant-",
        }),
        [
          new DiagnosticIssue({
            severity: "warning",
            message: "API key format looks invalid",
            fix: "API key should start with sk-ant-",
          }),
        ],
      ] as const;
    }
    return [new DiagnosticCheck({ status: "ok" }), A.empty<DiagnosticIssue>()] as const;
  }).pipe(
    Effect.catch(() =>
      Effect.succeed([
        new DiagnosticCheck({
          status: "unknown",
          message: "Unable to read API key configuration",
        }),
        A.make(
          new DiagnosticIssue({
            severity: "warning",
            message: "Unable to read API key configuration",
          })
        ),
      ] as const)
    )
  );

const decodePackageVersionFromText = (text: string): O.Option<string> =>
  pipe(
    S.decodeUnknownOption(PackageVersionFromJson)(text),
    O.flatMap((payload) => O.fromUndefinedOr(payload.version))
  );

const tryResolvePackageVersion = (specifier: string): Effect.Effect<O.Option<string>, never, HttpClient.HttpClient> =>
  Effect.gen(function* () {
    const url = resolveImport(`${specifier}/package.json`);
    if (!url) return O.none<string>();

    const bun = getBun();
    const bunFile = bun?.file;
    if (bunFile) {
      const textResult = yield* Effect.tryPromise({
        try: () => bunFile(url).text(),
        catch: thunkEmptyStr,
      }).pipe(Effect.orElseSucceed(thunkEmptyStr));
      return decodePackageVersionFromText(textResult);
    }

    if (!URL.canParse(url)) {
      return O.none<string>();
    }

    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return O.none<string>();
    }

    const method = "GET";
    const request = HttpClientRequest.make(method)(parsedUrl.href, {
      headers: Headers.fromInput({ Accept: "application/json" }),
      urlParams: UrlParams.fromInput([]),
    });
    const _hasBody = HttpMethod.hasBody(method);

    const responseOption = yield* HttpClient.execute(request).pipe(Effect.option);
    if (O.isNone(responseOption)) {
      return O.none<string>();
    }

    const payloadOption = yield* HttpClientResponse.schemaBodyJson(PackageVersion)(responseOption.value).pipe(
      Effect.map((payload) => O.fromUndefinedOr(payload.version)),
      Effect.orElseSucceed(O.none<string>)
    );

    if (_hasBody) {
      return payloadOption;
    }
    return payloadOption;
  });

const checkClaudeCodeCli = () =>
  Effect.tryPromise({
    try: async () => {
      const bun = getBun();
      if (!bun?.spawnSync) {
        return new DiagnosticCheck({
          status: "unknown",
          message: "Unable to detect Claude Code CLI in this runtime",
        });
      }
      const result = bun.spawnSync({ cmd: ["which", "claude"] });
      if (result.exitCode === 0) {
        const path = pipe(new TextDecoder().decode(result.stdout ?? new Uint8Array()), Str.trim);
        return new DiagnosticCheck({
          status: "ok",
          path,
        });
      }
      return new DiagnosticCheck({
        status: "missing",
        fix: "Install Claude Code CLI (https://docs.anthropic.com/en/docs/claude-code)",
      });
    },
    catch: () =>
      new DiagnosticCheck({
        status: "unknown",
        message: "Unable to detect Claude Code CLI",
      }),
  }).pipe(
    Effect.catch(() =>
      Effect.succeed(
        new DiagnosticCheck({
          status: "unknown",
          message: "Unable to detect Claude Code CLI",
        })
      )
    )
  );

/**
 * Validate the current environment and return actionable diagnostics.
 *
 * @since 0.0.0
 * @category Utility
 */
export const diagnose = (): Effect.Effect<DiagnosticResult> =>
  Effect.gen(function* () {
    const issues = A.empty<DiagnosticIssue>();
    const checks = R.empty<string, DiagnosticCheck>();

    const [apiKeyCheck, apiIssues] = yield* checkApiKey();
    checks.apiKey = apiKeyCheck;
    for (const issue of apiIssues) {
      issues.push(issue);
    }

    const cliCheck = yield* checkClaudeCodeCli();
    checks.claudeCode = cliCheck;
    if (cliCheck.status === "missing") {
      issues.push(
        new DiagnosticIssue({
          severity: "warning",
          message: "Claude Code CLI not found",
          ...(cliCheck.fix !== undefined ? { fix: cliCheck.fix } : R.empty),
        })
      );
    }

    const sdkVersion = yield* tryResolvePackageVersion("effect-claude-agent-sdk");
    checks.sdkVersion = O.match(sdkVersion, {
      onSome: (version) =>
        new DiagnosticCheck({
          status: "ok",
          version,
        }),
      onNone: () =>
        new DiagnosticCheck({
          status: "unknown",
          message: "Unable to resolve SDK version",
        }),
    });

    const effectVersion = yield* tryResolvePackageVersion("effect");
    checks.effectVersion = O.match(effectVersion, {
      onSome: (version) =>
        new DiagnosticCheck({
          status: "ok",
          version,
        }),
      onNone: () =>
        new DiagnosticCheck({
          status: "unknown",
          message: "Unable to resolve Effect version",
        }),
    });

    return new DiagnosticResult({
      valid: O.isNone(A.findFirst(issues, (issue) => issue.severity === "error")),
      checks,
      issues,
    });
  }).pipe(Effect.provide(BunHttpClient.layer));
