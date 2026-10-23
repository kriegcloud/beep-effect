# Native telemetry namespace contract — 2026-10-23

Refs #1865. S44 makes the reversible contract decision under the autonomy
charter: future qualifying native Claude/Codex roots use explicit
`beep-claude-telemetry` / `beep-codex-telemetry` launchers. Each resolves the
existing hash-salt reference at launch and exports the same value as both
`BEEP_HOOK_PULSE_HASH_SALT` and `BEEP_AI_METRICS_HASH_SALT`, then execs the
installed native client. Resolved values never enter files or argv.

The exact human-run apply/rollback script is
[2026-10-23-telemetry-namespace-cutover.py](../../ops/2026-10-23-telemetry-namespace-cutover.py).
Run `python3 goals/repository-simplification-residue/ops/2026-10-23-telemetry-namespace-cutover.py --apply`
from the checkout after review. Its entire authorized home scope is two owned
launchers under `~/.local/bin/` and their recovery journal/backups under
`~/.local/state/beep/telemetry-namespace-s44/`. It does not edit Claude settings,
Codex configuration, profiles, existing launchers or historical observation rows.
It refuses symlinked owned paths/ancestry, backs up prior files before applying,
records the real UTC application timestamp, and preserves that timestamp on a
repeat apply. Use `--rollback` to restore prior owned files/remove newly created
ones; backup/projection drift refuses before any rollback writes.

Lane-local synthetic fixture verification passed: first apply, repeat apply
without rewriting the cutover, equal salt variables delivered to a fake native
client, refusal on drift before other paths changed, and exact prior-content
restoration/removal. Python compilation also passed. No real home file was
written and no actual secret was used by those fixtures.

The **live cutover and tested production join remain unmet**. After the
operator runs the script, launch future native roots through these wrappers
and witness a real hook/forwarder join with the installed H3 collector. The
journal's timestamp separates old regimes from the new one. Keep old rows in
their original regimes; never combine them into a zero-use measurement window.
The fixture validates projection mechanics only, not a production join.
Reversal is the script's drift-fenced `--rollback`; keep the recovery journal
and original evidence even after rollback.
