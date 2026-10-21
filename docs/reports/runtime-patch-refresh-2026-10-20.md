# Runtime patch refresh, 2026-10-20

PR #1928 review found that four patch keys named versions no longer resolved by
the lockfile. Existing local installations retained patched files, so local
source inspection alone did not establish fresh-install behavior.

Pristine npm release tarballs were fetched and only the affected source and
declaration files extracted into an ignored inspection directory. Patches were
regenerated against those original release bytes.

| Package | Resolved version | Disposition |
| --- | --- | --- |
| effect | 4.0.5 | Retain the JavaScriptCore error-location equality patch. |
| @effect/platform-node-shared | 4.0.5 | Retain explicit offset/length for positional writes in source and distribution. |
| @xstate/effect | 1.0.0-alpha.8 | Retain stable string-key action requirements in published declarations. |
| xstate | 6.0.0-alpha.69 | Retire the patch: pristine StateSchema already permits undefined on states, contextSchema, and outputSchema. |

The three retained keys appear in both package.json and bun.lock. Superseded
patch files were removed. The onnxruntime-node and drizzle-orm patches were not
changed by this review.

A disposable, non-workspace install fixture within this clone installed the
resolved packages with Bun 1.4.3, `--ignore-scripts --no-cache`, and copies of
the three new patch files. Installation succeeded. A Bun smoke program using
that fixture's dependencies passed error equality across distinct construction
sites, matching error hashes, and write/writeAll after seeking, producing the
expected `AXYD` bytes. The existing error-equality and filesystem-write suites
passed six tests, and the XState package source/test typechecks passed.

Reversal: restore the previous dependency versions together with their matching
patch keys and lockfile. Do not restore stale patch keys while keeping newer
resolved versions. No patch has been treated as obsolete solely because a local
installation happened to contain patched bytes.
