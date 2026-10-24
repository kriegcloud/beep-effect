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

The attribution below covers the lab port of the whole module; the deviations are the signer half's only. The
pure-half rows are restated against the package's own paths in the
[`@beep/sbom` README](../../../packages/foundation/modeling/sbom/README.md#port-notes).

### Attribution

- Upstream package: `@effected/sbom` 0.10.0
- Upstream commit: `af7566a9da2eff169cb74955efcc5ede1e5de9f8` (~/YeeBois/references/effect/effected)
- License: [LICENSE](./LICENSE) (verbatim upstream MIT notice)
- scratchpad/effected/sbom/SigstoreSigner.ts:1 // The ONE module that imports `@sigstore/*`.
- The pure modules' attribution markers moved with them to `packages/foundation/modeling/sbom/src/` (wave 4-S).

### Added exports

None.

### Deviations

This directory is the signer half only (wave 4-S). One entry per class of change that applies to `SigstoreSigner.ts`,
its tests and the module reachability test. The pure-module deviations (native-runtime, schema-first, numeric-domains,
identity-annotations, the pure-module reachability and upstream-bug rows, and the pure halves of the rows below) moved
with the pure half: see `packages/foundation/modeling/sbom/README.md` → Port notes and the tests it names. The `sbom` row
of `scratchpad/effected/PORT_LEDGER.json` keeps the lab-era evidence under the pre-promotion test paths.

- **identity-keys** — The lab registers `SigstoreSigner` with a module-local IdentityComposer key instead of the upstream @effected/sbom service key (scratchpad/test/sbom/SigstoreSigner.test.ts; scratchpad/test/sbom/reachability.test.ts).
- **tagged-errors** — The lab unstubbed signer throws UnstubbedSigstoreSignerError with a schema tag instead of upstream native Error, preserving the synchronous failure and message (scratchpad/test/sbom/SigstoreSigner.test.ts).
- **type-safety** — The lab replaces upstream cause and bundle casts with property guards and typed inference while retaining oracle assertions (scratchpad/test/sbom/SigstoreSigner.test.ts).
- **tsgo-diagnostics** — The lab uses named Effect.fn callbacks in place of upstream diagnostic-triggering forms (scratchpad/test/sbom/SigstoreSigner.test.ts).
- **effect-first** — The lab replaces the redundant signer wrapper with a direct thunk while preserving stub selection (scratchpad/test/sbom/SigstoreSigner.test.ts).
- **effect-imports** — The signer source and tests import dedicated effect/* modules instead of the upstream root effect barrel (module suite scratchpad/test/sbom/**).
- **test-environment** — The signer-path and manifest tests point at scratchpad/effected/sbom and a module-data package.json instead of upstream src/package assumptions (scratchpad/test/sbom/reachability.test.ts).

### Dependency backlog

None.
