# @beep/config-file

Composable Effect config file loading: resolver chains, JSON/JSONC/YAML/TOML codecs, merge strategies, migrations and a ConfigProvider bridge

## Surface

- See `src/index.ts` barrel — do not hand-maintain inventory tables here.

## Laws

- Root `AGENTS.md` and `standards/ARCHITECTURE.md` govern this package; record only genuinely package-specific deltas here.
- Before handing back a change, run `bun run beep quality package-verify @beep/config-file` from the repository root. Use `--quick` only for a justified lint+check subset; a failure arms the checkout's shared P0 inbox.
