/**
 * Server-only entry point for pretty logging layers and accumulation helpers.
 *
 * @example
 * import * as Effect from "effect/Effect";
 * import { makePrettyConsoleLoggerLayer, withEnvLogging } from "@beep/errors/server";
 *
 * const program = Effect.logInfo("boot");
 * export const run = program.pipe(
 *   withEnvLogging(),
 *   Effect.provide(makePrettyConsoleLoggerLayer({ includeCausePretty: true }))
 * );
 *
 * @category Documentation/Modules
 * @since 0.1.0
 */
import * as FS from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import type { LogFormat } from "@beep/constants";
import * as HttpClient from "@effect/platform/HttpClient";
import * as HttpClientError from "@effect/platform/HttpClientError";
import * as Cause from "effect/Cause";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as FiberId from "effect/FiberId";
import * as HashMap from "effect/HashMap";
import type * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as LogLevel from "effect/LogLevel";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Record from "effect/Record";
import color from "picocolors";
import type { AccumulateOptions, AccumulateResult, PrettyLoggerConfig } from "./shared";
import {
  accumulateEffects,
  colorForLevel,
  defaultConfig,
  extractPrimaryError,
  formatAnnotations,
  formatCausePretty,
  formatMessage,
  formatSpans,
  parseLevel,
  shouldPrintCause,
} from "./shared";

/**
 * Re-export shared helpers for server entry.
 *
 * @category Documentation/Reexports
 * @since 0.1.0
 */
export * from "./shared";
/**
 * Formatting options for pretty cause headings (server-only).
 *
 * @category Documentation/Config
 * @since 0.1.0
 */
export interface CauseHeadingOptions {
  readonly colors?: boolean | undefined;
  readonly date?: Date | undefined;
  readonly levelLabel?: string | undefined;
  readonly fiberName?: string | undefined;
  readonly spansText?: string | undefined;
  readonly service?: string | undefined;
  readonly environment?: string | undefined;
  readonly requestId?: string | undefined;
  readonly correlationId?: string | undefined;
  readonly userId?: string | undefined;
  readonly hostname?: string | undefined;
  readonly pid?: number | string | undefined;
  readonly nodeVersion?: string | undefined;
  readonly includeCodeFrame?: boolean | undefined;
}
/**
 * Build a pretty console logger Layer (server-only).
 *
 * @category Documentation/Functions
 * @since 0.1.0
 */
export function makePrettyConsoleLoggerLayer(cfg?: Partial<PrettyLoggerConfig> | undefined): Layer.Layer<never> {
  const logger = makePrettyConsoleLogger(cfg);
  return Logger.replace(Logger.defaultLogger, logger);
}

/**
 * Wrap an Effect with pretty logging and minimum log level (server-only).
 *
 * @category Documentation/Functions
 * @since 0.1.0
 */
export function withPrettyLogging(cfg?: Partial<PrettyLoggerConfig> | undefined) {
  return <A, E, R>(self: Effect.Effect<A, E, R>) =>
    self.pipe(
      Logger.withMinimumLogLevel(cfg?.level ?? defaultConfig.level),
      Effect.provide(makePrettyConsoleLoggerLayer(cfg))
    );
}

/**
 * Run an Effect with pretty logging and return Exit (server-only convenience).
 *
 * @category Documentation/Functions
 * @since 0.1.0
 */
export const runWithPrettyLogsExit = <A, E, R>(
  eff: Effect.Effect<A, E, R>,
  cfg?: Partial<PrettyLoggerConfig> | undefined
) => Effect.exit(eff).pipe(withPrettyLogging(cfg));

// =========================
// Stack parsing & fancy error headers
// =========================

const STACK_RE_PAREN = /^\s*at\s+(.*?)\s+\((.*):(\d+):(\d+)\)/;
const STACK_RE_BARE = /^\s*at\s+(.*):(\d+):(\d+)/;

function normalizeFsPath(p: string): string {
  if (!p) return p;
  if (p.startsWith("file://")) p = p.replace(/^file:\/\//, "");
  return p.replace(/\\/g, "/");
}

function parseTopFrameFromStack(
  stack: string,
  repoRoot: string
):
  | { readonly file: string; readonly line: number; readonly col: number; readonly func?: string | undefined }
  | undefined {
  if (!stack) return undefined;
  const normRoot = normalizeFsPath(Path.resolve(repoRoot));
  const lines = stack.split("\n");
  for (const raw of lines) {
    const line = raw.trim();
    let m = line.match(STACK_RE_PAREN);
    let file: string | undefined;
    let ln: number | undefined;
    let col: number | undefined;
    let func: string | undefined;
    if (m) {
      func = m[1];
      file = normalizeFsPath(m[2]!);
      ln = Number(m[3]);
      col = Number(m[4]);
    } else {
      m = line.match(STACK_RE_BARE);
      if (m) {
        file = normalizeFsPath(m[1]!);
        ln = Number(m[2]);
        col = Number(m[3]);
      }
    }
    if (!file || Number.isNaN(ln!) || Number.isNaN(col!)) continue;
    if (file.startsWith("node:") || file.includes("/node_modules/")) continue;
    if (!file.includes(normRoot)) continue;
    return { file, line: ln!, col: col!, func };
  }
  return undefined;
}

function renderCodeFrame(file: string, line: number, enableColors: boolean, context = 2): string | undefined {
  try {
    const content = FS.readFileSync(file, "utf8");
    const lines = content.split(/\r?\n/);
    const start = Math.max(1, line - context);
    const end = Math.min(lines.length, line + context);
    const pad = String(end).length;
    const fmtNum = (n: number) => String(n).padStart(pad, " ");
    const out: string[] = [];
    for (let i = start; i <= end; i++) {
      const prefix = i === line ? ">" : " ";
      const num = fmtNum(i);
      const codeLine = lines[i - 1] ?? "";
      const txt = `${prefix} ${num} | ${codeLine}`;
      out.push(enableColors && i === line ? color.red(txt) : enableColors ? color.gray(txt) : txt);
    }
    return out.join("\n");
  } catch {
    return undefined;
  }
}

function inferFunctionName(file: string, line: number): string | undefined {
  try {
    const content = FS.readFileSync(file, "utf8");
    const lines = content.split(/\r?\n/);
    const index = Math.max(0, line - 1);
    const currentLine = lines[index] ?? "";
    const callMatch = currentLine.match(/([A-Za-z0-9_$]+)\s*\(/);
    if (callMatch?.[1]) {
      return callMatch[1];
    }
    for (let i = index; i >= 0; i--) {
      const raw = lines[i] ?? "";
      const trimmed = raw.trim();
      if (trimmed.length === 0) {
        continue;
      }
      const functionMatch = trimmed.match(/function\s+([A-Za-z0-9_$]+)/);
      if (functionMatch?.[1]) {
        return functionMatch[1];
      }
      const assignedMatch = trimmed.match(/const\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s+)?(?:function\s*)?\(/);
      if (assignedMatch?.[1]) {
        return assignedMatch[1];
      }
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Render a formatted heading for a Cause (optionally with code frames).
 *
 * @category Documentation/Functions
 * @since 0.1.0
 */
export function formatCauseHeading(cause: Cause.Cause<unknown>, options: boolean | CauseHeadingOptions = true): string {
  if (Cause.isEmpty(cause)) return "";
  const opts = typeof options === "boolean" ? ({ colors: options } as CauseHeadingOptions) : (options ?? {});
  const enableColors = opts.colors ?? true;
  const nowIso = (opts.date ?? new Date()).toISOString();

  const { error, message } = extractPrimaryError(cause);
  const stack = error?.stack ?? "";
  const root = process.cwd();
  const frame = parseTopFrameFromStack(stack, root);
  if (!frame) return "";

  const rel = Path.relative(root, frame.file) || frame.file;
  const filename = Path.basename(rel);
  const code = (s: string) => (enableColors ? color.bold(s) : s);
  const inferredFunc =
    !frame.func || frame.func === "<anonymous>" ? inferFunctionName(frame.file, frame.line) : undefined;
  const functionLabel = frame.func && frame.func !== "<anonymous>" ? frame.func : inferredFunc;
  const border = enableColors
    ? color.magenta("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    : "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
  const codeFrame = opts.includeCodeFrame !== false ? renderCodeFrame(frame.file, frame.line, enableColors) : undefined;
  const lines = [
    `┏${border}`,
    `┃ 🗂 Path: ${code(rel)}`,
    `┃ 📄 File: ${code(filename)}`,
    `┃ 📍 Line: ${code(String(frame.line))}:${code(String(frame.col))}`,
    functionLabel ? `┃ 🔧 Function: ${code(functionLabel)}` : undefined,
    `┃ 🕒 Time: ${code(nowIso)}`,
    error?.name ? `┃ 🧪 Type: ${code(error.name)}` : undefined,
    opts.levelLabel ? `┃ 🏷️ Level: ${code(opts.levelLabel)}` : undefined,
    opts.fiberName ? `┃ 🧵 Fiber: ${code(opts.fiberName)}` : undefined,
    opts.spansText ? `┃ 🧭 Spans: ${opts.spansText}` : undefined,
    opts.service ? `┃ 🧰 Service: ${code(opts.service)}` : undefined,
    opts.environment ? `┃ 🌱 Env: ${code(opts.environment)}` : undefined,
    opts.requestId ? `┃ 🔗 RequestId: ${code(opts.requestId)}` : undefined,
    opts.correlationId ? `┃ 🪢 CorrelationId: ${code(opts.correlationId)}` : undefined,
    opts.userId ? `┃ 🙍 UserId: ${code(opts.userId)}` : undefined,
    opts.hostname || opts.pid || opts.nodeVersion
      ? `┃ 🖥️ Host: ${code([opts.hostname ? `host=${opts.hostname}` : undefined, opts.pid ? `pid=${String(opts.pid)}` : undefined, opts.nodeVersion ? `node=${opts.nodeVersion}` : undefined].filter(Boolean).join(", "))}`
      : undefined,
    `┃ 💬 Message: ${code(message)}`,
    codeFrame ? `┃ 🔎 Code:` : undefined,
    codeFrame
      ? codeFrame
          .split("\n")
          .map((l) => `┃ ${l}`)
          .join("\n")
      : undefined,
    `┗${border}`,
  ].filter((x): x is string => typeof x === "string");
  return lines.join("\n");
}

/**
 * Build a pretty console logger instance (server-only).
 *
 * @category Documentation/Functions
 * @since 0.1.0
 */
export function makePrettyConsoleLogger(cfg?: Partial<PrettyLoggerConfig> | undefined): Logger.Logger<unknown, void> {
  const config: PrettyLoggerConfig = { ...defaultConfig, ...cfg };

  return Logger.make((options) => {
    const { logLevel, message, date, annotations, spans, fiberId, cause } = options;

    // Left side: time + level + message
    const partsLeft: string[] = [];
    if (config.showDate) partsLeft.push(color.dim(date.toISOString()));

    const levelLabel = logLevel.label;
    const levelColored = colorForLevel(logLevel, config.colors)(levelLabel);
    partsLeft.push(levelColored);

    const msg = formatMessage(message);
    partsLeft.push(msg);

    // Right side: annotations, spans, fiber id
    const partsRight: string[] = [];
    if (config.showAnnotations && annotations) {
      const annTxt = formatAnnotations(annotations, config.colors);
      if (annTxt.length > 0) partsRight.push(annTxt);
    }

    if (config.showSpans && spans) {
      const spanTxt = formatSpans(date.getTime(), spans, config.colors);
      if (spanTxt.length > 0) partsRight.push(spanTxt);
    }

    if (config.showFiberId && fiberId) {
      const name = FiberId.threadName(fiberId);
      const fiberTxt = `fiber=${name}`;
      partsRight.push(config.colors ? color.dim(fiberTxt) : fiberTxt);
    }

    const line = `${partsLeft.join(" ")}${partsRight.length > 0 ? ` | ${partsRight.join(" ")}` : ""}`;

    const isWarningOrAbove = logLevel.ordinal >= LogLevel.Warning.ordinal;
    const writer = isWarningOrAbove ? console.error : console.log;

    writer(line);

    if (shouldPrintCause(logLevel, cause, config.includeCausePretty)) {
      const getAnn = (key: string): string | undefined => {
        if (!annotations) return undefined;
        const v = HashMap.get(annotations, key);
        return O.isSome(v) ? String(v.value) : undefined;
      };
      const service = getAnn("service");
      const environment = getAnn("env") ?? getAnn("environment");
      const requestId = getAnn("requestId") ?? getAnn("request-id") ?? getAnn("x-request-id");
      const correlationId = getAnn("correlationId") ?? getAnn("correlation-id") ?? getAnn("x-correlation-id");
      const userId = getAnn("userId") ?? getAnn("user-id");
      const heading = formatCauseHeading(cause, {
        colors: config.colors,
        date,
        levelLabel: logLevel.label,
        fiberName: fiberId ? FiberId.threadName(fiberId) : undefined,
        spansText: spans ? formatSpans(date.getTime(), spans, false) : undefined,
        service,
        environment,
        requestId,
        correlationId,
        userId,
        hostname: OS.hostname(),
        pid: process.pid,
        nodeVersion: process.version,
        includeCodeFrame: true,
      });
      if (heading) writer(heading);
      const pretty = formatCausePretty(cause, config.colors);
      if (pretty) writer(pretty);
    }
  });
}

/**
 * Reads APP_LOG_FORMAT and APP_LOG_LEVEL with env-sensitive defaults.
 *
 * @category Documentation/Functions
 * @since 0.1.0
 */
export const readEnvLoggerConfig = Effect.gen(function* () {
  const appEnv = process.env.APP_ENV ?? process.env.NODE_ENV ?? process.env.NEXT_PUBLIC_ENV;
  const isProd = appEnv === "production" || appEnv === "prod";

  const formatRaw = process.env.APP_LOG_FORMAT ?? process.env.NEXT_PUBLIC_LOG_FORMAT ?? (isProd ? "json" : "pretty");
  const levelRaw =
    (process.env.APP_LOG_LEVEL as LogLevel.Literal | undefined) ??
    (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel.Literal | undefined) ??
    (isProd ? ("Error" as LogLevel.Literal) : ("All" as LogLevel.Literal));

  // Dev-only soft warning when using deprecated NEXT_PUBLIC_* keys
  if (!process.env.APP_LOG_FORMAT && process.env.NEXT_PUBLIC_LOG_FORMAT && !isProd) {
    console.warn("@beep/errors: NEXT_PUBLIC_LOG_FORMAT is deprecated; prefer APP_LOG_FORMAT");
  }
  if (!process.env.APP_LOG_LEVEL && process.env.NEXT_PUBLIC_LOG_LEVEL && !isProd) {
    console.warn("@beep/errors: NEXT_PUBLIC_LOG_LEVEL is deprecated; prefer APP_LOG_LEVEL");
  }

  const format = formatRaw as LogFormat.Type;
  const level: LogLevel.LogLevel = parseLevel(levelRaw);

  return { format, level };
});

const loggerForFormat = (format: LogFormat.Type, prettyOverrides?: Partial<PrettyLoggerConfig> | undefined) => {
  return Match.value(format).pipe(
    Match.when("pretty", () => makePrettyConsoleLogger(prettyOverrides)),
    Match.when("logFmt", () => Logger.withLeveledConsole(Logger.logfmtLogger)),
    Match.whenOr("json", "structured", () => Logger.withLeveledConsole(Logger.jsonLogger)),
    Match.exhaustive
  );
};

/**
 * Build a logger layer from environment variables.
 *
 * @category Documentation/Functions
 * @since 0.1.0
 */
export const makeEnvLoggerLayerFromEnv = (prettyOverrides?: Partial<PrettyLoggerConfig> | undefined) =>
  Effect.gen(function* () {
    const { format } = yield* readEnvLoggerConfig;
    const logger = loggerForFormat(format, prettyOverrides);
    return Logger.replace(Logger.defaultLogger, logger);
  });

/**
 * Apply the environment-derived logger and minimum level to an Effect.
 *
 * @category Documentation/Functions
 * @since 0.1.0
 */
export const withEnvLogging =
  (prettyOverrides?: Partial<PrettyLoggerConfig> | undefined) =>
  <A, E, R>(self: Effect.Effect<A, E, R>) =>
    Effect.gen(function* () {
      const { level } = yield* readEnvLoggerConfig;
      const layer = yield* makeEnvLoggerLayerFromEnv(prettyOverrides);
      return yield* self.pipe(Logger.withMinimumLogLevel(level), Effect.provide(layer));
    });

// =========================
// Accumulation helpers (server variant)
// =========================

/**
 * Accumulate effects and log/report errors (server variant).
 *
 * @category Documentation/Functions
 * @since 0.1.0
 */
export const accumulateEffectsAndReport = <A, E, R>(
  effects: ReadonlyArray<Effect.Effect<A, E, R>>,
  options?: AccumulateOptions | undefined
): Effect.Effect<AccumulateResult<A, E>, never, R> =>
  Effect.gen(function* () {
    const now = yield* DateTime.now;
    const res = yield* accumulateEffects(effects, { concurrency: options?.concurrency });

    yield* Effect.logInfo("accumulate summary", {
      successes: res.successes.length,
      errors: res.errors.length,
    });

    for (const [i, cause] of res.errors.entries()) {
      const getAnn = (key: string): string | undefined => {
        if (!P.isRecord(options?.annotations)) {
          return undefined;
        }
        return Record.get(key)(options?.annotations).pipe(O.getOrElse(() => undefined));
      };

      const service = getAnn("service") ?? process.env.APP_NAME;
      const environment = getAnn("env") ?? getAnn("environment") ?? process.env.APP_ENV ?? process.env.NODE_ENV;
      const heading = formatCauseHeading(cause, {
        colors: options?.colors ?? true,
        date: DateTime.toDateUtc(now),
        levelLabel: undefined,
        fiberName: undefined,
        spansText: undefined,
        service,
        environment,
        hostname: OS.hostname(),
        pid: process.pid,
        nodeVersion: process.version,
        includeCodeFrame: true,
      });
      if (heading) yield* Effect.sync(() => console.error(heading));
      const pretty = formatCausePretty(cause, options?.colors ?? true);
      yield* Effect.logError(`accumulate error[${i}]`);
      if (pretty) yield* Effect.sync(() => console.error(pretty));
    }

    let eff: Effect.Effect<AccumulateResult<A, E>, never, R> = Effect.succeed(res);
    if (options?.annotations) {
      eff = eff.pipe(Effect.annotateLogs(options.annotations));
    }
    if (options?.spanLabel) {
      eff = eff.pipe(Effect.withLogSpan(options.spanLabel));
    }
    return yield* eff;
  });

export const withResponseErrorLogging = <E, R>(client: HttpClient.HttpClient.With<E, R>) =>
  client.pipe(
    HttpClient.tapError((error) => {
      if (HttpClientError.isHttpClientError(error) && error._tag === "ResponseError") {
        return Effect.gen(function* () {
          const responseBody = yield* error.response.text.pipe(
            Effect.catchAllCause(() => Effect.succeed("<failed to read body>"))
          );

          yield* Effect.logError({
            type: "ResponseError",
            status: error.response.status,
            reason: error.reason,
            description: error.description ?? null,
            request: {
              method: error.request.method,
              url: error.request.url,
              headers: error.request.headers,
            },
            response: {
              headers: error.response.headers,
              body: responseBody,
            },
          });
        });
      }
      return Effect.void;
    })
  );
