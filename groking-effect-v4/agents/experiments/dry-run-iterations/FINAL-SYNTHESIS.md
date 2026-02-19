# Final Synthesis (Additional Dry Runs)

Rounds covered:
- Iteration 4
- Iteration 5
- Iteration 6

Scope:
- core `effect` exports across `const`, `function`, `class`, `interface` kinds.

## What improved across these rounds
- Stronger enforcement of source-aligned invocation strategy.
- Better distinction between hard blockers and semantic quality risks.
- Explicit source example coverage reporting.
- Better handling of type-like exports to avoid reflective-only examples.
- Better key-marker class guidance (semantic round-trip + safe lookup + fixture disclaimer).
- Better variadic callable guidance (contract boundary notes, avoid naive `function.length` heuristics).

## Net result
Prompt + config bundles are significantly more implementation-ready and should reduce low-signal or semantically misleading generated examples in future worker runs.
