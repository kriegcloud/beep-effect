<!--
AGENTS_UPDATE_PROMPT.md

Usage:
- Replace all {{...}} placeholders with real values before sending this prompt to an LLM.
- The LLM’s response should be the complete, updated contents of AGENTS.md for the package.

Placeholders:
- {{PACKAGE_NAME}}: Human-readable name of the package.
- {{PACKAGE_PATH}}: Relative path from the repo root to the package.
- {{PACKAGE_DESCRIPTION}}: Current 2–6 sentence summary of what the package does.
- {{PACKAGE_ROLE_IN_MONOREPO}}: Short description of how this package fits into the larger system.
- {{CURRENT_AGENTS_MD}}: The current contents of AGENTS.md for this package.
- {{RECENT_CHANGES_SUMMARY}}: Natural-language summary of recent changes to this package (and related agents), if available.
- {{GIT_DIFF}}: Optional diff or changelog snippets showing what changed (include only relevant parts).
- {{KEY_FILES_AND_DIRECTORIES}}: Updated list of key files/dirs with one-line explanations each.
- {{ADDITIONAL_CONTEXT}}: Any extra notes for the LLM (for example, “agent X was deleted”, “we renamed Y to Z”, “this section is known to be stale”).
-->

You are an expert software architect and technical writer helping maintain the {{PACKAGE_NAME}} package
inside a larger monorepo.

Your task is to **update the existing `AGENTS.md` file** so that it accurately reflects the current state
of this package and its related agents and workflows.

Here is the current context:

- Package name: {{PACKAGE_NAME}}
- Package path: {{PACKAGE_PATH}}
- Role in the monorepo: {{PACKAGE_ROLE_IN_MONOREPO}}
- Current package description:
  {{PACKAGE_DESCRIPTION}}

Key files and directories (current):

{{KEY_FILES_AND_DIRECTORIES}}

Recent changes to this package and its agents:

{{RECENT_CHANGES_SUMMARY}}

Relevant diffs / changelog snippets:

{{GIT_DIFF}}

Current `AGENTS.md` file (verbatim; treat this as the starting point you need to improve):

---8<--- CURRENT AGENTS.md START
{{CURRENT_AGENTS_MD}}
---8<--- CURRENT AGENTS.md END

Additional context for the update:

{{ADDITIONAL_CONTEXT}}

## What to do

Using the information above, update the `AGENTS.md` file so that it is correct, complete, and consistent
with the current code and behavior.

Specifically, you should:

1. **Understand the existing document**
   - Identify its current structure, sections, and tone.
   - Note any parts that are clearly outdated, incomplete, or inconsistent with the new context.

2. **Compare against the current state**
   - Use the description, key files, and change information to determine:
     - New agents, workflows, or capabilities that need to be documented.
     - Agents, workflows, or features that have been removed or renamed.
     - Changes in inputs, outputs, dependencies, or limitations.

3. **Update the content**
   - Bring all sections up to date, making edits where needed instead of rewriting everything unnecessarily.
   - Remove or rewrite content that no longer applies.
   - Add new sections or subsections when they clarify how agents now behave or interact.
   - Preserve the general tone and structure if it is still reasonable, but improve clarity and organization where helpful.

4. **Ensure consistency and usefulness**
   - Make sure agent names, file paths, and terminology are consistent with the current package.
   - Ensure the document is still structured in a way that’s easy for new contributors to understand. It should typically cover:
     - Overview
     - Agent catalog
     - Workflows and interactions
     - Implementation notes
     - Extending / adding agents
     - Maintenance checklist
   - If important information is missing from the inputs (for example, the changelog doesn’t mention an agent that still appears in the code), add a brief “TODO” note rather than inventing details.

## Quality and style requirements

- Do **not** add speculative information; rely only on what can be reasonably inferred from the inputs.
- Prefer targeted edits and improvements over a total rewrite when the existing structure is already good.
- Use clear, concise language and consistent Markdown formatting.
- Keep the document focused on agents, their responsibilities, and how they interact with this package and the wider system.

## Output format

- Output the **full, updated `AGENTS.md` file** in Markdown.
- Return one complete, coherent document, not a list of patches or instructions.
- Do **not** wrap the result in code fences.
- Do **not** include commentary about the changes you made; only return the final document.
