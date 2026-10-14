# F source checkpoint measurement

Status: partial source measurement, not final after-apply harness measurement.
The native observation at 20:04:25Z is recorded in
[checkpoint data](stage-3-f-source-checkpoint-state.json). Native set digest
`1f035829ecf40e425859b1421e285512841852dc765462baaa934e8f708d9b4d`
is observed and unfrozen. Other sessions may rewrite native configuration.
No home apply or final panel input follows from this digest.

| Repository duplicate | Before stored bytes | After stored bytes | Preservation evidence |
| --- | ---: | ---: | --- |
| Codex law-pulse | 2,429 | 232 | five-call law payload matches canonical |
| Codex hook-pulse-switch | 9,266 | 240 | disarm/status/arm/status passes on both routes |
| Grok graft skill | 9,101 | 38 (link target text) | link resolves to canonical 10,749-byte skill |

Confirmed duplicate payload owners decrease from three to zero. The files
remain callable. Stored text decreases by 20,286 bytes; this is neither
reclaimed filesystem capacity nor a measured default-context reduction.
The Grok loaded skill body is 10,749 bytes, so its on-demand body is larger
than the older copy. No reduction in advertised tools or token usage is
claimed. Byte/4, where used in earlier receipts, remains an estimate.

The live model check has zero drift. Claude's dry-run preview reports
change=false for both Fable 5.1 and medium effort. No native write was needed
for that preview, and the script remains operator-run for apply. The 142
scoped tests prove synthetic writer/rollback behavior, not native workflow
activation or a 30-session zero-use window. Fresh Cursor/Junie fixed prompts,
matched per-surface before/after medians, plan-window cost deltas, Docker
allowlist compatibility, and full final workflow acceptance remain pending.
No valid provider cost delta was collected. No actual dollar saving is stated.

## Qualified source coverage read

At candidate c353719e45, 142 tests across eleven files pass under the private
test namespace. No coverage baseline is rewritten. All recorded dimensions
exceed the existing floors for these four touched baseline files.

| File | Lines | Statements | Branches | Functions | Prior floors in the same order |
| --- | ---: | ---: | ---: | ---: | --- |
| Models.command.ts | 67.13 | 67.74 | 77.35 | 42.85 | 30 / 29.57 / 0 / 0 |
| Models.locator.service.ts | 93.26 | 93.75 | 78.57 | 92 | 92.04 / 92.55 / 72.72 / 90.47 |
| Models.service.ts | 91.15 | 90.16 | 91.52 | 81.63 | 90.42 / 89 / 89.47 / 78.37 |
| Skills.command.ts | 91.98 | 91.81 | 77.85 | 88.23 | 89.96 / 89.69 / 72.72 / 81.69 |

The earlier narrower read exposed a CLI coverage drop; direct command tests
now cover preview, optional targets, generated blocks, check/write/restore,
idempotence, mode conflicts, unmatched ids, unresolved bindings, and symlink
refusal. Synthetic parser privacy and invalid UTF-8 preservation also pass.
The accepted Fallow audit and health runs report zero findings. Preliminary
complexity reds were repaired without waivers or baseline relaxation.


## Authorized native apply and observed after state

The explicit scope grant resolves the earlier write boundary. The native Codex
legacy key was removed through ModelsApply, restored through its journal, and
removed again through `beep models codex-permissions --write`. Both native
round trips are byte-exact. Backup names are listed in the handoff and SPEC.
The staged temporary TOML is read and parsed before atomic replacement; model
pins remain unchanged. Return-of-key check passes, online model drift findings
are zero, and the pinned read-only Codex probe answers OK.

The [observed after data](stage-5-f-observed-after.json) repeats the same
historical-store collector. It is not a matched intervention study. The
[frozen configuration set](stage-5-f-config-fingerprint.json) covers native
files plus repository instructions, hooks, specialist bodies and skill lock.
Its set digest is `2658eaad0ab901432c01e3fb7821232918d9c33cb92f00617a5af302f074add8`.
A changed native file invalidates that set for panel acceptance.

| Surface | After n | Median first recorded input tokens |
| --- | ---: | ---: |
| claude claude-desktop | 20 | 115900.0 |
| claude cli | 20 | 81679.0 |
| claude sdk-cli | 20 | 78091.0 |
| claude sdk-ts | 2 | 79585.0 |
| codex Codex Desktop | 9 | 51129 |
| codex codex_exec | 20 | 38858.0 |
| codex codex-tui | 9 | 37330 |
| codex T3 Code | 2 | 35179.0 |

These samples can mix models, prompts and fingerprints. Surfaces below n=20
remain below n=20. Cursor has no admitted fixed-prompt observation; Junie's
ordinary fixed prompt fails with missing authorization. Historical data,
fixtures and a failed probe do not fill current-regime qualification windows.
No plan-window cost delta or valid tick conversion was collected, so no
actual-cost reduction is claimed. The live Docker gateway was not mutated.

Fresh scoped coverage passes 154 tests in eleven files. The four touched
existing baseline rows are all above their recorded floors. No baseline was
relaxed. SessionStart and PostToolUseFailure each emit a fixture pulse row;
this confirms script wiring only. Native failure rate remains **not recorded**.

| File | Lines | Statements | Branches | Functions |
| --- | ---: | ---: | ---: | ---: |
| Models.command.ts | 83.85 | 83.9 | 82.53 | 69.23 |
| Models.locator.service.ts | 93.85 | 93.54 | 78.12 | 92 |
| Models.service.ts | 91.15 | 90.16 | 91.52 | 81.63 |
| Skills.command.ts | 91.98 | 91.81 | 77.85 | 88.23 |

### Native fixed-prompt activation witnesses

The required read-only Codex probe passes on `gpt-6.1-sol`. Grok's installed
CLI passes the same OK-only intent on `grok-4.7-build` with explicit medium
effort and no tool invocation. Its one-turn usage reports 47,038 input tokens,
1,280 cache-read input tokens, 28 output tokens, and `costUsdTicks` 322,605,600.
This is one observation, not n=20, and no dollar conversion or saving is
claimed. Junie's ordinary probe fails missing authorization; its installed
release also rejects chat mode. No provider fallback or account purchase was
attempted. Cursor native activation is still unqualified for the recorded
state-isolation boundary.


The observed configuration set was captured at
`2026-10-14T22:47:02.763050Z` and has passed a fresh equality recheck. The
current-fingerprint window is open since that capture. Its qualifying session
count remains unknown; no retirement gate is met by elapsed wall-clock time.


The distinct Codex pulse body now delegates to the existing canonical writer,
matching H3's named adapter contract. Eight isolated spike events preserve
all compared core payload fields and omit a synthetic private input marker.
SessionStart now carries a harness stamp. Ordinary native trust/root-child
qualification remains open. This is the fourth removed repository duplicate
payload owner. The pre-adapter body is retained in the private lane backup.


The canonical writer conformance suite passes 71 tests. A new native Codex
probe returns OK and emits three callbacks into the isolated spike directory:
UserPromptSubmit, Stop, and SessionEnd. It emits no observed SessionStart row.
These are native callback witnesses, not 30-session qualification evidence;
root/child attribution and ordinary SessionStart qualification remain open.
The native legacy-key check and complete configuration-set equality were
rechecked after the probe.


Final main integration changed the repository instruction/skill inputs. Live
native clients also changed their own config fingerprints during verification.
The integrated set supersedes the earlier capture before any panel verdict.
Online model drift is still zero and the legacy-key check passes. No F model
pin write or additional home apply occurred. A new exact set, not a relaxed
comparison, is supplied for the final driver panel.


The final collector also includes the user Claude MCP registry and installed
plugin index, Claude Desktop MCP config, the actual Junie mcp/mcp.json path,
and discovered Kiro/Copilot/Gemini/OpenCode native config files when present.
These are hash-only reads; no file in those homes is changed by the collector.
They make the configuration boundary explicit rather than leaving MCP owners
outside the final set. Live native-client writes can invalidate this observed
set, and the driver must compare it before accepting a panel verdict.


Final expanded capture: `2026-10-14T22:54:37.633568Z`, set `2658eaad0ab901432c01e3fb7821232918d9c33cb92f00617a5af302f074add8`,
356 files. This supersedes the earlier narrower captures and starts the
recorded current-fingerprint qualification window. Native qualifying count is
unknown. The set includes canonical hook bodies, Cursor hook scripts, Grok
workflow definitions, Junie repo state and native agent/hook definitions.
A change in a delegated canonical hook therefore changes the reviewed set.


### Grok header and native tool-event controls

`research/f-grok-header-probe.py` creates only a lane-local fixture. The valid
environment header connects and discovers 47 tools; the invalid control fails.
Neither case echoes the header, and the native config bytes stay equal.
The shared Codex variable is absent in this checked environment, so global
header migration retains a provider prerequisite rather than breaking Grok.

A controlled native Codex `false` command produces one PreToolUse and one
PostToolUse row, plus UserPromptSubmit, Stop and SessionEnd. It returns OK as
instructed. No PostToolUseFailure or SessionStart row is observed in that
controlled run. These isolated spike observations contribute zero qualifying
sessions. Ordinary native failure rate remains not recorded.

The collector's `--check <receipt>` mode passes against a current capture and
rejects an altered receipt. It checks file content and link identity. The
final configuration gate is run again at publication; the driver repeats it
before accepting the panel's verdict.
