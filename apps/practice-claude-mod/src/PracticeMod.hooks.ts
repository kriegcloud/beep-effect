/**
 * The practice mod's hook bodies.
 *
 * **Details**
 *
 * Claude Code reads a hooks module statically: `register` must be a function
 * declaration, every hook a function literal, and `$` may only be handed to
 * functions named at the top of the module. So each body here is curried on
 * `$` (`toolRow($)(e)`), and `src/build-plugin.ts` generates the `register`
 * entry that calls them from literal hooks.
 *
 * - practice-kg tool rows draw as plain sentences (`/practice raw` toggles
 *   the engine's own rows back, D13);
 * - the band above the prompt offers Right / Wrong / Partly / Undo for the
 *   latest answer, and `/right`, `/wrong`, `/partly` do the same (D14);
 * - `/practice export` writes the verdict log as JSON lines into the working
 *   folder.
 *
 * **Gotchas**
 *
 * The latest answer and the raw-row toggle live in module state: a hot
 * reload forgets them until the next answer completes.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Match from "effect/Match";
import * as MutableRef from "effect/MutableRef";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { ModHost, makeModHost } from "./PracticeMod.host.ts";
import { phraseToolCall, practiceKgToolOf } from "./PracticeMod.phrases.ts";
import { KgAnswerItem } from "./PracticeMod.values.ts";
import { makeVerdictLog, VerdictInput, VerdictLog } from "./PracticeMod.verdicts.ts";
import type {
  AbovePromptProps,
  CommandRunResult,
  Engine,
  PluginOptions,
  RenderElement,
  RenderInput,
  ToolUseProps,
  TurnCompleteInput,
} from "claude-code";
import type { Verdict } from "./PracticeMod.values.ts";

type LatestAnswer = { readonly turnId: string; readonly question: string };

const DefaultServers: ReadonlyArray<string> = ["practice-kg"];
const ExportFile = "practice-verdicts.jsonl";

const VerdictLabel: Record<Verdict, string> = { right: "Right", wrong: "Wrong", partly: "Partly right" };

/**
 * The slash commands the mod registers.
 *
 * **Example** (List the commands)
 *
 * ```ts
 * import { PracticeCommands } from "@/PracticeMod.hooks"
 *
 * console.log(PracticeCommands.map((command) => command.name)) // ["right", "wrong", "partly", "practice"]
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const PracticeCommands = [
  { name: "right", description: "Mark Claude's last answer right.", argumentHint: "[note]" },
  { name: "wrong", description: "Mark Claude's last answer wrong.", argumentHint: "[note]" },
  { name: "partly", description: "Mark Claude's last answer partly right.", argumentHint: "[note]" },
  {
    name: "practice",
    description: "Practice tools: export the verdicts, undo the last verdict, or show raw tool rows.",
    argumentHint: "export | undo | raw",
  },
];

const servers = MutableRef.make(DefaultServers);
const latest = MutableRef.make<O.Option<LatestAnswer>>(O.none());
const lastSaved = MutableRef.make<O.Option<string>>(O.none());
const rawRows = MutableRef.make(false);

const decodeServers = S.decodeUnknownOption(S.NonEmptyArray(S.NonEmptyString));

const runWith =
  ($: Engine) =>
  <A, E>(program: Effect.Effect<A, E, VerdictLog | ModHost>): Promise<A> =>
    Effect.runPromise(
      program.pipe(
        Effect.provideServiceEffect(VerdictLog, makeVerdictLog),
        Effect.provideService(ModHost, makeModHost($))
      )
    );

const noteOf = (args: string): O.Option<string> => O.liftPredicate(Str.trim(args), Str.isNonEmpty);

/**
 * Applies the plugin's options: `servers` names the MCP servers whose
 * practice-kg tools are redrawn (default `practice-kg`).
 *
 * **Example** (Reference configure)
 *
 * ```ts
 * import * as P from "effect/Predicate"
 * import { configure } from "@/PracticeMod.hooks"
 *
 * console.log(P.isFunction(configure)) // true
 * ```
 *
 * @category hooks
 * @since 0.0.0
 */
export const configure = (options: PluginOptions): void => {
  MutableRef.set(
    servers,
    O.getOrElse(decodeServers(options.servers), () => DefaultServers)
  );
};

/**
 * Registers the mod's slash commands.
 *
 * **Example** (Reference registerCommands)
 *
 * ```ts
 * import * as P from "effect/Predicate"
 * import { registerCommands } from "@/PracticeMod.hooks"
 *
 * console.log(P.isFunction(registerCommands)) // true
 * ```
 *
 * @category hooks
 * @since 0.0.0
 */
export const registerCommands = ($: Engine) => (): Promise<void> =>
  Effect.runPromise(
    Effect.forEach(PracticeCommands, (command) => Effect.promise(() => $.command.register(command)), {
      discard: true,
    })
  );

/**
 * Remembers the latest main-loop answer as the verdict target.
 *
 * **Example** (Reference rememberAnswer)
 *
 * ```ts
 * import * as P from "effect/Predicate"
 * import { rememberAnswer } from "@/PracticeMod.hooks"
 *
 * console.log(P.isFunction(rememberAnswer)) // true
 * ```
 *
 * @category hooks
 * @since 0.0.0
 */
export const rememberAnswer =
  ($: Engine) =>
  (e: TurnCompleteInput): Promise<void> =>
    e.agentId !== undefined || e.isAborted
      ? Promise.resolve()
      : Effect.runPromise(
          Effect.map(
            Effect.promise(() => $.session.messages()),
            (messages) => {
              const question = pipe(
                A.findLast(messages, (message) => message.role === "user"),
                O.map((message) => message.text),
                O.getOrElse(() => "")
              );
              MutableRef.set(latest, O.some({ turnId: e.turnId, question }));
              MutableRef.set(lastSaved, O.none());
              $.ui.invalidate("ui.render");
            }
          )
        );

const recordVerdict =
  ($: Engine) =>
  (verdict: O.Option<Verdict>, note: O.Option<string>): Promise<string> =>
    O.match(MutableRef.get(latest), {
      onNone: () => Promise.resolve("There is no answer to mark yet."),
      onSome: (answer) =>
        runWith($)(
          Effect.gen(function* () {
            const host = yield* ModHost;
            const log = yield* VerdictLog;
            const sessionId = yield* host.sessionId;
            const item = KgAnswerItem.make({
              itemId: `kg-answer:${sessionId}:${answer.turnId}`,
              sessionId,
              turnId: answer.turnId,
              question: answer.question,
              matter: O.none(),
            });
            yield* log.record(VerdictInput.make({ item, verdict, note }));
            const saved = O.match(verdict, {
              onNone: () => "Undone",
              onSome: (value) => `Saved: ${VerdictLabel[value]}`,
            });
            MutableRef.set(lastSaved, O.some(saved));
            yield* host.toast(saved);
            $.ui.invalidate("ui.render");
            return saved;
          }).pipe(
            Effect.catchTag("VerdictLocked", () => Effect.succeed("This answer is locked; the verdict was not saved.")),
            Effect.orElseSucceed(() => "The verdict could not be saved. Try again.")
          )
        ),
    });

/**
 * Answers `/right`, `/wrong` and `/partly`.
 *
 * **Example** (Reference verdictCommand)
 *
 * ```ts
 * import * as P from "effect/Predicate"
 * import { verdictCommand } from "@/PracticeMod.hooks"
 *
 * console.log(P.isFunction(verdictCommand)) // true
 * ```
 *
 * @category hooks
 * @since 0.0.0
 */
export const verdictCommand =
  ($: Engine) =>
  (verdict: Verdict, args: string): Promise<CommandRunResult> =>
    recordVerdict($)(O.some(verdict), noteOf(args)).then((text) => ({ text }));

/**
 * Answers `/practice export | undo | raw`.
 *
 * **Example** (Reference practiceCommand)
 *
 * ```ts
 * import * as P from "effect/Predicate"
 * import { practiceCommand } from "@/PracticeMod.hooks"
 *
 * console.log(P.isFunction(practiceCommand)) // true
 * ```
 *
 * @category hooks
 * @since 0.0.0
 */
export const practiceCommand =
  ($: Engine) =>
  (args: string): Promise<CommandRunResult> =>
    Match.value(Str.trim(args)).pipe(
      Match.when("raw", () => {
        const raw = !MutableRef.get(rawRows);
        MutableRef.set(rawRows, raw);
        $.ui.invalidate("ui.render");
        return Promise.resolve({ text: raw ? "Showing the raw tool calls." : "Showing tool calls in plain language." });
      }),
      Match.when("undo", () => recordVerdict($)(O.none(), O.none()).then((text) => ({ text }))),
      Match.when("export", () =>
        runWith($)(
          Effect.flatMap(VerdictLog, (log) => log.exportJsonl(ExportFile)).pipe(
            Effect.match({
              onFailure: () => ({ text: "The verdicts could not be exported." }),
              onSuccess: (count) => ({ text: `Exported ${count} verdicts to ${ExportFile}.` }),
            })
          )
        )
      ),
      Match.orElse(() => Promise.resolve({ text: "Use /practice export, /practice undo, or /practice raw." }))
    );

/**
 * The plain-language row for a practice-kg tool call, or undefined to keep
 * the engine's own row.
 *
 * **Example** (Reference toolRow)
 *
 * ```ts
 * import * as P from "effect/Predicate"
 * import { toolRow } from "@/PracticeMod.hooks"
 *
 * console.log(P.isFunction(toolRow)) // true
 * ```
 *
 * @category hooks
 * @since 0.0.0
 */
export const toolRow =
  ($: Engine) =>
  (e: RenderInput<"ToolUse", ToolUseProps>): RenderElement | undefined =>
    MutableRef.get(rawRows)
      ? undefined
      : pipe(
          practiceKgToolOf(MutableRef.get(servers), e.props.tool),
          O.map((tool) => {
            const { Text } = $.ui.resolve(e);
            const sentence = phraseToolCall(tool, e.props.input);
            return e.props.isErrored
              ? Text({ color: "red", children: `${sentence} (failed)` })
              : e.props.isRunning
                ? Text({ dimColor: true, children: `${sentence}...` })
                : Text({ children: sentence });
          }),
          O.getOrUndefined
        );

/**
 * The verdict band for the latest answer, or undefined when there is none.
 *
 * **Example** (Reference verdictBand)
 *
 * ```ts
 * import * as P from "effect/Predicate"
 * import { verdictBand } from "@/PracticeMod.hooks"
 *
 * console.log(P.isFunction(verdictBand)) // true
 * ```
 *
 * @category hooks
 * @since 0.0.0
 */
export const verdictBand =
  ($: Engine) =>
  (e: RenderInput<"AbovePrompt", AbovePromptProps>): RenderElement | undefined =>
    pipe(
      MutableRef.get(latest),
      O.map(() => {
        const { Box, Text, Button } = $.ui.resolve(e);
        const press = (verdict: O.Option<Verdict>) => () => void recordVerdict($)(verdict, O.none());
        return Box({
          flexDirection: "row",
          gap: 1,
          children: [
            Text({ dimColor: true, children: "Last answer:" }),
            Button({ key: "verdict-right", label: "Right", onPress: press(O.some("right")) }),
            Button({ key: "verdict-wrong", label: "Wrong", onPress: press(O.some("wrong")) }),
            Button({ key: "verdict-partly", label: "Partly", onPress: press(O.some("partly")) }),
            Button({ key: "verdict-undo", label: "Undo", plain: true, dimColor: true, onPress: press(O.none()) }),
            pipe(
              MutableRef.get(lastSaved),
              O.map((saved) => Text({ dimColor: true, children: saved })),
              O.getOrUndefined
            ),
          ],
        });
      }),
      O.getOrUndefined
    );
