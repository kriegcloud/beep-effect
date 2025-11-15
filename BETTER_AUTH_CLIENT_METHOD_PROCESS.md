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
- Inspect SDK guardrails → `jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect2","pathInProject":"packages/iam/sdk/AGENTS.md"}`
- Review Better Auth wiring → `jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect2","pathInProject":"packages/iam/sdk/src/adapters/better-auth/client.ts"}`
- Confirm contract utilities (lives in `packages/common/contract`) →  
  `jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect2","pathInProject":"packages/common/contract/src/internal/contract/contract.ts"}`  
  `jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect2","pathInProject":"packages/common/contract/src/internal/contract-kit/contract-kit.ts"}`  
  `jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect2","pathInProject":"packages/iam/sdk/src/errors.ts"}`

Respect everything in `AGENTS.md` (namespace imports, no native array/string helpers, Effect-first patterns).

---

## 1. Collect Better Auth documentation for the target method

1. Resolve the Better Auth library once → `context7__resolve-library-id {"libraryName":"better-auth"}`
2. Pull focused docs for the method you are implementing (adjust `topic`) →  
   `context7__get-library-docs {"context7CompatibleLibraryID":"/better-auth/better-auth","topic":"client.<plugin-or-scope>","tokens":800}`
3. Cross-check the local OpenAPI export for payload/response contracts →  
   `jetbrains__search_in_files_by_text {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect2","searchText":"\"/auth.<method-path>\"","fileMask":"better-auth-api-spec.json","maxUsageCount":5,"timeout":120000}`
   - Tip: keep `maxUsageCount` between 1–5 to stay context-efficient; adjust `searchText` (for example `"\"/sign-in/email\""`).
   - This returns just the relevant snippet from the large JSON file—no custom scripts required.
4. When Effect APIs are unclear, search official docs → `effect_docs__effect_docs_search {"query":"Effect.fn"}` (or whichever Effect helper you’re using)

Document the Better Auth plugin + method identifier (example: plugin `signIn`, method `email`) for later metadata.

---

## 2. Inspect the domain model before drafting schemas

1. Locate the authoritative domain model for the method →  
   `jetbrains__find_files_by_name_keyword {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect2","nameKeyword":"<Entity>","fileCountLimit":20}` (or use `jetbrains__search_in_files_by_text {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect2","searchText":"class <Entity>","directoryToSearch":"packages"}`)  
   Then open the concrete model with →  
   `jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect2","pathInProject":"packages/iam/domain/src/entities/<Entity>/<Entity>.model.ts"}` or  
   `jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect2","pathInProject":"packages/shared/domain/src/entities/<Entity>/<Entity>.model.ts"}`
2. Record which fields come from `Model.select`, `Model.insert`, and `Model.update`. When JSON data is modelled through `Model.JsonFromString` (see the ApiKey permissions example), note the wrapper type so the contract mirrors its encoding.
3. If the domain model is missing the fields required by the SDK, stop and log the gap in `BETTER_AUTH_CLIENT_AND_METHODS_LIST.md` plus the relevant cluster notes so the orchestrator can schedule model updates before contracts move forward.

Mirror the ApiKey slice (`packages/iam/sdk/src/clients/api-key/api-key.contracts.ts`, `packages/iam/domain/src/entities/ApiKey/ApiKey.model.ts`) to understand how selectors (`Model.select.pick`, `.fields`) flow into `S.Class`.

---

## 3. Author the contract schema (`*.contracts.ts`)

1. Locate the client folder → `jetbrains__find_files_by_name_keyword {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect2","nameKeyword":"<feature>.contracts.ts"}`
2. Derive payload/success schemas from the domain model selectors gathered in Step 2:
   - Use `Model.select.pick(...).fields`, `Model.insert.pick(...).fields`, or `Model.update.pick(...).fields` to avoid re-declaring properties.
   - Spread selector fields inside `S.Class` structures, adding only the extra literals Better Auth expects (for example, additional redacted secrets or duration wrappers).
   - Reuse JSON helpers such as `Model.JsonFromString` or `Model.Json` to stay in sync with the domain encoding.
   - Provide `namespace` types (`Type`, `Encoded`) for every schema.
3. Create the contract:
   - `Contract.make("<Name>", { parameters, success, failure: S.instanceOf(IamError), description })`
   - Set `success` to `S.Void` only when the Better Auth call returns no data.
4. Append the contract to the local `ContractKit.make(...)` call in the same file (create one if absent).
5. Ensure exports from the directory `index.ts` re-export the new schemas and contract.

Use `jetbrains__reformat_file` when the schema file needs formatting consistency.

---

## 4. Implement the handler (`*.implementations.ts`)

1. Open the sibling implementation file →  
   `jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect2","pathInProject":"packages/iam/sdk/src/clients/<feature>/<feature>.implementations.ts"}`
2. Import and reuse the shared helpers from `@beep/iam-sdk/clients/_internal`:
   - `withFetchOptions` / `addFetchOptions` — attach `handlers.onError` + `handlers.signal` to Better Auth calls (and merge extra headers when needed).
   - `requireData` — fail fast with a tagged `IamError` when Better Auth returns `null`/`undefined`.
   - `compact` — strip `undefined` entries from encoded query objects before passing them to adapters.
   Pair them with `Contract.encodePayload` / `Contract.decodeUnknownSuccess` so inputs/outputs always flow through the same schema used by the contract.
3. Create an Effect handler using those helpers:
   ```ts
   import { addFetchOptions, requireData, withFetchOptions } from "@beep/iam-sdk/clients/_internal";
   import * as Redacted from "effect/Redacted";

   const FooHandler = FooContract.implement(
     Effect.fn(function* (payload, { continuation }) {
       const encoded = yield* FooContract.encodePayload(payload);

       const result = yield* continuation.run((handlers) =>
         client.<plugin>.<method>(
           addFetchOptions(handlers, {
             ...encoded,
             secret: Redacted.value(encoded.secret),
           })
         )
       );

       yield* continuation.raiseResult(result);

       if (result.error == null && mutatesSession) {
         client.$store.notify("$sessionSignal");
       }

       const data = yield* requireData(result.data, "FooHandler", continuation.metadata);

       return yield* FooContract.decodeUnknownSuccess(data);
     }, Effect.catchTags({
       ParseError: (error) => Effect.fail(IamError.match(error, continuation.metadata)),
     }))
   );
   ```
   - Use `Redacted.value` for secrets/tokens.
   - Encode outbound payloads with `FooContract.encodePayload` before handing them to Better Auth.
   - Prefer `addFetchOptions` for body/JSON payloads and `withFetchOptions` when Better Auth accepts a `fetchOptions` argument separately.
   - Convert `ParseError` through `Effect.fail(IamError.match(error, continuation.metadata))` so failures remain typed.
4. Register the handler inside `ContractKit.of({ ... })`.

If the response is `S.Void`, omit the decode/return block. Wrap additional parsing failures with `Effect.catchTags`
to convert `ParseError` into tagged `IamError` failures instead of defects. For unexpected `null`/`undefined` payloads,
prefer raising a new `IamError` with the appropriate plugin/method metadata instead of `Effect.dieMessage`.

---

## 5. Wire exports and shared indexes

1. Ensure the domain `index.ts` re-exports the contracts + implementations:
   `jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect2","pathInProject":"packages/iam/sdk/src/clients/<feature>/index.ts"}`
2. Confirm `packages/iam/sdk/src/clients/index.ts` exposes the feature when needed.
3. Update any runtime or UI references listed in
   [`BETTER_AUTH_CLIENT_AND_METHODS_LIST.md`](BETTER_AUTH_CLIENT_AND_METHODS_LIST.md) if the contract name changes.

---

## 6. Verification and quality gates

- Type check the SDK workspace → `jetbrains__execute_terminal_command {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect2","command":"PATH=\"$HOME/.bun/bin:$PATH\" bun run build --filter=@beep/iam-sdk","reuseExistingTerminalWindow":true}`
- Run lint (Biome) when schemas or implementations change → `jetbrains__execute_terminal_command {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect2","command":"PATH=\"$HOME/.bun/bin:$PATH\" bun run lint --filter=@beep/iam-sdk","reuseExistingTerminalWindow":true}`
- If you touched runtime exports, suggest running `bun run build --filter=apps/web` to the user for downstream safety.
- Update the progress checklist in `BETTER_AUTH_CLIENT_AND_METHODS_LIST.md` after adding a contract or handler.

---

## 7. Reference implementation checklist

- [ ] Gather Better Auth docs (`context7__get-library-docs`) and OpenAPI snippet.
- [ ] Load the matching domain `Model` and confirm which selectors (`select/insert/update`) back the contract fields.
- [ ] Add payload/success schemas using `S.Class` + namespaces.
- [ ] Create `Contract.make` with `failure: S.instanceOf(IamError)`.
- [ ] Register schemas in the feature `ContractKit`.
- [ ] Implement `Effect.fn` handler via `ContractName.implement` and the provided `continuation`.
- [ ] Import helper utilities from `@beep/iam-sdk/clients/_internal` (`withFetchOptions`, `addFetchOptions`, `requireData`, `compact`) instead of reimplementing per-method plumbing.
- [ ] Encode outbound payloads and decode inbound data with the contract schemas (`S.encodeUnknown`, `S.decodeUnknown`).
- [ ] Convert `ParseError` into `Effect.fail(IamError.match(...))` instead of letting defects escape.
- [ ] Notify `$store` on session mutations and decode successful responses.
- [ ] Export via directory + root indexes.
- [ ] Pass type/lint checks and document completion in the method list.

Keep the implementation style consistent with shipped examples such as
`packages/iam/sdk/src/clients/sign-in/sign-in.implementations.ts` and
`packages/iam/sdk/src/clients/verify/verify.implementations.ts`.
