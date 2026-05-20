# Claude Code And Codex Capability Matrix

Status: P1 implementation note.

P1 Manual Mode only proves that Claude and Codex local sessions are already
authenticated. It does not implement AI Mode, provider tool execution,
instruction bundle generation, MCP runtime execution, or manifest parity
between provider-driven flows.

Implemented P1 behavior:

- `@beep/ai-provider-cli` owns local provider CLI auth probes.
- Claude is probed with `claude auth status`.
- Codex is probed with `codex login status`.
- Exit code `0` maps to `authenticated`; non-zero maps to
  `not-authenticated`.
- `@beep/installer-use-cases` exposes `validateProviderAuths`.
- `@beep/installer-server` maps provider probes into manifest
  provider status values.

P1 capability boundary:

- Provider subscription/session status can be validated.
- Provider credentials are not read, exported, or stored.
- Provider CLIs are not asked to run installer actions.
- Manual Mode remains the only execution path.

Deferred to P2:

- Claude AI Mode run
- Codex AI Mode run
- shared approval model across providers
- app-local MCP executor adapter beyond the current Tauri proof command
- skill/instruction bundle generation
- byte-identical manifest parity modulo timestamps
