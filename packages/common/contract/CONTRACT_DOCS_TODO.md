# `@beep/contract` Documentation To‑Dos

The internal refactor split the contract runtime across `packages/common/contract/src/internal/**`, but most files still lack consistent docstrings and still reference IAM-specific scenarios. Use the checklist below to track required documentation passes. Each item is annotated with the inspection tool call used to evaluate the file so future Codex sessions can reproduce the context quickly.

## Global Guidelines

- [ ] Add a module-level docstring to **every** file in `packages/common/contract/src` and `src/internal/**` describing its purpose, exported types, and when to import it.
- [ ] Ensure every exported type, class, schema, constant, function, and public property has a JSDoc block explaining usage, parameters, return types, and examples that are *general-purpose* (no IAM/passkey-specific copy).
- [ ] When referencing Effect concepts, prefer links/examples drawn from `effect` or `@beep/contract` itself rather than IAM slices.
- [ ] Include parameter-level doc comments (e.g., `@param`, `@returns`) for helper APIs with complex options objects (continuations, lift hooks, etc.).

## File-Specific Tasks

### `src/index.ts`
- [ ] Rewrite the top-level module docs so they describe `@beep/contract` broadly (currently centered on IAM errors/tools). Include a short usage snippet showing contract definition + kit lifting.  
  _Reference: `functions.shell({"command":["bash","-lc","sed -n '1,200p' packages/common/contract/src/index.ts"],"workdir":"/home/elpresidank/YeeBois/projects/beep-effect2"})`_

### `src/Contract.ts`, `src/ContractKit.ts`, `src/ContractError.ts`
- [ ] Add concise docstrings stating that these files re-export the internal modules; mention where to find the canonical documentation (internal submodules).  
  _Reference: `functions.shell({"command":["bash","-lc","sed -n '1,20p' packages/common/contract/src/Contract.ts"],"workdir":"/home/elpresidank/YeeBois/projects/beep-effect2"})` and similar calls for the other two re-export files._

### `src/internal/index.ts`
- [ ] Document that this file aggregates the internal surface; clarify intended consumption (internal only).  
  _Reference: `functions.shell({"command":["bash","-lc","sed -n '1,40p' packages/common/contract/src/internal/index.ts"],"workdir":"/home/elpresidank/YeeBois/projects/beep-effect2"})`_

### `src/internal/utils.ts`
- [ ] Add module overview plus docstrings for `constEmptyStruct` and `toSchemaAnyNoContext`, including why the latter forces `never` contexts.  
  _Reference: `functions.shell({"command":["bash","-lc","sed -n '1,120p' packages/common/contract/src/internal/utils.ts"],"workdir":"/home/elpresidank/YeeBois/projects/beep-effect2"})`_

### `src/internal/contract/index.ts`
- [ ] Provide a module doc explaining the namespace export and how consumers should import `Contract`.  
  _Reference: `functions.shell({"command":["bash","-lc","sed -n '1,40p' packages/common/contract/src/internal/contract/index.ts"],"workdir":"/home/elpresidank/YeeBois/projects/beep-effect2"})`_

### `src/internal/contract/constants.ts`
- [ ] Append a file header and expand the `TypeId`/`ProviderDefinedTypeId` docs with guidance on when to read them (e.g., advanced tagging, diagnostics).  
  _Reference: `functions.shell({"command":["bash","-lc","sed -n '1,80p' packages/common/contract/src/internal/contract/constants.ts"],"workdir":"/home/elpresidank/YeeBois/projects/beep-effect2"})`_

### `src/internal/contract/annotations.ts`
- [ ] Add a module overview describing annotation tags + usage patterns.
- [ ] Fix duplicated “Annotation for providing a human-readable title” text; give each tag unique semantics (Title vs Domain vs Method vs SupportsAbort).
- [ ] Replace Effect AI / tool-specific examples with general contract examples.  
  _Reference: `functions.shell({"command":["bash","-lc","sed -n '1,200p' packages/common/contract/src/internal/contract/annotations.ts"],"workdir":"/home/elpresidank/YeeBois/projects/beep-effect2"})`_

### `src/internal/contract/types.ts`
- [ ] Replace IAM/auth-centric prose with domain-agnostic language across the huge `Contract` interface docs.
- [ ] Document every property/method (some have comments, but many Option/Either helpers lack parameter docs and example usage).
- [ ] Ensure extracted utility types (e.g., `ImplementationContext`, `HandleOutcome`, `LiftedService`) each have docstrings describing type parameters and channel semantics.  
  _Reference: `functions.shell({"command":["bash","-lc","sed -n '1,200p' packages/common/contract/src/internal/contract/types.ts"],"workdir":"/home/elpresidank/YeeBois/projects/beep-effect2"})`_

### `src/internal/contract/contract.ts`
- [ ] Update the file-level description to emphasize general “Effect-based contract definitions” instead of “auth contracts.”
- [ ] Add doc comments for every prototype helper (`setPayload`, `setSuccess`, `continuation`, `decodeSuccessOption`, etc.) clarifying when to use them and expected error modes.
- [ ] Document the `implement` helper (namespace + prototype) including how `ImplementationOptions` influence continuations.
- [ ] For every schema helper, include example snippets showing composition with `Effect.gen`.
  _Reference: `functions.shell({"command":["bash","-lc","sed -n '1,220p' packages/common/contract/src/internal/contract/contract.ts"],"workdir":"/home/elpresidank/YeeBois/projects/beep-effect2"})`_

### `src/internal/contract/continuation.ts`
- [ ] Add module header summarizing metadata derivation + continuation helpers.
- [ ] Document `FailureContinuationHandlers`, `FailureContinuationOptions`, `FailureContinuation.RunOptions`, and `handleOutcome` parameters/return values.
- [ ] Explain `surfaceDefect` semantics in the `run` overload (when to expect `Either`).
- [ ] Provide general-purpose examples for `metadata()` and `failureContinuation()`.  
  _Reference: `functions.shell({"command":["bash","-lc","sed -n '1,200p' packages/common/contract/src/internal/contract/continuation.ts"],"workdir":"/home/elpresidank/YeeBois/projects/beep-effect2"})`_

### `src/internal/contract/lift.ts`
- [ ] Add module-level docs describing how `Contract.lift` composes implementations for service exposure.
- [ ] Write docstrings for `LiftOptions`, `LiftedContract`, and `lift`, including parameter semantics (`onFailure`, `onDefect`) plus examples showing integration with `ContractKit.liftService`.
  _Reference: `functions.shell({"command":["bash","-lc","sed -n '1,200p' packages/common/contract/src/internal/contract/lift.ts"],"workdir":"/home/elpresidank/YeeBois/projects/beep-effect2"})`_

### `src/internal/contract/schemas.ts`
- [ ] Document the file purpose (FailureMode & HandleOutcome helpers).
- [ ] Expand the `FailureModeKit` doc with scenarios illustrating `"error"` vs `"return"` behavior.
- [ ] Provide doc comments for `makeHandleOutcome`, `FailureMode.$match`, and `FailureMode.matchOutcome`, including clear guidance on encoded result expectations.
  _Reference: `functions.shell({"command":["bash","-lc","sed -n '1,200p' packages/common/contract/src/internal/contract/schemas.ts"],"workdir":"/home/elpresidank/YeeBois/projects/beep-effect2"})`_

### `src/internal/contract-kit/index.ts`
- [ ] Add docstring indicating that this namespace re-exports the concrete kit implementation.  
  _Reference: `functions.shell({"command":["bash","-lc","sed -n '1,40p' packages/common/contract/src/internal/contract-kit/index.ts"],"workdir":"/home/elpresidank/YeeBois/projects/beep-effect2"})`_

### `src/internal/contract-kit/contract-kit.ts`
- [ ] Rewrite the opening docstring to describe contract kits generally (remove “auth contracts” phrasing).
- [ ] Add doc comments for every exported type (e.g., `ContractKit`, `LiftServiceMode`, helper contexts) and method documenting type parameters & behavior.
- [ ] Provide fresh examples covering kit construction, `of`, `toLayer`, `liftService`, and `handle`.
  _Reference: `functions.shell({"command":["bash","-lc","sed -n '1,200p' packages/common/contract/src/internal/contract-kit/contract-kit.ts"],"workdir":"/home/elpresidank/YeeBois/projects/beep-effect2"})`_

### `src/internal/contract-error/index.ts`
- [ ] Add docstring clarifying that this module exports the contract error taxonomy.  
  _Reference: `functions.shell({"command":["bash","-lc","sed -n '1,40p' packages/common/contract/src/internal/contract-error/index.ts"],"workdir":"/home/elpresidank/YeeBois/projects/beep-effect2"})`_

### `src/internal/contract-error/contract-error.ts`
- [ ] Replace IAM/OpenAI-specific descriptions with neutral terminology (e.g., “service module,” “operation”).
- [ ] Add a module overview at the top summarizing the error hierarchy (request/response/malformed/unknown).
- [ ] Provide docstrings for all schemas, helper functions, and static constructors (`fromRequestError`, `fromResponseError`, etc.).
- [ ] Ensure `getStatusCodeSuggestion` is documented or made internal if unnecessary.
  _Reference: `functions.shell({"command":["bash","-lc","sed -n '1,200p' packages/common/contract/src/internal/contract-error/contract-error.ts"],"workdir":"/home/elpresidank/YeeBois/projects/beep-effect2"})`_

---

Use this checklist to coordinate documentation passes; each box can be claimed/checked by future sessions once the described docstrings are added and reviewed.
