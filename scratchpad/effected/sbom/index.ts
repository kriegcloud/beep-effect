/**
 * The Sigstore DSSE signer, the half of the effected `sbom` module that is not
 * promoted yet (deferred `@beep/sigstore`, effected-promotion D-05 and W4-m).
 *
 * **Details**
 *
 * The pure models it signs with — `IdentityToken`, `InTotoStatement` and
 * `SigstoreBundle` — live in `@beep/sbom`; import them from its leaves. This
 * entry point re-exports only the signer, so nothing here aliases the package.
 *
 * **Example** (Read the Sigstore OIDC audience from the entry point)
 *
 * ```ts
 * import { SIGSTORE_OIDC_AUDIENCE } from "@beep/scratchpad/effected/sbom/index";
 *
 * console.log(SIGSTORE_OIDC_AUDIENCE) // sigstore
 * ```
 *
 * @packageDocumentation
 * @since 0.0.0
 */

export {
	SIGSTORE_OIDC_AUDIENCE,
	SigningError,
	SigningErrorKind,
	SigstoreSigner,
	type SigstoreSignerOptions,
	type SigstoreSignerShape,
} from "./SigstoreSigner.ts";
