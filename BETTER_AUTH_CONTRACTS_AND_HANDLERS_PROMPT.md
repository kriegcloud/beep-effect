# Better Auth Contract/AuthHandler Subtask Prompt

You are starting a fresh Codex CLI session in the `beep-effect` monorepo.
Your mission: extend `BETTER_AUTH_CLIENT_AND_METHODS_LIST.md` so that every method checkbox gains nested subtasks capturing the work to produce a typed `Contract` and a UI `AuthHandler`. Each nested subtask must surface useful context links/references that will help whoever implements it.

## Guardrails
- Keep following the Better Auth research constraints already in place: prefer Context7 docs (https://www.better-auth.com/llms.txt) or the local `node_modules/better-auth/**` sources for factual confirmation.
- Do not alter the existing top-level method descriptions or their checkbox state; you are only appending nested subtasks.
- Maintain alphabetical section ordering and the established Markdown voice.
- When linking to repository files, point at the workspace-relative path (for example ``packages/iam/sdk/src/clients/...``) instead of embedding large snippets.
- Use `effect-mcp` (or `context7` helpers) whenever you need to pull in additional Better Auth documentation to cite inside a subtask.

## Preparation
- [ ] Open `BETTER_AUTH_CLIENT_AND_METHODS_LIST.md` and skim a few sections to confirm the current format.
- [ ] Browse the existing contract and handler implementations for reference:
  - `packages/iam/sdk/src/clients/sign-in/sign-in.contracts.ts`
  - `packages/iam/ui/src/sign-in/sign-in-email.form.tsx`
- [ ] Inspect `packages/iam/sdk/src/clients/` and `packages/iam/ui/src/` for any plugin-specific contracts or handlers that already exist; note their paths so you can cite them.
- [ ] Keep `BETTER_AUTH_PLUGIN_EXECUTION_CHECKLIST_PROMPT.txt` open so you can reflect any new workflow notes if needed.

## Execution Workflow
For each method bullet (for example ``- [ ] [`auth.admin.setRole`](...) — ...``):
1. Append a nested contract task directly beneath it:
   - Example format: ``  - [ ] Contract: scaffold `packages/iam/sdk/src/clients/<plugin>/<method>.contracts.ts` mirroring the shape from <link to plugin doc>. References: <Better Auth doc URL>, <existing contract file path>.``
   - Ensure the description states the intended module path or target file, highlights any reuse of shared schemas, and includes at least one helpful link (Better Auth doc, internal contract example, runtime layer, etc.).
2. Append a nested auth handler task:
   - Example format: ``  - [ ] AuthHandler: add handler in `packages/iam/ui/src/<flow>/<plugin>.<method>.form.tsx` (or the appropriate slice) wiring the contract into the client runtime. References: <UI form path>, <runtime/service link>, <Better Auth doc>.``
   - Mention the relevant UI slice (`apps/web`, `packages/iam/ui`, etc.) and any runtime helper (`packages/runtime/client/src/services/runtime/live-layer.ts`) that needs to be composed.
3. If related contracts or handlers already exist in the codebase, include their workspace-relative paths as additional references so the implementer can mirror conventions.
4. When documentation beyond the existing method link would help (for example, error payload details), use `effect-mcp` or `context7` to fetch the specific Better Auth page and cite it in the subtask.
5. Keep indentation and checkbox syntax consistent (`two spaces + - [ ] ...`) so Markdown renders correctly.

## Verification
- [ ] After processing all method bullets, skim the file to confirm each now has both `Contract` and `AuthHandler` subtasks with at least one reference link each.
- [ ] Run `git diff BETTER_AUTH_CLIENT_AND_METHODS_LIST.md` to ensure only nested subtasks were added.
- [ ] If you updated any ancillary prompts (for example, `BETTER_AUTH_PLUGIN_EXECUTION_CHECKLIST_PROMPT.txt`), review those diffs as well.
- [ ] Summarize remaining gaps or open questions in your final response to the user.
