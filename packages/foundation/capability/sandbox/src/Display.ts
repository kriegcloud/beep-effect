import { $SandboxId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import { A } from "@beep/utils";
import * as clack from "@clack/prompts";
import { Clock, Context, DateTime, Effect, Exit, FileSystem, Layer, Path, pipe, Ref, Tuple } from "effect";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $SandboxId.create("Display");

/**
 * Severity - The severity of the display message.
 */
export const Severity = LiteralKit(["Info", "Success", "Warn", "Error"]).pipe(
  $I.annoteSchema("Severity", {
    description: "Severity - The severity of the display message.",
  })
);

export type Severity = typeof Severity.Type;

export const DisplayEntryStatusBody = Severity.mapMembers((members) => {
  const make = <T extends Severity>(severityLiteral: S.Literal<T>) =>
    S.Struct({
      severity: S.tag(severityLiteral.literal),
      message: S.String,
    });

  return pipe(members, Tuple.evolve([make, make, make, make]));
}).pipe(
  $I.annoteSchema("DisplayEntryStatusBody", {
    description: "DisplayEntryStatusBody - Represents the body of a display entry status message.",
  }),
  S.toTaggedUnion("severity")
);

export type DisplayEntryStatusBody = typeof DisplayEntryStatusBody.Type;

export class DisplayEntryStatus extends S.TaggedClass<DisplayEntryStatus>($I`DisplayEntryStatus`)(
  "Status",
  {
    body: DisplayEntryStatusBody,
  },
  $I.annote("DisplayEntryStatus", {
    description: "DisplayEntryStatus - Represents an introduction entry for display messages.",
  })
) {}

export class DisplayEntryIntro extends S.TaggedClass<DisplayEntryIntro>($I`DisplayEntryIntro`)(
  "Intro",
  {
    title: S.String,
  },
  $I.annote("DisplayEntryIntro", {
    description: "DisplayEntryIntro - Represents an introduction entry for display messages.",
  })
) {}

export class DisplayEntrySpinner extends S.TaggedClass<DisplayEntrySpinner>($I`DisplayEntrySpinner`)(
  "Spinner",
  {
    message: S.String,
  },
  $I.annote("DisplayEntrySpinner", {
    description: "DisplayEntrySpinner - Represents a spinner entry for display messages.",
  })
) {}

export class DisplayEntrySummary extends S.TaggedClass<DisplayEntrySummary>($I`DisplayEntrySummary`)(
  "Summary",
  {
    title: S.String,
    rows: S.Record(S.String, S.String),
  },
  $I.annote("DisplayEntrySummary", {
    description: "DisplayEntrySummary - Represents a summary entry for display messages.",
  })
) {}

export class DisplayEntryTaskLog extends S.TaggedClass<DisplayEntryTaskLog>($I`DisplayEntryTaskLog`)(
  "TaskLog",
  {
    title: S.String,
    messages: S.Array(S.String),
  },
  $I.annote("DisplayEntryTaskLog", {
    description: "DisplayEntryTaskLog - Represents a task log entry for display messages.",
  })
) {}

export class DisplayEntryText extends S.TaggedClass<DisplayEntryText>($I`DisplayEntryText`)(
  "Text",
  {
    message: S.String,
  },
  $I.annote("DisplayEntryText", {
    description: "DisplayEntryText - Represents a text entry for display messages.",
  })
) {}

export class DisplayEntryToolCall extends S.TaggedClass<DisplayEntryToolCall>($I`DisplayEntryToolCall`)(
  "ToolCall",
  {
    name: S.String,
    formattedArgs: S.String,
  },
  $I.annote("DisplayEntryToolCall", {
    description: "DisplayEntryToolCall - Represents a tool call entry for display messages.",
  })
) {}

export const DisplayEntry = S.Union([
  DisplayEntryStatus,
  DisplayEntryIntro,
  DisplayEntrySpinner,
  DisplayEntrySummary,
  DisplayEntryTaskLog,
  DisplayEntryText,
  DisplayEntryToolCall,
]).pipe(
  S.toTaggedUnion("_tag"),
  $I.annoteSchema("DisplayEntry", {
    description: "DisplayEntry - Represents a display entry.",
  })
);

export type DisplayEntry = typeof DisplayEntry.Type;

export interface DisplayServiceShape {
  readonly intro: (title: string) => Effect.Effect<void>;

  readonly spinner: <A, E, R>(message: string, effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;

  readonly status: (message: string, severity: Severity) => Effect.Effect<void>;

  readonly summary: (title: string, rows: Record<string, string>) => Effect.Effect<void>;

  readonly taskLog: <A, E, R>(
    title: string,
    effect: (message: (msg: string) => void) => Effect.Effect<A, E, R>
  ) => Effect.Effect<A, E, R>;

  readonly text: (message: string) => Effect.Effect<void>;

  readonly toolCall: (name: string, formattedArgs: string) => Effect.Effect<void>;
}

export class Display extends Context.Service<Display, DisplayServiceShape>()($I`Display`) {}

export const SilentDisplay = {
  layer: (ref: Ref.Ref<ReadonlyArray<DisplayEntry>>): Layer.Layer<Display> =>
    Layer.succeed(Display, {
      intro: Effect.fn("SilentDisplay.intro")(function* (title: string) {
        yield* Ref.update(
          ref,
          A.append(
            new DisplayEntryIntro({
              title,
            })
          )
        );
      }),
      status: Effect.fn("SilentDisplay.status")(function* (message: string, severity: Severity) {
        yield* Ref.update(
          ref,
          A.append(
            new DisplayEntryStatus({
              body: DisplayEntryStatusBody.cases[severity].make({
                message,
              }),
            })
          )
        );
      }),

      spinner: Effect.fn("SilentDisplay.spinner")(function* <A, E, R>(message: string, effect: Effect.Effect<A, E, R>) {
        yield* Ref.update(
          ref,
          A.append(
            new DisplayEntrySpinner({
              message,
            })
          )
        );

        return yield* effect;
      }),

      summary: Effect.fn("SilentDisplay.summary")(function* (title, rows) {
        yield* Ref.update(
          ref,
          A.append(
            new DisplayEntrySummary({
              title,
              rows,
            })
          )
        );
      }),

      taskLog: Effect.fn("SilentDisplay.taskLog")(function* <A, E, R>(
        title: string,
        effect: (message: (msg: string) => void) => Effect.Effect<A, E, R>
      ) {
        let messages = A.empty<string>();
        const collectMessage = (message: string): void => {
          messages = A.append(messages, message);
        };

        const result = yield* effect(collectMessage);

        return yield* Effect.map(
          Ref.update(
            ref,
            A.append(
              new DisplayEntryTaskLog({
                title,
                messages,
              })
            )
          ),
          () => result
        );
      }),
      text: Effect.fn("SilentDisplay.text")(function* (message) {
        yield* Ref.update(
          ref,
          A.append(
            new DisplayEntryText({
              message,
            })
          )
        );
      }),
      toolCall: Effect.fn("SilentDisplay.toolCall")(function* (name, formattedArgs) {
        yield* Ref.update(
          ref,
          A.append(
            new DisplayEntryToolCall({
              name,
              formattedArgs,
            })
          )
        );
      }),
    }),
};

const appendFlag = { flag: "a" } as const;

const stripStatusPrefix = Str.replace(/^\[[^\]]+\] /, "");

const renderSummaryRows = (rows: Record<string, string>): string =>
  pipe(
    rows,
    R.toEntries,
    A.map(([key, value]) => `  ${key}: ${value}`),
    A.join("\n")
  );

const formatElapsedSeconds = (startMillis: number, endMillis: number): string =>
  `${((endMillis - startMillis) / 1000).toFixed(1)}s`;

/**
 * File-backed display implementation that appends display output to a log file.
 *
 * @category Layers
 * @since 0.0.0
 */
export const FileDisplay = {
  layer: (filePath: string): Layer.Layer<Display, never, FileSystem.FileSystem | Path.Path> =>
    Layer.effect(
      Display,
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;

        yield* fs.makeDirectory(path.dirname(filePath), { recursive: true }).pipe(Effect.orDie);

        const startedAt = yield* DateTime.now;
        const delimiter = `\n--- Run started: ${DateTime.formatIso(startedAt)} ---\n`;
        yield* fs.writeFileString(filePath, delimiter, appendFlag).pipe(Effect.orDie);

        const appendToLog = (line: string): Effect.Effect<void> =>
          fs.writeFileString(filePath, `${line}\n`, appendFlag).pipe(Effect.ignore);

        return Display.of({
          intro: Effect.fn("FileDisplay.intro")(function* () {
            return yield* Effect.void;
          }),

          status: Effect.fn("FileDisplay.status")(function* (message: string, _severity: Severity) {
            yield* appendToLog(stripStatusPrefix(message));
          }),

          spinner: Effect.fn("FileDisplay.spinner")(function* <A, E, R>(
            message: string,
            effect: Effect.Effect<A, E, R>
          ) {
            yield* appendToLog(`${message}...`);
            const start = yield* Clock.currentTimeMillis;
            const result = yield* effect;
            const end = yield* Clock.currentTimeMillis;

            yield* appendToLog(`${message} done (${formatElapsedSeconds(start, end)})`);

            return result;
          }),

          summary: Effect.fn("FileDisplay.summary")(function* (title: string, rows: Record<string, string>) {
            yield* appendToLog(`${title}\n${renderSummaryRows(rows)}`);
          }),

          taskLog: Effect.fn("FileDisplay.taskLog")(function* <A, E, R>(
            title: string,
            effect: (message: (msg: string) => void) => Effect.Effect<A, E, R>
          ) {
            yield* appendToLog(title);
            const start = yield* Clock.currentTimeMillis;
            let messages = A.empty<string>();
            const collectMessage = (message: string): void => {
              messages = A.append(messages, message);
            };

            const result = yield* effect(collectMessage);
            const end = yield* Clock.currentTimeMillis;

            yield* Effect.forEach(messages, (message) => appendToLog(`  ${message}`), { discard: true });
            yield* appendToLog(`${title} done (${formatElapsedSeconds(start, end)})`);

            return result;
          }),

          text: Effect.fn("FileDisplay.text")(function* (message: string) {
            yield* appendToLog(message);
          }),

          toolCall: Effect.fn("FileDisplay.toolCall")(function* (name: string, formattedArgs: string) {
            yield* appendToLog(`${name}(${formattedArgs})`);
          }),
        });
      })
    ),
};

const terminalAnsi = {
  bold: ["\u001B[1m", "\u001B[22m"],
  dim: ["\u001B[2m", "\u001B[22m"],
  inverse: ["\u001B[7m", "\u001B[27m"],
} as const;

const styleText = (style: keyof typeof terminalAnsi, text: string): string => {
  const [open, close] = terminalAnsi[style];

  return `${open}${text}${close}`;
};

const severityToClack: Record<Severity, (message: string) => void> = {
  Error: clack.log.error,
  Info: clack.log.info,
  Success: clack.log.success,
  Warn: clack.log.warning,
};

/**
 * Terminal text styles used by {@link ClackDisplay}.
 *
 * @category Rendering
 * @since 0.0.0
 */
export const terminalStyle = {
  status: (message: string): string => styleText("bold", message),
  summaryTitle: (title: string): string => styleText("bold", title),
  summaryRow: (key: string, value: string): string => `${styleText("bold", key)}: ${styleText("dim", value)}`,
  toolCall: (text: string): string => styleText("dim", text),
};

/**
 * Interactive terminal display implementation backed by `@clack/prompts`.
 *
 * @category Layers
 * @since 0.0.0
 */
export const ClackDisplay = {
  layer: Layer.succeed(
    Display,
    Display.of({
      intro: Effect.fn("ClackDisplay.intro")(function* (title: string) {
        yield* Effect.sync(() => clack.intro(styleText("inverse", ` ${title} `)));
      }),

      status: Effect.fn("ClackDisplay.status")(function* (message: string, severity: Severity) {
        yield* Effect.sync(() => severityToClack[severity](terminalStyle.status(message)));
      }),

      spinner: Effect.fn("ClackDisplay.spinner")(function* <A, E, R>(message: string, effect: Effect.Effect<A, E, R>) {
        return yield* Effect.acquireUseRelease(
          Effect.sync(() => {
            const spinner = clack.spinner();
            spinner.start(message);

            return spinner;
          }),
          () => effect,
          (spinner, exit) =>
            Effect.sync(() => {
              if (Exit.isSuccess(exit)) {
                spinner.stop(message);
              } else {
                spinner.stop(`${message} (failed)`);
              }
            })
        );
      }),

      summary: Effect.fn("ClackDisplay.summary")(function* (title: string, rows: Record<string, string>) {
        yield* Effect.sync(() => {
          const lines = pipe(
            rows,
            R.toEntries,
            A.map(([key, value]) => terminalStyle.summaryRow(key, value)),
            A.join("\n")
          );

          clack.note(lines, terminalStyle.summaryTitle(title));
        });
      }),

      taskLog: Effect.fn("ClackDisplay.taskLog")(function* <A, E, R>(
        title: string,
        effect: (message: (msg: string) => void) => Effect.Effect<A, E, R>
      ) {
        return yield* Effect.acquireUseRelease(
          Effect.sync(() => clack.taskLog({ title })),
          (log) => effect((message) => log.message(message)),
          (log, exit) =>
            Effect.sync(() => {
              if (Exit.isSuccess(exit)) {
                log.success(title, { showLog: true });
              } else {
                log.error(title, { showLog: true });
              }
            })
        );
      }),

      text: Effect.fn("ClackDisplay.text")(function* (message: string) {
        yield* Effect.sync(() => clack.log.message(message));
      }),

      toolCall: Effect.fn("ClackDisplay.toolCall")(function* (name: string, formattedArgs: string) {
        yield* Effect.sync(() => clack.log.step(terminalStyle.toolCall(`${name}(${formattedArgs})`)));
      }),
    })
  ),
};
