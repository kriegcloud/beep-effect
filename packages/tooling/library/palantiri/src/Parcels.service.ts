/**
 * The `Parcels` service and the source ports it reads through.
 *
 * **Details**
 *
 * Every local source a parcel needs lives in the repo CLI, which no package
 * may depend on. So each parcel declares a narrow source port here, the CLI
 * provides it from its own services, and `Parcels` stays host-agnostic: the
 * CLI command and the MCP host read the same service.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $PalantiriId } from "@beep/identity/packages";
import { AgentProvider } from "@beep/repo-ai-metrics/AiMetrics.instruments";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as Layer from "effect/Layer";
import * as Metric from "effect/Metric";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import {
  AccountHeadroomSpec,
  accountHeadroomItems,
  freshAccountHeadroom,
  reduceAccountHeadroom,
} from "./AccountHeadroom.ts";
import { Freshness } from "./Freshness.ts";
import {
  AccountsWindowRemaining,
  ParcelAttribute,
  ParcelFreshnessAttribute,
  ProviderAttribute,
  WindowAttribute,
  WindowScopeAttribute,
} from "./Palantiri.instruments.ts";
import { ParcelId, ParcelReadOptions } from "./Parcel.models.ts";
import { makeParcelEnvelope, ParcelDraft } from "./ParcelEnvelope.models.ts";
import { UnknownParcel } from "./Parcels.errors.ts";
import type { AccountHeadroom, AccountHeadroomInput } from "./AccountHeadroom.models.ts";
import type { ParcelBudget } from "./Parcel.models.ts";
import type { ParcelEnvelope } from "./ParcelEnvelope.models.ts";
import type { SourceFailed } from "./Parcels.errors.ts";

const $I = $PalantiriId.create("Parcels.service");

/**
 * Port the account-headroom parcel reads through: one accounts report.
 *
 * **Example** (Provide a fixed report)
 *
 * ```ts
 * import { AccountHeadroomSource } from "@beep/palantiri/Parcels.service"
 * import { AccountHeadroomInput, AccountsReportInput } from "@beep/palantiri/AccountHeadroom.models"
 * import * as DateTime from "effect/DateTime"
 * import * as Effect from "effect/Effect"
 * import * as O from "effect/Option"
 *
 * const source = AccountHeadroomSource.of({
 *   snapshot: Effect.succeed(
 *     AccountHeadroomInput.make({
 *       report: AccountsReportInput.make({ schemaVersion: "accounts-status/v2", generatedAt: DateTime.makeUnsafe(0), groups: [] }),
 *       expectedProviders: O.some([])
 *     })
 *   )
 * })
 * console.log(Effect.isEffect(source.snapshot)) // true
 * ```
 *
 * @category ports
 * @since 0.0.0
 */
export class AccountHeadroomSource extends Context.Service<
  AccountHeadroomSource,
  {
    /**
     * The newest accounts report the host can serve, live or from its
     * snapshot, with the providers the host has configured.
     */
    readonly snapshot: Effect.Effect<AccountHeadroomInput, SourceFailed>;
  }
>()($I`AccountHeadroomSource`) {}

/**
 * Shape of the {@link Parcels} service.
 *
 * @category services
 * @since 0.0.0
 */
export interface ParcelsShape {
  /**
   * Read one parcel by id. A source failure is served as
   * `Unknown{unreachable}`; only an unknown id fails.
   */
  readonly read: (id: string, options?: ParcelReadOptions) => Effect.Effect<ParcelEnvelope, UnknownParcel>;
}

/**
 * Reads parcels, checks their freshness, and records the quota gauge.
 *
 * **Example** (Read a parcel)
 *
 * ```ts
 * import { AccountHeadroomSource, Parcels, layerParcels } from "@beep/palantiri/Parcels.service"
 * import { AccountHeadroomInput, AccountsReportInput } from "@beep/palantiri/AccountHeadroom.models"
 * import * as DateTime from "effect/DateTime"
 * import * as Effect from "effect/Effect"
 * import * as Layer from "effect/Layer"
 * import * as O from "effect/Option"
 *
 * const source = Layer.succeed(AccountHeadroomSource, {
 *   snapshot: Effect.succeed(
 *     AccountHeadroomInput.make({
 *       report: AccountsReportInput.make({ schemaVersion: "accounts-status/v2", generatedAt: DateTime.makeUnsafe(0), groups: [] }),
 *       expectedProviders: O.some([])
 *     })
 *   )
 * })
 * const program = Parcels.use((parcels) => parcels.read("account-headroom")).pipe(
 *   Effect.provide(layerParcels.pipe(Layer.provide(source)))
 * )
 * console.log(Effect.isEffect(program)) // true
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class Parcels extends Context.Service<Parcels, ParcelsShape>()($I`Parcels`) {}

const windowRemaining = Metric.gauge(AccountsWindowRemaining.name, {
  description: AccountsWindowRemaining.description,
});

const agentProviders = HashMap.make<ReadonlyArray<readonly [string, AgentProvider]>>(
  ["claude", AgentProvider.Enum.anthropic],
  ["codex", AgentProvider.Enum.openai],
  ["cursor", AgentProvider.Enum.cursor],
  ["grok", AgentProvider.Enum.xai],
  ["grok-bot", AgentProvider.Enum.xai],
  ["muse", AgentProvider.Enum.meta],
  ["junie", AgentProvider.Enum.jetbrains]
);

const GaugeReading = S.Struct({ provider: AgentProvider, window: S.String, scope: S.String, remaining: S.Finite });
type GaugeReading = typeof GaugeReading.Type;

const byRemaining: Order.Order<GaugeReading> = Order.mapInput(Num.Order, (reading) => reading.remaining);

// One series per provider, window and scope: several accounts of one provider
// share it, so it reports the most headroom any of them has, and scoped
// windows (one per model group) stay separate series. Only fresh items count,
// so a stale reading never looks current. A gauge keeps its last value, so in
// a long-lived process a series that goes stale keeps reporting its last fresh
// reading; each `beep palantiri` CLI run is its own process with an empty
// registry, and the long-lived MCP host clears stale series (P3).
const gaugeReadings = (items: ReadonlyArray<AccountHeadroom>): ReadonlyArray<GaugeReading> =>
  A.map(
    R.values(
      A.groupBy(
        A.flatMap(freshAccountHeadroom(items), (item) =>
          O.match(HashMap.get(agentProviders, item.provider), {
            onNone: A.empty<GaugeReading>,
            onSome: (provider) =>
              A.map(item.windows, (window) => ({
                provider,
                window: window.kind,
                scope: O.getOrElse(window.scope, () => "all"),
                remaining: window.remainingPercent,
              })),
          })
        ),
        (reading) => `${reading.provider} ${reading.window} ${reading.scope}`
      )
    ),
    (readings) => A.max(readings, byRemaining)
  );

const recordHeadroom = (items: ReadonlyArray<AccountHeadroom>) =>
  Effect.forEach(
    gaugeReadings(items),
    (reading) =>
      Metric.update(
        Metric.withAttributes(windowRemaining, {
          [ProviderAttribute]: reading.provider,
          [WindowAttribute]: reading.window,
          [WindowScopeAttribute]: reading.scope,
        }),
        reading.remaining
      ),
    { discard: true }
  );

const freshnessState = Freshness.match({ Fresh: () => "fresh", Unknown: () => "unknown" });

const makeParcels = Effect.gen(function* () {
  const accounts = yield* AccountHeadroomSource;

  const readAccountHeadroom = Effect.fnUntraced(function* (budget: ParcelBudget) {
    const now = yield* DateTime.now;
    return yield* accounts.snapshot.pipe(
      Effect.tap((input) => recordHeadroom(accountHeadroomItems(input.report, now))),
      Effect.map(reduceAccountHeadroom(now, budget)),
      Effect.catchTag("SourceFailed", (failure) =>
        Effect.succeed(
          makeParcelEnvelope(
            ParcelDraft.make({
              spec: AccountHeadroomSpec,
              readAt: now,
              freshness: Freshness.cases.Unknown.make({
                reason: "unreachable",
                asOf: O.none(),
                detail: O.some(failure.detail),
              }),
              summary: `account headroom unavailable: ${failure.detail}`,
              items: [],
              budget,
            })
          )
        )
      )
    );
  });

  const read = Effect.fn("Parcels.read")(function* (id: string, options?: ParcelReadOptions) {
    const parcel = yield* S.decodeUnknownEffect(ParcelId)(id).pipe(
      Effect.mapError(() => UnknownParcel.make({ parcel: id }))
    );
    yield* Effect.annotateCurrentSpan(ParcelAttribute, parcel);
    const { budget } = options ?? ParcelReadOptions.make({});
    const envelope = yield* ParcelId.$match(parcel, {
      "account-headroom": () => readAccountHeadroom(budget),
    });
    yield* Effect.annotateCurrentSpan(ParcelFreshnessAttribute, freshnessState(envelope.freshness));
    return envelope;
  });

  return Parcels.of({ read });
});

/**
 * The {@link Parcels} service over its source ports.
 *
 * **Example** (Provide the parcels service)
 *
 * ```ts
 * import { Parcels, layerParcels } from "@beep/palantiri/Parcels.service"
 * import * as Effect from "effect/Effect"
 *
 * const program = Parcels.use((parcels) => parcels.read("account-headroom")).pipe(Effect.provide(layerParcels))
 * console.log(Effect.isEffect(program)) // true
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const layerParcels = Layer.effect(Parcels, makeParcels);
