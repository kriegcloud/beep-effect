# Sources verified 2026-10-14

- Installed `@effect/tsgo` 0.51.1 README/schema and 0.53.0 npm tarball (registry metadata).
- [0.52 release](https://github.com/Effect-TS/tsgo/releases/tag/%40effect%2Ftsgo%400.52.0)
- [0.53 release](https://github.com/Effect-TS/tsgo/releases/tag/%40effect%2Ftsgo%400.53.0)
- Live `.repos/effect-tsgo/_packages/tsgo/src/cli/{index,diagnostics}.ts`.
- Live `.repos/t3code/docs/operations/development.md:109` and workspace manifests.
- `docs/runbooks/typescript-toolchain.md`, `goals/tsc-rs-gates/SPEC.md` Decision Log.
- `goals/schema-opaque-default/SPEC.md` D4/D7: arm the brand rule at error on the bump.

Raw logs and downloaded packages stay under `~/.cache/beep/`, outside this packet.

## Performance amendment: compiler pin

Live release [tsc-rs 0.7.0](https://github.com/pingdotgg/ts-rust/releases/tag/v0.7.0)
is dated 2026-10-14. The tagged README still describes the port of effect-tsgo
0.51.1; raw snapshot is h2-logs/tsc-rs-070-readme.md in the external lane cache.
The root catalog remains exactly 0.6.0. This lane does not upgrade the compiler.
