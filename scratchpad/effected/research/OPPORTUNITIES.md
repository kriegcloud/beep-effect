# Friction Ledger

Receipts from the effected kit port (`scratchpad/EFFECTED_PORT_GOAL.md`), per the repo's friction-first-class
law. The port has no `goals/` packet by design, so its ledger sits next to its other records.

## 2026-10-09 and 2026-10-14 — the Codex usage limit killed every lane in flight, twice

- **Doing:** running review rounds 2 and 3. Each module's fix, merge, repair and bookkeeping lanes were
  `codex exec --model gpt-6.1-sol` processes under transient user units, fed by Python drivers.
- **Evidence:** every lane alive at the moment exited 1 with `fixed=0`, and its log read
  `ERROR: You've hit your usage limit. ... try again at Oct 16th, 2026` (2026-10-09 21:07 CDT), and
  `... Oct 20th, 2026` (2026-10-14 00:30Z, after a weekly reset that lasted about 2.5 hours). The
  drivers marked the modules `INCOMPLETE`, and the repair watcher spent both attempts on the dead lanes
  and wrote `GAVE UP`. Nothing noticed until the next session resumed three days later. On resume, a
  probe `codex exec` looped on the repository's Stop hook, because one stale P0 inbox row was
  unacknowledged.
- **Cost:** about three idle days for four modules, a manual census of which lanes had died, and a
  second relaunch on another route.
- **Prevention:** lane runners should match the usage-limit message, stop launching, and write one
  `blocked: codex quota` row instead of burning repair attempts. Check the account's remaining quota
  (`bun run beep accounts`) before a fan-out. Keep a route-agnostic lane script ready; this port ended
  with one (`llm-lane.sh`, direct `claude-opus-5-5`), selected by an environment variable.

## 2026-10-13 — continuing a lab branch after its progress PR was squash-merged

- **Doing:** publishing progress PR 2 from `@lab/effected-2` after progress PR 1 (#1628) had been
  squash-merged into `main`.
- **Evidence:** `git merge-tree --write-tree --name-only HEAD origin/main` listed about 30 conflicting
  `scratchpad/effected/**` files. Round 3 had edited content that the squash commit already held, and a
  squash carries no ancestry, so git could not see it. A blanket `git merge -s ours <squash>` would have
  silently dropped three unrelated `main` commits (#1627, #1619 and a goals feature) between the earlier
  main merge and the squash. The safe sequence: merge the pre-squash PR head (tagged first so it could
  not be collected), merge `main` up to the squash's parent, `-s ours` on the squash alone (checked:
  zero differences outside `scratchpad/`), then merge `main`.
- **Cost:** one dry run, a planning pass, and a tag to keep the pre-squash head alive.
- **Prevention:** merge progress PRs from long-running branches with a merge commit, or restart the lab
  branch from `main` after each squash (done after #1592). Or ship a squash-aware re-integration helper
  that verifies "content already held" before recording an `ours` merge.

## 2026-10-13 — the runner's check gate followed the editor's newest tsgo

- **Doing:** integrating round 3. The runner's `check` gate also runs the newest tsgo found in the
  WebStorm cache (`~/.cache/JetBrains/*/effect-tsgo/<version>`).
- **Evidence:** editor tsgo 0.52.0 appeared mid-run and exits 1 when it prints only suggestion-level
  diagnostics (369 `TS377141` in github-actions). The gate read the exit code, so `check` went red for
  most modules, and repair lanes started chasing false reds. Concurrent gates also copied the 26 MB
  binary into the same staging directory, so one could execute a half-copied `tsc`. After merging
  `main`, the same tsgo raised real errors that only the editor build enforced: `unnecessaryTypeofType`
  on #1621's new aliases, and `preferSchemaTypeProperty`.
- **Cost:** nine false reds cleared by hand, one repair lane stopped, and a fix pass on the progress PR
  head.
- **Prevention:** classify the captured diagnostics, not the exit code; stage through a private
  directory and an atomic rename (both shipped in the runner). Pin the editor tsgo the gate uses, or
  record its version with the verdict, so a desktop update cannot change the gate mid-run.

## 2026-10-13 — `ts.preProcessFile` lost its place and the parity gate read JSDoc as code

- **Doing:** the parity gate's foreign-specifier scan (`foreignSpecifierLines`), which must ignore
  JSDoc example imports of `@beep/scratchpad/effected/...`.
- **Evidence:** a regex literal holding a quote inside a template (yaml: `` `'${s.replace(/'/g, "''")}'` ``)
  and regex literals holding a backtick (markdown: `` /^[#`~*+_=<>0-9-]/ ``, the code-fence pattern)
  desynchronized the lightweight scanner. Every later JSDoc example import then counted as a real one
  (`@effected specifier at .../blockParser.ts:702`). A bisect probe found the culprit lines. The first
  case was worked around by rewriting the source line; the second showed the class of bug.
- **Cost:** two false parity reds, a give-up on one module's repair lanes, and two bisects.
- **Prevention:** never rely on `preProcessFile` for anything that gates. The scan now walks the
  TypeScript syntax tree, with a regression test covering backtick and quote regexes before a JSDoc
  example.
