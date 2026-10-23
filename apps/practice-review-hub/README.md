# @beep/practice-review-hub

Workstation review hub: one MCP endpoint over HTTP for review items, answers and verdicts.

## Commands

- `serve --data-dir <dir> --allowed-logins <logins> [--port <port>]` serves the MCP endpoint on
  `127.0.0.1`.
- `notice --data-dir <dir> --time-zone <zone> [--claude-folder <folder>]` sends the daily notice;
  its mailbox settings come from the `PRACTICE_REVIEW_NOTICE_*` environment variables under
  `op run`. `--claude-folder` (or `PRACTICE_REVIEW_NOTICE_CLAUDE_FOLDER`) is an absolute Windows
  folder on the attorney's PC, such as `C:/Users/attorney/Review`; with it, the email adds an
  "Answer them in Claude Code" link that opens Claude Code there with the request typed in.

Install, `tailscale serve`, the notice timer, upgrades and removal:
[practice review hub](../../docs/runbooks/practice-review-hub.md). Sample user units are in
`deploy/`; nothing installs them.

## Development

```bash
bun run dev   # watches src/main.ts; prints the commands until given one
bun run check
bun run test
bun run lint
```

This workspace is a runtime app, not a public TypeScript package. Keep app internals behind `@/*`; promote reusable contracts and domain code to slice or shared packages.

## License

MIT
