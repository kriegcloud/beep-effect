/**
 * Human-operated registration of the `beep-knowledge-mint` GitHub App.
 * Run: bun scripts/github-app/create-beep-knowledge-mint.ts (through the human launcher).
 * Secret material travels only through memory and the op process's stdin.
 */
import * as BunCrypto from "@effect/platform-bun/BunCrypto";
import * as Crypto from "effect/Crypto";
import * as Effect from "effect/Effect";
import { FetchHttpClient, HttpClient, HttpClientRequest } from "effect/http";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as Match from "effect/Match";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import type * as Context from "effect/Context";

const PORT = 8787;
const MANIFEST_URL = new URL("../../../../../scripts/github-app/beep-knowledge-mint.manifest.json", import.meta.url);
const ITEM_TITLE = "beep-knowledge-mint GitHub App";

class MintConversion extends S.Opaque<MintConversion, { readonly brand: unique symbol }>()(
  S.Struct({
    id: S.Int,
    slug: S.NonEmptyString,
    client_id: S.NonEmptyString,
    pem: S.RedactedFromValue(S.NonEmptyString),
  }).annotate({ identifier: "KnowledgeMintManifestConversion" })
) {}
const decodeConversion = S.decodeUnknownEffect(MintConversion);
const Json = S.fromJsonString(S.Unknown);
const encodeJson = S.encodeEffect(Json);
const decodeJson = S.decodeUnknownEffect(Json);
const decodeManifest = S.decodeUnknownEffect(S.Record(S.String, S.Unknown));

const headers = {
  "cache-control": "no-store",
  "referrer-policy": "no-referrer",
  "content-type": "text/html; charset=utf-8",
  "content-security-policy": "default-src 'none'; form-action https://github.com; frame-ancestors 'none'",
};
const page = (body: string, status = 200) => new Response(body, { status, headers });

/** The outcome of one callback, safe to show: no credential, payload, or exception text. */
type Outcome =
  | { readonly _tag: "Stored"; readonly slug: string; readonly appId: number }
  | { readonly _tag: "ConversionFailed"; readonly status: number }
  | { readonly _tag: "StoreFailed"; readonly slug: string; readonly exitCode: number }
  | { readonly _tag: "Failed" };

const renderTemplate = (converted: MintConversion) =>
  encodeJson({
    title: ITEM_TITLE,
    category: "API_CREDENTIAL",
    fields: [
      { id: "app_id", label: "app_id", type: "STRING", value: `${converted.id}` },
      { id: "client_id", label: "client_id", type: "STRING", value: converted.client_id },
      { id: "installation_id", label: "installation_id", type: "STRING", value: "" },
      { id: "slug", label: "slug", type: "STRING", value: converted.slug },
      { id: "private_key", label: "private_key", type: "CONCEALED", value: Redacted.value(converted.pem) },
    ],
  });

const convertAndStore = Effect.fn("KnowledgeMint.convertAndStore")(function* (code: string) {
  const client = yield* HttpClient.HttpClient;
  const response = yield* client.execute(
    HttpClientRequest.post(`https://api.github.com/app-manifests/${encodeURIComponent(code)}/conversions`).pipe(
      HttpClientRequest.setHeaders({ accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28" })
    )
  );
  if (response.status !== 201) {
    return { _tag: "ConversionFailed", status: response.status } satisfies Outcome;
  }
  const converted = yield* decodeConversion(yield* response.json);
  const template = yield* renderTemplate(converted);
  // No secret in argv, stdout, stderr, the callback page, or a temporary file.
  // Bun uses a socket for child stdin on Linux. The CLI requires a real pipe
  // to detect a JSON template, so cat bridges the in-memory Blob into one.
  const child = Bun.spawn(["bash", "-o", "pipefail", "-c", "cat | op item create --vault BEEP_SECRETS -"], {
    stdin: new Blob([template]),
    stdout: "ignore",
    stderr: "ignore",
  });
  const exitCode = yield* Effect.promise(() => child.exited);
  if (exitCode !== 0) {
    // One safe, count-only diagnosis for the operator; a missing op-doctor changes nothing.
    yield* Effect.tryPromise(() => Bun.spawn(["op-doctor"], { stdout: "inherit", stderr: "ignore" }).exited).pipe(
      Effect.ignore
    );
  }
  return exitCode === 0
    ? ({ _tag: "Stored", slug: converted.slug, appId: converted.id } satisfies Outcome)
    : ({ _tag: "StoreFailed", slug: converted.slug, exitCode } satisfies Outcome);
});

// Logs the outcome for the operator and renders the callback page; neither carries a secret.
const report = (outcome: Outcome): Effect.Effect<Response> =>
  Match.valueTags(outcome, {
    Stored: (outcome) =>
      Effect.as(
        Effect.log(
          `[knowledge-mint] Stored "${ITEM_TITLE}" in BEEP_SECRETS for App ${outcome.slug} (app_id ${outcome.appId}). Install it, record installation_id, then press Ctrl-C.`
        ),
        page(
          `Stored in 1Password as "${ITEM_TITLE}" (App ${outcome.slug}). Install it on beep-effect/beep-effect only, record installation_id, then stop the launcher with Ctrl-C.`
        )
      ),
    ConversionFailed: (outcome) =>
      Effect.as(
        Effect.logError(`[knowledge-mint] Manifest conversion returned HTTP ${outcome.status}; nothing was stored.`),
        page(
          `Manifest conversion returned HTTP ${outcome.status}. Nothing was stored. Check the App registration page before starting over.`,
          500
        )
      ),
    StoreFailed: (outcome) =>
      Effect.as(
        Effect.logError(
          `[knowledge-mint] App ${outcome.slug} was registered, but 1Password item creation exited ${outcome.exitCode}; secret diagnostics suppressed. Do not reload the callback.`
        ),
        page(
          `App ${outcome.slug} was registered, but storing it in 1Password failed (exit ${outcome.exitCode}). Do not reload this page: the code is single-use. Revoke the new App's generated private key, delete the uninstalled registration, then start the launcher again.`,
          500
        )
      ),
    Failed: () =>
      Effect.as(
        Effect.logError(
          "[knowledge-mint] Conversion or vault write failed; diagnostics suppressed. Do not reload the callback."
        ),
        page(
          "Conversion or vault write failed. No secret was printed or saved locally. Do not reload this page. Inspect the App settings, revoke any generated key, and delete an uninstalled new registration before retrying.",
          500
        )
      ),
  });

// Bridges one Bun request into the captured Effect context; Bun calls it outside any fiber.
const fetchWith =
  (
    context: Context.Context<HttpClient.HttpClient>,
    handle: (request: Request) => Effect.Effect<Response, never, HttpClient.HttpClient>
  ) =>
  (request: Request): Promise<Response> =>
    Effect.runPromise(Effect.provideContext(handle(request), context));

/**
 * Builds the loopback request handler for one registration attempt.
 *
 * **Details**
 *
 * `/` serves a form that POSTs the manifest to the beep-effect organization's App registration
 * page with a random `state`. `/callback` accepts exactly one request whose `state` matches,
 * exchanges the code, and stores the credentials through the op process's stdin. Any other
 * host, method, path, state, or a second callback is rejected. The returned `fetch` runs each
 * request in the context captured here, so the caller provides the HTTP client and logger once.
 *
 * @param options - The random `state` bound into the registration form and the serialized App
 *   manifest posted to GitHub.
 * @returns The `fetch` option for `Bun.serve`.
 */
export const makeKnowledgeMintHandler = Effect.fn("KnowledgeMint.makeHandler")(function* (options: {
  readonly nonce: string;
  readonly manifestJson: string;
}) {
  const context = yield* Effect.context<HttpClient.HttpClient>();
  const escaped = options.manifestJson.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
  let attempted = false;
  const handle = Effect.fnUntraced(function* (request: Request) {
    const url = new URL(request.url);
    if (request.method !== "GET" || ![`localhost:${PORT}`, `127.0.0.1:${PORT}`].includes(url.host)) {
      return page("Rejected", 400);
    }
    if (url.pathname === "/") {
      return page(
        `<form method="POST" action="https://github.com/organizations/beep-effect/settings/apps/new?state=${options.nonce}"><input type="hidden" name="manifest" value="${escaped}"><button>Create beep-knowledge-mint in beep-effect</button></form>`
      );
    }
    const code = url.searchParams.get("code");
    if (url.pathname !== "/callback" || url.searchParams.get("state") !== options.nonce || code === null || attempted) {
      return page("Invalid or already used callback", 400);
    }
    attempted = true;
    const outcome = yield* convertAndStore(code).pipe(
      Effect.catchCause(() => Effect.succeed<Outcome>({ _tag: "Failed" }))
    );
    return yield* report(outcome);
  });
  return { fetch: fetchWith(context, handle) };
});

/**
 * Everything the registration needs: the GitHub HTTP client, the UUID source for the form
 * `state`, and a logger that keeps operator errors on stderr.
 */
export const KnowledgeMintLayer = Layer.mergeAll(
  FetchHttpClient.layer,
  BunCrypto.layer,
  Logger.layer([Logger.withLeveledConsole(Logger.formatSimple)])
);

const serve = Effect.gen(function* () {
  const crypto = yield* Crypto.Crypto;
  const nonce = yield* crypto.randomUUIDv4();
  const manifest = yield* decodeJson(yield* Effect.promise(() => Bun.file(MANIFEST_URL).text())).pipe(
    Effect.flatMap(decodeManifest)
  );
  const manifestJson = yield* encodeJson(manifest);
  const handler = yield* makeKnowledgeMintHandler({ nonce, manifestJson });
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: PORT,
    fetch: handler.fetch,
    error: () => page("Registration failed; secret diagnostics suppressed.", 500),
  });
  yield* Effect.log(
    `[knowledge-mint] Listening. Open http://localhost:${server.port} in Chrome as kriegcloud. The callback never displays credentials. Ctrl-C stops the server.`
  );
});

/**
 * Starts the loopback registration server and prints the URL to open.
 *
 * @returns Resolves once the server listens; Bun keeps the process alive until the human stops it with Ctrl-C.
 */
export const startKnowledgeMintRegistration = (): Promise<void> =>
  Effect.runPromise(
    KnowledgeMintLayer.pipe(
      Layer.build,
      Effect.flatMap((context) => Effect.provideContext(serve, context)),
      Effect.scoped
    )
  );
