# Dry-Run Feedback Report

## Metadata
- Agent ID: Codex (GPT-5)
- Iteration: 5
- Export file: `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/tail.function.ts`
- Export kind: `function`
- Prompt bundle:
  - `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/prompts/shared/base-system.md`
  - `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/prompts/kinds/function-like.md`
  - `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/prompts/shared/dry-run-overlay.md`
- Config bundle:
  - `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/configs/dry-run.worker.jsonc`

## What Worked
- Discovery example is appropriate: it inspects runtime metadata and confirms callable export shape before invocation.
- Source summary and embedded JSDoc example are clear and include both primary and boundary outcomes.
- Runtime contract is easy to verify:
  - `Array.tail.length === 1`
  - `Array.tail([1, 2, 3, 4])` returns `[2, 3, 4]`
  - `Array.tail([])` returns `undefined`

## What Didn't
- Primary invocation example currently uses zero-arg probing (`probeNamedExportFunction`), which violates the required-arity rule for this function.
- Zero-arg invocation produces a `TypeError` (`Array.from requires an array-like object - not null or undefined`), so the only invocation-oriented runtime signal is failure.
- The current invocation example does not execute the source-aligned documented calls, so non-empty vs empty behavior is not demonstrated in runtime output.

## Hard Blockers
- none

## Probe Strategy Declaration
- Callable probe strategy: documented invocation (reject zero-arg as primary for this export).
- Rationale: `tail` has required arity (`length === 1`) and explicit source examples; dry-run config disallows zero-arg primary probes when required arity exists.

## Semantic Risks
- Logging a tolerated invocation failure as the main invocation example can mislead readers into thinking `tail` is unstable or broken.
- Omitting boundary-case execution (`[]`) loses the key semantic contract (`undefined` for empty array).
- Relying on reflective probing instead of domain-semantic examples weakens pedagogical value for an otherwise simple API.

## Behavior Alignment Check
- Summary/JSDoc intent: return all elements except the first; return `undefined` for empty input.
- Example behavior alignment: discovery aligns; invocation example does not align because it uses invalid zero-arg input rather than documented array inputs.
- Gaps: missing runtime demonstration of both source outcomes (non-empty and empty).

## Source Example Coverage
- Source example exists: yes
- Source-aligned behavior executed in examples: no
- If not, why: current template-generated invocation path defaults to generic zero-arg probe and was not specialized for required-arity function with documented input.

## Proposed Changes
### Documentation
- Add explicit function-export guidance: when source examples include concrete args and `fn.length > 0`, invocation block must call documented form first.
- Add boundary-case rule to docs: when summary/JSDoc describes a second outcome (for example empty input), include it in runtime example.

### Prompt
- Strengthen `function-like` prompt text to require an immediate rejection note for zero-arg primary probes when required arity is detected.
- Add checklist item: “Did you run at least one source example line verbatim (or equivalent inputs)?”

### Agent Config
- Keep `disallow_zero_arg_probe_when_required_arity_detected`, and add/enable a stricter guard that fails dry-run when invocation examples omit source-documented happy path.
- Add a targeted heuristic for array utilities: require at least one non-empty and one empty input when docs mention emptiness semantics.

## Proposed Patch Sketch (Not Applied)
```diff
--- a/src/effect/Array/exports/tail.function.ts
+++ b/src/effect/Array/exports/tail.function.ts
@@
 import {
   createPlaygroundProgram,
   inspectNamedExport,
-  probeNamedExportFunction,
 } from "@beep/groking-effect-v4/runtime/Playground";
@@
 const exampleFunctionInvocation = Effect.gen(function* () {
-  yield* Console.log("Execute a safe zero-arg invocation probe.");
-  yield* probeNamedExportFunction({ moduleRecord, exportName });
+  yield* Console.log("Run documented invocation and boundary case.");
+  const nonEmpty = ArrayModule.tail([1, 2, 3, 4]);
+  const empty = ArrayModule.tail([]);
+  yield* Console.log(`Array.tail([1, 2, 3, 4]) => ${JSON.stringify(nonEmpty)}`);
+  yield* Console.log(`Array.tail([]) => ${String(empty)}`);
 });
@@
     {
-      title: "Zero-Arg Invocation Probe",
-      description: "Attempt invocation and report success/failure details.",
+      title: "Documented Invocation",
+      description: "Show non-empty and empty array behavior from source docs.",
       run: exampleFunctionInvocation,
     },
   ],
 });
```

## Estimated Real Run Effort
- Estimated duration: 15-25 minutes (edit + run + verify output)
- Confidence: high
- Primary risks:
  - Generator/template defaults may reintroduce zero-arg probes unless prompt/config guards remain strict.
  - Minor output-format drift if log phrasing is not standardized across exports.
