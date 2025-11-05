# Better Auth Cluster Prompts (Copy & Paste)

Use these prompts to launch Codex agents for each checklist cluster. Replace `<...>` placeholders, then paste the whole
block into a fresh session.

> **Tip**: Only one agent should edit `BETTER_AUTH_CLIENT_AND_METHODS_LIST.md` at a time.
>
> **Helper rule**: Always import `MetadataFactory`, `withFetchOptions`, `addFetchOptions`, `requireData`, `decodeResult`,
> and `compact` from `@beep/iam-sdk/clients/_internal` when wiring handlers. Do not rebuild fetch plumbing or metadata per
> method—reuse the helpers to keep failure reporting and fetch options consistent.

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
   a. Update contracts in `packages/iam/sdk/src/clients/<feature>/<feature>.contracts.ts` (schemas, namespace exports, Contract.make, ContractKit entry).
   b. Update implementations in `packages/iam/sdk/src/clients/<feature>/<feature>.implementations.ts` (Effect.fn handler, makeFailureContinuation, helper utilities from `@beep/iam-sdk/clients/_internal`, Redacted.value, session notifications, ContractKit.of).
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
   a. Update `packages/iam/sdk/src/clients/admin/admin.contracts.ts` for the batch (schemas, namespace exports, Contract.make, ContractKit entries).
   b. Update `packages/iam/sdk/src/clients/admin/admin.implementations.ts` for the same batch (Effect.fn, makeFailureContinuation, helper utilities from `@beep/iam-sdk/clients/_internal` such as `MetadataFactory`, `withFetchOptions`, `requireData`, `decodeResult`, Redacted.value, session notifications, ContractKit.of).
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
   a. Update `packages/iam/sdk/src/clients/<feature>/<feature>.contracts.ts` (schemas, namespaces, Contract.make, ContractKit entry).
   b. Update `packages/iam/sdk/src/clients/<feature>/<feature>.implementations.ts` (Effect.fn handler, makeFailureContinuation, helper utilities from `@beep/iam-sdk/clients/_internal`, Redacted.value, session notifications, ContractKit.of).
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
   a. Update `packages/iam/sdk/src/clients/<feature>/<feature>.contracts.ts` (schemas, namespace exports, Contract.make, ContractKit entry).
   b. Update `packages/iam/sdk/src/clients/<feature>/<feature>.implementations.ts` (Effect.fn handler, makeFailureContinuation, helper utilities from `@beep/iam-sdk/clients/_internal`, Redacted.value, session notifications, ContractKit.of).
4. Run `bun run build --filter=@beep/iam-sdk` and report the result.
5. Update checklist items after successful verification.
```

---

## 5. JMulti-Session Cluster

```text
You are GPT-5 Codex. Your cluster: jwt/multi-session (methods: auth.multiSession.*).
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
   a. Update `packages/iam/sdk/src/clients/<feature>/<feature>.contracts.ts` (schemas, namespaces, Contract.make, ContractKit entry).
   b. Update `packages/iam/sdk/src/clients/<feature>/<feature>.implementations.ts` (Effect.fn handler, makeFailureContinuation, helper utilities from `@beep/iam-sdk/clients/_internal`, Redacted.value, session notifications, ContractKit.of).
4. Run `bun run build --filter=@beep/iam-sdk` and report the outcome.
5. Update checklist items post verification.
```

---

## 6. Organization Cluster

```text
You are GPT-5 Codex. Your cluster: organization-core (methods: auth.organization.create, .checkSlug, .list, .setActive, .getFullOrganization, .update, .delete, .inviteMember, .getInvitation, .cancelInvitation, .rejectInvitation, .listInvitations, .listUserInvitations, .listMembers, .removeMember, .updateMemberRole, .getActiveMember, .getActiveMemberRole, .addMember, .leave, .createRole, .deleteRole, .listRoles, .getRole, .updateRole, .acceptInvitation).
Tasks:
1. Read `packages/iam/sdk/AGENTS.md`, `BETTER_AUTH_CLIENT_METHOD_PROCESS.md`, `BETTER_AUTH_CLIENT_AND_METHODS_LIST.md` (organization section), and the latest admin/organization notes if any.
2. Gather docs:
   - context7__resolve-library-id {"libraryName":"better-auth"}
   - context7__get-library-docs {"context7CompatibleLibraryID":"/better-auth/better-auth","topic":"plugins/organization","tokens":1200}
   - jetbrains__search_in_files_by_text {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"better-auth-api-spec.json","searchText":"\"/organization/create\"","maxUsageCount":3,"timeout":120000,"useRegex":false}
   - jetbrains__search_in_files_by_text {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"better-auth-api-spec.json","searchText":"\"/organization/invite-member\"","maxUsageCount":3,"timeout":120000,"useRegex":false}
   - jetbrains__search_in_files_by_text {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"better-auth-api-spec.json","searchText":"\"/organization/list-members\"","maxUsageCount":3,"timeout":120000,"useRegex":false}
   - jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/shared/domain/src/entities/Organization/Organization.model.ts"}
   - jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/iam/domain/src/entities/Member/Member.model.ts"}
   - jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/iam/domain/src/entities/OrganizationRole/OrganizationRole.model.ts"}
   - Review the canonical ApiKey slice for Model.* usage:
     - jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/iam/sdk/src/clients/api-key/api-key.contracts.ts"}
     - jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/iam/sdk/src/clients/api-key/api-key.implementations.ts"}
   (These focused searches keep the OpenAPI context manageable—no custom scripts.)
3. For each method in this cluster:
   a. Derive contracts from the domain models in step 2 (use `Model.select/insert/update.pick(...).fields` spreads) and update `packages/iam/sdk/src/clients/organization/organization.contracts.ts` (schemas, namespaces, Contract.make, ContractKit entries). Do not hand-roll DTOs—extend the domain model first if a field is missing.
   b. Update `packages/iam/sdk/src/clients/organization/organization.implementations.ts` (Effect.fn handlers, makeFailureContinuation, helper utilities from `@beep/iam-sdk/clients/_internal`, Redacted.value, session notifications, ContractKit.of) and encode/decode with the same schemas. Convert every `ParseError` with `Effect.fail(IamError.match(...))`.
   c. Wire or adjust supporting UI/runtime hooks as noted in the checklist (ensure `$sessionSignal` is emitted when org context changes).
4. Run `bun run build --filter=@beep/iam-sdk` after completing a logical batch and report the result.
5. When the build is clean and behavior verified, update the corresponding entries in `BETTER_AUTH_CLIENT_AND_METHODS_LIST.md` (coordinate file edits if another cluster agent is active).
6. If you discover gaps in the domain models, stop and note them in the checklist + team cluster prompt so the orchestrator can schedule schema updates before proceeding.
```

---

## 7. Team Cluster

```text
You are GPT-5 Codex. Your cluster: organization-teams (methods: auth.organization.createTeam, .listTeams, .updateTeam, .removeTeam, .setActiveTeam, .listUserTeams, .listTeamMembers, .addTeamMember, .removeTeamMember).
Tasks:
1. Read `packages/iam/sdk/AGENTS.md`, `BETTER_AUTH_CLIENT_METHOD_PROCESS.md`, and the team subsection of `BETTER_AUTH_CLIENT_AND_METHODS_LIST.md`.
2. Gather docs:
   - context7__resolve-library-id {"libraryName":"better-auth"}
   - context7__get-library-docs {"context7CompatibleLibraryID":"/better-auth/better-auth","topic":"plugins/organization","tokens":800}
   - jetbrains__search_in_files_by_text {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"better-auth-api-spec.json","searchText":"\"/organization/create-team\"","maxUsageCount":3,"timeout":120000,"useRegex":false}
   - jetbrains__search_in_files_by_text {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"better-auth-api-spec.json","searchText":"\"/organization/list-team-members\"","maxUsageCount":3,"timeout":120000,"useRegex":false}
   - jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/iam/domain/src/entities/TeamMember/TeamMember.model.ts"}
   - jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/shared/domain/src/entities/Organization/Organization.model.ts"}
   - Review canonical ApiKey files for Model.* integration:
     - jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/iam/sdk/src/clients/api-key/api-key.contracts.ts"}
     - jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/iam/sdk/src/clients/api-key/api-key.implementations.ts"}
   (These commands surface the exact OpenAPI snippets without needing helper scripts.)
3. Scaffold the new client slice if it does not exist:
   - `packages/iam/sdk/src/clients/team/team.contracts.ts`
   - `packages/iam/sdk/src/clients/team/team.implementations.ts`
   - `packages/iam/sdk/src/clients/team/index.ts`
   Ensure the module exports follow existing Effect import conventions and are registered in `packages/iam/sdk/src/clients/index.ts`.
4. For each method:
   a. Implement contracts in `team.contracts.ts` by spreading the `Model.select/insert/update` fields gathered in step 2 (no manual DTO duplication). Add new properties to the domain model first if they do not exist.
   b. Implement handlers in `team.implementations.ts` (Effect.fn, makeFailureContinuation, helper utilities from `@beep/iam-sdk/clients/_internal`, runtime notifications) and encode/decode with the same schemas. Wrap every `ParseError` via `Effect.fail(IamError.match(...))`.
   c. Update or add UI/runtime hooks cited in the checklist (e.g. `packages/iam/ui/src/organization/teams/*`), emitting `$sessionSignal` when active team changes.
5. Run `bun run build --filter=@beep/iam-sdk` after a batch of updates and share the output. Add any new files to git if the CLI indicates they are untracked.
6. After verification, check off the relevant team items in `BETTER_AUTH_CLIENT_AND_METHODS_LIST.md` (coordinate edits if another agent is touching the file).
7. Escalate missing domain fields or schema misalignments in the checklist before proceeding to maintain parity with the backend models.
```

---

## 8. Passkey Cluster

```text
You are GPT-5 Codex. Your cluster: passkey (methods: auth.passkey.addPasskey, auth.passkey.listUserPasskeys, auth.passkey.deletePasskey, auth.passkey.updatePasskey).
Tasks:
1. Read `packages/iam/sdk/AGENTS.md`, `BETTER_AUTH_CLIENT_METHOD_PROCESS.md`, the passkey section of `BETTER_AUTH_CLIENT_AND_METHODS_LIST.md`, and any passkey-related notes in cluster files.
2. Gather docs:
   - context7__resolve-library-id {"libraryName":"better-auth"}
   - context7__get-library-docs {"context7CompatibleLibraryID":"/better-auth/better-auth","topic":"plugins/passkey","tokens":800}
   - jetbrains__search_in_files_by_text {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"better-auth-api-spec.json","searchText":"\"/passkey/generate-register-options\"","maxUsageCount":3,"timeout":120000,"useRegex":false}
   - jetbrains__search_in_files_by_text {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"better-auth-api-spec.json","searchText":"\"/passkey/list-user-passkeys\"","maxUsageCount":3,"timeout":120000,"useRegex":false}
   - jetbrains__search_in_files_by_text {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"better-auth-api-spec.json","searchText":"\"/passkey/delete-passkey\"","maxUsageCount":3,"timeout":120000,"useRegex":false}
   - jetbrains__search_in_files_by_text {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"better-auth-api-spec.json","searchText":"\"/passkey/update-passkey\"","maxUsageCount":3,"timeout":120000,"useRegex":false}
   - jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/iam/domain/src/entities/Passkey/Passkey.model.ts"}
   - Review the ApiKey exemplar:
     - jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/iam/sdk/src/clients/api-key/api-key.contracts.ts"}
     - jetbrains__get_file_text_by_path {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/iam/sdk/src/clients/api-key/api-key.implementations.ts"}
3. Contracts (`packages/iam/sdk/src/clients/passkey/passkey.contracts.ts`):
   - Derive payloads/views from `Passkey.Model.select/insert/update` via `.pick(...).fields`; do not hand-roll DTOs.
   - Reuse JSON helpers or redacted wrappers wired through the domain model.
   - Register each schema with `ContractKit.make` and export declare namespace types.
4. Implementations (`packages/iam/sdk/src/clients/passkey/passkey.implementations.ts`):
   - Use `Effect.fn`, `makeFailureContinuation`, and helper utilities from `@beep/iam-sdk/clients/_internal` (`MetadataFactory`, `withFetchOptions`, `addFetchOptions`, `requireData`, `decodeResult`, `compact`).
   - Encode payloads before calling Better Auth, map WebAuthn secrets with `Redacted.value`, and wrap `ParseError` via `Effect.fail(IamError.match(...))`.
   - Notify `client.$store.notify("$sessionSignal")` if the operation mutates the active session.
5. Wire/passkey UI hooks noted in the checklist (privacy protection tab, account settings) to consume the new handlers.
6. Run `PATH="$HOME/.bun/bin:$PATH" bun run build --filter=@beep/iam-sdk` after completing the batch and record the result in the checklist notes.
7. Update checklist items once code, build, and documentation are aligned.
```

---

## 9. Daily Update Template

```text
- Cluster: <cluster name>
- Methods completed: <list>
- Builds/tests run: <command + result>
- Outstanding todos/blockers: <notes>
```
