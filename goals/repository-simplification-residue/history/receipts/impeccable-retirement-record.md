# Repository Impeccable: retirement record

Locked disposition (repository-simplification-confidence SPEC, workstream A):
"Repository Impeccable: Remove completely". The disposition covers the
Claude/GitHub skill payloads, hooks, Codex wiring, scripts, exclusions and local
residue in this repository. Global (home-directory) installations follow
workstream F's evidence policy and are out of scope.

## Census before (branch base `79be810dcc`)

Path census: `rg --files --hidden -g '!.git' | rg -i impeccable`.
Content census: `rg -c -i impeccable` with `goals/`, `explorations/` and
`research/` excluded (those directories are provenance).

Payload files (313):

- `.claude/skills/impeccable/**` (154 files, also reachable through the
  `.agents/skills` symlink).
- `.github/skills/impeccable/**` (149 files, the GitHub Copilot mirror).
- `.github/agents/impeccable-{asset-producer,documenter,finish-reviewer,manual-edit-applier}.agent.md` (4 files).
- `.github/hooks/impeccable.json` (the Copilot hook).
- `.impeccable/config.json` (the detector ignore list).
- `apps/todox/.impeccable/` (`design.json` sidecar plus one question log and
  answer: local tool state).

Live references (16 files):

- Root `package.json`: the `impeccable:detect` script; `css-select`, `css-tree`,
  `domutils`, `htmlparser2` in the catalog and root devDependencies.
- `skills-lock.json` and `.codex/config.toml` (skill rows, owned by
  `beep skills update`).
- `biome.jsonc`, plus `biome.identity.jsonc`, which `beep cache profile` derives
  from it; `.fallowrc.jsonc` (entry, ignore patterns, ignoreFindings, the four
  ignoreDependencies, duplicates and health ignores); `.semgrepignore`;
  `.gitignore` (`.impeccable/questions` state); `beep-effect.iml` (the
  `.impeccable` exclusion).
- `@beep/repo-cli`: the Semgrep candidate filter in `Quality.command.ts`, the
  Knowledge refs excluded prefixes, and the four `repo.skills.impeccable.*`
  seats in `Models.seed.ts`. In the tests, the Impeccable mirror assertions in
  `skills-provenance.test.ts` and `knowledge-refs.test.ts`.
- `apps/todox`: the inert `impeccable:product-schema` marker in `PRODUCT.md`
  and the tool name in the `layout.tsx` direction-contract JSDoc.

The F lane had already removed the `.codex/hooks.json` callbacks and the
`.claude/settings.json` registrations; neither file mentions Impeccable at the base.

## What was removed

Every payload file listed above. Every live reference was removed or
regenerated: `skills-lock.json` and `.codex/config.toml` through
`beep skills update`, `biome.identity.jsonc` through `beep cache profile --write`,
and `bun.lock` through `bun install` (4 packages removed; `css-select` left the
lockfile; `css-tree`, `domutils` and `htmlparser2` stay only as transitive
dependencies of jsdom and the RDF parsers). The Impeccable-only capability test
was deleted. The trust-boundary test keeps its ontology adapter sandbox assertions.

## Census after

Same commands. No payload paths remain. Outside provenance directories, the only
content hits are the four `home.agents.impeccable.*` seats in `Models.seed.ts`.
They point at `$HOME/.agents/skills/impeccable/...`, so they are global seats
owned by workstream F (decision F-CLAUDE).

Provenance mentions in `goals/**`, `explorations/**` and `research/**` stay:
packet records, sweeps, fingerprint receipts, the todox site exploration, and the
ci-ops corpus `impeccable-plugin-*` attempt and verdict files.

## Out of scope

The user's globally installed Impeccable plugin and home skills, and the four
home model seats. Their hooks may still run in this checkout. Before this
change, the repo-local `.impeccable/config.json` held their ignores.

Reversal: revert the retirement PR. Every removed file is in git history.
`bun install` restores the four root dependencies.
