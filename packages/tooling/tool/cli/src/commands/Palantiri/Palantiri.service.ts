/**
 * The CLI's implementations of the Palantiri source ports, and the telemetry
 * layer a parcel read exports through.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { layerLocalLgtmServer, ServerObservabilityConfig } from "@beep/observability/server";
import {
  AccountHeadroomInput,
  AccountHeadroomSource,
  AccountHeadroomSpec,
  AccountsReportInputJson,
  SourceFailed,
} from "@beep/palantiri";
import * as A from "effect/Array";
import * as Config from "effect/Config";
import * as DateTime from "effect/DateTime";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { resolveWorkstationStateDir } from "../../internal/state/WorkstationState.ts";
import { AccountsStatusReportJson } from "../Accounts/Accounts.schemas.ts";
import { AccountsUsage, layerAccountsUsageLive, loadAccountsReport } from "../Accounts/AccountsUsage.service.ts";
import type { AccountsStatusReport } from "../Accounts/Accounts.schemas.ts";

const SNAPSHOT_FILE = "account-headroom.json";

const sourceFailed = (detail: string) => SourceFailed.make({ parcel: AccountHeadroomSpec.id, detail });

const isWithinBound = (now: DateTime.Utc) => (report: AccountsStatusReport) =>
  !Duration.isGreaterThan(DateTime.distance(report.generatedAt, now), AccountHeadroomSpec.freshnessBound);

/**
 * Build the account-headroom source over the accounts poller, with a snapshot
 * file in front of it.
 *
 * **Details**
 *
 * A live poll takes up to 20 seconds per account, so each read first looks
 * for `account-headroom.json` in the Palantiri state directory
 * (`BEEP_PALANTIRI_STATE_ROOT`, else `$XDG_STATE_HOME/beep/palantiri`, else
 * `$HOME/.local/state/beep/palantiri`). A snapshot younger than the parcel's
 * 5-minute bound is served as-is; otherwise every account is polled, the
 * previous snapshot's readings stand in for accounts whose poll failed, and
 * the new report replaces the file. When the live poll itself fails, the
 * stale snapshot is served, so the parcel reads `Unknown{stale}` instead of
 * `Unknown{unreachable}`. Each read also lists the configured providers
 * (stored logins and collector snapshot files) as the parcel's expected
 * providers. The file holds the full accounts report,
 * labels included, and stays on this machine; the parcel itself never
 * carries a label. A failed snapshot write is logged and the live report is
 * still served.
 *
 * **Example** (Build the source effect)
 *
 * ```ts
 * import { makeAccountHeadroomSourceLive } from "@beep/repo-cli/test/Palantiri"
 * import * as Effect from "effect/Effect"
 *
 * console.log(Effect.isEffect(makeAccountHeadroomSourceLive)) // true
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeAccountHeadroomSourceLive = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const usage = yield* AccountsUsage;

  const writeSnapshot = Effect.fn("PalantiriSource.writeSnapshot")(function* (file: string, text: string) {
    yield* fs.makeDirectory(path.dirname(file), { recursive: true });
    const temporary = `${file}.tmp`;
    yield* fs.writeFileString(temporary, text);
    yield* fs.rename(temporary, file);
  });

  // The providers this host is configured for: every stored login and every
  // collector snapshot file. A listing failure claims nothing.
  const expectedProviders = Effect.all([usage.accounts, usage.snapshots], { concurrency: 2 }).pipe(
    Effect.map(([accounts, snapshots]) =>
      A.dedupe(
        A.appendAll(
          A.map(accounts, (account) => account.provider),
          A.map(snapshots, (snapshot) => snapshot.account.provider)
        )
      )
    ),
    Effect.orElseSucceed(A.empty<string>)
  );

  const snapshot = Effect.gen(function* () {
    const dir = yield* resolveWorkstationStateDir({ override: "BEEP_PALANTIRI_STATE_ROOT", store: "palantiri" });
    const file = path.join(dir, SNAPSHOT_FILE);
    const previous = yield* fs
      .readFileString(file)
      .pipe(Effect.map(AccountsStatusReportJson.decodeOption), Effect.orElseSucceed(O.none));
    const now = yield* DateTime.now;
    const report = yield* O.match(O.filter(previous, isWithinBound(now)), {
      onSome: Effect.succeed,
      onNone: () =>
        loadAccountsReport(previous).pipe(
          Effect.tap((live) =>
            AccountsStatusReportJson.encode(live).pipe(
              Effect.flatMap((text) => writeSnapshot(file, text)),
              Effect.catchCause((cause) =>
                Effect.logWarning("[palantiri] could not write the account-headroom snapshot", cause)
              )
            )
          ),
          // A failed live poll serves the stale snapshot; its age makes the
          // parcel Unknown{stale}.
          Effect.catchTag("AccountsError", (error) =>
            O.match(previous, {
              onNone: () => Effect.fail(error),
              onSome: (stale) =>
                Effect.logWarning("[palantiri] live accounts poll failed; serving the stale snapshot").pipe(
                  Effect.as(stale)
                ),
            })
          )
        ),
    });
    const text = yield* AccountsStatusReportJson.encode(report);
    return AccountHeadroomInput.make({
      report: yield* S.decodeEffect(AccountsReportInputJson)(text),
      expectedProviders: yield* expectedProviders,
    });
  }).pipe(
    Effect.catchTags({
      AccountsError: (error) => Effect.fail(sourceFailed(`accounts report unavailable (${error.reason})`)),
      SchemaError: () => Effect.fail(sourceFailed("accounts report did not decode")),
      ConfigError: () => Effect.fail(sourceFailed("state directory could not be resolved")),
    }),
    Effect.provideService(AccountsUsage, usage),
    Effect.withSpan("PalantiriSource.accountHeadroom")
  );

  return AccountHeadroomSource.of({ snapshot });
});

/**
 * The live account-headroom source: the accounts poller behind a snapshot
 * file. See {@link makeAccountHeadroomSourceLive}.
 *
 * **Details**
 *
 * A poller that cannot start becomes a source whose every read fails, so the
 * parcel is served as `Unknown{unreachable}` instead of the command failing.
 *
 * **Example** (Provide the live source)
 *
 * ```ts
 * import { layerAccountHeadroomSourceLive } from "@beep/repo-cli/test/Palantiri"
 * import * as Layer from "effect/Layer"
 *
 * console.log(Layer.isLayer(layerAccountHeadroomSourceLive)) // true
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const layerAccountHeadroomSourceLive = Layer.effect(AccountHeadroomSource, makeAccountHeadroomSourceLive).pipe(
  Layer.provide(layerAccountsUsageLive),
  Layer.catchTag(["AccountsError", "ConfigError"], () =>
    Layer.succeed(AccountHeadroomSource, {
      snapshot: Effect.fail(sourceFailed("accounts poller could not start")),
    })
  )
);

/**
 * OTLP export for a Palantiri read, on only when `OTEL_EXPORTER_OTLP_ENDPOINT`
 * is set.
 *
 * **Details**
 *
 * Built on the shared server observability layer. Spans and metrics leave on
 * an interval or when the layer's scope closes, so a short CLI run is flushed
 * by the command's scope finalizer (bounded by a 3 second shutdown timeout).
 * With no endpoint, nothing is exported.
 *
 * **Example** (Build the telemetry layer)
 *
 * ```ts
 * import { layerPalantiriTelemetry } from "@beep/repo-cli/test/Palantiri"
 * import * as Layer from "effect/Layer"
 *
 * console.log(Layer.isLayer(layerPalantiriTelemetry)) // true
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const layerPalantiriTelemetry = Layer.unwrap(
  Effect.gen(function* () {
    const endpoint = yield* Config.option(Config.String("OTEL_EXPORTER_OTLP_ENDPOINT")).pipe(
      Effect.orElseSucceed(O.none)
    );
    return O.match(O.filter(endpoint, Str.isNonEmpty), {
      onNone: () => Layer.empty,
      onSome: (otlpBaseUrl) =>
        layerLocalLgtmServer(
          ServerObservabilityConfig.make({
            serviceName: "beep-cli",
            serviceVersion: "0.0.0",
            environment: "workstation",
            minLogLevel: "Info",
            otlpBaseUrl,
            otlpEnabled: true,
            otlpResourceAttributes: {},
            devtoolsEnabled: false,
            devtoolsUrl: "ws://localhost:34437",
            prometheusPrefix: "beep",
          })
        ),
    });
  })
);
