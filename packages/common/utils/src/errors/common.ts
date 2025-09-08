import * as FS from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import * as Cause from "effect/Cause";
import * as Chunk from "effect/Chunk";
import * as Clock from "effect/Clock";
import * as Config from "effect/Config";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as FiberId from "effect/FiberId";
import * as HashMap from "effect/HashMap";
import type * as Layer from "effect/Layer";
import * as List from "effect/List";
import * as Logger from "effect/Logger";
import * as LogLevel from "effect/LogLevel";
import * as LogSpan from "effect/LogSpan";
import * as Metric from "effect/Metric";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Record from "effect/Record";
import color from "picocolors";
/**
 * Pretty, colored console logger + small telemetry helpers for Effect.
 *
 * Goals
 * - Beautiful, readable log lines
 * - Include timestamp, level, fiber id, spans, annotations
 * - Helpful cause rendering for warnings/errors
 * - Simple helpers to install the logger and set minimum levels
 */

export interface PrettyLoggerConfig {
  readonly level: LogLevel.LogLevel;
  readonly colors: boolean;
  readonly showDate: boolean;
  readonly showFiberId: boolean;
  readonly showSpans: boolean;
  readonly showAnnotations: boolean;
  /**
   * When true, will render Cause.pretty(cause) as a separate line
   * for Warning and above (and any time a non-empty cause exists).
   */
  readonly includeCausePretty: boolean;
}

const defaultConfig: PrettyLoggerConfig = {
  level: LogLevel.Info,
  colors: true,
  showDate: true,
  showFiberId: true,
  showSpans: true,
  showAnnotations: true,
  includeCausePretty: true,
};

const identity = (s: string) => s;

function colorForLevel(level: LogLevel.LogLevel, enabled: boolean) {
  if (!enabled) return identity;
  const ord = level.ordinal;
  if (ord >= LogLevel.Fatal.ordinal) return color.magenta;
  if (ord >= LogLevel.Error.ordinal) return color.red;
  if (ord >= LogLevel.Warning.ordinal) return color.yellow;
  if (ord >= LogLevel.Info.ordinal) return color.green;
  if (ord >= LogLevel.Debug.ordinal) return color.cyan;
  return color.gray; // Trace and below
}

function formatMessage(message: unknown): string {
  if (typeof message === "string") return message;
  if (message instanceof Error) return `${message.name}: ${message.message}`;
  try {
    return typeof message === "object" ? JSON.stringify(message) : String(message);
  } catch {
    return String(message);
  }
}

function formatAnnotations(ann: HashMap.HashMap<string, unknown>, enableColors: boolean): string {
  const parts: string[] = [];
  for (const [k, v] of HashMap.entries(ann)) {
    // Skip internal keys if needed later
    const key = enableColors ? color.dim(String(k)) : String(k);
    const val = formatMessage(v);
    parts.push(`${key}=${val}`);
  }
  return parts.join(" ");
}

function formatSpans(nowMs: number, spans: List.List<LogSpan.LogSpan>, enableColors: boolean): string {
  const rendered = List.toArray(spans).map((s) => LogSpan.render(nowMs)(s));
  const spanTxt = rendered.join(" ");
  return enableColors ? color.dim(spanTxt) : spanTxt;
}

function shouldPrintCause(level: LogLevel.LogLevel, cause: Cause.Cause<unknown>, includePretty: boolean): boolean {
  if (!includePretty) return false;
  if (!Cause.isEmpty(cause)) return true;
  return level.ordinal >= LogLevel.Warning.ordinal;
}

export function formatCausePretty(cause: Cause.Cause<unknown>, enableColors = true): string {
  const pretty = Cause.isEmpty(cause) ? "" : Cause.pretty(cause);
  return enableColors && pretty ? color.red(pretty) : pretty;
}

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
): { file: string; line: number; col: number; func?: string } | undefined {
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

function renderCodeFrame(
  file: string,
  line: number,
  col: number,
  enableColors: boolean,
  context = 2
): string | undefined {
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

function extractPrimaryError(cause: Cause.Cause<unknown>): { error?: Error; message: string } {
  const failOpt = Cause.failureOption(cause);
  if (O.isSome(failOpt)) {
    const val = failOpt.value;
    if (val instanceof Error) return { error: val, message: val.message };
    return { message: String(val) };
  }
  const defects = Cause.defects(cause);
  const arr = Chunk.toArray(defects);
  const err = arr.find((d): d is Error => d instanceof Error);
  if (err) return { error: err, message: err.message };
  return { message: "Unknown error" };
}

export interface CauseHeadingOptions {
  readonly colors?: boolean;
  readonly date?: Date;
  readonly levelLabel?: string;
  readonly fiberName?: string;
  readonly spansText?: string;
  readonly service?: string;
  readonly environment?: string;
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly userId?: string;
  readonly gitBranch?: string;
  readonly gitSha?: string;
  readonly hostname?: string;
  readonly pid?: number | string;
  readonly nodeVersion?: string;
  readonly includeCodeFrame?: boolean;
}

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
  const border = enableColors
    ? color.magenta("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    : "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
  const codeFrame =
    opts.includeCodeFrame !== false ? renderCodeFrame(frame.file, frame.line, frame.col, enableColors) : undefined;
  const lines = [
    `┏${border}`,
    `┃ 🗂 Path: ${code(rel)}`,
    `┃ 📄 File: ${code(filename)}`,
    `┃ 📍 Line: ${code(String(frame.line))}:${code(String(frame.col))}`,
    frame.func ? `┃ 🔧 Function: ${code(frame.func)}` : undefined,
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
    opts.gitBranch || opts.gitSha
      ? `┃ 🌿 Git: ${code([opts.gitBranch ? `branch=${opts.gitBranch}` : undefined, opts.gitSha ? `sha=${opts.gitSha.slice(0, 8)}` : undefined].filter(Boolean).join(", "))}`
      : undefined,
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

export function makePrettyConsoleLogger(cfg?: Partial<PrettyLoggerConfig>): Logger.Logger<unknown, void> {
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
      const service = getAnn("service") ?? process.env.APP_NAME;
      const environment = getAnn("env") ?? getAnn("environment") ?? process.env.APP_ENV ?? process.env.NODE_ENV;
      const requestId = getAnn("requestId") ?? getAnn("request-id") ?? getAnn("x-request-id");
      const correlationId = getAnn("correlationId") ?? getAnn("correlation-id") ?? getAnn("x-correlation-id");
      const userId = getAnn("userId") ?? getAnn("user-id");
      const gitBranch = process.env.GIT_BRANCH ?? process.env.GITHUB_REF_NAME ?? process.env.CI_COMMIT_BRANCH;
      const gitSha = process.env.GIT_COMMIT ?? process.env.GITHUB_SHA ?? process.env.CI_COMMIT_SHA;
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
        gitBranch,
        gitSha,
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

export function makePrettyConsoleLoggerLayer(cfg?: Partial<PrettyLoggerConfig>): Layer.Layer<never> {
  const logger = makePrettyConsoleLogger(cfg);
  return Logger.replace(Logger.defaultLogger, logger);
}

export function withPrettyLogging(cfg?: Partial<PrettyLoggerConfig>) {
  return <A, E, R>(self: Effect.Effect<A, E, R>) =>
    self.pipe(
      Logger.withMinimumLogLevel(cfg?.level ?? defaultConfig.level),
      Effect.provide(makePrettyConsoleLoggerLayer(cfg))
    );
}

/**
 * Helper to annotate logs with a stable set of fields for a component/service.
 * Example: effect.pipe(withLogContext({ service: 'auth', version: '1.2.3' }))
 */
export const withLogContext =
  (annotations: Readonly<Record<string, unknown>>) =>
  <A, E, R>(self: Effect.Effect<A, E, R>) =>
    self.pipe(Effect.annotateLogs(annotations));

/**
 * Helper to add a root span around an operation and ensure logger context includes it.
 */
export const withRootSpan =
  (label: string) =>
  <A, E, R>(self: Effect.Effect<A, E, R>) =>
    self.pipe(Effect.withLogSpan(label));

/**
 * Convenience: run an Effect with pretty logging and return Exit.
 * Useful in CLIs / scripts.
 */
export const runWithPrettyLogsExit = <A, E, R>(eff: Effect.Effect<A, E, R>, cfg?: Partial<PrettyLoggerConfig>) =>
  Effect.exit(eff).pipe(withPrettyLogging(cfg));

/**
 * Log an error cause explicitly using the pretty formatter (independent helper).
 */
export const logCausePretty = (cause: Cause.Cause<unknown>, colors = true) =>
  Effect.sync(() => {
    const pretty = formatCausePretty(cause, colors);
    if (pretty) console.error(pretty);
  });

/**
 * Instrument an effect with:
 * - a log span label
 * - optional annotations
 * - optional metrics (success/error counters and a duration histogram)
 *
 * Preserves the original error Cause by re-failing with the captured cause on failures.
 */
export interface SpanMetricsConfig {
  readonly successCounter?: Metric.Metric.Counter<number>;
  readonly errorCounter?: Metric.Metric.Counter<number>;
  readonly durationHistogram?: Metric.Metric.Histogram<number>;
  /** How to record the duration value into the histogram (default: millis). */
  readonly durationUnit?: "millis" | "seconds";
}

export const withSpanAndMetrics =
  (spanLabel: string, metrics?: SpanMetricsConfig, annotations?: Readonly<Record<string, unknown>>) =>
  <A, E, R>(self: Effect.Effect<A, E, R>) =>
    Effect.gen(function* () {
      const start = yield* Clock.currentTimeMillis;
      const exit = yield* Effect.exit(
        self.pipe(Effect.withLogSpan(spanLabel), annotations ? Effect.annotateLogs(annotations) : (eff) => eff)
      );
      const end = yield* Clock.currentTimeMillis;
      const durationMs = end - start;

      if (metrics?.durationHistogram) {
        const value = metrics.durationUnit === "seconds" ? durationMs / 1000 : durationMs;
        yield* Metric.update(metrics.durationHistogram, value);
      }

      if (Exit.isSuccess(exit)) {
        if (metrics?.successCounter) {
          yield* Metric.increment(metrics.successCounter);
        }
        return exit.value;
      }

      if (metrics?.errorCounter) {
        yield* Metric.increment(metrics.errorCounter);
      }
      // Re-emit the original cause to preserve failure semantics
      return yield* Effect.failCause(exit.cause);
    });

// =========================
// Environment-driven config
// =========================

export type AppLogFormat = "pretty" | "json" | "logfmt" | "structured";

const parseFormat = (raw: string): AppLogFormat | undefined => {
  const s = raw.trim().toLowerCase();
  if (s === "pretty") return "pretty";
  if (s === "json" || s === "structured") return "json";
  if (s === "logfmt") return "logfmt";
  return undefined;
};

const parseLevel = (raw: string): LogLevel.LogLevel | undefined => {
  const s = raw.trim().toLowerCase();
  switch (s) {
    case "all":
      return LogLevel.All;
    case "trace":
      return LogLevel.Trace;
    case "debug":
      return LogLevel.Debug;
    case "info":
      return LogLevel.Info;
    case "warning":
      return LogLevel.Warning;
    case "error":
      return LogLevel.Error;
    case "fatal":
      return LogLevel.Fatal;
    case "none":
      return LogLevel.None;
    default:
      return undefined;
  }
};

export interface EnvLoggerConfig {
  readonly format: AppLogFormat;
  readonly level: LogLevel.LogLevel;
}

/**
 * Reads `APP_LOG_FORMAT` and `APP_LOG_LEVEL` with env-sensitive defaults:
 * - development (NODE_ENV!=production): format=pretty, level=All
 * - production  (NODE_ENV==production): format=json,   level=Error
 */
export const readEnvLoggerConfig = Effect.gen(function* () {
  const nodeEnv = yield* Config.option(Config.string("NODE_ENV"));
  const isProd = nodeEnv._tag === "Some" && nodeEnv.value.toLowerCase() === "production";

  const formatEnv = yield* Config.option(Config.string("APP_LOG_FORMAT"));
  const levelEnv = yield* Config.option(Config.string("APP_LOG_LEVEL"));

  const format: AppLogFormat = (() => {
    if (formatEnv._tag === "Some") {
      const parsed = parseFormat(formatEnv.value);
      if (parsed) return parsed;
    }
    return isProd ? "json" : "pretty";
  })();

  const level: LogLevel.LogLevel = (() => {
    if (levelEnv._tag === "Some") {
      const parsed = parseLevel(levelEnv.value);
      if (parsed) return parsed;
    }
    return isProd ? LogLevel.Error : LogLevel.All;
  })();

  return { format, level };
}).pipe(Effect.catchTag("ConfigError", (e) => Effect.dieMessage(e.message)));

const loggerForFormat = (
  format: AppLogFormat,
  prettyOverrides?: Partial<PrettyLoggerConfig>
): Logger.Logger<unknown, void> => {
  switch (format) {
    case "pretty":
      return makePrettyConsoleLogger(prettyOverrides);
    case "logfmt":
      return Logger.withLeveledConsole(Logger.logfmtLogger);
    case "json":
    case "structured":
      return Logger.withLeveledConsole(Logger.jsonLogger);
  }
};

/**
 * Build a logger layer from environment variables.
 */
export const makeEnvLoggerLayerFromEnv = (prettyOverrides?: Partial<PrettyLoggerConfig>) =>
  Effect.gen(function* () {
    const { format } = yield* readEnvLoggerConfig;
    const logger = loggerForFormat(format, prettyOverrides);
    return Logger.replace(Logger.defaultLogger, logger);
  });

/**
 * Apply the environment-derived logger and minimum level to an Effect.
 */
export const withEnvLogging =
  (prettyOverrides?: Partial<PrettyLoggerConfig>) =>
  <A, E, R>(self: Effect.Effect<A, E, R>) =>
    Effect.gen(function* () {
      const { level } = yield* readEnvLoggerConfig;
      const layer = yield* makeEnvLoggerLayerFromEnv(prettyOverrides);
      return yield* self.pipe(Logger.withMinimumLogLevel(level), Effect.provide(layer));
    });

// =========================
// Demonstrations / Examples
// =========================

// =========================
// Accumulation helpers (reusable)
// =========================

export interface AccumulateResult<A, E> {
  readonly successes: ReadonlyArray<A>;
  readonly errors: ReadonlyArray<Cause.Cause<E>>;
}

export interface AccumulateOptions {
  readonly concurrency?: number | "unbounded";
  readonly spanLabel?: string;
  readonly annotations?: Readonly<Record<string, string>>;
  readonly colors?: boolean;
}

/**
 * Run all effects, capturing every failure as a Cause (no fail-fast), and return arrays.
 */
export const accumulateEffects = <A, E, R>(
  effects: ReadonlyArray<Effect.Effect<A, E, R>>,
  options?: { readonly concurrency?: number | "unbounded" }
): Effect.Effect<AccumulateResult<A, E>, never, R> =>
  Effect.gen(function* () {
    const [errs, oks] = yield* Effect.partition(effects, (eff) => Effect.sandbox(eff), {
      concurrency: options?.concurrency ?? "unbounded",
    });
    return { successes: oks, errors: errs };
  });

/**
 * Run and log a summary. Pretty-print each error cause.
 */
export const accumulateEffectsAndReport = <A, E, R>(
  effects: ReadonlyArray<Effect.Effect<A, E, R>>,
  options?: AccumulateOptions
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
