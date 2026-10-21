# Historical fixture dependency alerts: source handoff

As of 2026-10-20, the captured snapshot contains 104 open Dependabot alerts over 50 advisories. This lane owns the 94 alerts on nine historical parser-input files. The other ten alerts (six Python, four Rust) remain separate real-dependency work. No alert has been dismissed or otherwise mutated.

## Decision and evidence boundary

Represent inert parser inputs explicitly with non-installable fixture filenames, preserving the captured bytes and the parser assertions. This does not upgrade their historical package records or establish that the advisory reports are invalid. The intended result is that GitHub inventories actual installed workspace dependencies while excluding inert corpus documents from its dependency manifests. Graph removal or a reviewed non-runtime disposition must be observed after merge before these 94 alerts can be called closed. No tests, quality checks, installs, lock regeneration, commits or publication ran in this lane: the operator hold remains active until PR #1928 merges.

The supported GitHub commit/main read returned `8086a42233ab3eab7265c8deb7a6f3816686d445`. That exact commit is also local `origin/main`; this lane inspected its tracked fixture entries and port closeout. The fixture inputs are present on that default revision; this is not an obsolete-branch-only finding.

## Why these inputs are not installed dependencies

- Root `package.json` lists `scratchpad` as one workspace, alongside explicit package globs; it does not include nested `scratchpad/test/**` manifests. `scratchpad/package.json` is an actual workspace manifest and is untouched by this lane.
- `scratchpad/test/package-json/integration/PackageJsonFile.int.test.ts` imports five JSON input objects and serializes them into `MemoryFileSystem` under virtual `/fixtures/<name>/package.json` paths. It exercises `PackageJsonFile.read/modify`; the sample build/lint/test script strings are parser fields. No fixture install or script execution occurs in this consumer.
- `scratchpad/test/lockfiles/Lockfile.test.ts`, `importers.test.ts`, `documents.test.ts`, and `PnpmEnvLockfile.test.ts` read historical strings and pass them to `Lockfile.parse` or `PnpmEnvLockfile`. Those parser APIs consume strings; they do not invoke package managers.
- `scratchpad/test/lockfiles/fixtures/README.md` already required real manager output to remain verbatim and recorded exact package/peer/integrity/framing properties. Updating version strings or resolved hashes by hand would falsify the oracle.
- Source searches for these fixture roots and install/spawn consumers found the parser-test reads above. The effected runner copies fixture trees and counts their bytes (`scratchpad/effected/runner/Copy.ts`), while real installs belong to its top-level dependency-registration lane. This is source-bound evidence, not a proof against a human manually installing a historical fixture.

## Source and representation changes

- Renamed all 38 lockfile captures to `<original filename>.fixture`; every original capture byte is retained. Corpus-wide conversion prevents future captured inputs from silently appearing as active dependency lockfiles.
- Added `scratchpad/test/lockfiles/fixtures.ts`, the test-only loader mapping logical manager filenames to inert storage filenames. Consolidated the four readers through this helper. Logical filenames and all parser format arguments remain unchanged.
- Updated the existing version-gate enumeration guard to require the suffixed stored filename, preserving its positive/negative/config-only fixture classification.
- Added `scratchpad/test/lockfiles/fixtures/digests.json` recording the pre-move SHA-256 of every capture and `fixtures.test.ts` to require exact byte preservation, absence of executable lockfile basenames, and enumeration parity for the complete corpus.
- Renamed the five manifest parser inputs from `package.json` to `package.fixture.json` and updated only the JSON import paths in `scratchpad/test/package-json/integration/PackageJsonFile.int.test.ts`. The virtual `package.json` paths and existing behavior assertions remain intact.
- Added explicit inert-data guidance to both fixture README files, including prohibition on installing the examples and the process for a provenance-backed future recapture.

The only source path outside `scratchpad/test/lockfiles/**` and the integration fixture tree was proposed to the parent before editing and explicitly approved: `scratchpad/test/package-json/integration/PackageJsonFile.int.test.ts` (five JSON import paths). No production loader, dependency manifest, root lockfile or advisory status was changed.

## Earlier goal and current-main mapping

- `scratchpad/EFFECTED_PORT_GOAL.md`, section "Port complete, 2026-10-14", records the lab port and closeout through PRs #1592, #1628 and #1659; it records 29/29 done. Those are historical completion claims, not current security clearance.
- The original fixture-bearing paths arrived in #1592 (`7929b1f529`), as shown by path history. The fixture README also attributes the upstream corpus to effected #38, #432, #453 and #58; those upstream issue/PR references describe input provenance, not new security remediation.
- `goals/repository-simplification-confidence/SPEC.md` Decision Log 2026-10-14 records PRs #1592/#1628/#1659/#1662 as landed and ends the previous shared-file notification constraint. Its H1 work concerned real catalogs/registers and compatibility evidence; it did not erase or refresh the historical fixture corpus.
- `goals/repository-simplification-confidence/research/sweeps/2026-10-09/E-github.md` and `goals/model-routing-sync/research/2026-09-22-02-repo-cli-sync-surface.md` recorded dependency-graph/updater observations. They do not establish that these later alerts were resolved.

## Exact alert bindings and baseline blobs

Advisory identifiers, affected paths, severities and first-patched metadata below come directly from the captured supported GitHub snapshot. Links refer to GitHub advisory records; versions are advisory metadata, not claims that this lane installed or tested an upgrade.

### `scratchpad/test/package-json/integration/fixtures/full/package.json`

1 open alerts. Present on current main as blob `6778fa16d4168c07691acda1d93d77ac193e0c72`. Draft stored path: `scratchpad/test/package-json/integration/fixtures/full/package.fixture.json`.

| Alert | Package | Advisory | Severity | First patched version |
| --- | --- | --- | --- | --- |
| [#430](https://github.com/beep-effect/beep-effect/security/dependabot/430) | `vitest` | [GHSA-5xrq-8626-4rwp](https://github.com/advisories/GHSA-5xrq-8626-4rwp) | critical | `3.2.6` |

### `scratchpad/test/lockfiles/fixtures/yarn/v2/yarn.lock`

40 open alerts. Present on current main as blob `af56436519b7144aa61cd156610a7175bff9bd4f`. Draft stored path: `scratchpad/test/lockfiles/fixtures/yarn/v2/yarn.lock.fixture`.

| Alert | Package | Advisory | Severity | First patched version |
| --- | --- | --- | --- | --- |
| [#390](https://github.com/beep-effect/beep-effect/security/dependabot/390) | `lodash` | [GHSA-f23m-r3pf-42rh](https://github.com/advisories/GHSA-f23m-r3pf-42rh) | medium | `4.18.0` |
| [#391](https://github.com/beep-effect/beep-effect/security/dependabot/391) | `lodash` | [GHSA-r5fr-rjxr-66jc](https://github.com/advisories/GHSA-r5fr-rjxr-66jc) | high | `4.18.0` |
| [#392](https://github.com/beep-effect/beep-effect/security/dependabot/392) | `vite` | [GHSA-p9ff-h696-f583](https://github.com/advisories/GHSA-p9ff-h696-f583) | high | `7.3.2` |
| [#393](https://github.com/beep-effect/beep-effect/security/dependabot/393) | `vite` | [GHSA-v2wj-q39q-566r](https://github.com/advisories/GHSA-v2wj-q39q-566r) | high | `7.3.2` |
| [#394](https://github.com/beep-effect/beep-effect/security/dependabot/394) | `vite` | [GHSA-4w7w-66w2-5vf9](https://github.com/advisories/GHSA-4w7w-66w2-5vf9) | medium | `7.3.2` |
| [#395](https://github.com/beep-effect/beep-effect/security/dependabot/395) | `postcss` | [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93) | medium | `8.5.10` |
| [#396](https://github.com/beep-effect/beep-effect/security/dependabot/396) | `ip-address` | [GHSA-v2v4-37r5-5v8g](https://github.com/advisories/GHSA-v2v4-37r5-5v8g) | medium | `10.1.1` |
| [#397](https://github.com/beep-effect/beep-effect/security/dependabot/397) | `brace-expansion` | [GHSA-jxxr-4gwj-5jf2](https://github.com/advisories/GHSA-jxxr-4gwj-5jf2) | medium | `5.0.6` |
| [#398](https://github.com/beep-effect/beep-effect/security/dependabot/398) | `vitest` | [GHSA-5xrq-8626-4rwp](https://github.com/advisories/GHSA-5xrq-8626-4rwp) | critical | `3.2.6` |
| [#399](https://github.com/beep-effect/beep-effect/security/dependabot/399) | `esbuild` | [GHSA-g7r4-m6w7-qqqr](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr) | low | `0.28.1` |
| [#400](https://github.com/beep-effect/beep-effect/security/dependabot/400) | `vite` | [GHSA-fx2h-pf6j-xcff](https://github.com/advisories/GHSA-fx2h-pf6j-xcff) | high | `7.3.5` |
| [#401](https://github.com/beep-effect/beep-effect/security/dependabot/401) | `vite` | [GHSA-v6wh-96g9-6wx3](https://github.com/advisories/GHSA-v6wh-96g9-6wx3) | medium | `7.3.5` |
| [#402](https://github.com/beep-effect/beep-effect/security/dependabot/402) | `tar` | [GHSA-vmf3-w455-68vh](https://github.com/advisories/GHSA-vmf3-w455-68vh) | medium | `7.5.16` |
| [#403](https://github.com/beep-effect/beep-effect/security/dependabot/403) | `brace-expansion` | [GHSA-3jxr-9vmj-r5cp](https://github.com/advisories/GHSA-3jxr-9vmj-r5cp) | high | `5.0.7` |
| [#404](https://github.com/beep-effect/beep-effect/security/dependabot/404) | `tar` | [GHSA-gvwx-54wh-qm9j](https://github.com/advisories/GHSA-gvwx-54wh-qm9j) | medium | `7.5.17` |
| [#405](https://github.com/beep-effect/beep-effect/security/dependabot/405) | `tar` | [GHSA-8x88-c5mf-7j5w](https://github.com/advisories/GHSA-8x88-c5mf-7j5w) | high | `7.5.18` |
| [#406](https://github.com/beep-effect/beep-effect/security/dependabot/406) | `tar` | [GHSA-23hp-3jrh-7fpw](https://github.com/advisories/GHSA-23hp-3jrh-7fpw) | critical | `7.5.19` |
| [#407](https://github.com/beep-effect/beep-effect/security/dependabot/407) | `tar` | [GHSA-w8wr-v893-vjvp](https://github.com/advisories/GHSA-w8wr-v893-vjvp) | medium | `7.5.18` |
| [#408](https://github.com/beep-effect/beep-effect/security/dependabot/408) | `postcss` | [GHSA-6g55-p6wh-862q](https://github.com/advisories/GHSA-6g55-p6wh-862q) | high | `8.5.12` |
| [#409](https://github.com/beep-effect/beep-effect/security/dependabot/409) | `postcss` | [GHSA-r28c-9q8g-f849](https://github.com/advisories/GHSA-r28c-9q8g-f849) | high | `8.5.18` |
| [#410](https://github.com/beep-effect/beep-effect/security/dependabot/410) | `tar` | [GHSA-r292-9mhp-454m](https://github.com/advisories/GHSA-r292-9mhp-454m) | high | `7.5.21` |
| [#411](https://github.com/beep-effect/beep-effect/security/dependabot/411) | `brace-expansion` | [GHSA-mh99-v99m-4gvg](https://github.com/advisories/GHSA-mh99-v99m-4gvg) | high | `5.0.8` |
| [#412](https://github.com/beep-effect/beep-effect/security/dependabot/412) | `brace-expansion` | [GHSA-rgw5-rvv9-x895](https://github.com/advisories/GHSA-rgw5-rvv9-x895) | high | `5.0.9` |
| [#413](https://github.com/beep-effect/beep-effect/security/dependabot/413) | `postcss` | [GHSA-fxqj-rqcc-2cmp](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp) | medium | `8.5.23` |
| [#414](https://github.com/beep-effect/beep-effect/security/dependabot/414) | `ip-address` | [GHSA-mwp4-54f8-5fhr](https://github.com/advisories/GHSA-mwp4-54f8-5fhr) | high | `10.3.1` |
| [#415](https://github.com/beep-effect/beep-effect/security/dependabot/415) | `nanoid` | [GHSA-28wg-ghj8-5hjv](https://github.com/advisories/GHSA-28wg-ghj8-5hjv) | high | `3.3.16` |
| [#416](https://github.com/beep-effect/beep-effect/security/dependabot/416) | `nanoid` | [GHSA-2v37-7h3g-55p8](https://github.com/advisories/GHSA-2v37-7h3g-55p8) | high | `3.3.18` |
| [#417](https://github.com/beep-effect/beep-effect/security/dependabot/417) | `nanoid` | [GHSA-xwg4-73v4-xw9w](https://github.com/advisories/GHSA-xwg4-73v4-xw9w) | high | `3.3.12` |
| [#418](https://github.com/beep-effect/beep-effect/security/dependabot/418) | `@vitest/mocker` | [GHSA-82fw-gwwq-j7x9](https://github.com/advisories/GHSA-82fw-gwwq-j7x9) | medium | `4.1.11` |
| [#419](https://github.com/beep-effect/beep-effect/security/dependabot/419) | `vitest` | [GHSA-82fw-gwwq-j7x9](https://github.com/advisories/GHSA-82fw-gwwq-j7x9) | medium | `4.1.11` |
| [#420](https://github.com/beep-effect/beep-effect/security/dependabot/420) | `ip-address` | [GHSA-rpw4-54j3-4h4q](https://github.com/advisories/GHSA-rpw4-54j3-4h4q) | medium | `10.5.1` |
| [#421](https://github.com/beep-effect/beep-effect/security/dependabot/421) | `brace-expansion` | [GHSA-6j4f-fj2g-mc7p](https://github.com/advisories/GHSA-6j4f-fj2g-mc7p) | high | `5.0.10` |
| [#422](https://github.com/beep-effect/beep-effect/security/dependabot/422) | `brace-expansion` | [GHSA-qhr7-859c-m2p7](https://github.com/advisories/GHSA-qhr7-859c-m2p7) | high | `5.0.11` |
| [#423](https://github.com/beep-effect/beep-effect/security/dependabot/423) | `brace-expansion` | [GHSA-q2hr-2g5m-vwhr](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr) | medium | `5.0.12` |
| [#424](https://github.com/beep-effect/beep-effect/security/dependabot/424) | `ip-address` | [GHSA-h3mg-xc3c-68pw](https://github.com/advisories/GHSA-h3mg-xc3c-68pw) | medium | `10.7.1` |
| [#425](https://github.com/beep-effect/beep-effect/security/dependabot/425) | `ip-address` | [GHSA-j6r3-76f7-8jcv](https://github.com/advisories/GHSA-j6r3-76f7-8jcv) | medium | `10.7.1` |
| [#426](https://github.com/beep-effect/beep-effect/security/dependabot/426) | `http-cache-semantics` | [GHSA-ch52-4w7c-c8xp](https://github.com/advisories/GHSA-ch52-4w7c-c8xp) | high | `None recorded` |
| [#427](https://github.com/beep-effect/beep-effect/security/dependabot/427) | `tinypool` | [GHSA-85c8-ppgw-ccpr](https://github.com/advisories/GHSA-85c8-ppgw-ccpr) | critical | `2.1.2` |
| [#428](https://github.com/beep-effect/beep-effect/security/dependabot/428) | `tinypool` | [GHSA-5gmw-xhrv-c9v3](https://github.com/advisories/GHSA-5gmw-xhrv-c9v3) | critical | `2.1.1` |
| [#429](https://github.com/beep-effect/beep-effect/security/dependabot/429) | `source-map-js` | [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) | high | `1.2.2` |

### `scratchpad/test/lockfiles/fixtures/yarn/v1/yarn.lock`

2 open alerts. Present on current main as blob `b5e714446e70e707a5b3d71c62193dafec5ede57`. Draft stored path: `scratchpad/test/lockfiles/fixtures/yarn/v1/yarn.lock.fixture`.

| Alert | Package | Advisory | Severity | First patched version |
| --- | --- | --- | --- | --- |
| [#388](https://github.com/beep-effect/beep-effect/security/dependabot/388) | `lodash` | [GHSA-f23m-r3pf-42rh](https://github.com/advisories/GHSA-f23m-r3pf-42rh) | medium | `4.18.0` |
| [#389](https://github.com/beep-effect/beep-effect/security/dependabot/389) | `lodash` | [GHSA-r5fr-rjxr-66jc](https://github.com/advisories/GHSA-r5fr-rjxr-66jc) | high | `4.18.0` |

### `scratchpad/test/lockfiles/fixtures/pnpm/v3/pnpm-lock.yaml`

2 open alerts. Present on current main as blob `6bf4398638bdef03c4f4a636f1dbe967c416604f`. Draft stored path: `scratchpad/test/lockfiles/fixtures/pnpm/v3/pnpm-lock.yaml.fixture`.

| Alert | Package | Advisory | Severity | First patched version |
| --- | --- | --- | --- | --- |
| [#386](https://github.com/beep-effect/beep-effect/security/dependabot/386) | `lodash` | [GHSA-f23m-r3pf-42rh](https://github.com/advisories/GHSA-f23m-r3pf-42rh) | medium | `4.18.0` |
| [#387](https://github.com/beep-effect/beep-effect/security/dependabot/387) | `lodash` | [GHSA-r5fr-rjxr-66jc](https://github.com/advisories/GHSA-r5fr-rjxr-66jc) | high | `4.18.0` |

### `scratchpad/test/lockfiles/fixtures/pnpm/v2/pnpm-lock.yaml`

21 open alerts. Present on current main as blob `06c77d84b8f1833dfa768e9f2d56575a1600d14d`. Draft stored path: `scratchpad/test/lockfiles/fixtures/pnpm/v2/pnpm-lock.yaml.fixture`.

| Alert | Package | Advisory | Severity | First patched version |
| --- | --- | --- | --- | --- |
| [#365](https://github.com/beep-effect/beep-effect/security/dependabot/365) | `lodash` | [GHSA-f23m-r3pf-42rh](https://github.com/advisories/GHSA-f23m-r3pf-42rh) | medium | `4.18.0` |
| [#366](https://github.com/beep-effect/beep-effect/security/dependabot/366) | `lodash` | [GHSA-r5fr-rjxr-66jc](https://github.com/advisories/GHSA-r5fr-rjxr-66jc) | high | `4.18.0` |
| [#367](https://github.com/beep-effect/beep-effect/security/dependabot/367) | `vite` | [GHSA-p9ff-h696-f583](https://github.com/advisories/GHSA-p9ff-h696-f583) | high | `7.3.2` |
| [#368](https://github.com/beep-effect/beep-effect/security/dependabot/368) | `vite` | [GHSA-v2wj-q39q-566r](https://github.com/advisories/GHSA-v2wj-q39q-566r) | high | `7.3.2` |
| [#369](https://github.com/beep-effect/beep-effect/security/dependabot/369) | `vite` | [GHSA-4w7w-66w2-5vf9](https://github.com/advisories/GHSA-4w7w-66w2-5vf9) | medium | `7.3.2` |
| [#370](https://github.com/beep-effect/beep-effect/security/dependabot/370) | `postcss` | [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93) | medium | `8.5.10` |
| [#371](https://github.com/beep-effect/beep-effect/security/dependabot/371) | `vitest` | [GHSA-5xrq-8626-4rwp](https://github.com/advisories/GHSA-5xrq-8626-4rwp) | critical | `3.2.6` |
| [#372](https://github.com/beep-effect/beep-effect/security/dependabot/372) | `esbuild` | [GHSA-g7r4-m6w7-qqqr](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr) | low | `0.28.1` |
| [#373](https://github.com/beep-effect/beep-effect/security/dependabot/373) | `vite` | [GHSA-fx2h-pf6j-xcff](https://github.com/advisories/GHSA-fx2h-pf6j-xcff) | high | `7.3.5` |
| [#374](https://github.com/beep-effect/beep-effect/security/dependabot/374) | `vite` | [GHSA-v6wh-96g9-6wx3](https://github.com/advisories/GHSA-v6wh-96g9-6wx3) | medium | `7.3.5` |
| [#375](https://github.com/beep-effect/beep-effect/security/dependabot/375) | `postcss` | [GHSA-6g55-p6wh-862q](https://github.com/advisories/GHSA-6g55-p6wh-862q) | high | `8.5.12` |
| [#376](https://github.com/beep-effect/beep-effect/security/dependabot/376) | `postcss` | [GHSA-r28c-9q8g-f849](https://github.com/advisories/GHSA-r28c-9q8g-f849) | high | `8.5.18` |
| [#377](https://github.com/beep-effect/beep-effect/security/dependabot/377) | `postcss` | [GHSA-fxqj-rqcc-2cmp](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp) | medium | `8.5.23` |
| [#378](https://github.com/beep-effect/beep-effect/security/dependabot/378) | `nanoid` | [GHSA-28wg-ghj8-5hjv](https://github.com/advisories/GHSA-28wg-ghj8-5hjv) | high | `3.3.16` |
| [#379](https://github.com/beep-effect/beep-effect/security/dependabot/379) | `nanoid` | [GHSA-2v37-7h3g-55p8](https://github.com/advisories/GHSA-2v37-7h3g-55p8) | high | `3.3.18` |
| [#380](https://github.com/beep-effect/beep-effect/security/dependabot/380) | `nanoid` | [GHSA-xwg4-73v4-xw9w](https://github.com/advisories/GHSA-xwg4-73v4-xw9w) | high | `3.3.12` |
| [#381](https://github.com/beep-effect/beep-effect/security/dependabot/381) | `@vitest/mocker` | [GHSA-82fw-gwwq-j7x9](https://github.com/advisories/GHSA-82fw-gwwq-j7x9) | medium | `4.1.11` |
| [#382](https://github.com/beep-effect/beep-effect/security/dependabot/382) | `vitest` | [GHSA-82fw-gwwq-j7x9](https://github.com/advisories/GHSA-82fw-gwwq-j7x9) | medium | `4.1.11` |
| [#383](https://github.com/beep-effect/beep-effect/security/dependabot/383) | `tinypool` | [GHSA-85c8-ppgw-ccpr](https://github.com/advisories/GHSA-85c8-ppgw-ccpr) | critical | `2.1.2` |
| [#384](https://github.com/beep-effect/beep-effect/security/dependabot/384) | `tinypool` | [GHSA-5gmw-xhrv-c9v3](https://github.com/advisories/GHSA-5gmw-xhrv-c9v3) | critical | `2.1.1` |
| [#385](https://github.com/beep-effect/beep-effect/security/dependabot/385) | `source-map-js` | [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) | high | `1.2.2` |

### `scratchpad/test/lockfiles/fixtures/pnpm/v1/pnpm-lock.yaml`

3 open alerts. Present on current main as blob `050273a8019fb2f962deeeb1b2e4244c346c999d`. Draft stored path: `scratchpad/test/lockfiles/fixtures/pnpm/v1/pnpm-lock.yaml.fixture`.

| Alert | Package | Advisory | Severity | First patched version |
| --- | --- | --- | --- | --- |
| [#362](https://github.com/beep-effect/beep-effect/security/dependabot/362) | `lodash` | [GHSA-xxjr-mmjv-4gpg](https://github.com/advisories/GHSA-xxjr-mmjv-4gpg) | medium | `4.17.23` |
| [#363](https://github.com/beep-effect/beep-effect/security/dependabot/363) | `lodash` | [GHSA-f23m-r3pf-42rh](https://github.com/advisories/GHSA-f23m-r3pf-42rh) | medium | `4.18.0` |
| [#364](https://github.com/beep-effect/beep-effect/security/dependabot/364) | `lodash` | [GHSA-r5fr-rjxr-66jc](https://github.com/advisories/GHSA-r5fr-rjxr-66jc) | high | `4.18.0` |

### `scratchpad/test/lockfiles/fixtures/pnpm/alias/pnpm-lock.yaml`

4 open alerts. Present on current main as blob `409a0632976256e8438621b0b207992e935d5e17`. Draft stored path: `scratchpad/test/lockfiles/fixtures/pnpm/alias/pnpm-lock.yaml.fixture`.

| Alert | Package | Advisory | Severity | First patched version |
| --- | --- | --- | --- | --- |
| [#358](https://github.com/beep-effect/beep-effect/security/dependabot/358) | `glob` | [GHSA-5j98-mcp5-4vw2](https://github.com/advisories/GHSA-5j98-mcp5-4vw2) | high | `10.5.0` |
| [#359](https://github.com/beep-effect/beep-effect/security/dependabot/359) | `brace-expansion` | [GHSA-6j4f-fj2g-mc7p](https://github.com/advisories/GHSA-6j4f-fj2g-mc7p) | high | `2.1.5` |
| [#360](https://github.com/beep-effect/beep-effect/security/dependabot/360) | `brace-expansion` | [GHSA-qhr7-859c-m2p7](https://github.com/advisories/GHSA-qhr7-859c-m2p7) | high | `2.1.6` |
| [#361](https://github.com/beep-effect/beep-effect/security/dependabot/361) | `brace-expansion` | [GHSA-q2hr-2g5m-vwhr](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr) | medium | `2.1.7` |

### `scratchpad/test/lockfiles/fixtures/npm/v2/package-lock.json`

19 open alerts. Present on current main as blob `523ad31a52b43807520b2e36222b9273550cab99`. Draft stored path: `scratchpad/test/lockfiles/fixtures/npm/v2/package-lock.json.fixture`.

| Alert | Package | Advisory | Severity | First patched version |
| --- | --- | --- | --- | --- |
| [#337](https://github.com/beep-effect/beep-effect/security/dependabot/337) | `lodash` | [GHSA-f23m-r3pf-42rh](https://github.com/advisories/GHSA-f23m-r3pf-42rh) | medium | `4.18.0` |
| [#338](https://github.com/beep-effect/beep-effect/security/dependabot/338) | `lodash` | [GHSA-r5fr-rjxr-66jc](https://github.com/advisories/GHSA-r5fr-rjxr-66jc) | high | `4.18.0` |
| [#339](https://github.com/beep-effect/beep-effect/security/dependabot/339) | `vite` | [GHSA-p9ff-h696-f583](https://github.com/advisories/GHSA-p9ff-h696-f583) | high | `7.3.2` |
| [#340](https://github.com/beep-effect/beep-effect/security/dependabot/340) | `vite` | [GHSA-v2wj-q39q-566r](https://github.com/advisories/GHSA-v2wj-q39q-566r) | high | `7.3.2` |
| [#341](https://github.com/beep-effect/beep-effect/security/dependabot/341) | `vite` | [GHSA-4w7w-66w2-5vf9](https://github.com/advisories/GHSA-4w7w-66w2-5vf9) | medium | `7.3.2` |
| [#342](https://github.com/beep-effect/beep-effect/security/dependabot/342) | `postcss` | [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93) | medium | `8.5.10` |
| [#343](https://github.com/beep-effect/beep-effect/security/dependabot/343) | `vitest` | [GHSA-5xrq-8626-4rwp](https://github.com/advisories/GHSA-5xrq-8626-4rwp) | critical | `3.2.6` |
| [#344](https://github.com/beep-effect/beep-effect/security/dependabot/344) | `esbuild` | [GHSA-g7r4-m6w7-qqqr](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr) | low | `0.28.1` |
| [#345](https://github.com/beep-effect/beep-effect/security/dependabot/345) | `vite` | [GHSA-fx2h-pf6j-xcff](https://github.com/advisories/GHSA-fx2h-pf6j-xcff) | high | `7.3.5` |
| [#346](https://github.com/beep-effect/beep-effect/security/dependabot/346) | `vite` | [GHSA-v6wh-96g9-6wx3](https://github.com/advisories/GHSA-v6wh-96g9-6wx3) | medium | `7.3.5` |
| [#347](https://github.com/beep-effect/beep-effect/security/dependabot/347) | `postcss` | [GHSA-6g55-p6wh-862q](https://github.com/advisories/GHSA-6g55-p6wh-862q) | high | `8.5.12` |
| [#348](https://github.com/beep-effect/beep-effect/security/dependabot/348) | `postcss` | [GHSA-r28c-9q8g-f849](https://github.com/advisories/GHSA-r28c-9q8g-f849) | high | `8.5.18` |
| [#349](https://github.com/beep-effect/beep-effect/security/dependabot/349) | `postcss` | [GHSA-fxqj-rqcc-2cmp](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp) | medium | `8.5.23` |
| [#352](https://github.com/beep-effect/beep-effect/security/dependabot/352) | `nanoid` | [GHSA-xwg4-73v4-xw9w](https://github.com/advisories/GHSA-xwg4-73v4-xw9w) | high | `3.3.12` |
| [#353](https://github.com/beep-effect/beep-effect/security/dependabot/353) | `@vitest/mocker` | [GHSA-82fw-gwwq-j7x9](https://github.com/advisories/GHSA-82fw-gwwq-j7x9) | medium | `4.1.11` |
| [#354](https://github.com/beep-effect/beep-effect/security/dependabot/354) | `vitest` | [GHSA-82fw-gwwq-j7x9](https://github.com/advisories/GHSA-82fw-gwwq-j7x9) | medium | `4.1.11` |
| [#355](https://github.com/beep-effect/beep-effect/security/dependabot/355) | `tinypool` | [GHSA-85c8-ppgw-ccpr](https://github.com/advisories/GHSA-85c8-ppgw-ccpr) | critical | `2.1.2` |
| [#356](https://github.com/beep-effect/beep-effect/security/dependabot/356) | `tinypool` | [GHSA-5gmw-xhrv-c9v3](https://github.com/advisories/GHSA-5gmw-xhrv-c9v3) | critical | `2.1.1` |
| [#357](https://github.com/beep-effect/beep-effect/security/dependabot/357) | `source-map-js` | [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) | high | `1.2.2` |

### `scratchpad/test/lockfiles/fixtures/npm/v1/package-lock.json`

2 open alerts. Present on current main as blob `51ef8d2f9851f8ad5f381385555884e333d88ef3`. Draft stored path: `scratchpad/test/lockfiles/fixtures/npm/v1/package-lock.json.fixture`.

| Alert | Package | Advisory | Severity | First patched version |
| --- | --- | --- | --- | --- |
| [#335](https://github.com/beep-effect/beep-effect/security/dependabot/335) | `lodash` | [GHSA-f23m-r3pf-42rh](https://github.com/advisories/GHSA-f23m-r3pf-42rh) | medium | `4.18.0` |
| [#336](https://github.com/beep-effect/beep-effect/security/dependabot/336) | `lodash` | [GHSA-r5fr-rjxr-66jc](https://github.com/advisories/GHSA-r5fr-rjxr-66jc) | high | `4.18.0` |

## Pending work and reversal

1. After the parent confirms #1928 merged, run the affected package-json integration suite, complete lockfile parser suites (including importer, framing, env and negative/version-gate cases), the new storage/digest regressions, and the applicable scratchpad type/lint gates. No present result should be read as passing those checks.
2. Review the rename diff as byte-preserving moves, including the new digest inventory, and ensure all test consumers resolve logical names through the shared loader. The unchanged captures deliberately retain historical vulnerable records.
3. Publish in the single authorized security PR with the other eight security findings and the real Python/Rust dependency repairs. After merge, read the default-branch dependency graph and all 104 captured alert IDs. A path rename alone is not proof that GitHub has recomputed or closed alerts.
4. If GitHub continues to report the inert captures, inspect its current manifest classification. Record any false-positive disposition against the exact alert IDs only through an authorized supported status action, with this source reachability evidence; do not silently suppress alerts or exclude real workspace dependencies.
5. Future fixture refreshes require isolated manager-generated captures, recorded manager/input provenance, and deliberate parser assertion updates. A fixture with no available patch (for example captured alert #426 on `http-cache-semantics`) does not justify fabricated lock records.

Reversal: rename the 38 captures and five JSON inputs back, restore the five reader/import edits, and remove the shared loader/storage test/digests and new documentation together. No runtime state or installation was changed. Reversal restores dependency-manifest discovery as well as the original input layout.

Residual limits: there is no runtime install/execute capability in the inspected consumers, but these are real package-manager-format documents containing vulnerable historical versions. A human can rename/copy them into an installation root. The explicit suffix and guidance reduce accidental use; they do not sanitize the underlying historical package graphs or upgrade any actual package.

Graft retrieval saved approximately 84,452 input tokens in one call (tool-reported value about $0.05).
