import * as FS from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import { LogFormat } from "@beep/constants";
import type { CauseHeadingOptions, PrettyLoggerConfig } from "@beep/errors/shared";
import {
  colorForLevel,
  defaultConfig,
  extractPrimaryError,
  formatAnnotations,
  formatCausePretty,
  formatMessage,
  formatSpans,
  parseLevel,
  shouldPrintCause,
} from "@beep/errors/shared";
import * as Cause from "effect/Cause";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as FiberId from "effect/FiberId";
import * as HashMap from "effect/HashMap";
import * as Logger from "effect/Logger";
import * as LogLevel from "effect/LogLevel";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Record from "effect/Record";
import color from "picocolors";

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
 * Reads `APP_LOG_FORMAT` and `APP_LOG_LEVEL` with env-sensitive defaults:
 * - development (NODE_ENV!=production): format=pretty, level=All
 * - production  (NODE_ENV==production): format=json,   level=Error
 */
export const readEnvLoggerConfig = Effect.gen(function* () {
  const nodeEnv = process.env.NEXT_PUBLIC_ENV;
  const isProd = nodeEnv === "prod";

  const formatEnv = isProd ? "json" : (process.env.NEXT_PUBLIC_LOG_FORMAT as LogFormat.Type);
  const levelEnv = process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel.Literal;

  const format = isProd ? LogFormat.Enum.json : formatEnv;

  const level: LogLevel.LogLevel = parseLevel(levelEnv);

  return { format, level };
});

const loggerForFormat = (format: LogFormat.Type, prettyOverrides?: Partial<PrettyLoggerConfig>) => {
  return Match.value(format).pipe(
    Match.when("pretty", () => makePrettyConsoleLogger(prettyOverrides)),
    Match.when("logFmt", () => Logger.withLeveledConsole(Logger.logfmtLogger)),
    Match.whenOr("json", "structured", () => Logger.withLeveledConsole(Logger.jsonLogger)),
    Match.exhaustive
  );
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
