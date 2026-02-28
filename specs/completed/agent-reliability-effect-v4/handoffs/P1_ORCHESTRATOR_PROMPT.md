# Phase 1 Orchestrator Prompt

Refactor `tooling/agent-eval` in place with these hard constraints:

1. Use `effect/FileSystem` and `effect/Path` for fs/path operations under `src/**`.
2. Provide `NodeFileSystem.layer` + `NodePath.layer` only at CLI boundary.
3. Replace nested run loops with deterministic run matrix + `Effect.forEach`.
4. Preserve current schemas, add only required new schema files.
5. Remove tracked `tooling/agent-eval/dist/tsconfig.tsbuildinfo`.
6. Ensure `check`, `lint`, `test`, `docgen` pass for `tooling/agent-eval`.

Update outputs:

- `outputs/p1-harness-design.md`
- `outputs/p1-effect-v4-verification.md`

Read full context in `handoffs/HANDOFF_P1.md`.
