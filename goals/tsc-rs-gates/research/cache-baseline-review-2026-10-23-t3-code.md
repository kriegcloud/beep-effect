# Cache baseline review: @beep/t3-code engine migration (2026-10-23)

`bun run beep quality cache-policy` reports eight configuration-drift BLOCKs, all on
one subject, `@beep/t3-code`:

| Task | Input change |
| --- | --- |
| `@beep/t3-code#build` | manifest bytes: `beep:build` `tsc -p` → `tsc-rs -p` |
| `@beep/t3-code#check` | manifest bytes: `beep:check` and `beep:check:tests` `tsgo -p` → `tsc-rs -p` |
| `@beep/t3-code#docgen` | manifest bytes only (same three script values) |
| `@beep/t3-code#lint` | manifest bytes only |
| `@beep/t3-code#lint:deprecated-apis` | manifest bytes only |
| `@beep/t3-code#lint:jsdoc` | manifest bytes only |
| `@beep/t3-code#lint:laws` | manifest bytes only |
| `@beep/t3-code#test` | manifest bytes only |

The only manifest edit is the three type-check script values moving to `tsc-rs`, the
engine every other workspace already uses (the 2026-10-14 tsc-rs-gates migration missed
this package). Task names, project files, inputs, outputs, cache flags and `turbo.json`
are unchanged. The request re-records the existing legacy posture for this subject only;
no qualification is widened and no exception row is added.
