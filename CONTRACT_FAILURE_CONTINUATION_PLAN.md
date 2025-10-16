# Contract Failure Continuation Rollout Plan

This plan sequences the implementation work for the failure continuation helper that bridges Better Auth callbacks into the ContractKit error channel. Each step lists the key actions and the MCP tool commands to gather or edit context efficiently.

> See [Contract Failure Continuation Specification](./CONTRACT_FAILURE_CONTINUATION_SPEC.md) for the authoritative design.

## 1. Introduce `FailureContinuation` helper in ContractKit
- [ ] Inspect existing ContractKit exports to determine placement and re-export strategy.
  - [ ] `mcp:jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/iam/sdk/src/contractkit/index.ts"}`
- [ ] Implement `packages/iam/sdk/src/contractkit/failure-continuation.ts` according to the specification:
  - [ ] Declare `FailureContinuationContext`, `FailureContinuationOptions`, `FailureContinuationHandlers`, and `FailureContinuation` interfaces.
  - [ ] Provide `makeFailureContinuation` returning `{ run, raiseResult }` built with `Effect.asyncInterrupt`, a single-resolution guard, and optional abort support (`supportsAbort` default `false`).
  - [ ] Ensure normalization delegates to `IamError.match`, enriched via the `metadata` thunk supplied in the context.
  - [ ] `mcp:apply_patch` to add the module.
- [ ] Re-export the helper from `packages/iam/sdk/src/contractkit/index.ts` for downstream consumers.
  - [ ] `mcp:apply_patch` editing the barrel file.

## 2. Refactor Sign-In v2 implementations to use the helper
- [ ] Open `packages/iam/sdk/src/clients/sign-in-v2/sign-in.implementations.ts` and replace the mutable `let error` pattern with the helper.
  - [ ] `mcp:jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/iam/sdk/src/clients/sign-in-v2/sign-in.implementations.ts"}`
- [ ] For each handler (`SignInEmailHandler`, `SignInSocialHandler`, etc.):
  - [ ] Instantiate the failure continuation with a metadata thunk reflecting contract `plugin`/`method`, leaving `supportsAbort` as `false` unless Better Auth confirms signal support.
  - [ ] Wrap Better Auth calls with `yield* continuation.run((handlers) => client.*(payload, { fetchOptions: { onError: handlers.onError, ...(handlers.signal ? { signal: handlers.signal } : {}), ... } }))`.
  - [ ] Invoke `yield* continuation.raiseResult(result)` immediately after each call to lift `{ error }` payloads into the Effect failure channel.
  - [ ] Preserve existing success side-effects (`client.$store.notify("$sessionSignal")`) only once continuation confirms no failure.
  - [ ] Ensure all Effect array/string conventions are preserved (no native methods).
- [ ] Adjust imports to pull the helper from `@beep/iam-sdk/contractkit`.

## 3. Document and propagate the pattern
- [ ] Update ContractKit documentation or AGENTS guidance (if required) to explain the helper usage for other implementations.
  - [ ] `mcp:jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/iam/sdk/src/contractkit/AGENTS.md"}`
  - [ ] `mcp:apply_patch` to add a concise example based on the specification’s handler pattern.
- [ ] Identify other SDK surfaces that use `fetchOptions.onError` and queue follow-up refactors.
  - [ ] `mcp:jetbrains__search_in_files_by_text {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","searchText":"fetchOptions","maxUsageCount":200,"caseSensitive":false}`
  - [ ] Record candidate modules (sign-up, verify, sign-out) for subsequent adoption passes.

## 4. Verification and regression coverage
- [ ] Ensure TypeScript contracts compile and types align.
  - [ ] `mcp:jetbrains__execute_terminal_command {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","command":"bun run check"}`
- [ ] Run targeted tests (if available) for IAM SDK clients.
  - [ ] `mcp:jetbrains__execute_terminal_command {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","command":"bun run test --filter sign-in-v2"}`
- [ ] Add unit coverage for the helper per the specification (§6).
  - [ ] Create `packages/iam/sdk/src/contractkit/__tests__/failure-continuation.test.ts` verifying callback failure, promise rejection, success path, `raiseResult`, and optional abort behaviour.
- [ ] Coordinate with QA for manual sign-in regression if automated coverage is limited.

## 5. Follow-up tracking
- [ ] Document the current assumption (per the Context7 lookup in the specification) that `fetchOptions.signal` is unsupported; capture any upstream responses in project notes.
  - [ ] `mcp:context7__get-library-docs {"context7CompatibleLibraryID":"/better-auth/better-auth","topic":"fetchOptions signal AbortSignal","tokens":4000}`
- [ ] Track opportunities to move metadata provisioning into Contract annotations once the helper is adopted across sign-in v2.
- [ ] Schedule refactors for other ContractKit clients once the helper proves stable in sign-in v2.

> After completing each major change, update the `update_plan` tracker accordingly and summarize results in the PR description referencing this rollout plan.
