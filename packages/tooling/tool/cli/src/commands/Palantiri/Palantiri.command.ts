/**
 * `beep palantiri`: agent-facing observability parcels.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import {
  Freshness,
  layerPalantiriClientInProcess,
  layerParcels,
  PalantiriClient,
  ParcelBudget,
  ParcelEnvelope,
  ParcelItem,
  ParcelReadOptions,
  parcelSpecs,
  SessionKey,
  withTraceParent,
} from "@beep/palantiri";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import { Command, Flag } from "effect/cli";
import * as DateTime from "effect/DateTime";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import { dual } from "effect/Function";
import * as Layer from "effect/Layer";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { failWithReportedExit } from "../../internal/cli/ExitCodeError.ts";
import { sessionHarness } from "../Session/SessionLedger.service.ts";
import { layerPalantiriSourcesLive, layerPalantiriTelemetry } from "./Palantiri.service.ts";
import type { ParcelId, ParcelSources, ParcelSpec } from "@beep/palantiri";
import type * as FileSystem from "effect/FileSystem";
import type * as Path from "effect/Path";

const ParcelEnvelopeJson = S.fromJsonString(ParcelEnvelope);

const jsonFlag = Flag.Boolean("json").pipe(
  Flag.withDefault(false),
  Flag.withDescription("Emit the parcel as one JSON document")
);

const budgetFlag = Flag.Int("budget").pipe(
  Flag.withSchema(ParcelBudget),
  Flag.optional,
  Flag.withDescription("Most items to return (1-500, default 20)")
);

const sessionFlag = Flag.String("session").pipe(
  Flag.withSchema(SessionKey),
  Flag.optional,
  Flag.withDescription("Session whose read cursor to use (default: CLAUDE_CODE_SESSION_ID or CODEX_THREAD_ID)")
);

const optionText = <A>(option: O.Option<A>, render: (value: A) => string): string =>
  O.getOrElse(O.map(option, render), () => "");

const renderFreshness = Freshness.match({
  Fresh: (fresh) => `fresh as of ${DateTime.formatIso(fresh.asOf)}`,
  Unknown: (unknown) =>
    `unknown (${unknown.reason})${O.getOrElse(
      O.map(unknown.asOf, (asOf) => ` as of ${DateTime.formatIso(asOf)}`),
      () => ""
    )}${O.getOrElse(
      O.map(unknown.detail, (detail) => `: ${detail}`),
      () => ""
    )}`,
});

const percent = (value: number): string => `${Num.round(value, 1)}%`;

const unknownTag = Freshness.match({ Fresh: () => "", Unknown: (unknown) => `  [${unknown.reason}]` });

const renderItem = ParcelItem.match({
  AccountHeadroom: (item) =>
    `  ${item.provider} #${item.account}  ${item.state}${A.join(
      A.map(
        item.windows,
        (window) =>
          `  ${window.kind}${O.getOrElse(
            O.map(window.scope, (scope) => `(${scope})`),
            () => ""
          )} ${Num.round(window.remainingPercent, 0)}% left`
      ),
      ""
    )}`,
  LaneRed: (item) =>
    `  ${item.severity} ${item.lane}${optionText(item.prNumber, (pr) => ` #${pr}`)}  ${item.kind}: ${item.summary}${unknownTag(item.freshness)}`,
  PressureStall: (item) =>
    `  ${item.resource}  ${optionText(
      item.some,
      (some) => `some ${percent(some.avg10)}/${percent(some.avg60)}/${percent(some.avg300)}`
    )}${optionText(item.full, (full) => `  full ${percent(full.avg10)}/${percent(full.avg60)}/${percent(full.avg300)}`)}${unknownTag(item.freshness)}`,
  HostMemory: (item) =>
    `  memory  ${Num.round(item.availableGib, 1)} of ${Num.round(item.totalGib, 1)} GiB available${unknownTag(item.freshness)}`,
  AdmissionSlots: (item) =>
    `  admission  ${Num.round(item.activeTokens, 1)} of ${Num.round(item.capacityTokens, 1)} tokens active, ${item.queued} queued, ${item.dead} dead${item.hardFloorEngaged ? ", hard floor engaged" : ""}${unknownTag(item.freshness)}`,
  SessionChange: (item) =>
    `  ${DateTime.formatIso(item.at)}  ${item.source} ${item.lane}${optionText(item.prNumber, (pr) => ` #${pr}`)}${optionText(
      item.state,
      (state) => ` [${state}]`
    )}${optionText(item.kind, (kind) => ` [${kind}]`)}  ${item.text}`,
});

/**
 * Render a parcel envelope as plain text: summary, freshness, items, receipt.
 *
 * **Example** (Render an empty parcel)
 *
 * ```ts
 * import { Freshness, ParcelEnvelope, ParcelReceipt } from "@beep/palantiri"
 * import { renderParcel } from "@beep/repo-cli/test/Palantiri"
 * import * as DateTime from "effect/DateTime"
 * import * as O from "effect/Option"
 *
 * const text = renderParcel(
 *   ParcelEnvelope.make({
 *     schemaVersion: "palantiri-parcel/v1",
 *     parcel: "account-headroom",
 *     key: "account",
 *     readAt: DateTime.makeUnsafe("2026-10-14T12:00:00Z"),
 *     freshness: Freshness.cases.Unknown.make({ reason: "no-source", asOf: O.none(), detail: O.none() }),
 *     summary: "0 accounts",
 *     items: [],
 *     receipt: ParcelReceipt.make({ shown: 0, total: 0 })
 *   })
 * )
 * console.log(text.startsWith("account-headroom: 0 accounts")) // true
 * ```
 *
 * @param envelope - The parcel to render.
 * @returns The text, one line per item.
 * @category formatting
 * @since 0.0.0
 */
export const renderParcel = (envelope: ParcelEnvelope): string =>
  A.join(
    [
      `${envelope.parcel}: ${envelope.summary}`,
      `  ${renderFreshness(envelope.freshness)}`,
      ...A.map(envelope.items, renderItem),
      `  showing ${envelope.receipt.shown} of ${envelope.receipt.total}`,
    ],
    "\n"
  );

/**
 * Read one parcel through the in-process client, under the caller's
 * `TRACEPARENT`, and print it as one JSON document or as text.
 *
 * **Example** (Build the print effect)
 *
 * ```ts
 * import { ParcelReadOptions } from "@beep/palantiri"
 * import { printParcel } from "@beep/repo-cli/test/Palantiri"
 * import * as Effect from "effect/Effect"
 *
 * console.log(Effect.isEffect(printParcel("account-headroom", true))) // true
 * console.log(Effect.isEffect(printParcel("lane-reds", false, ParcelReadOptions.make({ budget: 5 })))) // true
 * ```
 *
 * @param id - The parcel to read.
 * @param json - Print the encoded envelope instead of text.
 * @param options - The budget (default 20) and the session `since-last-check` reads.
 * @returns An effect that prints the parcel.
 * @category cli-commands
 * @since 0.0.0
 */
export const printParcel = Effect.fn("PalantiriCommand.printParcel")(function* (
  id: ParcelId,
  json: boolean,
  options: ParcelReadOptions = ParcelReadOptions.make({})
) {
  const client = yield* PalantiriClient;
  const envelope = yield* client.parcels
    .read({
      params: { id },
      query: O.match(options.session, {
        onNone: () => ({ budget: options.budget }),
        onSome: (session) => ({ budget: options.budget, session }),
      }),
    })
    .pipe(withTraceParent);
  yield* Console.log(json ? yield* S.encodeEffect(ParcelEnvelopeJson)(envelope) : renderParcel(envelope));
});

const reportFailure = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(
    Effect.catchCause((cause) =>
      Effect.logError("[palantiri] parcel read failed", cause).pipe(
        Effect.andThen(failWithReportedExit("[palantiri] parcel read failed"))
      )
    )
  );

/**
 * The in-process Palantiri client over the given source and telemetry
 * layers: the runtime every Palantiri command (and, later, the MCP host)
 * reads through.
 *
 * **Details**
 *
 * The telemetry layer is provided underneath the client, so the handler it
 * runs sees the same tracer and exports through it.
 *
 * **Example** (Build the live runtime)
 *
 * ```ts
 * import { layerPalantiriRuntime, layerPalantiriSourcesLive, layerPalantiriTelemetry } from "@beep/repo-cli/test/Palantiri"
 * import * as Layer from "effect/Layer"
 *
 * console.log(Layer.isLayer(layerPalantiriRuntime(layerPalantiriSourcesLive, layerPalantiriTelemetry))) // true
 * ```
 *
 * @param sources - Every parcel source port.
 * @param telemetry - Tracer and metric export; `Layer.empty` exports nothing.
 * @returns The client layer.
 * @category layers
 * @since 0.0.0
 */
export const layerPalantiriRuntime: {
  <ET, RT>(
    telemetry: Layer.Layer<never, ET, RT>
  ): <EA, RA>(
    sources: Layer.Layer<ParcelSources, EA, RA>
  ) => Layer.Layer<PalantiriClient, EA | ET, FileSystem.FileSystem | Path.Path | RA | RT>;
  <EA, RA, ET, RT>(
    sources: Layer.Layer<ParcelSources, EA, RA>,
    telemetry: Layer.Layer<never, ET, RT>
  ): Layer.Layer<PalantiriClient, EA | ET, FileSystem.FileSystem | Path.Path | RA | RT>;
} = dual(
  2,
  <EA, RA, ET, RT>(
    sources: Layer.Layer<ParcelSources, EA, RA>,
    telemetry: Layer.Layer<never, ET, RT>
  ): Layer.Layer<PalantiriClient, EA | ET, FileSystem.FileSystem | Path.Path | RA | RT> =>
    layerPalantiriClientInProcess.pipe(
      Layer.provide(layerParcels),
      Layer.provide(sources),
      Layer.provideMerge(telemetry)
    )
);

const liveRuntime = layerPalantiriRuntime(layerPalantiriSourcesLive, layerPalantiriTelemetry);

// The flag wins; otherwise the harness session the process runs under.
const resolveSession = (flag: O.Option<SessionKey>) =>
  O.match(flag, {
    onSome: Effect.succeedSome,
    onNone: () => sessionHarness.pipe(Effect.map((harness) => O.filter(harness.sessionId, S.is(SessionKey)))),
  });

// An absent budget keeps the schema's default.
const readOptions = (budget: O.Option<ParcelBudget>, session: O.Option<SessionKey>) =>
  ParcelReadOptions.make({
    ...O.match(budget, { onNone: () => ({}), onSome: (value) => ({ budget: value }) }),
    session,
  });

const parcelCommand = (id: ParcelId, description: string) =>
  Command.make(
    id,
    { json: jsonFlag, budget: budgetFlag },
    Effect.fn("PalantiriCommand.parcel")(function* ({ json, budget }) {
      yield* reportFailure(printParcel(id, json, readOptions(budget, O.none())));
    })
  ).pipe(Command.withDescription(description), Command.provide(liveRuntime));

/**
 * `beep palantiri parcel account-headroom [--json] [--budget N]`: remaining
 * plan quota per account, by provider and ordinal, with freshness.
 *
 * **Example** (Read the command name)
 *
 * ```ts
 * import { palantiriAccountHeadroomCommand } from "@beep/repo-cli/test/Palantiri"
 *
 * console.log(palantiriAccountHeadroomCommand.name) // "account-headroom"
 * ```
 *
 * @category cli-commands
 * @since 0.0.0
 */
export const palantiriAccountHeadroomCommand = parcelCommand(
  "account-headroom",
  "Remaining plan quota per account, by provider and ordinal, with freshness"
);

/**
 * `beep palantiri parcel lane-reds [--json] [--budget N]`: open P0/P1 inbox
 * rows and failed proof jobs across this checkout and every live lane.
 *
 * **Example** (Read the command name)
 *
 * ```ts
 * import { palantiriLaneRedsCommand } from "@beep/repo-cli/test/Palantiri"
 *
 * console.log(palantiriLaneRedsCommand.name) // "lane-reds"
 * ```
 *
 * @category cli-commands
 * @since 0.0.0
 */
export const palantiriLaneRedsCommand = parcelCommand(
  "lane-reds",
  "Open P0/P1 inbox rows and failed proof jobs across this checkout and every live lane"
);

/**
 * `beep palantiri parcel host-pressure [--json] [--budget N]`: CPU, memory
 * and IO pressure stall figures, memory and admission occupancy.
 *
 * **Example** (Read the command name)
 *
 * ```ts
 * import { palantiriHostPressureCommand } from "@beep/repo-cli/test/Palantiri"
 *
 * console.log(palantiriHostPressureCommand.name) // "host-pressure"
 * ```
 *
 * @category cli-commands
 * @since 0.0.0
 */
export const palantiriHostPressureCommand = parcelCommand(
  "host-pressure",
  "CPU, memory and IO pressure stall figures, available memory and admission occupancy"
);

/**
 * `beep palantiri parcel app-error-classes [--json] [--budget N]`: app error
 * classes, `Unknown{no-source}` until a telemetry query adapter exists.
 *
 * **Example** (Read the command name)
 *
 * ```ts
 * import { palantiriAppErrorClassesCommand } from "@beep/repo-cli/test/Palantiri"
 *
 * console.log(palantiriAppErrorClassesCommand.name) // "app-error-classes"
 * ```
 *
 * @category cli-commands
 * @since 0.0.0
 */
export const palantiriAppErrorClassesCommand = parcelCommand(
  "app-error-classes",
  "App error classes (no telemetry query adapter yet, so always Unknown{no-source})"
);

/**
 * `beep palantiri parcel since-last-check [--json] [--budget N] [--session ID]`:
 * session notes and inbox rows newer than this session's last read, then
 * moves its read cursor.
 *
 * **Details**
 *
 * The session is `--session`, else `CLAUDE_CODE_SESSION_ID`, else
 * `CODEX_THREAD_ID`. With none, the parcel is
 * `Unknown{attribution-incomplete}` and no cursor moves.
 *
 * **Example** (Read the command name)
 *
 * ```ts
 * import { palantiriSinceLastCheckCommand } from "@beep/repo-cli/test/Palantiri"
 *
 * console.log(palantiriSinceLastCheckCommand.name) // "since-last-check"
 * ```
 *
 * @category cli-commands
 * @since 0.0.0
 */
export const palantiriSinceLastCheckCommand = Command.make(
  "since-last-check",
  { json: jsonFlag, budget: budgetFlag, session: sessionFlag },
  Effect.fn("PalantiriCommand.sinceLastCheck")(function* ({ json, budget, session }) {
    const resolved = yield* resolveSession(session);
    yield* reportFailure(printParcel("since-last-check", json, readOptions(budget, resolved)));
  })
).pipe(
  Command.withDescription("Session notes and inbox rows newer than this session's last read; moves its cursor"),
  Command.provide(liveRuntime)
);

const renderBound = (bound: Duration.Duration): string =>
  Duration.isFinite(bound) ? `${Duration.toSeconds(bound)}s` : "none (event-sourced)";

/**
 * Render a parcel spec as one line: id, key, freshness bound and sources.
 *
 * **Example** (Render the account-headroom spec)
 *
 * ```ts
 * import { AccountHeadroomSpec } from "@beep/palantiri"
 * import { renderParcelSpec } from "@beep/repo-cli/test/Palantiri"
 *
 * console.log(renderParcelSpec(AccountHeadroomSpec))
 * // "account-headroom  key=account  bound=300s  sources=accounts-poll, accounts-retained"
 * ```
 *
 * @param spec - A parcel's id, key, freshness bound and sources.
 * @returns One line.
 * @category formatting
 * @since 0.0.0
 */
export const renderParcelSpec = (spec: ParcelSpec): string =>
  `${spec.id}  key=${spec.key}  bound=${renderBound(spec.freshnessBound)}  sources=${A.join(spec.sources, ", ")}`;

/**
 * `beep palantiri parcels`: every parcel id with its key, freshness bound and
 * sources.
 *
 * **Example** (Read the command name)
 *
 * ```ts
 * import { palantiriParcelsCommand } from "@beep/repo-cli/test/Palantiri"
 *
 * console.log(palantiriParcelsCommand.name) // "parcels"
 * ```
 *
 * @category cli-commands
 * @since 0.0.0
 */
export const palantiriParcelsCommand = Command.make(
  "parcels",
  {},
  Effect.fn("PalantiriCommand.parcels")(function* () {
    yield* Effect.forEach(parcelSpecs, (spec) => Console.log(renderParcelSpec(spec)), { discard: true });
  })
).pipe(Command.withDescription("List every parcel with its key, freshness bound and sources"));

const parcelGroupCommand = Command.make("parcel").pipe(
  Command.withDescription("Read one schema-typed, freshness-checked parcel"),
  Command.withSubcommands([
    palantiriAccountHeadroomCommand,
    palantiriLaneRedsCommand,
    palantiriHostPressureCommand,
    palantiriAppErrorClassesCommand,
    palantiriSinceLastCheckCommand,
  ])
);

/**
 * `beep palantiri`: read agent-facing parcels
 * (`parcel <id> [--json] [--budget N]`) and list them (`parcels`).
 *
 * **Example** (Read the group name)
 *
 * ```ts
 * import { palantiriCommand } from "@beep/repo-cli/test/Palantiri"
 *
 * console.log(palantiriCommand.name) // "palantiri"
 * ```
 *
 * @category cli-commands
 * @since 0.0.0
 */
export const palantiriCommand = Command.make("palantiri").pipe(
  Command.withDescription("Agent-facing observability parcels: quota headroom, lane reds, host pressure and more"),
  Command.withSubcommands([parcelGroupCommand, palantiriParcelsCommand])
);
