# sbom (lab port of @effected/sbom): the Sigstore signer

The pure half of this module — the CycloneDX 1.6 SBOM model and emitter, the NTIA report, in-toto statements, SLSA
provenance, the `SigstoreBundle` value and the `IdentityToken` contract — is promoted as
[`@beep/sbom`](../../../packages/foundation/modeling/sbom/README.md) (effected-promotion wave 4-S, SPEC W4-b). What
stays here is `SigstoreSigner`, Sigstore DSSE signing against Fulcio and Rekor, the one module that imports
`@sigstore/*`. It is the deferred `@beep/sigstore` half (SPEC D-05): it leaves the lab with its first consumer, a
release attestation step, or is deleted at the packet's close and recoverable by sha (W4-m). It imports the models it
signs with from `@beep/sbom` leaves, and this entry point re-exports only the signer.

## Signing

`SigstoreSigner` fetches an identity token, exchanges it with Fulcio for a certificate, signs the statement, and (unless `witnesses: []`) logs it to Rekor — all behind one method, `sign`, over `IdentityToken`:

```ts
import { IdentityToken } from "@beep/sbom/IdentityToken";
import type { InTotoStatement } from "@beep/sbom/InTotoStatement";
import { SigstoreSigner } from "@beep/scratchpad/effected/sbom/index";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

declare const oidcToken: string;
declare const statement: InTotoStatement;

const program = Effect.gen(function* () {
  const signer = yield* SigstoreSigner;
  return yield* signer.sign(statement);
});

const SignerLayer = SigstoreSigner.layer.pipe(Layer.provide(IdentityToken.layerStatic(oidcToken)));

Effect.runPromise(program.pipe(Effect.provide(SignerLayer))).then(console.log);
// SigstoreBundle: { mediaType, verificationMaterial, dsseEnvelope }
```

`IdentityToken` is a narrow, one-method contract deliberately smaller than any real issuer's surface, so several things can satisfy it. On a GitHub runner that is `ActionsIdentityToken.layer`, which the lab `github-actions` module ships over its own `OidcTokenIssuer` — the dependency points that way so signing never drags the Actions runtime into a consumer that only emits an SBOM. A CI system that mints its own token works the same way through `IdentityToken.layerStatic`.

## Errors

`SigningError.kind` names which step failed — `identity` (a workflow permissions problem), `certificate` (Fulcio), `transparencyLog` (Rekor), or `bundle` (assembly) — with the original failure preserved structurally on `cause` rather than flattened into a message:

```ts
import { SigningError } from "@beep/scratchpad/effected/sbom/index";
import * as Effect from "effect/Effect";

declare const sign: Effect.Effect<unknown, SigningError>;

const program = sign.pipe(Effect.catchTag("SigningError", (error) => Effect.logError(`${error.kind}: ${error.message}`)));
```


## Testing

`SigstoreSigner.makeTest().sign` **dies** rather than fabricating a bundle: a signature-shaped lie is exactly the failure an attestation exists to prevent. A test that needs a real bundle without a network drives the real `DSSEBundleBuilder` through `SigstoreSigner.layerWith({ signer, witnesses })`. `IdentityToken.makeTest`, by contrast, **answers** — a fabricated OIDC token is a real answer to "give me a token":

```ts
import { IdentityToken } from "@beep/sbom/IdentityToken";
import * as Effect from "effect/Effect";

const TestToken = IdentityToken.layerTest({
  token: () => Effect.succeed("test-token"),
});
```

## Features

- `SigstoreSigner` — DSSE signing against Fulcio and Rekor, `layerWith` for a supplied signer, witnesses and
  endpoints, and a die-on-unstubbed test double.
- `SigningError` / `SigningErrorKind` — which signing step failed, with the cause preserved.
- `SIGSTORE_OIDC_AUDIENCE` — the audience the signer asks `IdentityToken` for.

## License

[MIT](LICENSE)


## Port notes

The record below is the lab port of the whole module; the pure-half rows are restated against the package's own
paths in the [`@beep/sbom` README](../../../packages/foundation/modeling/sbom/README.md#port-notes).

### Attribution

- Upstream package: `@effected/sbom` 0.10.0
- Upstream commit: `af7566a9da2eff169cb74955efcc5ede1e5de9f8` (~/YeeBois/references/effect/effected)
- License: [LICENSE](./LICENSE) (verbatim upstream MIT notice)
- scratchpad/effected/sbom/SbomDocument.ts:11 import { License, isValidExpression } from "@beep/spdx";
- scratchpad/effected/sbom/SbomMetadataSource.ts:16 // timestamp is an argument, and so is the copyright year.
- scratchpad/effected/sbom/SigstoreBundle.ts:7 // re-exported from `@sigstore/bundle`.
- scratchpad/effected/sbom/index.ts:40 type CopyrightYears,

### Added exports

None.

### Deviations

One entry per class of change (law- or ruling-forced) and one per behavioural divergence; the full test, upstream behaviour, lab behaviour and reason are on the module's ledger row.

- **native-runtime** — The lab replaces upstream Object.entries, Date.parse, Object.assign schema statics and native Error with Effect Record/Schema facilities, S.Opaque statics and a tagged error (scratchpad/test/sbom/Sbom.test.ts:83; scratchpad/test/sbom/NtiaReport.test.ts:134; scratchpad/test/sbom/InTotoStatement.test.ts:68; scratchpad/test/sbom/SigstoreSigner.test.ts:261).
- **identity-keys** — The lab registers IdentityToken and SigstoreSigner with module-local IdentityComposer keys instead of upstream @effected/sbom service keys (scratchpad/test/sbom/IdentityToken.test.ts:18; scratchpad/test/sbom/SigstoreSigner.test.ts:267; scratchpad/test/sbom/reachability.test.ts:132).
- **tagged-errors** — The lab unstubbed signer throws UnstubbedSigstoreSignerError with a schema tag instead of upstream native Error, preserving the synchronous failure and message (scratchpad/test/sbom/SigstoreSigner.test.ts:261).
- **schema-first** — The lab replaces eight upstream input interfaces with runtime schemas, named literal domains with LiteralKit, digest/NTIA predicates with schema guards and JSON.stringify with schema codecs that preserve successful bytes but surface SchemaError on failure (scratchpad/test/sbom/InTotoStatement.test.ts:68; scratchpad/test/sbom/InTotoStatement.test.ts:136; scratchpad/test/sbom/Sbom.test.ts:117; scratchpad/test/sbom/NtiaReport.test.ts:76; module suite scratchpad/test/sbom/**).
- **numeric-domains** — The lab rejects non-finite SbomDocument revisions accepted by upstream Schema.Number and gives the new indentation/year schemas finite-number domains without changing function validation boundaries (module suite scratchpad/test/sbom/**).
- **type-safety** — The lab replaces upstream digest, cause, bundle and parsed-JSON casts with schema-derived guards, property guards and typed inference while retaining oracle assertions (scratchpad/test/sbom/InTotoStatement.test.ts:161; scratchpad/test/sbom/Sbom.test.ts:74; scratchpad/test/sbom/SigstoreSigner.test.ts:115; scratchpad/test/sbom/conformance.test.ts:116; scratchpad/test/sbom/reachability.test.ts:191).
- **tsgo-diagnostics** — The lab uses named Effect.fn callbacks, schema .make constructors and S.Finite in place of upstream diagnostic-triggering forms, retaining scoped test entry-point diagnostic exceptions (scratchpad/test/sbom/IdentityToken.test.ts:18; scratchpad/test/sbom/IdentityToken.test.ts:84; scratchpad/test/sbom/InTotoStatement.test.ts:73; scratchpad/test/sbom/SigstoreSigner.test.ts:206; module suite scratchpad/test/sbom/**).
- **effect-first** — The lab replaces upstream callbacks, typeof checks, native component sorting and the redundant signer wrapper with Effect.fn, Predicate helpers, Array/Order/String helpers and a direct thunk while preserving ordering and stub selection (scratchpad/test/sbom/IdentityToken.test.ts:18; scratchpad/test/sbom/Sbom.test.ts:56; scratchpad/test/sbom/SigstoreSigner.test.ts:261).
- **effect-imports** — The lab source, tests and source examples import dedicated effect/* modules instead of the upstream root effect barrel (module suite scratchpad/test/sbom/**; scratchpad/test/sbom/reachability.test.ts:132; scratchpad/test/sbom/reachability.test.ts:170).
- **identity-annotations** — The lab adds $ScratchpadId identifiers and schema/field annotations absent upstream, including digest identity metadata and nested provenance/error descriptions while retaining the inline digest pattern (module suite scratchpad/test/sbom/**; scratchpad/test/sbom/InTotoStatement.test.ts:192; scratchpad/test/sbom/reachability.test.ts:170).
- **test-environment** — The lab points source/manifest/signer-path tests at scratchpad/effected/sbom, a module-data package.json and TypeScript paths instead of upstream src/package/output assumptions (scratchpad/test/sbom/reachability.test.ts:191; scratchpad/test/sbom/reachability.test.ts:199; scratchpad/test/sbom/reachability.test.ts:231).
- **reachability** — The lab enumerates effect/* and Beep imports and asserts the vendored SPDX edge plus package-json IO exclusion instead of upstream bare-package graph expectations (scratchpad/test/sbom/reachability.test.ts:132; scratchpad/test/sbom/reachability.test.ts:142; scratchpad/test/sbom/reachability.test.ts:170; scratchpad/test/sbom/reachability.test.ts:199).
- **upstream-bug** — The lab declaration parser excludes the phantom ${this.path} import emitted by the upstream regex walker, with the exported-error-message regression fixture pinning the correction (scratchpad/test/sbom/reachability.test.ts:93; scratchpad/test/sbom/reachability.test.ts:110; scratchpad/test/sbom/reachability.test.ts:116).

### Dependency backlog

None.
