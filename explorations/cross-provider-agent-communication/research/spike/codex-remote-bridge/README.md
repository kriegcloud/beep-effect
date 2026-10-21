# Codex remote bridge scripts

Support files for [the 2026-10-21 bridge note](../../2026-10-21-codex-remote-control-bridge.md).

- `start-ws.ps1`: Windows wrapper that runs `codex app-server --listen ws://127.0.0.1:48123 --ws-auth capability-token --ws-token-sha256 <digest>` hidden and records pid and logs under `%USERPROFILE%\.codex\remote-ws\`. Copy it there, replace `<token-sha256-hex>`, and launch it through the one-shot interactive scheduled task shown in its header.
- `codex-remote-ask.ts`: one-shot client (Bun, no dependencies). Resumes or starts a thread with explicit `approvalPolicy` and `sandbox`, fails closed on a policy mismatch, starts a turn, waits for `turn/completed` and prints one JSON line with the reply.
- `codex-ws.ts`: generic JSON-RPC probe (`initialize`, then any requests from argv or `--requests-file`) for protocol exploration.

The bearer token is read from the environment variable named by `--token-env`; keep it in a 0600 file and never in argv.
