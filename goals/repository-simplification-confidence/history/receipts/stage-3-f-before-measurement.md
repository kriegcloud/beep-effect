# F before measurement — 2026-10-14

Status: **partial before evidence, before any F apply**. This is not stage-5
acceptance. Audited source: `529d77338d` on `chore/rsc-f-agents`, after the
required fetch and fast-forward merge. `bun install --frozen-lockfile` passed.
No home configuration, model manifest, plugin, skill, hook, or gateway was
changed by this lane.

The dispatch authorizes writes only within this lane. The brief's home applies
and client probes that persist home state therefore remain outside this run's
write boundary. The live manifest also differs from the brief's locked routes;
see [inventory](stage-3-f-inventory.md#routing-source-conflict).

## Snapshot and qualification

[Sanitized before state](stage-3-f-before-state.json) records per-file SHA-256,
byte size, top-level key names, native-state counts, skill-root inventory, and
aggregate measurements. Capture started at `2026-10-14T19:32:13Z`. No raw
transcript, credential value, account identity, project key, or hook-state key
is included. Native fingerprint-set SHA-256:

`dd9b8802a1c405f54793ffba05b10645abfc56792c1a877990c8835f2c268350`

The set digest is SHA-256 of newline-terminated `client sha256` rows sorted by
client. It covers the seven native files in the JSON, including Air as its own
Codex home. It is an observed before set, **not a frozen final configuration**.

The [read-only collector](../../research/f-before-measurement.py) runs as
`python3 goals/repository-simplification-confidence/research/f-before-measurement.py`
from the lane root. History sampling uses live local stores, newest file modification time first,
up to 20 observations per surface. Claude top-level project transcripts are
read separately from nested children. Codex includes repo-cwd sessions with a
string source, takes the first available token-count event, and stops at the
first task-complete event or 1,001 records. Embedded/forked metadata and archived
rollouts are excluded. Grok uses repo-associated session directories and their
saved tool definitions. This bounded extraction is not a complete population
census; missing values remain missing. A deferred-tools row is a names count,
not an eagerly advertised tool count. All historical samples may mix prompts,
models, versions, and configurations. None qualifies a 30-session current-
fingerprint zero-use window. No retirement follows from these samples.

## Fresh measured context

Token figures below are recorded input usage, including Claude input cache
creation/read tokens. They are not byte estimates. Compare only like surfaces;
there is no matched before/after intervention in this run.

| Surface | n | Median first recorded input tokens | Range | First deferred names, n / median |
| --- | ---: | ---: | --- | --- |
| Claude desktop | 20 | 117,421.5 | 47,193–127,839 | 20 / 497 |
| Claude CLI interactive | 20 | 81,150 | 50,229–401,738 | 20 / 173 |
| Claude headless SDK CLI | 20 | 78,091 | 5,841–324,645 | 19 / 299 |
| Claude SDK TS | 2 | 79,585 | 77,061–82,109 | 2 / 373.5 |
| Codex exec | 20 | 38,858 | 38,001–42,781 | not recorded |
| Codex desktop | 8 | 51,510.5 | 45,153–127,518 | not recorded |
| Codex TUI | 6 | 35,163 | 32,916–38,568 | not recorded |
| T3 Code | 2 | 35,179 | 35,022–35,336 | not recorded |
| Cursor | 0 | not recorded | fixed-prompt probe pending | not recorded |
| Junie | 0 | not recorded | fixed-prompt probe pending | not recorded |

Codex first-task time-to-first-token medians: exec 8,482 ms (n=10), desktop
8,486 ms (n=3), TUI 8,808 ms (n=3), T3 Code 11,257 ms (n=2). These are historical
response timings, not activation latency or measured active work. Base
instruction-byte medians: exec 21,779; desktop 21,603.5; TUI 20,388.5; T3 Code
21,779. Tool schemas and advertised counts are not recorded in these rollouts.

## Tools, instructions, estimates, and cost boundary

| Observed surface | n | Tools median | Tool-definition bytes median | Instruction bytes median |
| --- | ---: | ---: | ---: | ---: |
| Grok default (at least 20 tools) | 20 | 25.5 | 57,431 | 5,208 |
| Grok allowlist/specialist (fewer than 20) | 20 | 5 | 10,497 | 5,992 |
| Authenticated running Docker gateway | 1 | 47 | 128,947 | not measured |

Grok bytes are actual saved file sizes. Gateway bytes are UTF-8 compact JSON
for the complete returned tools array, including names, descriptions, and
schemas; no pagination cursor was returned. These are different measurement
surfaces. Byte/4 **estimates**, not tokenizer measurements: Grok default tool
file 14,357.75 tokens; allowlist tool file 2,624.25; gateway tools 32,236.75.
The allowlist sessions have different workloads; this is no causal reduction
or cost comparison. Grok median whole-session `costUsdTicks`: default
6,303,569,400; allowlist/specialist 19,450,747,200 (n=20 each). The tick-to-dollar
conversion is unverified. Whole-session model-call medians are 27.5 and 65.5;
duration medians 373.5 and 1,377.5 seconds include different workloads.

`beep accounts status --json` completed and was reduced in memory to provider,
outcome tag, and window kind/percentage. Provider account identifiers and
credit balances were not emitted. Snapshot: Claude weekly percentages
45/79/100/100; Codex 62/0/100 plus one NeedsLogin; Grok weekly 45; Grok snapshot
weekly 24; Cursor cycle 1; Muse session 5 / weekly 3; Junie cycle 77.0743265.
Snapshot rows can be stale; no plan-window delta or spend attributable to this
lane has been measured. No dollar-cost claim, purchase, endpoint change,
credential repair, or paid generation was attempted.

## Hook failure attribution

Live `.codex/hooks.json` registers seven events. Its SessionStart invokes packet
projections and the Yeet inbox, **not hook-pulse**. The hook-pulse `hook_events`
filter also omits SessionStart. Those two local wiring facts explain why this
configuration cannot emit SessionStart pulse rows through that path. They do
not establish a cause for every historical dropped event. PostToolUseFailure
is understood by the writer but is not registered. Codex failure rate remains
**not recorded**. Registration, installed-runtime compatibility, H3 coordination,
and a fresh emitted-event witness are pending; no failure count is assumed zero.

## Recovery precondition

All three stage-1 backup files exist. Full SHA-256 checks match the prefixes
recorded in [stage-1 ownership](stage-1-ownership.md#3-global-configuration--stage-1-copies-rulings-r55).
No new apply backup was created because no F apply occurred.

| Stage-1 backup name under `~/.config-backups/` | Verified SHA-256 |
| --- | --- |
| `rsc-stage1-20261009T155100Z--.codex__config.toml` | `d789089d816e8dc0956a8bb7dde5026cf37a53d16f3e836836ec5401bde43c2f` |
| `rsc-stage1-20261009T155100Z--.claude__settings.json` | `011db7693f1e788e0694562d63a940d5e891b20f1b05b6963c598bb04fbf74f5` |
| `rsc-stage1-20261009T155100Z--.config__beep__models.yaml` | `980c0402cd0b77bad763ba1f6236b5dd79947fcdae3283bed2561385fb773d03` |

The October 9 measured baseline remains historical input. It has not been
relabeled as current, nor combined into this sample to fill n<20 gaps.
