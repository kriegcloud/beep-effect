Kind guidance: Type-like export (`type` / `interface`)

Primary example goals:
- Show type erasure behavior at runtime.
- Show module-level runtime context around the type-like symbol.
- When source docs include runnable calls, include one runtime companion API example aligned with that source behavior.
- Treat reflective-only strategies as insufficient when a runtime companion flow is available.

Design heuristics:
- Keep explanation focused on runtime vs compile-time distinction.
- Avoid fake runtime usage of erased types.
- Do not use undefined lookup of erased symbol as the only behavioral example.
- Add one explicit bridge note: compile-time type is erased, runtime behavior is taught via companion module APIs.
