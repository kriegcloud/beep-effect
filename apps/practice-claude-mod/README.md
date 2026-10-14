# @beep/practice-claude-mod

Claude Code plugin (mod + firm skills) for the attorney sessions: plain-language practice-kg rows, verdict capture, matter band, visible timer.

## Development

```bash
bun run dev
bun run check
bun run test
bun run lint
```

This workspace is a runtime app, not a public TypeScript package. Keep app internals behind `@/*`; promote reusable contracts and domain code to slice or shared packages.

## Current phase

Matter selection and explicit timing are implemented alongside the answer verdicts.
Requires Claude Code 2.1.287 or newer; API shapes were checked against the bundled
engine declarations and terminal/desktop engine tests.

- `/matter <reference>` selects a uniquely resolved matter. Ambiguous matches list
  up to five docket keys to repeat with `/matter`. `/matter` shows the choice;
  `/matter clear` clears it.
- `/time start` starts the visible timer; `/time stop` saves one raw interval.
  `/time` shows its status. The interval keeps the matter selected when it started.
- `/practice export` writes `practice-verdicts.jsonl` and `practice-timer.jsonl`
  into the working folder. Logs stay in the plugin's local store until exported.

The band shows the chosen matter, elapsed whole minutes while timing runs, and
verdict controls after an answer. Selection and a running timer are module state
and reset on reload; saved rows remain in the store. There is no passive timing
or narrative generation. A failed timer write shows a toast and keeps the interval
available for retry.

The plugin's `servers` option names practice-kg servers (default `practice-kg`);
lookup uses its first entry. The local columnar decoder imports no law-practice
server modules. Hooks bundle: 299,481 bytes before this slice, 311,453 bytes after.

## License

MIT
