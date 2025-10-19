# Better Auth client adapter process (GPT‑5 Codex reference)

This guide teaches a fresh `GPT-5 Codex` session how to author Effect-first wrappers for Better Auth execution
boundaries inside `@beep/iam-sdk`. Every step references the exact MCP tool calls and repo files required so the
session stays context-efficient and follows established patterns under `packages/iam/sdk`.

---

## 0. Required context (load once per session)

- Ensure Bun commands are available:
  ```bash
  bun --version || (echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.zshrc && echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.zshrc && exec $SHELL && bun --version)
  ```
- If Bun was just added to `PATH`, reopen your shell or prefix commands with `export PATH=$HOME/.bun/bin:$PATH;`.
- Inspect SDK guardrails → `jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/iam/sdk/AGENTS.md"}`
- Review Better Auth wiring →  
  `jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/iam/infra/src/adapters/better-auth/Auth.service.ts"}`  
  `jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/iam/infra/src/adapters/better-auth/plugins/plugins.ts"}`  
  `jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/iam/sdk/src/adapters/better-auth/client.ts"}`
- Confirm contract utilities →  
  `jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/iam/sdk/src/contract-kit/Contract.ts"}`  
  `jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/iam/sdk/src/contract-kit/ContractSet.ts"}`  
  `jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/iam/sdk/src/contract-kit/failure-continuation.ts"}`  
  `jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/iam/sdk/src/errors.ts"}`

Respect everything in `AGENTS.md` (namespace imports, no native array/string helpers, Effect-first patterns).

---

## 1. Collect Better Auth documentation for the target method

1. Resolve the Better Auth library once → `context7__resolve-library-id {"libraryName":"better-auth"}`
2. Pull focused docs for the method you are implementing (adjust `topic`) →  
   `context7__get-library-docs {"context7CompatibleLibraryID":"/better-auth/better-auth","topic":"client.<plugin-or-scope>","tokens":800}`
3. Cross-check the local OpenAPI export for payload/response contracts →  
   `jetbrains__search_in_files_by_text {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","searchText":"\"/auth.<method-path>\"","pathInProject":"better-auth-api-spec.json","maxUsageCount":20}`
4. When Effect APIs are unclear, search official docs → `effect_docs__effect_docs_search {"query":"makeFailureContinuation"}`

Document the Better Auth plugin + method identifier (example: plugin `signIn`, method `email`) for later metadata.

---

## 2. Author the contract schema (`*.contracts.ts`)

1. Locate the client folder → `jetbrains__find_files_by_name_keyword {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","nameKeyword":"<feature>.contracts.ts"}`
2. Define payload/success schemas with `BS.Class` or `S.Struct`; export `namespace` types (`Type`, `Encoded`).
3. Create the contract:
   - `Contract.make("<Name>", { parameters, success, failure: S.instanceOf(IamError), description })`
   - Set `success` to `S.Void` only when the Better Auth call returns no data.
4. Append the contract to the local `ContractSet.make(...)` call in the same file (create one if absent).
5. Ensure exports from the directory `index.ts` re-export the new schemas and contract.

Use `jetbrains__reformat_file` when the schema file needs formatting consistency.

---

## 3. Implement the handler (`*.implementations.ts`)

1. Open the sibling implementation file →  
   `jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/iam/sdk/src/clients/<feature>/<feature>.implementations.ts"}`
2. Create an Effect handler:
   ```ts
   const FooHandler = Effect.fn("FooHandler")(function* (payload: FooPayload.Type) {
     const continuation = makeFailureContinuation({
       contract: "Foo",
       metadata: () => ({ plugin: "<plugin>", method: "<method>" }),
     }, { supportsAbort: true /* when Better Auth accepts AbortSignal */ });

     const result = yield* continuation.run((handlers) =>
       client.<plugin>.<method>(
         {
           // spread payload, wrap secrets with Redacted.value
           fetchOptions: handlers.signal
             ? { signal: handlers.signal, onError: handlers.onError }
             : { onError: handlers.onError },
         }
       )
     );

     yield* continuation.raiseResult(result);

     if (result.error == null && mutatesSession) {
       client.$store.notify("$sessionSignal");
     }

     if (result.data == null) {
       return yield* new IamError(
         new Error("Missing Foo response"),
         "FooHandler returned no payload from Better Auth",
         { plugin: "<plugin>", method: "<method>" }
       );
     }

     return yield* S.decodeUnknown(FooSuccess)(result.data);
   });
   ```
   - Use `Redacted.value` for secrets/tokens.
   - Pass `handlers.signal` + `handlers.onError` via `fetchOptions` when the Better Auth API supports aborts.
   - Decode the success payload with `S.decodeUnknown` and surface `IamError` only.
3. Register the handler inside `ContractSet.of({ ... })`.

If the response is `S.Void`, omit the decode/return block. Wrap additional parsing failures with `Effect.catchTags`
to convert `ParseError` into defects as existing code does. For unexpected `null`/`undefined` payloads, prefer raising a
new `IamError` with the appropriate plugin/method metadata instead of `Effect.dieMessage`.

---

## 4. Wire exports and shared indexes

1. Ensure the domain `index.ts` re-exports the contracts + implementations:
   `jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/iam/sdk/src/clients/<feature>/index.ts"}`
2. Confirm `packages/iam/sdk/src/clients/index.ts` exposes the feature when needed.
3. Update any runtime or UI references listed in
   [`BETTER_AUTH_CLIENT_AND_METHODS_LIST.md`](BETTER_AUTH_CLIENT_AND_METHODS_LIST.md) if the contract name changes.

---

## 5. Verification and quality gates

- Type check the SDK workspace → `jetbrains__execute_terminal_command {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","command":"bun run build --filter=@beep/iam-sdk","reuseExistingTerminalWindow":true}`
- Run lint (Biome) when schemas or implementations change → `jetbrains__execute_terminal_command {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","command":"bun run lint --filter=@beep/iam-sdk","reuseExistingTerminalWindow":true}`
- If you touched runtime exports, suggest running `bun run build --filter=apps/web` to the user for downstream safety.
- Update the progress checklist in `BETTER_AUTH_CLIENT_AND_METHODS_LIST.md` after adding a contract or handler.

---

## 6. Reference implementation checklist

- [ ] Gather Better Auth docs (`context7__get-library-docs`) and OpenAPI snippet.
- [ ] Add payload/success schemas using `BS.Class` + namespaces.
- [ ] Create `Contract.make` with `failure: S.instanceOf(IamError)`.
- [ ] Register schemas in the feature `ContractSet`.
- [ ] Implement `Effect.fn` handler using `makeFailureContinuation`.
- [ ] Notify `$store` on session mutations and decode successful responses.
- [ ] Export via directory + root indexes.
- [ ] Pass type/lint checks and document completion in the method list.

Keep the implementation style consistent with shipped examples such as
`packages/iam/sdk/src/clients/sign-in/sign-in.implementations.ts` and
`packages/iam/sdk/src/clients/verify/verify.implementations.ts`.
