# P1 Harness Design

## Core Decisions

1. File/path operations in `tooling/agent-eval/src/**` use `effect/FileSystem` and `effect/Path` only.
2. Node implementations (`NodeFileSystem.layer`, `NodePath.layer`) are provided at CLI runtime boundary.
3. Benchmark execution uses deterministic run matrix generation + `Effect.forEach`, replacing nested loops.
4. Dry-run remains fast for local regression checks; live mode is explicit and isolated.
5. Native `Error` usage is removed from `tooling/*/src`; typed `S.TaggedErrorClass` errors are required.
6. A hard lint gate enforces no `new Error` / `throw new Error` in `tooling/*/src`.

## Runner Flow

1. Load tasks, policies, corrections, and pricing map.
2. Build deterministic run tuples (task x condition x agent x trial).
3. For each tuple:
   - resolve policy + skills
   - build correction packet (+ KG facts for `adaptive_kg`)
   - execute simulated or live run
   - run acceptance commands
   - evaluate wrong-API detector
   - emit result + transcript metadata
4. Persist suite and markdown report.

## Non-goals

1. No full enterprise orchestration system inside `agent-eval`.
2. No unlimited context retrieval.
