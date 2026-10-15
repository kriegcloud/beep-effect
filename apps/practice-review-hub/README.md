# @beep/practice-review-hub

Workstation review hub: one MCP endpoint over HTTP for review items, answers and verdicts.

## Development

```bash
bun run dev
bun run check
bun run test
bun run lint
```

This workspace is a runtime app, not a public TypeScript package. Keep app internals behind `@/*`; promote reusable contracts and domain code to slice or shared packages.

## License

MIT
