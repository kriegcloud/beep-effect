# Plan: Effect Code Review & Refactoring

## Phase 1: Analysis & Reporting [checkpoint: 11bc65a]
- [x] Task: Scan `packages/@core-v2/src` for Effect anti-patterns (e.g., deeply nested pipes, `runPromise` in business logic, lack of `Effect.gen`). 8cc17eb
- [x] Task: Compile a prioritized list of files or modules requiring refactoring. 8ce7b42
- [x] Task: Conductor - User Manual Verification 'Analysis & Reporting' (Protocol in workflow.md) 11bc65a

## Phase 2: Domain Layer Refactoring [checkpoint: 651d406]
- [x] Task: Refactor Domain schemas and models to strictly use `Effect.Schema` and branded types where applicable. f184bfd
- [x] Task: Ensure all Domain functions are pure and free of side effects (referential transparency). 3760d63
- [x] Task: Conductor - User Manual Verification 'Domain Layer Refactoring' (Protocol in workflow.md) 651d406

## Phase 3: Service Layer Refactoring [checkpoint: 5db9da5]
- [x] Task: Update Service definitions to use `Effect.Tag` and `Context` correctly. 591ce1e
- [x] Task: Refactor Service implementations to use `Effect.gen` for readability and error handling. a8edf69
- [x] Task: Ensure proper Layer construction and composition. 5db9da5
- [x] Task: Conductor - User Manual Verification 'Service Layer Refactoring' (Protocol in workflow.md) 5db9da5

## Phase 4: Workflow & Runtime Refactoring [checkpoint: a8edf69]
- [x] Task: Refactor high-level workflows to leverage structured concurrency (`Effect.all`, `Effect.forEach`) efficiently. a8edf69
- [x] Task: Verify resource management (scopes) in the Runtime layer. a8edf69
- [x] Task: Conductor - User Manual Verification 'Workflow & Runtime Refactoring' (Protocol in workflow.md) a8edf69
