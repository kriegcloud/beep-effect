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
  ParcelEnvelope,
  ParcelItem,
  withTraceParent,
} from "@beep/palantiri";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import { Command, Flag } from "effect/cli";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import { dual } from "effect/Function";
import * as Layer from "effect/Layer";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { failWithReportedExit } from "../../internal/cli/ExitCodeError.ts";
import { layerAccountHeadroomSourceLive, layerPalantiriTelemetry } from "./Palantiri.service.ts";
import type { AccountHeadroomSource, ParcelId } from "@beep/palantiri";
import type * as FileSystem from "effect/FileSystem";
import type * as Path from "effect/Path";

const ParcelEnvelopeJson = S.fromJsonString(ParcelEnvelope);

const jsonFlag = Flag.Boolean("json").pipe(
  Flag.withDefault(false),
  Flag.withDescription("Emit the parcel as one JSON document")
);

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
 * import { printParcel } from "@beep/repo-cli/test/Palantiri"
 * import * as Effect from "effect/Effect"
 *
 * console.log(Effect.isEffect(printParcel("account-headroom", true))) // true
 * ```
 *
 * @param id - The parcel to read.
 * @param json - Print the encoded envelope instead of text.
 * @returns An effect that prints the parcel.
 * @category cli-commands
 * @since 0.0.0
 */
export const printParcel = Effect.fn("PalantiriCommand.printParcel")(function* (id: ParcelId, json: boolean) {
  const client = yield* PalantiriClient;
  const envelope = yield* client.parcels.read({ params: { id }, query: {} }).pipe(withTraceParent);
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
 * import { layerAccountHeadroomSourceLive, layerPalantiriRuntime, layerPalantiriTelemetry } from "@beep/repo-cli/test/Palantiri"
 * import * as Layer from "effect/Layer"
 *
 * console.log(Layer.isLayer(layerPalantiriRuntime(layerAccountHeadroomSourceLive, layerPalantiriTelemetry))) // true
 * ```
 *
 * @param accountHeadroom - The account-headroom source port.
 * @param telemetry - Tracer and metric export; `Layer.empty` exports nothing.
 * @returns The client layer.
 * @category layers
 * @since 0.0.0
 */
export const layerPalantiriRuntime: {
  <ET, RT>(
    telemetry: Layer.Layer<never, ET, RT>
  ): <EA, RA>(
    accountHeadroom: Layer.Layer<AccountHeadroomSource, EA, RA>
  ) => Layer.Layer<PalantiriClient, EA | ET, FileSystem.FileSystem | Path.Path | RA | RT>;
  <EA, RA, ET, RT>(
    accountHeadroom: Layer.Layer<AccountHeadroomSource, EA, RA>,
    telemetry: Layer.Layer<never, ET, RT>
  ): Layer.Layer<PalantiriClient, EA | ET, FileSystem.FileSystem | Path.Path | RA | RT>;
} = dual(
  2,
  <EA, RA, ET, RT>(
    accountHeadroom: Layer.Layer<AccountHeadroomSource, EA, RA>,
    telemetry: Layer.Layer<never, ET, RT>
  ): Layer.Layer<PalantiriClient, EA | ET, FileSystem.FileSystem | Path.Path | RA | RT> =>
    layerPalantiriClientInProcess.pipe(
      Layer.provide(layerParcels),
      Layer.provide(accountHeadroom),
      Layer.provideMerge(telemetry)
    )
);

/**
 * `beep palantiri parcel account-headroom [--json]`: remaining plan quota per
 * account, by provider and ordinal, with freshness.
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
export const palantiriAccountHeadroomCommand = Command.make(
  "account-headroom",
  { json: jsonFlag },
  Effect.fn("PalantiriCommand.accountHeadroom")(function* ({ json }) {
    yield* reportFailure(printParcel("account-headroom", json));
  })
).pipe(
  Command.withDescription("Remaining plan quota per account, by provider and ordinal, with freshness"),
  Command.provide(layerPalantiriRuntime(layerAccountHeadroomSourceLive, layerPalantiriTelemetry))
);

const parcelCommand = Command.make("parcel").pipe(
  Command.withDescription("Read one schema-typed, freshness-checked parcel"),
  Command.withSubcommands([palantiriAccountHeadroomCommand])
);

/**
 * `beep palantiri`: read agent-facing parcels such as `parcel
 * account-headroom [--json]`.
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
  Command.withDescription("Agent-facing observability parcels: quota headroom and more, freshness-checked"),
  Command.withSubcommands([parcelCommand])
);
