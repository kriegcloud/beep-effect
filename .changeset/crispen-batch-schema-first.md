---
"@beep/m365": patch
"@beep/identity": patch
"@beep/repo-ai-metrics": patch
---

Schema-first crispening pass (behavior-preserving):

- `@beep/m365`: fold the 11 identical request decoders + `mapError` call sites into one
  parametric `decodeRequest(schema, resource)` helper.
- `@beep/identity`: replace the 8 `Result.getOrThrowWith(decodeXResult, schemaIssueToError)`
  sites with `S.decodeUnknownSync`, dropping the dead helper, decoder consts, and `Result` import.
- `@beep/repo-ai-metrics`: single-source the coverage-gap codes via one `LiteralKit`; fold the
  two pure-number `firstOrNull(...)?.count ?? 0` sites to `A.head(...).pipe(O.map, O.getOrElse)`.
