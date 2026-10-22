# Dependency patch audit — October 20, 2026

This audit compares the repository patches with the published packages selected
by the dependency update. Pristine npm archives were checked against their
registry SHA512 integrity before inspection. Regression tests ran with Bun 1.4.3.

| Patch or companion document | Decision | Evidence |
| --- | --- | --- |
| Node platform 4.0.5 | Retain all source and distribution hunks | Pristine upstream still passes undefined buffer offset and length to both positioned write paths. The original suite fails twice unpatched and passes all three cases patched; separate backward-seek checks fail for both write methods unpatched and pass patched. |
| Effect 4.0.5 | Retain | Pristine upstream strips only stack from Error equality keys. Two original Bun equality regressions fail unpatched; all three cases pass patched. Declared metadata-named payloads remain covered. |
| XState Effect alpha.8 | Retire this version-specific patch and replace with alpha.9 | Alpha.9 still exposes its private action brand in exported machine declarations. The unchanged declaration guard fails with TS4023 before applying the migrated patch and passes afterward. |
| Drizzle ORM rc.5-ab785fc | Retain | The pristine artifact still imports the removed Effect SQL error path in all 46 patched files. The old path does not resolve under Effect 4.0.5; its current replacement does. The complete patch applies cleanly, and effect-drizzle check and its 28 type tests pass. |
| ONNX Runtime Node 1.30.0 | Retain patch and companion document | The pristine installer still uses adm-zip extraction. The seven installer regression tests pass with the replacement, including selected-entry handling, symlinks, malformed archives and cleanup. |

The current [Effect patch](../../patches/effect@4.0.5.patch) and
[node platform patch](../../patches/@effect%252Fplatform-node-shared@4.0.5.patch)
remain necessary at the latest published 4.0.5 versions checked. Their combined
original regression suite passes all six tests with the installed patches.
The Error equality patch retains its existing applicability boundary: it changes
the published distribution, and plain Error location-named fields can still be
runtime metadata. This audit does not claim a broader equality redesign.

The [alpha.9 patch](../../patches/@xstate%252Feffect@1.0.0-alpha.9.patch)
replaces the obsolete alpha.8 registration, file and current runbook reference.
Its action-brand producer and requirement extractor use the same public key.
The exact generated Bun suite passes all 14 XState tests after installation;
package audit, docgen and standalone Effect diagnostics also pass. No declaration
fixture or assertion was weakened.

The [Drizzle patch](../../patches/drizzle-orm@1.0.0-rc.5-ab785fc.patch)
continues to replace the obsolete SQL import with the dedicated public module.
The package is still on the same selected release candidate; the version number
alone provides no basis for retiring its compatibility fix.

The [ONNX patch](../../patches/onnxruntime-node@1.30.0.patch) and its
[installer rationale](../../patches/onnxruntime-node@1.30.0.md) must stay paired
with the scoped dependency override. The replacement ZIP library has a different
API, so removing only the patch breaks the installer. The upstream ZIP dependency
remains affected, with no patched version listed in
[GHSA-vwc7-r8mq-g2x9](https://github.com/advisories/GHSA-vwc7-r8mq-g2x9)
on the audit date. The companion document now records the current Bun pin and
advisory check date.

Retire a retained patch only after its pristine replacement passes the same
regressions on the supported runtime. Update its registration, override where
applicable, lockfile and documentation together. Keep the regression tests so a
later dependency update cannot silently reintroduce the failure.
