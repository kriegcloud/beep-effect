Kind guidance: Value-like export (`const` / `let` / `var` / `enum` / `namespace` / `reexport`)

Primary example goals:
- Show runtime shape inspection.
- Show one behavior probe (callable probe only when applicable).
- For callable values, show one documented/representative invocation when semantics are parameter-sensitive.

Design heuristics:
- Prefer direct log output over speculative assertions.
- If value is callable and semantics are parameter-sensitive, documented invocation is required.
- Use zero-arg probe only when `function.length === 0` or docs indicate optional args.
- Otherwise use a deterministic invocation derived from source JSDoc example intent.
- Include invocation constraints and expected failure modes.
- If value is data-only, demonstrate read/inspect workflows.
- If runtime-permissive behavior conflicts with summary/JSDoc contract, include an explicit contract note.
