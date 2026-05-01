# Runtime Data Loop Fixtures

This directory contains the synthetic fixtures for P2 of the Agentic
Professional Runtime initiative.

Run validation from the repo root:

```sh
node initiatives/agentic-professional-runtime/fixtures/runtime-data-loop/validate-fixtures.mjs
```

Fixture scenarios:

- `law-patent-intake`
- `wealth-cash-request`

Each scenario has seed state, normalized email input, source body spans, and
expected snapshots for candidate claims, tasks, drafts, approval gates, and the
SDK context packet.
