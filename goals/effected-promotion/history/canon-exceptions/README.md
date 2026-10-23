# Archived canon exceptions

These files are the port's per-module `.canon-exceptions.json`, archived
read-only by D-18. They record the effect-vitest findings the port had
adjudicated in `scratchpad/`. Under D-19 none of them moves into
`standards/effect-vitest.inventory.jsonc`: each promotion fixes the tests
instead. The `id` paths point at the old `scratchpad/test/<module>` locations
and are not updated.

## Status

| Module | Exceptions | Status |
| --- | --- | --- |
| `config-file` | 1 | Resolved in wave 3-3 (`@beep/config-file`, SPEC W3-h (3-3)). The `ConfigFileTest.int.test.ts` integration suite runs on `@beep/memfs` instead of `NodeFileSystem` (EV010), still asserting the temporary directory is removed when the scope closes, and `@effect/platform-node` left the devDependencies. |
| `markdown` | 5 | All resolved in wave 2d-1 (`@beep/markdown`, SPEC D-45). The corpus loader reads `data/conformance/` through Vite `import.meta.glob` (EV010). `generate-entities.ts` moved to the package `scripts/` on `effect/FileSystem` (EV010). The stringify-scalability `vi.mock` spy became a structural assertion on the serializer source (EV011, EV012). The 150,000-line definition stack test runs in-process (EV010). |
| `sbom` | 9 | All resolved in wave 4-S (`@beep/sbom`, SPEC W4-b, W4-g). The 6 EV002 rows in `IdentityToken.test.ts` go through `it.layer` (with hook timeouts); the 3 EV010 rows go through JSON imports of the vendored fixtures (`SlsaProvenance.test.ts`, `conformance.test.ts`) and a Vite raw-glob source walker (`reachability.test.ts`). The lab signer's reachability test, which stays in `scratchpad/test/sbom`, keeps its own Node-only walker. |
| `lockfiles` | 4 | All resolved in wave 3-5 (`@beep/lockfiles`, W3-h). All 4 were EV010 fixture reads (`Lockfile`, `PnpmEnvLockfile`, `documents` and `importers` tests). `test/support/fixtures.ts` now reads the `.fixture` corpus through Vite `import.meta.glob` (`?raw`, eager), the corpus enumeration and the version-gate guard walk its keys, and the digest guard hashes each capture through `JsoncFingerprint.hashText` on a WebCrypto `Crypto` layer instead of `node:crypto`. |
