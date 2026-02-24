<!--
AGENTS_CREATE_PROMPT.md

Usage:
- Replace all {{...}} placeholders with real values before sending this prompt to an LLM.
- The LLM’s response should be the complete contents of AGENTS.md for the package.

Placeholders:
- {{PACKAGE_NAME}}: Human-readable name of the package.
- {{PACKAGE_PATH}}: Relative path from the repo root to the package.
- {{PACKAGE_DESCRIPTION}}: 2–6 sentence summary from README, package.json, or other docs.
- {{PACKAGE_ROLE_IN_MONOREPO}}: Short description of how this package fits into the larger system.
- {{KEY_FILES_AND_DIRECTORIES}}: Bullet list of key files/dirs with one-line explanations each.
- {{EXISTING_DOCS_SUMMARY}}: Optional summary of relevant docs (README sections, design docs, etc.).
- {{KNOWN_AGENTS_OR_AUTOMATIONS}}: Optional bullets describing known agents/workflows, if any.
- {{ADDITIONAL_CONTEXT}}: Any other context you want the LLM to consider (may be empty).
-->

You are an expert software architect and technical writer helping maintain the {{PACKAGE_NAME}} package
inside a larger monorepo.

Your task is to write a clear, accurate `AGENTS.md` file that documents the agents, tools, and
automations associated with this package. The file will live next to the code and should be useful to:

- Developers working on {{PACKAGE_NAME}}
- Engineers wiring agents together across packages
- Operators debugging or updating automations

Here is the context about the package:

- Package name: {{PACKAGE_NAME}}
- Package path: {{PACKAGE_PATH}}
- Role in the monorepo: {{PACKAGE_ROLE_IN_MONOREPO}}
- High-level description:
  {{PACKAGE_DESCRIPTION}}

Key files and directories:

{{KEY_FILES_AND_DIRECTORIES}}

Relevant existing documentation:

{{EXISTING_DOCS_SUMMARY}}

Known agents / automations for this package (if any):

{{KNOWN_AGENTS_OR_AUTOMATIONS}}

Additional context:

{{ADDITIONAL_CONTEXT}}

## What to produce

Using only the information above, write the full contents of a new `AGENTS.md` file for this package.

Design the document so that someone new to the codebase can quickly understand:

- What agents exist that relate to this package
- What those agents do and when they should be used
- How they interact with this package’s modules, APIs, or data
- Constraints, limitations, or important caveats
- How to extend or add new agents safely

### Required structure

Follow this structure, adapting section names slightly only if it clearly improves the document:

1. `# Agents for {{PACKAGE_NAME}}`
2. `## Overview`
   - 1–3 short paragraphs describing the purpose of the agents connected to this package and how they fit into the larger system.
3. `## Agent catalog`
   - One subsection per agent, using a format like:

     - `### <Agent name>`
       - **Purpose**: What problem it solves.
       - **Inputs**: What information it receives.
       - **Outputs**: What it produces or changes.
       - **Triggers / invocation**: When and how it is run.
       - **Key dependencies**: Important modules, APIs, or external services it uses.
       - **Failure modes / limitations**: Known edge cases or cautions.

4. `## Workflows and interactions`
   - Describe how agents work together or interact with other packages, queues, schedulers, or external systems.
   - Include simple sequence-style bullet lists for common flows.

5. `## Implementation notes`
   - Pointers into the codebase (file paths, modules, key functions) that are most relevant to the agents.
   - Any conventions, configuration files, or environment variables that matter.

6. `## Extending or adding agents`
   - Guidance for adding a new agent or modifying an existing one safely.
   - Things to check before making changes (tests, docs, configs, safety constraints).

7. `## Maintenance checklist`
   - Short bullet list of things to update in `AGENTS.md` when the package or its agents change (for example, new endpoints, renamed workflows, retired features).

### Quality and style requirements

- Be **accurate** with respect to the provided context; do not invent agents, APIs, or behaviors that are not justified by the input.
- If some expected information is missing or ambiguous, call it out explicitly in the document as a short “TODO” item instead of guessing.
- Use clear, concise sentences and descriptive headings.
- Prefer bullet lists and short paragraphs over long walls of text.
- Keep the tone professional and matter-of-fact.

### Output format

- Return **only** the final Markdown content of `AGENTS.md`.
- Do **not** wrap the output in code fences.
- Do **not** include any explanation of what you did—only the document itself.
