# Rubrics: Knowledge Stats Dashboard POC

Use this rubric in Phase 2 (Evaluation) and Phase 6 (Verification).

## A. Architecture Boundaries (0-5)

- 0: Cross-slice imports / boundary violations.
- 3: Mostly correct; a few questionable imports or layering shortcuts.
- 5: Strict domain -> tables -> server -> client -> ui; imports only via `@beep/*`.

## B. Type Safety & Schemas (0-5)

- 0: `any`, unchecked casts, unvalidated payloads across RPC boundary.
- 3: Some schemas exist; gaps remain (optional fields, unions, branded IDs).
- 5: All RPC inputs/outputs are schema-validated; no `any`.

## C. Data Correctness (0-5)

- 0: UI displays mocked values or client-side computed aggregates.
- 3: Real data for some metrics; others mocked or inconsistent.
- 5: All displayed aggregates come from server SQL and match DB truth.

## D. Graph Viewer Interaction (0-5)

- 0: Graph is static image or non-interactive.
- 3: Graph renders and basic zoom works.
- 5: Graph supports layout switching + direction + edge style + spacing + zoom/fit.

## E. Visual Parity (0-5)

- 0: Layout doesn’t resemble reference.
- 3: Core 3-region layout present; details differ.
- 5: Clear parity with reference: header/sidebar/main, metrics row, accordion + graph canvas.

## F. Tests & Verification (0-5)

- 0: No tests; gates not run.
- 3: Tests exist but miss key cases (empty DB, basic correctness).
- 5: Server aggregates tested; `bun run check/test/lint` all pass.

## Passing Thresholds

- POC pass: >= 20/30 with no “0” in A-C.
- Strong POC: >= 25/30.

