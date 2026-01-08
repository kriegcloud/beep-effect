# Original Prompt

**SPEC_NAME**: claude-md-best-practices-alignment

## Request

Can you deploy sub-agents to read the following links:
- https://code.claude.com/docs/en/memory
- https://www.anthropic.com/engineering/multi-agent-research-system
- https://platform.claude.com/cookbook/tool-use-memory-cookbook
- https://www.anthropic.com/engineering/claude-code-best-practices

Then produce a synthesized "compressed" summary of best-practices from all links I've shared containing the do's and dont's & best practices for the next set of agents to reference when comparing and contrasting those best practices against ./.claude configurations & CLAUDE.md files (symlinked to AGENTS.md files).

## NEXT BATCH

Deploy agents in parallel batches to compare contrast the best practices & recommendations from the synthesized document from the previous phase with this repository's `CLAUDE.md` files & `.claude` configurations. If areas of improvement are found or anti-patterns are identified they should be added to a report markdown document. Each sub-agent should produce its own report in `./specs/claude-md-best-practices-alignment/alignment-reports/<package-name-or-claude-file>.md` then once all agent reports are finished they should be synthesized into a todo list markdown document containing checkbox list items where each list item contains:
- Exact file path & line numbers to issue
- Area of improvement
- Suggested fix
- The violation / best practice not being followed
