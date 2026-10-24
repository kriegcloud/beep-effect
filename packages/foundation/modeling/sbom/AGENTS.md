# @beep/sbom

CycloneDX 1.6 SBOMs, NTIA minimum elements, in-toto statements, SLSA provenance and the Sigstore bundle schema as Effect schemas

## Surface

- See `src/index.ts` barrel — do not hand-maintain inventory tables here.

## Laws

- Root `AGENTS.md` and `standards/ARCHITECTURE.md` govern this package; record only genuinely package-specific deltas here.
- Before handing back a change, run `bun run beep quality package-verify @beep/sbom` from the repository root. Use `--quick` only for a justified lint+check subset; a failure arms the checkout's shared P0 inbox.
