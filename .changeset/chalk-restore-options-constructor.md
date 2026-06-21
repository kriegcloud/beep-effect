---
"@beep/chalk": patch
---

Restore the type-only `constructor(_options?: ChalkConstructorOptionsType)` on
`ChalkValue`/`ChalkStderrValue` (node + browser) so the public `new Chalk(options)`
signature typechecks again — fixing the dtslint/test `TS2554` regression.
