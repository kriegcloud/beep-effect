import bc from "@beep/colors";
import { $ObservabilityId } from "@beep/identity/packages";
import { LiteralKit, LogLevel } from "@beep/schema";
import { Cause, Inspectable, Layer, Logger, Match, References } from "effect";
import * as S from "effect/Schema";

const $I = $ObservabilityId.create("Logging");

/**
 * Supported console logger formats for shared observability wiring.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const LogFormat = LiteralKit(["pretty", "structured", "json", "logfmt", "string"]).pipe(
  $I.annoteSchema("LogFormat", {
    description: "Supported console logger formats for shared observability wiring.",
  })
);

/**
 * Runtime type for {@link LogFormat}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type LogFormat = typeof LogFormat.Type;

/**
 * Theme palette for the custom pretty logger.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const PrettyLogTheme = LiteralKit(["ocean", "forest", "sunrise", "mono"]).pipe(
  $I.annoteSchema("PrettyLogTheme", {
    description: "Theme palette for the custom pretty logger.",
  })
);

/**
 * Runtime type for {@link PrettyLogTheme}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type PrettyLogTheme = typeof PrettyLogTheme.Type;

/**
 * Banner render modes for startup and phase summaries.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const BannerMode = LiteralKit(["off", "startup", "phase", "all"]).pipe(
  $I.annoteSchema("BannerMode", {
    description: "Banner render modes for startup and phase summaries.",
  })
);

/**
 * Runtime type for {@link BannerMode}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type BannerMode = typeof BannerMode.Type;

/**
 * Extra configuration for the custom pretty logger.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class PrettyLoggerConfig extends S.Class<PrettyLoggerConfig>($I`PrettyLoggerConfig`)(
  {
    theme: PrettyLogTheme,
    bannerMode: BannerMode,
  },
  $I.annote("PrettyLoggerConfig", {
    description: "Extra configuration for the custom pretty logger.",
  })
) {}

/**
 * Shared logger configuration for browser-safe and server-safe console logging.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class LoggingConfig extends S.Class<LoggingConfig>($I`LoggingConfig`)(
  {
    format: LogFormat,
    minLogLevel: LogLevel,
  },
  $I.annote("LoggingConfig", {
    description: "Shared logger configuration for browser-safe and server-safe console logging.",
  })
) {}

type PrettyPalette = {
  readonly accent: (value: string) => string;
  readonly dim: (value: string) => string;
  readonly trace: (value: string) => string;
  readonly debug: (value: string) => string;
  readonly info: (value: string) => string;
  readonly warn: (value: string) => string;
  readonly error: (value: string) => string;
  readonly fatal: (value: string) => string;
};

const defaultPrettyLoggerConfig = new PrettyLoggerConfig({
  theme: "ocean",
  bannerMode: "off",
});

const themePalette = (theme: PrettyLogTheme): PrettyPalette =>
  Match.value(theme).pipe(
    Match.when("forest", () => ({
      accent: bc.green,
      dim: bc.dim,
      trace: bc.gray,
      debug: bc.cyan,
      info: bc.green,
      warn: bc.yellow,
      error: bc.red,
      fatal: (value: string) => bc.bgRed(bc.white(value)),
    })),
    Match.when("sunrise", () => ({
      accent: bc.yellow,
      dim: bc.dim,
      trace: bc.gray,
      debug: bc.magenta,
      info: bc.blue,
      warn: bc.yellow,
      error: bc.red,
      fatal: (value: string) => bc.bgRed(bc.white(value)),
    })),
    Match.when("mono", () => ({
      accent: bc.white,
      dim: bc.dim,
      trace: bc.dim,
      debug: bc.white,
      info: bc.white,
      warn: bc.white,
      error: bc.white,
      fatal: bc.white,
    })),
    Match.when("ocean", () => ({
      accent: bc.cyan,
      dim: bc.dim,
      trace: bc.gray,
      debug: bc.blue,
      info: bc.cyan,
      warn: bc.yellow,
      error: bc.red,
      fatal: (value: string) => bc.bgRed(bc.white(value)),
    })),
    Match.exhaustive
  );

const levelColor = (palette: PrettyPalette, level: LogLevel) =>
  Match.value(level).pipe(
    Match.when("Trace", () => palette.trace(level)),
    Match.when("Debug", () => palette.debug(level)),
    Match.when("Info", () => palette.info(level)),
    Match.when("Warn", () => palette.warn(level)),
    Match.when("Error", () => palette.error(level)),
    Match.when("Fatal", () => palette.fatal(level)),
    Match.orElse(() => palette.dim(level))
  );

const renderMessage = (message: unknown | ReadonlyArray<unknown>): string => {
  const values = Array.isArray(message) ? message : [message];
  return values.map((value) => Inspectable.toStringUnknown(value, 2)).join(" ");
};

const renderBannerGlyph = (kind: "phase" | "startup"): string => (kind === "phase" ? "<>" : "[]");

/**
 * Render an opt-in banner for startup and phase summaries.
 *
 * @since 0.0.0
 * @category Logging
 */
export const renderLogBanner = (
  title: string,
  options?: {
    readonly kind?: "phase" | "startup" | undefined;
    readonly pretty?: PrettyLoggerConfig | undefined;
  }
): string => {
  const pretty = options?.pretty ?? defaultPrettyLoggerConfig;
  const kind = options?.kind ?? "startup";

  if (
    pretty.bannerMode === "off" ||
    (pretty.bannerMode === "startup" && kind !== "startup") ||
    (pretty.bannerMode === "phase" && kind !== "phase")
  ) {
    return title;
  }

  const palette = themePalette(pretty.theme);
  const glyph = renderBannerGlyph(kind);
  const line = palette.accent(`${glyph.repeat(4)} ${title.toUpperCase()} ${glyph.repeat(4)}`);
  return [line, palette.dim("-".repeat(Math.max(12, title.length + 10)))].join("\n");
};

const makePrettyConsoleLogger = (pretty: PrettyLoggerConfig): Logger.Logger<unknown, void> => {
  const palette = themePalette(pretty.theme);

  return Logger.make((options) => {
    const timestamp = palette.dim(options.date.toISOString());
    const level = levelColor(palette, options.logLevel);
    const message = palette.accent(renderMessage(options.message));
    const annotations = options.fiber.getRef(References.CurrentLogAnnotations);
    const logSpans = options.fiber.getRef(References.CurrentLogSpans);
    const renderedAnnotations =
      Object.keys(annotations).length === 0 ? "" : ` ${palette.dim(Inspectable.toStringUnknown(annotations, 2))}`;
    const renderedSpans =
      logSpans.length === 0
        ? ""
        : ` ${palette.dim(
            Inspectable.toStringUnknown(
              logSpans.map(([label, startedAt]) => ({
                label,
                elapsedMs: Math.max(0, options.date.getTime() - startedAt),
              })),
              2
            )
          )}`;
    const renderedCause = options.cause.reasons.length === 0 ? "" : `\n${palette.dim(Cause.pretty(options.cause))}`;

    console.log(`${timestamp} ${level} ${message}${renderedAnnotations}${renderedSpans}${renderedCause}`);
  });
};

const resolveLogger = (format: LogFormat, pretty = defaultPrettyLoggerConfig) =>
  Match.value(format).pipe(
    Match.when("pretty", () => makePrettyConsoleLogger(pretty)),
    Match.when("structured", () => Logger.consoleStructured),
    Match.when("json", () => Logger.consoleJson),
    Match.when("logfmt", () => Logger.consoleLogFmt),
    Match.when("string", () => Logger.withConsoleLog(Logger.formatSimple)),
    Match.exhaustive
  );

/**
 * Build a console logger layer from a shared logging config.
 *
 * @since 0.0.0
 * @category Logging
 */
export const layerConsoleLogger = (
  config: LoggingConfig,
  pretty: PrettyLoggerConfig = defaultPrettyLoggerConfig
): Layer.Layer<never> =>
  Layer.mergeAll(
    Logger.layer([resolveLogger(config.format, pretty)]),
    Layer.succeed(References.MinimumLogLevel, config.minLogLevel)
  );
