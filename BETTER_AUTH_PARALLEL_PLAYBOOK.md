# Better Auth Parallel Orchestration Playbook

This playbook describes how to coordinate multiple `GPT-5 Codex` sessions working in parallel on the
[`BETTER_AUTH_CLIENT_AND_METHODS_LIST.md`](BETTER_AUTH_CLIENT_AND_METHODS_LIST.md) checklist while adhering to the
process enforced in [`BETTER_AUTH_CLIENT_METHOD_PROCESS.md`](BETTER_AUTH_CLIENT_METHOD_PROCESS.md) and
`packages/iam/sdk/AGENTS.md`.

---

## 1. Prerequisites

- Every agent must read:
  - `packages/iam/sdk/AGENTS.md`
  - `BETTER_AUTH_CLIENT_METHOD_PROCESS.md`
  - `BETTER_AUTH_CLIENT_AND_METHODS_LIST.md`
- Ensure Bun is installed and on PATH (`bun --version` should return `1.3.0`). If not, ask the agent to run:

  ```bash
  echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.zshrc
  echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.zshrc
  exec $SHELL
  bun --version
  ```

- All agents must know the MCP tooling required by the SOP (Context7 docs, JetBrains IDE calls, etc.).

---

## 2. Recommended Team Structure

| Cluster             | Checklist Section(s) | Primary Agent | Backup Agent | Integration Branch             |
|---------------------|----------------------|---------------|--------------|--------------------------------|
| Base & Verify       | `base`, `custom-session`, `verify` |               |              | `feat/base-verify-contracts`   |
| Admin               | `admin`              |               |              | `feat/admin-contracts`         |
| API Key & Anonymous | `api-key`, `anonymous` |               |              | `feat/api-key-contracts`       |
| Device + OIDC       | `device-authorization`, `oidc-provider`, `generic-oauth` |               |              | `feat/device-oidc-contracts`   |
| JWT & Multi-session | `jwt`, `multi-session` |               |              | `feat/jwt-multisession`        |

Populate the table before work starts. Each agent owns contracts + implementations + UI/runtime references for their
cluster but keeps reviewers in the loop.

---

## 3. Per-Agent Execution Loop

1. **Review & Scope**  
   - Inspect current contracts/implementations in the cluster.  
   - Note missing schemas, metadata, or exports.

2. **Documentation Harvest**  
   - Run the following MCP calls for every method in scope:

     ```json
     {"tool":"context7__resolve-library-id","args":{"libraryName":"better-auth"}}
     {"tool":"context7__get-library-docs","args":{"context7CompatibleLibraryID":"/better-auth/better-auth","topic":"<topic>","tokens":800}}
    {"tool":"jetbrains__search_in_files_by_text","args":{"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"better-auth-api-spec.json","searchText":"\"/<api path>\"","maxUsageCount":3,"timeout":120000,"useRegex":false}}
     ```

   - The `jetbrains__search_in_files_by_text` call returns just the relevant snippet from the large OpenAPI JSON—no custom scripts needed.
   - Paste key payloads/response structures into the agent’s working context.

3. **Contract Authoring (see SOP §2)**  
   - Create/extend `BS.Class` schemas with namespaces.  
   - Define `Contract.make` entries (`failure: S.instanceOf(IamError)`).  
   - Append to the appropriate `ContractKit`.  
   - Export via the feature `index.ts`.

4. **Implementation (see SOP §3)**  
   - Use `Effect.fn` wrappers and `makeFailureContinuation`.  
   - Import helper utilities from `@beep/iam-sdk/clients/_internal` (`MetadataFactory`, `withFetchOptions`, `addFetchOptions`, `requireData`, `decodeResult`, `compact`) instead of reimplementing fetch plumbing or null guards.  
   - Pass `handlers.signal` and `handlers.onError` correctly.  
   - Notify `$sessionSignal` when the call mutates session state.  
   - Decode success payloads with `S.decodeUnknown` (unless `S.Void`).

5. **Verification**  
   - Run `bun run build --filter=@beep/iam-sdk`.  
   - If UI/runtime touched: recommend `bun run lint --filter=@beep/iam-ui` or targeted tests.  
   - Document all commands run + results in the PR summary.

6. **Checklist Update & Handoff**  
   - Update `BETTER_AUTH_CLIENT_AND_METHODS_LIST.md` (only one agent edits at a time to avoid conflicts).  
   - Mark items as `[x]` only after implementation + build pass.  
   - Note any residual TODOs or UI follow-ups inline.

---

## 4. Coordination & Review

- Maintain a shared Kanban (even a quick Markdown table) listing each method, assigned agent, and status (`Draft`, `Ready for Review`, `Done`).
- Require cross-cluster reviews. Example: admin agent reviews API key work for consistent telemetry metadata.
- During review, check:
  - Contract namespace exports
  - `makeFailureContinuation` metadata strings (must match plugin + method)
  - Usage of the `_internal` helper utilities (`MetadataFactory`, `withFetchOptions`, `addFetchOptions`, `requireData`, `decodeResult`, `compact`) instead of ad-hoc implementations
  - Use of `Redacted.value` for secrets
  - Session notifications
  - Updated exports in `index.ts` files

---

## 5. Copy-Pasteable Prompts

Assign one of the following prompts to each agent when spinning up a new Codex session.

### A. Cluster Kickoff Prompt

```text
You are GPT-5 Codex. Your cluster: <CLUSTER_NAME> (methods: <METHOD_LIST>).
1. Read `packages/iam/sdk/AGENTS.md`, `BETTER_AUTH_CLIENT_METHOD_PROCESS.md`, and `BETTER_AUTH_CLIENT_AND_METHODS_LIST.md`.
2. Pull Better Auth docs and OpenAPI snippets for each method:
   - context7__resolve-library-id {"libraryName":"better-auth"}
   - context7__get-library-docs {"context7CompatibleLibraryID":"/better-auth/better-auth","topic":"<topic>","tokens":800}
   - jetbrains__search_in_files_by_text {"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"better-auth-api-spec.json","searchText":"\"/<api path>\"","maxUsageCount":20}
3. Implement missing contracts + handlers following the SOP.
4. Run `bun run build --filter=@beep/iam-sdk` and report the result.
5. Update the checklist items you completed (one agent edits the file at a time).
```

### B. Contract Authoring Prompt (use per method)

```text
Target method: <PLUGIN.METHOD>
1. Summarize the request/response schema from Better Auth docs + OpenAPI.
2. Implement or refine the schemas in `packages/iam/sdk/src/clients/<feature>/<feature>.contracts.ts`.
3. Ensure namespaces export `Type` and `Encoded` types.
4. Register the contract in the local `ContractKit`.
Do not modify implementations yet; just confirm contracts match the docs.
```

### C. Implementation Prompt (use after contracts are in place)

```text
Target contract: <ContractName>
1. Open `packages/iam/sdk/src/clients/<feature>/<feature>.implementations.ts`.
2. Add an `Effect.fn` handler using `makeFailureContinuation` with correct metadata { plugin: "<plugin>", method: "<method>" }.
3. Map payload fields, wrap secrets with `Redacted.value`, and pass `handlers.onError` + optional `handlers.signal`.
4. Decode success payloads with `S.decodeUnknown` if result schema is not `S.Void`.
5. Call `client.$store.notify("$sessionSignal")` when the method mutates session state.
6. Register the handler in `ContractKit.of`.
7. Run `bun run build --filter=@beep/iam-sdk` and share the output.
```

### D. Review Prompt

```text
Review scope: <PR or Branch Name>
1. Cross-check new/updated contracts against Better Auth docs.
2. Verify implementation handlers use `makeFailureContinuation`, `Redacted.value`, and session notifications correctly.
3. Ensure exports in `index.ts` files are updated.
4. Confirm `BETTER_AUTH_CLIENT_AND_METHODS_LIST.md` entries match the implementation work.
5. Run or request `bun run build --filter=@beep/iam-sdk`; flag any missing verification.
Provide actionable feedback or approve if all checks pass.
```

---

## 6. Daily Status Template

Ask each agent to report progress with the following template:

```text
- Cluster: <CLUSTER_NAME>
- Methods completed: <LIST>
- Builds/tests run: <COMMANDS + RESULTS>
- Outstanding todos/blockers: <NOTES>
```

Collect the updates in a shared channel or document at least once per day to reallocate work if needed.

---

By following this playbook, you can run multiple Codex sessions concurrently without losing quality or diverging from the
established Better Auth integration patterns. Update this document as the SOP evolves or new plugins are introduced.
