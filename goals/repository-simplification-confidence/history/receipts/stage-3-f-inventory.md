# F configuration inventory — 2026-10-14

Status: **pre-apply inventory; execution blocked; not final acceptance**.
Audited source `529d77338d`; native-file snapshot and fresh metrics are in
[before measurement](stage-3-f-before-measurement.md) and its
[sanitized data](stage-3-f-before-state.json). Canonical means the existing
owner, not permission for this lane to replace that owner. Unknown consumers
are preserved. No capability was removed, disabled, or moved by this run.

## Routing source conflict

The current home manifest, owned by `rsc-shared`, has SHA-256
`cb1b05476db9cc4ff280d40d57bd2041899b24c01791d995ed265b4ff3f9a16b`.
`bun run beep models check --offline --json` exits 0, `hasDrift=false`, zero
findings. That check validates the installed manifest; it does not settle
whether the manifest meets the lane's approved brief.

| Route | Launch brief / R48 / locked preservation | Current manifest / native observation |
| --- | --- | --- |
| Ordinary Codex | `gpt-6.1-sol`, medium | matches, including Air |
| Ordinary Claude | `claude-opus-5-5`, medium | manifest and native default `claude-fable-5-1`, medium |
| Lightweight proxy | preserve `gpt-5.6-luna` | manifest `gpt-6-luna`, supersedes `gpt-5.6-luna` |
| Research CLI / proxy | preserve `grok-4.6` | manifest `grok-4.7`, supersedes `grok-4.6` |
| Grok fallback | `grok-4.7`, explicit medium; R49 keeps research default xhigh | native file default already medium |
| Junie CLI | preserve `gemini-3-flash-preview`, Auto subagents | matches; no fallback invented |

The manifest's Claude and research notes cite newer October 14 operator
rulings. Those notes are evidence of a newer policy claim, not authority for
this worker to undo the brief or rewrite the orchestrator-owned manifest.
The packet SPEC stop condition covers materially contradictory required
sources. Reconcile this route matrix in the lane brief/rulings and shared
manifest before applying routing changes. Existing models were not silently
replaced with the older brief values.

## Ownership classes and current load surfaces

| Harness / surface | Canonical sources and native fields | Links / projections | Enabled, disabled, and plugin-owned content |
| --- | --- | --- | --- |
| Claude repository | `AGENTS.md`; `.claude/skills`, `.claude/agents`, `.claude/hooks`; `.claude/settings.json`; `.mcp.json` | `CLAUDE.md` links to `AGENTS.md`; generated routing blocks belong to models; Codex skill projection belongs to skills update | 37 skill bodies; 7 agents; 9 hook-directory entries; settings have 10 hook events; MCP explicitly enables phoenix-docs/stately and disables chrome-devtools/phoenix/serena/webstorm |
| Codex repository | `.codex/config.toml` native features/MCP; `.codex/hooks.json` native registration | `.agents/skills` and `.agents/agents` link to Claude canon; 37 skill projection rows; seven `.codex/agents/*.toml` hand-maintained projections lack a generator | Repo MCP phoenix-docs enabled; webstorm/phoenix disabled. Hook registration has seven events and retains Impeccable commands in this checkout |
| Cursor repository | `.cursor/cli.json`, `.cursor/hooks.json`, environment/bootstrap wiring | Bootstrap is an owner-routed projection, not a second toolchain | Seven hook events; native git/sudo/pkexec deny fields retained. No repository MCP file discovered by this inventory |
| Junie repository | `.junie/memory`, language/version files | `.junie/skills/adhd` links through `.agents/skills` | One direct skill link; broader shared-skill loading was demonstrated by the October 9 private sweep, not retested here |
| Grok repository | `.grok/workflows` native workflow | `.grok/skills/graft/SKILL.md` remains a divergent manual projection: 9,101 B vs canonical 10,749 B | Claude compatibility surfaces are not explicitly disabled in the current home config; only `compat.cursor.mcps=false` is set |
| Claude home | `~/.claude/CLAUDE.md`, rules, memory; settings and user MCP are native owners | Home skill roots have 55 entries, 34 symlinks, 44 direct SKILL files | Five plugins enabled: Codex, Notion, Discord, Impeccable, Azure. Seven disabled MCP names include stale basic-memory/codegraph/sourcegraph. Plugin payloads remain owned by their installers |
| Codex home | `~/.codex/config.toml`, `AGENTS.md`, client plugins and native trust state | 52 skill config rows; 24 skills entries / 5 links / 19 SKILL files | 20 enabled plugin records; 495 project entries / 311 hook states. `effect-v4` and `turborepo` skill links do not resolve. Extra `beep-*.config.toml` and config-mcp profiles remain unowned pending consumer proof (R54) |
| Air Codex home | `~/.config/JetBrains/Air/.codex/config.toml`, its instructions, trust and skills | Separate configuration home; 52 skill rows; 24 entries / 5 links / 19 SKILL files | 20 enabled plugins; 491 projects / 309 hook states; same two unresolved skill links. Air MCP is also a separate native configuration |
| Cursor home | `~/.cursor/cli-config.json`, `mcp.json`; vendor skills remain vendor-owned | Two home skills, no links in that root | Sourcegraph and open-knowledge MCP configured; no Docker gateway binding. CLI execution/model behavior not freshly probed |
| Junie home and IDE | `~/.junie/settings.json`, MCP, extensions; IDE ACP model selection is a distinct owner | 32 skill links; `~/.junie/AGENTS.md` is still a regular 16,704 B file, not a link to current Claude doctrine (19,025 B) | CLI model and Auto preserved. IDE ACP model/effort drift remains historical evidence until a fresh IDE inspection; no CLI inference is substituted for ACP behavior |
| Grok home | `~/.grok/config.toml`, its native MCP/plugins/compat fields | 16 home skill links; 15 old memory links unresolved; one direct readable SKILL | Four native MCP definitions, including the shared Docker gateway. Research and fallback launch semantics require the route reconciliation above |
| Shared home skills | `~/.agents/skills` and installer/vendor owners | 74 entries / 1 link / 66 SKILL files | `turborepo` unresolved; mirrored Claude/Junie/Codex roots do not make those payloads independently owned |
| Other discovered clients | JetBrains AI Assistant / Air and Claude Desktop native config/extensions were inventoried in the private October 9 sweep | IDE launcher and ACP XML fields are native; no new manager added | Fresh effective-load probes remain pending; the old sweep is not a current success claim |

Counts of root entries include helper directories; SKILL counts count readable
`SKILL.md` at one level. A shared directory reached through a root symlink is
not a duplicate payload merely because it has another discovery path.

### Per-client load matrix

`Observed` below means structural discovery or stored-session evidence, not
proof that every named item was loaded by a fresh process in this run.

| Surface | Claude | Codex | Cursor | Junie | Grok | Air |
| --- | --- | --- | --- | --- | --- | --- |
| Repository doctrine | CLAUDE link | AGENTS | client instructions, probe pending | October 9 guidelines witness | October 9 CLAUDE compatibility witness | its selected ACP harness / separate Codex home |
| Repository skill owner | `.claude/skills` | `.agents/skills` plus native projection | fresh discovery pending | shared roots plus direct adhd link | shared roots plus graft copy | own Codex skills root |
| Repository hooks | native Claude settings | native hooks JSON | native Cursor hooks | native extension/ACP, fresh witness pending | Claude compat may load them | selected harness |
| Home plugins/extensions | native settings/installers | native settings/installers | vendor/skills | Junie extensions | native + compatibility | own selected harness |
| MCP | layered project/user/plugin sources | own native + repo | two home definitions | own native + extensions | native + compatibility | own MCP JSON + selected harness |

### Duplicate and instruction findings

- `law-pulse.sh` and `hook-pulse-switch.sh` in `.codex/hooks` are byte-identical
  to Claude copies. Codex hook-pulse itself differs and must not become a blind
  symlink. Two other Codex hooks are already small delegating shims.
- Root `AGENTS.md` is 31,078 bytes. `CLAUDE.md` is a symlink, not another payload.
  There are 98 tracked AGENTS files and 20 nested ones without a sibling
  CLAUDE link. Their paths are the twenty listed by the October 9 sweep; the
  count was rechecked live. No links were added across unverified packages.
- Claude auto-memory index is 38,028 bytes, exceeding the brief's 24.4 KB
  target. This run measured bytes only and did not rewrite memory.
- Global Impeccable, Azure, and Discord remain enabled in Claude. Their
  configured presence does not prove use or non-use. The four home Impeccable
  model seats and plugin payloads are retained pending a reconciled workflow
  decision or qualified window; no zero-use retirement is asserted.
- Cross-clone local Claude MCP policy remains unqualified in this dispatch.
  The private October 9 sweep found conflicting native local settings. This
  lane did not standardize another checkout or adopt its local state.

## Docker MCP

Fresh bounded checks: Docker MCP `v0.44.1`; profile `dankstation` exists.
The installed user unit uses legacy `--servers`, port 8811, no `--profile`,
no `--tools`, no dynamic flag, and no code-mode flag. Features report profiles
enabled, dynamic-tools disabled, embeddings disabled, and an unknown legacy
`hooks` feature. The running gateway was queried with authenticated MCP
initialize and tools/list; it returned **47 tools**, 128,947 bytes of compact
JSON tool definitions, without pagination. Authentication values were used in
memory and never emitted. No tool was called and no configuration was written.

The October 9 receipt's 46 live tools and 42 snapshot tools are historical.
Today `docker mcp tools count` returns **0**, despite the running gateway's 47;
that standalone command does not enumerate this legacy running service.
`profile show` returns presentation text rather than JSON; an exact structural
profile/tool diff is still unqualified. The discrepancy is resolved as an
ownership/mode mismatch, not by accepting a CLI count as runtime truth.

Codex, Claude, Grok, Junie and Air configuration all reference port 8811; Air
has no explicit bearer header. Four authenticated client definitions share the
gateway, with Air an additional configured endpoint whose authentication was
not tested. Claude/Grok/Junie contain literal bearer headers; Codex uses an
environment reference. The endpoint remains one shared HTTP service with no
per-client profile. Changing it would change multiple clients together.

Proposed minimal owner choice (R56): retain the installed service's explicit
`--servers` ownership, add a reviewed `--tools` allowlist and a profile-diff
validator before any restart/apply. The exact allowlist needs representative
workflow coverage and a stable profile comparison; neither is claimed here.
Dynamic discovery remains off and experimental code mode excluded. No gateway
restart, profile switch, or secret move occurred.

## Existing writers and pending implementation

`beep models` currently has check/catalog/init, with no apply/restore command.
Its 11 locator kinds cover TOML, JSON, YAML, shell/env, XML, source literals,
line values and generated Markdown. Reuse the existing manifest schemas,
locator reader, value renderer, and manifest store; do not introduce a general
configuration manager. A production writer still needs schema → Context.Service
→ span implementations, all-match shell validation, native-key equality,
exclusive backups, drift fences, atomic rename, a durable journal and restore.
No safe production writer or rollback proof was completed in this blocked run.

`beep skills update` owns repo skill discovery/projection. Its current block
replacement can discard unknown `[skills]` keys; writes lack backups and atomic
replacement. It was not run in write mode: remote skill updates can also touch
`.claude` payloads, which require the S2 operator-run script route. Current repo
Codex projection already has 37 rows, so the October 9 missing-row claim needs
fresh owner-command qualification rather than a hand-edited regeneration.

`ai-sync` is the existing schema validation/projection owner. Cursor id,
additional native validators, ACP model drift and the unowned claudem route
remain implementation/disposition work; no speculative replacement was built.

## Decisions and ledger boundary

`RSC-F-BOUNDARY-20261014` in SPEC records the bounded evidence decision and its
reversal. No harness surface was edited, so no execution proposal/disposition
was invented merely to represent read-only inventory. Interview decision-id
mapping and existing ledger chain closeout remain pending through the supported
HarnessLedger writer. Earlier rejected rows remain untouched. The program
acceptance, surviving-capability outcomes, after metrics and final panel remain
open; none is implied by the current zero-drift offline manifest check.

## Wave-2 source checkpoint

The 19:55Z F ruling resolves the routing-source conflict above in favor of
the October 14 manifest. Those conflict observations remain historical.
The current offline check reports zero findings; the new ModelsApply service
and restore CLI have source and synthetic proof, with no home apply.
The implementation keeps missing primary keys/markers fail-closed and edits
all shell matches. The live Claude script preview reports no change for
Fable 5.1 and medium effort. Full inventory dispositions, native activation
workflows, telemetry windows, and panel acceptance remain open.
