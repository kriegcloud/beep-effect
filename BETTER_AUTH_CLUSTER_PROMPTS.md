# Better Auth Cluster Prompts (Copy & Paste)

Use these prompts to launch Codex agents for each checklist cluster. Replace `<...>` placeholders, then paste the whole
block into a fresh session.

> **Tip**: Only one agent should edit `BETTER_AUTH_CLIENT_AND_METHODS_LIST.md` at a time.

---

## 1. Base & Verify Cluster

```text
You are GPT-5 Codex. Your cluster: base/verify (methods: auth.verify.email.sendVerificationEmail, auth.verify.email.verifyEmail, auth.getSession).
Tasks:
1. Read `packages/iam/sdk/AGENTS.md`, `BETTER_AUTH_CLIENT_METHOD_PROCESS.md`, and `BETTER_AUTH_CLIENT_AND_METHODS_LIST.md`.
2. Gather docs:
   - context7__resolve-library-id {"libraryName":"better-auth"}
   - context7__get-library-docs {"context7CompatibleLibraryID":"/better-auth/better-auth","topic":"concepts/email","tokens":800}
   - jetbrains__search_in_files_by_text {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"better-auth-api-spec.json","searchText":"\"/send-verification-email\"","maxUsageCount":3,"timeout":120000,"useRegex":false}
   - jetbrains__search_in_files_by_text {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"better-auth-api-spec.json","searchText":"\"/verify-email\"","maxUsageCount":3,"timeout":120000,"useRegex":false}
   - jetbrains__search_in_files_by_text {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"better-auth-api-spec.json","searchText":"\"/get-session\"","maxUsageCount":3,"timeout":120000,"useRegex":false}
   (The OpenAPI JSON is huge; these targeted searches return the needed snippet without custom scripts.)
3. For each method:
   a. Update contracts in `packages/iam/sdk/src/clients/<feature>/<feature>.contracts.ts` (schemas, namespace exports, Contract.make, ContractSet entry).
   b. Update implementations in `packages/iam/sdk/src/clients/<feature>/<feature>.implementations.ts` (Effect.fn handler, makeFailureContinuation, Redacted.value, session notifications, ContractSet.of).
4. Run `bun run build --filter=@beep/iam-sdk` and report the output.
5. Update checklist entries after successful build.
```

---

## 2. Admin Cluster

```text
You are GPT-5 Codex. Your cluster: admin (methods: all `auth.admin.*` entries in BETTER_AUTH_CLIENT_AND_METHODS_LIST.md).
Tasks:
1. Read `packages/iam/sdk/AGENTS.md`, `BETTER_AUTH_CLIENT_METHOD_PROCESS.md`, the admin section of `BETTER_AUTH_CLIENT_AND_METHODS_LIST.md`, and `ADMIN_CLIENT_WORKING_NOTES.md` so you pick up from the prior session.
2. Gather docs:
   - context7__resolve-library-id {"libraryName":"better-auth"}
   - context7__get-library-docs {"context7CompatibleLibraryID":"/better-auth/better-auth","topic":"plugins/admin","tokens":800}
   - jetbrains__search_in_files_by_text {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"better-auth-api-spec.json","searchText":"\"/admin\"","maxUsageCount":3,"timeout":120000,"useRegex":false}
   (This search returns focused OpenAPI snippets—no custom parsing scripts needed.)
3. Work in small batches (2–3 methods at a time) to conserve context:
   a. Update `packages/iam/sdk/src/clients/admin/admin.contracts.ts` for the batch (schemas, namespace exports, Contract.make, ContractSet entries).
   b. Update `packages/iam/sdk/src/clients/admin/admin.implementations.ts` for the same batch (Effect.fn, makeFailureContinuation, Redacted.value, session notifications, ContractSet.of).
   c. Remove any temporary `as any` casts by aligning schemas/handlers with Better Auth client types.
   d. Run `PATH="$HOME/.bun/bin:$PATH" bun run build --filter=@beep/iam-sdk` after each batch and record results.
4. Log progress, remaining issues, and build diagnostics in `ADMIN_CLIENT_WORKING_NOTES.md` after each batch.
5. Once the entire cluster builds cleanly, update checklist entries (coordinate edits before touching the file).
```

---

## 3. API Key & Anonymous Cluster

```text
You are GPT-5 Codex. Your cluster: api-key/anonymous (methods: auth.apiKey.*, auth.signIn.anonymous).
Tasks:
1. Read `packages/iam/sdk/AGENTS.md`, `BETTER_AUTH_CLIENT_METHOD_PROCESS.md`, and the relevant sections of `BETTER_AUTH_CLIENT_AND_METHODS_LIST.md`.
2. Gather docs:
   - context7__resolve-library-id {"libraryName":"better-auth"}
   - context7__get-library-docs {"context7CompatibleLibraryID":"/better-auth/better-auth","topic":"plugins/api-key","tokens":800}
   - context7__get-library-docs {"context7CompatibleLibraryID":"/better-auth/better-auth","topic":"plugins/anonymous","tokens":400}
   - jetbrains__search_in_files_by_text {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"better-auth-api-spec.json","searchText":"\"/api-key\"","maxUsageCount":3,"timeout":120000,"useRegex":false}
   - jetbrains__search_in_files_by_text {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"better-auth-api-spec.json","searchText":"\"/sign-in/anonymous\"","maxUsageCount":3,"timeout":120000,"useRegex":false}
   (These searches slice the spec down to the relevant method definitions.)
3. For each method:
   a. Update `packages/iam/sdk/src/clients/<feature>/<feature>.contracts.ts` (schemas, namespaces, Contract.make, ContractSet entry).
   b. Update `packages/iam/sdk/src/clients/<feature>/<feature>.implementations.ts` (Effect.fn handler, makeFailureContinuation, Redacted.value, session notifications, ContractSet.of).
4. Run `bun run build --filter=@beep/iam-sdk` and report the result.
5. Update checklist items after a successful build.
```

---

## 4. Device Authorization & OIDC Cluster

```text
You are GPT-5 Codex. Your cluster: device-authorization/oidc (methods: all `auth.device.*` + `auth.oauth2.*` entries).
Tasks:
1. Read `packages/iam/sdk/AGENTS.md`, `BETTER_AUTH_CLIENT_METHOD_PROCESS.md`, and the relevant sections in `BETTER_AUTH_CLIENT_AND_METHODS_LIST.md`.
2. Gather docs:
   - context7__resolve-library-id {"libraryName":"better-auth"}
   - context7__get-library-docs {"context7CompatibleLibraryID":"/better-auth/better-auth","topic":"plugins/device-authorization","tokens":800}
   - context7__get-library-docs {"context7CompatibleLibraryID":"/better-auth/better-auth","topic":"plugins/oidc-provider","tokens":800}
   - jetbrains__search_in_files_by_text {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"better-auth-api-spec.json","searchText":"\"/device\"","maxUsageCount":3,"timeout":120000,"useRegex":false}
   - jetbrains__search_in_files_by_text {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"better-auth-api-spec.json","searchText":"\"/oauth2\"","maxUsageCount":3,"timeout":120000,"useRegex":false}
   (Limit `maxUsageCount` to keep responses focused; no need for external scripts.)
3. For each method:
   a. Update `packages/iam/sdk/src/clients/<feature>/<feature>.contracts.ts` (schemas, namespace exports, Contract.make, ContractSet entry).
   b. Update `packages/iam/sdk/src/clients/<feature>/<feature>.implementations.ts` (Effect.fn handler, makeFailureContinuation, Redacted.value, session notifications, ContractSet.of).
4. Run `bun run build --filter=@beep/iam-sdk` and report the result.
5. Update checklist items after successful verification.
```

---

## 5. JWT & Multi-Session Cluster

```text
You are GPT-5 Codex. Your cluster: jwt/multi-session (methods: auth.jwt.*, auth.multiSession.*).
Tasks:
1. Read `packages/iam/sdk/AGENTS.md`, `BETTER_AUTH_CLIENT_METHOD_PROCESS.md`, and the relevant sections in `BETTER_AUTH_CLIENT_AND_METHODS_LIST.md`.
2. Gather docs:
   - context7__resolve-library-id {"libraryName":"better-auth"}
   - context7__get-library-docs {"context7CompatibleLibraryID":"/better-auth/better-auth","topic":"plugins/jwt","tokens":600}
   - context7__get-library-docs {"context7CompatibleLibraryID":"/better-auth/better-auth","topic":"plugins/multi-session","tokens":600}
   - jetbrains__search_in_files_by_text {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"better-auth-api-spec.json","searchText":"\"/jwt\"","maxUsageCount":3,"timeout":120000,"useRegex":false}
   - jetbrains__search_in_files_by_text {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"better-auth-api-spec.json","searchText":"\"/multi-session\"","maxUsageCount":3,"timeout":120000,"useRegex":false}
   (Small `maxUsageCount` values return the relevant snippets quickly.)
3. For each method:
   a. Update `packages/iam/sdk/src/clients/<feature>/<feature>.contracts.ts` (schemas, namespaces, Contract.make, ContractSet entry).
   b. Update `packages/iam/sdk/src/clients/<feature>/<feature>.implementations.ts` (Effect.fn handler, makeFailureContinuation, Redacted.value, session notifications, ContractSet.of).
4. Run `bun run build --filter=@beep/iam-sdk` and report the outcome.
5. Update checklist items post verification.
```

---

## 6. Daily Update Template

```text
- Cluster: <cluster name>
- Methods completed: <list>
- Builds/tests run: <command + result>
- Outstanding todos/blockers: <notes>
```
