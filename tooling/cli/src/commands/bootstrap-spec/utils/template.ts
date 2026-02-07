/**
 * @file Template Utility for Spec Bootstrapping
 *
 * Provides Handlebars template compilation and rendering for spec scaffolding.
 * Pre-computes context variables and provides templates for all spec file types.
 *
 * @module bootstrap-spec/utils/template
 * @since 0.1.0
 */

import type { BootstrapSpecInput, SpecComplexity } from "../schemas.js";

// -----------------------------------------------------------------------------
// Spec Context
// -----------------------------------------------------------------------------

/**
 * Context variables for template rendering.
 */
export interface SpecContext {
  /** Lowercase kebab-case spec name, e.g., "my-feature" */
  readonly specName: string;
  /** Brief description of the spec */
  readonly specDescription: string;
  /** Purpose statement for README */
  readonly purpose: string;
  /** Problem statement for README */
  readonly problemStatement: string;
  /** Scope definition for README */
  readonly scope: string;
  /** Complexity level */
  readonly complexity: SpecComplexity;
  /** ISO 8601 timestamp */
  readonly createdAt: string;
}

/**
 * Create a SpecContext from BootstrapSpecInput.
 *
 * Derives sensible defaults for purpose, problem statement, and scope
 * from the description if not provided.
 *
 * @example
 * ```ts
 * const ctx = createSpecContext(input);
 * ```
 *
 * @param input - The validated input from the CLI
 * @returns Complete SpecContext for template rendering
 *
 * @since 0.1.0
 * @category constructors
 */
export const createSpecContext = (input: BootstrapSpecInput): SpecContext => ({
  specName: input.specName,
  specDescription: input.specDescription,
  purpose: input.purpose || `Implement ${input.specDescription.toLowerCase()}`,
  problemStatement:
    input.problemStatement || `Currently, ${input.specDescription.toLowerCase()} needs to be addressed.`,
  scope: input.scope || `This specification covers ${input.specDescription.toLowerCase()}.`,
  complexity: input.complexity,
  createdAt: new Date().toISOString(),
});

// -----------------------------------------------------------------------------
// Template Definitions
// -----------------------------------------------------------------------------

/**
 * README.md template for spec root.
 */
export const README_TEMPLATE = `# {{specName}}

> {{specDescription}}

---

## Purpose

{{purpose}}

---

## Problem Statement

{{problemStatement}}

---

## Scope

{{scope}}

---

## Success Criteria

- [ ] Primary goal achieved
- [ ] All outputs generated
- [ ] Tests passing
- [ ] Documentation updated

---

## Phase Overview

| Phase | Focus | Agents |
|-------|-------|--------|
| 0 | Scaffolding | doc-writer |
| 1 | Discovery | codebase-researcher |
| 2 | Evaluation | code-reviewer |
| 3 | Synthesis | reflector, doc-writer |
| 4+ | Iteration | test-writer, package-error-fixer |

---

## Quick Start

See [QUICK_START.md](./QUICK_START.md) for a 5-minute getting started guide.

---

## Related

- [SPEC_CREATION_GUIDE.md](../SPEC_CREATION_GUIDE.md)
- [META_SPEC_TEMPLATE.md](../ai-friendliness-audit/META_SPEC_TEMPLATE.md)
`;

/**
 * REFLECTION_LOG.md template.
 */
export const REFLECTION_LOG_TEMPLATE = `# {{specName}}: Reflection Log

> Cumulative learnings from spec creation and implementation phases.

---

## Reflection Protocol

After each phase, document:

1. **What Worked** - Techniques that were effective
2. **What Didn't Work** - Approaches that failed or were inefficient
3. **Methodology Improvements** - Changes to apply in future phases
4. **Prompt Refinements** - Updated prompts based on learnings
5. **Codebase-Specific Insights** - Patterns unique to this repo

---

## Reflection Entries

*(Entries will be added after each phase)*

---

## Accumulated Improvements

### Template Updates
*(None yet)*

### Process Updates
*(None yet)*

---

## Lessons Learned Summary

### Top 3 Most Valuable Techniques
1. *(To be filled)*
2.
3.

### Top 3 Wasted Efforts
1. *(To be filled)*
2.
3.
`;

/**
 * QUICK_START.md template.
 */
export const QUICK_START_TEMPLATE = `# {{specName}} Quick Start

> 5-minute guide to get started with this specification.

---

## Prerequisites

- Access to the beep-effect repository
- Familiarity with Effect patterns
- Understanding of spec structure

---

## Step 1: Understand the Scope

{{scope}}

---

## Step 2: Run Discovery

\`\`\`bash
# Launch codebase-researcher to gather context
# Output: outputs/codebase-context.md
\`\`\`

---

## Step 3: Review Findings

Check \`outputs/codebase-context.md\` for:
- Affected files and packages
- Existing patterns to follow
- Dependencies to consider

---

## Step 4: Create Plan

Based on discovery, create:
- \`outputs/remediation-plan.md\` with prioritized tasks
- \`HANDOFF_P1.md\` for first iteration

---

## Step 5: Execute

Follow the handoff document to complete each phase.

---

## Verification

After completion:
- [ ] All success criteria met
- [ ] REFLECTION_LOG.md updated
- [ ] Tests passing

---

## Need Help?

- [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) - Full workflow
- [SPEC_CREATION_GUIDE.md](../SPEC_CREATION_GUIDE.md) - General guidance
`;

/**
 * MASTER_ORCHESTRATION.md template for complex specs.
 */
export const MASTER_ORCHESTRATION_TEMPLATE = `# {{specName}}: Master Orchestration

> Complete workflow for implementing {{specDescription}}.

---

## Overview

This orchestration guide covers the full implementation of this specification.

---

## Phase 0: Scaffolding

### Completed Items
- [x] Created spec folder structure
- [x] README.md with purpose and scope
- [x] REFLECTION_LOG.md template

### Outputs
- \`specs/pending/{{specName}}/README.md\`
- \`specs/pending/{{specName}}/REFLECTION_LOG.md\`

---

## Phase 1: Discovery

### Tasks
- [ ] Research existing implementation patterns
- [ ] Identify affected packages and files
- [ ] Document dependencies

### Outputs
- \`outputs/codebase-context.md\`

---

## Phase 2: Evaluation

### Tasks
- [ ] Analyze findings from discovery
- [ ] Identify gaps and issues
- [ ] Prioritize work items

### Outputs
- \`outputs/evaluation.md\`

---

## Phase 3: Synthesis

### Tasks
- [ ] Create remediation plan
- [ ] Define success criteria
- [ ] Prepare handoff document

### Outputs
- \`outputs/remediation-plan.md\`
- \`HANDOFF_P1.md\`

---

## Phase 4+: Iteration

### Tasks
- [ ] Execute plan from handoff
- [ ] Update reflection log
- [ ] Validate results

---

## Verification Commands

\`\`\`bash
bun run check
bun run lint
bun run test
\`\`\`

---

## Success Criteria

- [ ] Primary goal achieved
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Reflection log completed
`;

/**
 * AGENT_PROMPTS.md template for complex specs.
 */
export const AGENT_PROMPTS_TEMPLATE = `# {{specName}}: Agent Prompts

> Pre-configured prompts for each phase of the specification workflow.

---

## Phase 1: Discovery Prompts

### Codebase Researcher

\`\`\`
Research the beep-effect codebase to understand:
1. Existing patterns related to {{specDescription}}
2. Affected packages and dependencies
3. Integration points to consider

Output: outputs/codebase-context.md
\`\`\`

---

## Phase 2: Evaluation Prompts

### Code Reviewer

\`\`\`
Review the codebase context and:
1. Identify gaps in current implementation
2. Note code quality issues
3. Suggest improvements

Output: outputs/evaluation.md
\`\`\`

---

## Phase 3: Synthesis Prompts

### Doc Writer

\`\`\`
Based on the evaluation, create:
1. Remediation plan with prioritized tasks
2. Handoff document for implementation

Output: outputs/remediation-plan.md, HANDOFF_P1.md
\`\`\`

---

## Phase 4+: Implementation Prompts

### Effect Code Writer

\`\`\`
Follow the handoff document to implement:
1. Core functionality
2. Tests for new code
3. Integration with existing systems
\`\`\`
`;

/**
 * RUBRICS.md template for complex specs.
 */
export const RUBRICS_TEMPLATE = `# {{specName}}: Evaluation Rubrics

> Criteria for evaluating spec completion and quality.

---

## Completion Rubric

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Functionality | 40% | Core features work as specified |
| Code Quality | 25% | Follows Effect patterns, clean code |
| Testing | 20% | Adequate test coverage |
| Documentation | 15% | Clear docs and comments |

---

## Quality Checklist

### Functionality
- [ ] All success criteria met
- [ ] Edge cases handled
- [ ] Error handling complete

### Code Quality
- [ ] Effect patterns used correctly
- [ ] No TypeScript errors
- [ ] Lint checks pass

### Testing
- [ ] Unit tests added
- [ ] Integration tests where needed
- [ ] All tests pass

### Documentation
- [ ] README updated
- [ ] JSDoc comments added
- [ ] Reflection log completed

---

## Grading Scale

| Grade | Score | Description |
|-------|-------|-------------|
| A | 90-100% | Exceptional - exceeds requirements |
| B | 80-89% | Good - meets all requirements |
| C | 70-79% | Acceptable - meets core requirements |
| D | 60-69% | Needs improvement |
| F | <60% | Incomplete |
`;

/**
 * HANDOFF_P1.md template for complex specs.
 */
export const HANDOFF_TEMPLATE = `# {{specName}} Handoff: Phase 1

> Transition from discovery to implementation.

---

## Session Summary

| Metric | Status |
|--------|--------|
| Spec structure created | Complete |
| Discovery completed | Pending |
| Implementation started | Not started |

---

## What Was Accomplished

### Phase 0: Scaffolding
1. Created spec folder structure
2. Wrote README.md with purpose and scope
3. Created REFLECTION_LOG.md template

---

## Remaining Work

### Priority 1: Discovery
- [ ] Research existing patterns
- [ ] Identify affected files
- [ ] Document dependencies

### Priority 2: Planning
- [ ] Create remediation plan
- [ ] Define implementation steps

### Priority 3: Implementation
- [ ] Execute plan
- [ ] Write tests
- [ ] Update documentation

---

## Notes for Next Agent

1. Start with discovery phase
2. Document findings in outputs/
3. Update this handoff as progress is made
`;

// -----------------------------------------------------------------------------
// Template Rendering
// -----------------------------------------------------------------------------

/**
 * Simple template renderer using string replacement.
 * Replaces {{variable}} with context values.
 *
 * @param template - Template string with {{variable}} placeholders
 * @param context - Context object with values
 * @returns Rendered string
 *
 * @since 0.1.0
 * @category utilities
 */
export const renderTemplate = (template: string, context: SpecContext): string => {
  let result = template;
  const entries: Array<[string, string]> = [
    ["specName", context.specName],
    ["specDescription", context.specDescription],
    ["purpose", context.purpose],
    ["problemStatement", context.problemStatement],
    ["scope", context.scope],
    ["complexity", context.complexity],
    ["createdAt", context.createdAt],
  ];

  for (const [key, value] of entries) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }

  return result;
};
