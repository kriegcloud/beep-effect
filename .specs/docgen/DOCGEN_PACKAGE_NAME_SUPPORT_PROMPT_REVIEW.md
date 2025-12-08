# Prompt Review & Optimization Task

## Your Role

You are a **prompt engineering specialist and code review agent**. Your task is to review, identify issues with, and optimize the implementation prompt in `DOCGEN_PACKAGE_NAME_SUPPORT_PROMPT.md`.

---

## Objective

1. **Review** the prompt in `.specs/docgen/DOCGEN_PACKAGE_NAME_SUPPORT_PROMPT.md`
2. **Identify issues** that could cause implementation problems
3. **Fix and optimize** the prompt using prompt engineering best practices
4. **Update** the file with your improvements

---

## Review Checklist

Evaluate the prompt against these criteria:

### Clarity & Completeness

- [ ] Is the task objective clearly stated?
- [ ] Are all files that need modification explicitly listed?
- [ ] Are line numbers accurate and up-to-date?
- [ ] Is the expected behavior clearly defined with examples?
- [ ] Are edge cases addressed?

### Technical Accuracy

- [ ] Do the code examples match the actual codebase patterns?
- [ ] Are import paths correct?
- [ ] Are function signatures accurate?
- [ ] Do the error types match what's actually in the codebase?
- [ ] Are the Effect patterns correct per AGENTS.md?

### Implementation Guidance

- [ ] Is the implementation order logical?
- [ ] Are dependencies between steps clear?
- [ ] Is it clear what can be done in parallel vs sequentially?
- [ ] Are there any missing steps?
- [ ] Are there any unnecessary steps?

### Context Efficiency

- [ ] Is there redundant information that could be removed?
- [ ] Is critical information prominently placed?
- [ ] Could any sections be condensed without losing clarity?
- [ ] Is the prompt structured for easy scanning?

### Error Prevention

- [ ] Are common mistakes anticipated and warned against?
- [ ] Are the testing commands comprehensive?
- [ ] Are success criteria measurable?
- [ ] Is there guidance for handling failures?

---

## Verification Steps

Before making changes, verify the following by reading the actual source files:

### 1. Verify Line Numbers
Read these files and confirm the line numbers in the prompt are accurate:
- `tooling/cli/src/commands/docgen/shared/discovery.ts` - Check `D` function location, `resolvePackagePath` location
- `tooling/cli/src/commands/docgen/init.ts` - Check `resolvePackagePath` usage location
- `tooling/cli/src/commands/docgen/generate.ts` - Check `resolvePackagePath` usage location
- `tooling/cli/src/commands/docgen/aggregate.ts` - Check `resolvePackagePath` usage location
- `tooling/cli/src/commands/docgen/analyze.ts` - Check `resolvePackagePath` usage location

### 2. Verify Code Patterns
Confirm the existing code patterns match what's described:
- How are imports structured?
- How are options defined?
- How is error handling implemented?

### 3. Verify Dependencies
Check that:
- `FsUtils` is actually required by `discoverAllPackages`
- The error types exist and have the properties described
- The `PackageInfo` type matches the description

---

## Optimization Guidelines

### Prompt Engineering Best Practices

1. **Front-load critical information** - Most important details should be at the top
2. **Use hierarchical structure** - Main points → sub-points → details
3. **Provide concrete examples** - Show don't tell
4. **Eliminate ambiguity** - Every instruction should have one interpretation
5. **Include verification steps** - How to confirm each step succeeded
6. **Anticipate failure modes** - What could go wrong and how to recover

### Context Window Optimization

1. **Remove redundancy** - Don't repeat information
2. **Use references** - "See X above" instead of repeating
3. **Prioritize actionable content** - Less explanation, more instruction
4. **Use tables for structured data** - More compact than prose
5. **Code blocks over descriptions** - Show the actual code needed

### Implementation Agent Considerations

1. **Assume the agent has access to file reading tools** - Don't duplicate file contents
2. **Be explicit about what to change vs what to reference**
3. **Order tasks by dependency** - Can't update imports before creating the function
4. **Identify parallelizable work** - Commands can be updated concurrently
5. **Include "done" markers** - How does the agent know when finished?

---

## Output Requirements

After your review, update the `DOCGEN_PACKAGE_NAME_SUPPORT_PROMPT.md` file with:

1. **Corrections** to any inaccurate information (line numbers, code patterns, etc.)
2. **Additions** for any missing critical information
3. **Removals** of any redundant or unnecessary content
4. **Restructuring** if the organization could be improved
5. **Clarifications** for any ambiguous instructions

---

## Process

### Phase 1: Verification (Use subagents for parallel file reading)

Launch subagents to read and analyze in parallel:
- Agent 1: Read `discovery.ts` and verify function locations/signatures
- Agent 2: Read `init.ts` and `generate.ts` to verify usage patterns
- Agent 3: Read `aggregate.ts` and `analyze.ts` to verify usage patterns
- Agent 4: Read `errors.ts` and `types.ts` to verify type definitions

### Phase 2: Analysis

Compile findings from all subagents and identify:
- Inaccuracies in the prompt
- Missing information
- Opportunities for optimization

### Phase 3: Revision

Edit the `DOCGEN_PACKAGE_NAME_SUPPORT_PROMPT.md` file with improvements.

### Phase 4: Validation

Ensure the revised prompt:
- Is internally consistent
- Matches the actual codebase
- Follows prompt engineering best practices
- Would enable successful implementation

---

## Success Criteria

Your review is complete when:

1. All line numbers in the prompt match the actual source files
2. All code examples match the actual codebase patterns
3. The prompt is free of ambiguity
4. Redundant information has been removed
5. Missing critical information has been added
6. The prompt is optimized for an implementation agent's context window
7. The file has been updated with your improvements

---

## Notes

- **Do not implement the feature** - Only review and improve the prompt
- **Use subagents** to parallelize file reading and save your context
- **Be conservative with removals** - Only remove truly redundant content
- **Test your changes** - Re-read the prompt after editing to ensure coherence
