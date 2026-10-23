# Harness-child Turbo cache posture census (2026-10-23)

Refs #1873. This covers the first criterion, the effective shared cache path and read-only posture inside a child of each harness. `stage-5-cache.md` recorded only the current process and scrubbed bash/zsh. Taken at origin/main `61dcdbad9d` from a fresh lane checkout on Linux x64.

## Method

The S44 orchestrator approved one short child per harness on its pinned AGENTS.md route. Each child ran under a host `timeout -k 10 300` with stdin from `/dev/null`. The prompt carried no repository or corpus content: it asked the child to run one probe script, kept in the lane's ignored `.beep/`, and return only its stdout.

The probe runs `node_modules/.bin/turbo config` and `turbo run '@beep/types#build' --dry=json` inside the child. It prints one JSON line with:

- the effective `cacheDir`, with the home directory written as `~`;
- `TURBO_CACHE`;
- `TURBO_CACHE_DIR`;
- set/unset booleans for `TURBO_TOKEN`, `TURBO_TEAM`, the API URL and the signature (never their values);
- the dry-run task's `cache.local`, `cache.remote`, `status` and `source`.

There are no retries on another model, and a harness that hit its quota is recorded as such.

| Harness (pinned route) | Exit | Effective `cacheDir` | `TURBO_CACHE` | Token / team present | Dry-run task cache |
| --- | --- | --- | --- | --- | --- |
| Claude Code `claude -p --model claude-opus-5-5` | 0 | `~/.cache/beep/turbo` | `local:rw,remote:r` | yes / yes | local HIT, `source: LOCAL`, `remote: false` |
| Codex `codex exec --model gpt-6.1-sol` (medium, `workspace-write`) | 0 | `~/.cache/beep/turbo` | unset | no / no | local HIT, `source: LOCAL`, `remote: false` |
| Cursor `cursor-agent -p --sandbox enabled --model claude-opus-5-5-medium` | 1 | **gap: not measured** (Opus usage limit, resets 2026-11-11) | — | — | — |
| Grok `grok -m grok-4.7 --effort medium` | 0 | `~/.cache/beep/turbo` | `local:rw,remote:r` | yes / yes | local HIT, `source: LOCAL`, `remote: false` |
| Junie `junie --model=claude-opus-5-5 --effort=medium` | 0 | `~/.cache/beep/turbo` | `local:rw,remote:r` | yes / yes | local HIT, `source: LOCAL`, `remote: false` |

The first Claude launch exited 1 on an invocation error (a variadic `--allowedTools` swallowed the prompt). The re-run with `--allowedTools=Bash` is the row above. Cursor refused with its Opus usage limit, which resets when its monthly cycle ends on 2026-11-11.

## Findings

- The census is incomplete: Cursor is a recorded gap, not a pass, until its re-run.
- Every measured child resolves the shared `~/.cache/beep/turbo` directory. None falls back to the per-checkout `.turbo/cache` that the scrubbed-bash route in `stage-5-cache.md` showed.
- Claude, Grok and Junie children inherit the read-only remote posture (`local:rw,remote:r`) together with the remote credentials.
- Codex's `workspace-write` sandbox strips `TURBO_CACHE`, `TURBO_TOKEN` and `TURBO_TEAM`. A Codex child therefore keeps the shared local cache but has no remote-read posture. That is safe, since it cannot write remotely, but its children miss remote hits.
- The dry-run task is a local hit everywhere, so this census proves the cache path and posture, not a cold remote read. Cold remote reads stay with #1872.

## Left open

- Cursor child posture: re-run the same probe after Cursor's usage cycle resets (2026-11-11), with no model substitution.
- Criterion 2: the operator grants the native environment/home write scope for the backed-up `environment.d` apply (`stage-5-cache-environment.sh`, dry run by default), including its drift-refusal test.
- Criterion 3: the owner rules on the two retained legacy per-checkout caches.
