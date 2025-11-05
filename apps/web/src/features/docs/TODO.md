# Form System Roadmap (MVP hardening)
Last updated: 2025-08-17

## Findings
- The engine supports validation-gated NEXT, BACK with history, conditional branching via JsonLogic, and async branching via promise actors with external context merging.
- Demo ([apps/web/src/app/form-demo/page.tsx](cci:7://file:///home/elpresidank/YeeBois/projects/beep-effect/apps/web/src/app/form-demo/page.tsx:0:0-0:0)) exercises product step with async actor and conditional transitions in [examples/inventory-adjustment.workflow.json](cci:7://file:///home/elpresidank/YeeBois/projects/beep-effect/apps/web/src/features/form-system/examples/inventory-adjustment.workflow.json:0:0-0:0).

## Prioritized roadmap
1) Engine durability: RESET + snapshot/restore; store answers in machine context. [in progress]
2) Async actors lifecycle/UI: per-actor loading/error status, optional autorun on step enter.
3) JsonLogic safety: allow-list operators + rule schema validation at load time.
4) Tests: navigation gating, BACK history, branching (including external), RUN success/failure.
5) Renderer UX: progress indicator, inline error mapping, Reset/Restart button in demo.
6) Ajv centralization + per-step validator cache.
7) Semantic validation: improve “default/exhaustiveness” detection to avoid false warnings.
8) Persistence adapters: localStorage for demo + server adapter interface.
9) DSL skeleton: typed helpers for conditions, compile to canonical JSON.
10) Observability hooks: STEP_ENTER/STEP_SUBMIT/BRANCH_TAKEN/WORKFLOW_COMPLETE.

## Item 1 — Engine durability (spec)
- Features
  - RESET event returns to `initial` and clears [history](cci:1://file:///home/elpresidank/YeeBois/projects/beep-effect/apps/web/src/features/form-system/runtime/xstateAdapter.ts:23:8-24:38), [external](cci:1://file:///home/elpresidank/YeeBois/projects/beep-effect/apps/web/src/features/form-system/runtime/xstateAdapter.ts:79:8-84:9), and [answers](cci:1://file:///home/elpresidank/YeeBois/projects/beep-effect/apps/web/src/features/form-system/runtime/xstateAdapter.ts:144:14-151:15).
  - Optional snapshot hydrate on machine creation, plus LOAD_SNAPSHOT event to restore at runtime.
  - Store [answers](cci:1://file:///home/elpresidank/YeeBois/projects/beep-effect/apps/web/src/features/form-system/runtime/xstateAdapter.ts:144:14-151:15) in machine context; persist current step’s answers on NEXT.
- API changes
  - Events: `RESET`, `LOAD_SNAPSHOT { snapshot }`.
  - [buildMachine(def, evaluate, actors?, options?: { snapshot? } | undefined)](cci:1://file:///home/elpresidank/YeeBois/projects/beep-effect/apps/web/src/features/form-system/runtime/xstateAdapter.ts:47:0-194:1).
  - Machine context shape: `{ history: string[]; external: Record<string, unknown>; answers: Record<string, unknown> }`.
  - Snapshot shape: `{ value: string; context: { history, external, answers } }`.
- Acceptance criteria
  - RESET always lands on `initial`, clears context data.
  - Snapshot round-trips (serialize → reload → LOAD_SNAPSHOT) without errors.
  - Guards evaluate with merged answers: `{...machine.answers, ...event.answers}`.
- Implementation notes
  - Engine: [apps/web/src/features/form-system/runtime/xstateAdapter.ts](cci:7://file:///home/elpresidank/YeeBois/projects/beep-effect/apps/web/src/features/form-system/runtime/xstateAdapter.ts:0:0-0:0).
  - Demo: [apps/web/src/app/form-demo/page.tsx](cci:7://file:///home/elpresidank/YeeBois/projects/beep-effect/apps/web/src/app/form-demo/page.tsx:0:0-0:0) adds Reset/Save/Load buttons and localStorage persistence.
- Follow-ups
  - Tests: snapshot round-trip, RESET clears state, NEXT persists answers correctly.
  - Demo: consider showing machine [answers](cci:1://file:///home/elpresidank/YeeBois/projects/beep-effect/apps/web/src/features/form-system/runtime/xstateAdapter.ts:144:14-151:15) in debug panel to verify persistence.

## Quick links
- Engine: `apps/web
