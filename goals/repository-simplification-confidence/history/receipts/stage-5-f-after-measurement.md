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
