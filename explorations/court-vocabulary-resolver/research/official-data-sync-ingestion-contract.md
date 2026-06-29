# official-data-sync-ingestion-contract

Scope: how the static courts-db dataset is ingested *through* `goals/official-data-sync-foundation` (not by rebuilding the sync engine) — deterministic assembly (gazetteer alternation, `${N-M}` ordinal expansion, `variables.json` template substitution, parent→child field inheritance), landing into `@beep/data`, and cross-checked against the seal-rookery 365-ID lookup.

## Findings

### The repo already owns the sync engine — a courts target is one new `SyncDataTarget`, not a new pipeline

- The engine lives at `packages/tooling/tool/cli/src/commands/SyncDataToTs` and is driven by `bun run beep sync-data-to-ts` (`--all`, `--check`, `--report-dir`). Mission per the goal manifest: "Automate official source refreshes into `@beep/data` and derive `@beep/schema` literals/codecs from those generated snapshots." (in-repo: `goals/official-data-sync-foundation/ops/manifest.json`, `SPEC.md`).
- The ingestion contract is the `SyncDataTarget` interface (in-repo: `packages/tooling/tool/cli/src/commands/SyncDataToTs/internal/Models.ts:138-143`):
  ```ts
  interface SyncDataTarget {
    readonly acquire: Effect.Effect<SyncDataTargetProjection, SyncDataToTsError, SyncDataTargetServices>;
    readonly description: string;
    readonly id: string;
    readonly sourceUrls: ReadonlyArray<string>;
  }
  ```
  `SyncDataTargetServices = HttpClient.HttpClient | Crypto.Crypto` (Models.ts:130) — i.e. a target may only fetch over HTTP and hash; no other ambient capabilities. Adding courts-db = adding one file `targets/Courts.ts` implementing this interface and registering it in `targets/index.ts`. The engine (diffing, `--check` drift, report rendering, write) is reused unchanged. This matches the CAPTURE.md directive "Ingest … via `goals/official-data-sync-foundation` (the static-dataset sync engine — do NOT rebuild that engine)" (in-repo: `explorations/court-vocabulary-resolver/CAPTURE.md`).
- `acquire` must produce a `SyncDataTargetProjection` (Models.ts:110-122): `{ files: SyncDataOutputFile[], canonicalPath, canonical: Json, recordCount, summary, sources: SyncDataSourceMetadata[] }`. `SyncDataSourceMetadata` (Models.ts:75-86) is `{ id, url, sha256, version?, published? }` — **every source URL + SHA-256 is recorded** in the generated sidecar and the PR report (SPEC.md "Every generated dataset records source URLs and SHA-256 metadata").
- Canonical target shape to copy is `targets/CldrTerritories.ts` (in-repo). It: fetches via `fetchSource`/`parseJsonSource` (from `internal/Source.ts`), decodes each payload with an `S.Class` schema + `SyncDataToTsError.mapError`, normalizes to sorted entries, then emits **two files** — a generated `*.ts` module (literal arrays + `*ByCode` maps + `*Metadata` with sources) and a canonical `*.data.json` sidecar — landing under `packages/foundation/primitive/data/src/generated/` (e.g. `cldr-territories.ts` + `cldr-territories.data.json`). A courts target lands `courts.ts` + `courts.data.json` in the same `generated/` dir. (in-repo: `CldrTerritories.ts:26-28, 461-481`).
- Supported source formats are `json | csv | xml | bytes | text` (`SyncDataSourceFormatKit`, Models.ts:25). courts-db needs **`text`/`bytes`**, not `json`, for the templated source files, because substitution must happen on the raw string *before* `JSON.parse` (see assembly below).
- Downstream contract: `@beep/data` owns raw arrays/maps/literals/sidecars; `@beep/schema` imports them and derives `LiteralKit`/`MappedLiteralKit` schemas via `@beep/utils/Struct` helpers (`keysNonEmpty`, `entriesNonEmpty`, `reverse`); "Schema modules must not hand-copy official literal lists." (in-repo: `SPEC.md` Data Contract). For courts this means a `CourtId` literal union + `citationString→courtId` mapped codec derived from `@beep/data`, not hand-written.
- Automation already exists: `.github/workflows/data-sync.yml` refreshes data, uploads Markdown/JSON reports, and prepares a PR body; diffs use Effect v4 `Differ`/`JsonPatch`, reports render via `@beep/md`; hashing uses Effect `Crypto`, **not** `@beep/schema/Sha256` (in-repo: `SPEC.md` Automation Contract, `PLAN.md`).

### courts-db deterministic assembly (must be reimplemented in TS inside `acquire`)

The Python reference is `courts_db/utils.py::load_courts_db()` (lines 126-179). The published `courts.json` is a **templated source**, not a finished table — it must be rendered in four deterministic stages (source: https://raw.githubusercontent.com/freelawproject/courts-db/main/courts_db/utils.py):

1. **Placename gazetteer alternation** (utils.py:140-143): each `data/places/*.txt` file is read, lines joined into a regex alternation `(line1|line2|…)`, and registered as a template variable keyed by filename stem. There are ~28 gazetteer files (e.g. `al_counties.txt`, `ny_counties.txt`, `va_circuits.txt`, `az_superior_cts.txt`, `gand_divisions.txt`) — verified via GitHub contents API (https://api.github.com/repos/freelawproject/courts-db/contents/courts_db/data/places).
2. **`${N-M}` ordinal expansion** (utils.py:145-156): `re.findall(r"\${(\d+)-(\d+)}", temp)` finds ordinal-range tokens; each `${N-M}` is replaced by `((ordinal_N)|…|(ordinal_M))` using the module-level `ordinals` list. The `ordinals` list has **exactly 100 forms**, `"first"` … `"one[- ]hundredth"`, with multi-spelling regexes (e.g. `"twenty(-| )first"`) (verified: utils.py:9-110). Slice semantics are `ordinals[N-1 : M]`, so `${1-56}` → `first … fifty-sixth` (index 55 = `"fifty(-| )sixth"`, verified).
3. **`variables.json` template substitution** (utils.py:158-163): `string.Template(temp).substitute(**variables)` expands `$key`/`${key}` regex fragments, then `s.replace("\\", "\\\\")` double-escapes backslashes, then `json.loads`. `variables.json` holds short regex-template keys reused across courts — district abbreviations (`md`, `wd`, `sd`, `ed`, `nd`, `cd`, `d`), federal types (`usa`, `uscoa`, `usdc`, `usbc`…), 50-state name patterns, and court-type fragments (`sup`, `sjc`, `super`) (source: https://raw.githubusercontent.com/freelawproject/courts-db/main/courts_db/data/variables.json; courts-db README "`variables.json` holds templates for large numbers of regexes" https://raw.githubusercontent.com/freelawproject/courts-db/main/README.rst).
4. **Parent→child field inheritance** (utils.py:165-177): for any court with a `parent` that is missing `dates`/`type`/`location`, those fields are copied from the parent record. This is the "streamed-down data" step — it neither adds nor removes courts, it only fills sparse child fields.

`gather_regexes()` (utils.py:182-210) is resolver-layer (compiles `regex + [name]` into `(compiled, id, name, type, location, parent)` tuples) — that belongs to the resolver subtopic, **not** the ingestion target; the ingestion target should emit the *rendered records* (and optionally the rendered regex strings), leaving compilation to the resolver.

- **`courts.json` = 2,809 court records** (verified: `jq length` on https://raw.githubusercontent.com/freelawproject/courts-db/main/courts_db/data/courts.json = 2809), confirming the CAPTURE.md "~2,809 courts" nugget. Per-court fields (README): `id`, `name`, `name_abbreviation`, `citation_string`, `regex[]`, `examples[]`, `jurisdiction`, `system`, `type`, `level`, `location`, `parent`, `dates[]`.

### `${1-56}` is illustrative, not literal — adversarial correction

The subtopic and CAPTURE.md cite `${1-56}`, but **that exact token does not appear in the published `courts.json`**. Grep of the live source finds only `${1-5}` (×7), `${1-8}` (×1), `${1-10}` (×2) (verified via `grep -oE '\$\{[0-9]+-[0-9]+\}'` on the raw courts.json). `${1-56}` comes from the source-code **comment** at utils.py:145-146 ("for example 1 to 56 judicial districts"), illustrating the mechanism's *capacity* (the 100-entry `ordinals` list). The TS reimplementation must still support arbitrary `${N-M}` (the live tokens require ordinals 1-10), not hard-code 56.

### Licensing — re-derive data, reimplement code, attribute Free Law Project

- **courts-db is BSD-2-Clause** (verified: LICENSE header "BSD 2-Clause License / Copyright (c) 2020, Free Law Project" https://raw.githubusercontent.com/freelawproject/courts-db/main/LICENSE; README "available under the permissive BSD license, making it easy and safe to incorporate" https://raw.githubusercontent.com/freelawproject/courts-db/main/README.rst). PyPI `license` metadata field is null but the repo LICENSE governs. This permits vendoring the data tables **with attribution**; per CAPTURE.md cautions, treat resolver/loader *logic* as **reimplement-don't-copy** and avoid pulling any AGPL CourtListener server code. (PyPI: courts-db **0.10.27**, released **2026-03-25** — https://pypi.org/pypi/courts-db/json.)
- The ingestion `acquire` should fetch the upstream files at a **pinned git ref** from `raw.githubusercontent.com` (mirroring how `CldrTerritories.ts` pins a release tag), recording each URL + SHA-256, so a snapshot is reproducible and attributable.

### Cross-check against the seal-rookery 365-ID lookup (concrete, verified)

- `seal_rookery/seals/seals.json` has **exactly 365 top-level court-ID keys**, of which **254 have `has_seal: true`** (verified: `jq 'keys|length'` = 365, `has_seal==true` = 254 on https://raw.githubusercontent.com/freelawproject/seal-rookery/main/seal_rookery/seals/seals.json). This **confirms the CAPTURE.md "365 IDs" nugget** and **refutes** an unreliable WebFetch summary that claimed 542. Each entry is `{ has_seal, hash?, name, notes }`, keyed by the same CourtListener court ID space courts-db uses.
- **Cross-check intersection (verified):** of the 365 seal IDs, **354 are present in courts-db's 2,809 IDs**; **11 seal-only IDs are absent from courts-db**: `aoc` (Administrative Office of the U.S. Courts), `asbca` (Armed Services Board of Contract Appeals), `bapma`, `bapme` (Bankruptcy Appellate Panels MA / D. Maine), `cbca` (Civilian Board of Contract Appeals), `compliance` (Office of Compliance, U.S. Congress), `mocd`, `mosd` (C.D./S.D. Missouri district courts), `mspb` (Merit Systems Protection Board), `stp` (U.S. Special Tribunal of Pennsylvania), `tennworkcompcl` (TN Court of Workers' Comp Claims). This 354/365 (≈97%) overlap is the cross-check signal: the ingestion test/report should assert seal IDs resolve to courts-db IDs and surface the 11-ID delta as expected exceptions (some are agencies/boards, not courts-db "courts").
- **seal-rookery license is a split, non-SPDX license** (GitHub classifies it `NOASSERTION`/`Other` — https://api.github.com/repos/freelawproject/seal-rookery/license): `LICENSE.txt` states the seal **images** are U.S. public domain under 17 U.S.C. §105 (federal works) (https://raw.githubusercontent.com/freelawproject/seal-rookery/main/LICENSE.txt). For this subtopic we consume only `seals.json` factual data (IDs + names + hashes) as a reference lookup — treat as **reference** (CAPTURE.md routing for seal-rookery#1 is "reference", not port), re-derive, attribute Free Law Project.

## Sources

- In-repo engine contract: `packages/tooling/tool/cli/src/commands/SyncDataToTs/internal/Models.ts` (lines 25, 75-86, 94-122, 130, 138-143)
- In-repo canonical target pattern: `packages/tooling/tool/cli/src/commands/SyncDataToTs/targets/CldrTerritories.ts`
- In-repo goal contract: `goals/official-data-sync-foundation/{SPEC.md,PLAN.md,ops/manifest.json}`
- In-repo landing zone: `packages/foundation/primitive/data/src/generated/`
- In-repo capture: `explorations/court-vocabulary-resolver/CAPTURE.md`
- courts-db assembly logic: https://raw.githubusercontent.com/freelawproject/courts-db/main/courts_db/utils.py
- courts-db dataset: https://raw.githubusercontent.com/freelawproject/courts-db/main/courts_db/data/courts.json
- courts-db variables: https://raw.githubusercontent.com/freelawproject/courts-db/main/courts_db/data/variables.json
- courts-db places gazetteers: https://api.github.com/repos/freelawproject/courts-db/contents/courts_db/data/places
- courts-db README: https://raw.githubusercontent.com/freelawproject/courts-db/main/README.rst
- courts-db license: https://raw.githubusercontent.com/freelawproject/courts-db/main/LICENSE
- courts-db version/release: https://pypi.org/pypi/courts-db/json (0.10.27, 2026-03-25)
- courts-db project page: https://free.law/projects/courts-db/
- seal-rookery index: https://raw.githubusercontent.com/freelawproject/seal-rookery/main/seal_rookery/seals/seals.json
- seal-rookery license: https://raw.githubusercontent.com/freelawproject/seal-rookery/main/LICENSE.txt ; https://api.github.com/repos/freelawproject/seal-rookery/license
- seal-rookery README: https://raw.githubusercontent.com/freelawproject/seal-rookery/main/README.md

## Open / Unverified

- **No existing courts target / `@beep/data` court module yet** — the courts target is NET-NEW; the v1 sync engine ships only `iso4217`, `iana-media-types`, `iana-timezones`, `cldr-territories` (manifest `sourceTargets`). The contract above is inferred from those four working targets; an actual `targets/Courts.ts` has not been written, so the exact `S.Class` decode schemas for a templated (pre-`JSON.parse`) source are UNVERIFIED in this codebase.
- **Format mismatch risk (engine deviation, not a blocker):** every shipped target fetches *finished* JSON/XML and decodes it directly. courts-db requires reading raw `text` and running Template/ordinal/inheritance rendering *before* parsing. The engine supports a `text`/`bytes` `SyncDataSourceFormat`, but no shipped target exercises the "render-then-parse" path — confirm `parseJsonSource`/`Source.ts` helpers accommodate post-fetch string transformation, or render inline in `acquire`. (UNVERIFIED: `internal/Source.ts` helper surface not read in full.)
- **Exact published `${N-M}` token set is version-sensitive:** verified against `main` on 2026-06-29 (`${1-5}`, `${1-8}`, `${1-10}`); a pinned-ref ingestion must re-scan, not assume.
- **seal-rookery `seals.json` code/data license boundary:** `LICENSE.txt` explicitly covers the image works (public domain); the licensing of the JSON *index* metadata itself is not separately stated and GitHub reports `NOASSERTION`. Treated here as factual reference data (IDs/names — non-copyrightable facts) with FLP attribution; a lawyer-grade confirmation is UNVERIFIED.
- **courts-db ↔ CourtListener ID identity:** the cross-check assumes courts-db `id` and seal-rookery key share the CourtListener court-ID namespace. The 354/365 overlap strongly supports this, but no upstream doc statement asserting a guaranteed 1:1 ID contract was located — UNVERIFIED beyond the empirical intersection.
</content>
</invoke>
