# ContractKit Failure Continuation Prompt

## Objective
- Define an idiomatic, immutable strategy for propagating `betterAuthClient` callback errors through the `contractkit` execution path without resorting to mutable state.
- Document and name the injected helper that bridges callback-style `onError` hooks into the Effect error channel, and outline how the same pattern scales to other non-Effect libraries.
- Produce a concrete implementation plan for introducing this helper across the sign-in contract implementations.

## Key Concept
- **Failure Continuation**: Treat the injected helper as a failure continuation that converts out-of-band callback errors (e.g., `ctx.error`) into typed `Effect.fail` branches. This continuation should encapsulate error normalization (`IamError.match`, etc.) and surface a reusable interface that maintains referential transparency.

## Repository Research Checklist
_Check off each item as you complete it._
1. [ ] Inspect the ContractKit primitives to understand how contract implementations are provisioned and executed.
   - `mcp:jetbrains__list_directory_tree {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","directoryPath":"packages/iam/sdk/src/contractkit","maxDepth":2}`
   - `mcp:jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/iam/sdk/src/contractkit/Contract.ts"}`
   - `mcp:jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/iam/sdk/src/contractkit/ContractSet.ts"}`
2. [ ] Review IAM error modeling and normalization.
   - `mcp:jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/iam/sdk/src/errors.ts"}`
   - `mcp:jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/iam/sdk/src/contractkit/IamError.ts"}`
3. [ ] Examine the current Sign-In v2 implementations to catalogue mutable error extraction patterns.
   - `mcp:jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/iam/sdk/src/clients/sign-in-v2/sign-in.implementations.ts"}`
   - `mcp:jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/iam/sdk/src/clients/sign-in-v2/sign-in.contracts.ts"}`
   - Scan for additional handlers that rely on `fetchOptions.onError` across the SDK.
     - `mcp:jetbrains__search_in_files_by_text {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","searchText":"fetchOptions","maxUsageCount":40,"caseSensitive":false}`
     - `mcp:jetbrains__list_directory_tree {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","directoryPath":"packages/iam/sdk/src/clients/sign-in-v2","maxDepth":2}`
     - `mcp:jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/iam/sdk/src/clients/sign-in-v2/index.ts"}`
4. [ ] Inspect Better Auth adapter wiring to understand available surfaces for injecting the continuation.
   - `mcp:jetbrains__list_directory_tree {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","directoryPath":"packages/iam/sdk/src/adapters","maxDepth":2}`
   - `mcp:jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/iam/sdk/src/adapters/better-auth/client.ts"}`
   - If additional context is needed, request explicit approval before fetching external Better Auth docs due to restricted network access.

## Effect Documentation References
- Always use the `effect-docs` MCP tool when consulting Effect APIs to keep references precise and up to date.
- Gather supporting Effect documentation while analyzing each module. Focus on async bridging and generator helpers.
  - `mcp:effect_docs__effect_docs_search {"query":"Effect.tryPromise"}`
  - `mcp:effect_docs__get_effect_doc {"documentId":5876}`
  - `mcp:effect_docs__effect_docs_search {"query":"Effect.fn"}`
  - `mcp:effect_docs__get_effect_doc {"documentId":6120}`
  - Fetch any additional Effect module references encountered during review (e.g., `Effect.catchAll`, `Effect.tap`, `Effect.mapError`) using `effect_docs__effect_docs_search`.

## Better Auth Documentation References
- Use the `context7` MCP toolchain whenever Better Auth documentation is required.
  - `mcp:context7__resolve-library-id {"libraryName":"better-auth"}`
  - Follow with `mcp:context7__get-library-docs` using the resolved ID to access sections on `fetchOptions` and error hooks.

## Better Auth `fetchOptions` Notes
- Determine how `fetchOptions.onError` is surfaced by Better Auth and whether a shared adapter layer can supply the failure continuation automatically.
  - `mcp:jetbrains__search_in_files_by_text {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","searchText":"onError","directoryToSearch":"packages/iam/sdk/src/adapters","maxUsageCount":40,"caseSensitive":false}`
  - If proprietary documentation is required, outline the questions first, then pause for user approval to perform any network lookups.

## Design Tasks
_Mark tasks complete once their deliverables are satisfied._
1. [ ] **Define the Failure Continuation Interface**
   - Describe the helper signature (arguments, return type, effect type bounds).
   - Clarify how the continuation captures `ctx` metadata and normalizes to `IamError`.
   - Specify whether the continuation should be injected via `ContractSet.of`, dependency context, or a higher-order builder.
2. [ ] **Eliminate Mutable Error Buckets**
   - Rework the existing handlers conceptually using the continuation.
   - Ensure the resulting flow maintains the `Effect`-first style and leverages `Effect.flatMap` / `Effect.catchAll` instead of `let` reassignment.
3. [ ] **Generalize Beyond Better Auth**
   - Document how the same continuation can wrap other callback-based libraries (e.g., React Query `onError`, Stripe SDK hooks).
   - Highlight any shared adapter utilities that could live alongside ContractKit.
4. [ ] **Produce an Implementation Plan**
   - Use the planning tool to map the refactor rollout.
     - `mcp:update_plan {"plan":[{"status":"pending","step":"..."},...]}`
   - Include sequencing for introducing the continuation helper, updating handlers, and adding regression coverage (unit or integration tests).
   - Add the plan to the root of this repository in a file called `CONTRACT_FAILURE_CONTINUATION_PLAN.md` making sure that it is well annotated with useful and relevant mcp tool call references and commands such that another session of GPT-5 Codex can implement the plan in a context efficient and optimized manner.

## Expected Deliverables
- A written analysis summarizing current mutable patterns and the drawbacks they introduce.
- A named Failure Continuation API proposal with type definitions and usage examples inside ContractKit handlers.
- A generalized strategy section that explains how to reuse the helper for other libraries with `onError` callbacks.
- A step-by-step implementation plan (at minimum, ContractKit updates, handler refactors, verification tasks).
- Explicit notes on any open questions requiring user or product confirmation (e.g., Better Auth API guarantees).

## Additional Guidance
- Respect existing Effect style conventions: no native array or string methods; prefer the Effect collection utilities.
- Avoid introducing side-channel state; prefer dependency injection via contexts or higher-order constructors.
- Do not modify source code while drafting the prompt—focus on analysis, design articulation, and planning.
- Summarize findings and plans clearly in the final response, calling out risks and follow-up actions before implementation work begins.
- Treat the tool requirements above as mandatory: no Effect or Better Auth documentation should be referenced without using `effect-docs` or `context7` respectively.
