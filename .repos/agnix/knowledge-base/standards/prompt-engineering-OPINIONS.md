# Config Prompt Engineering - Opinionated Best Practices

**Status**: Community wisdom, style guides, and recommendations
**Last Updated**: 2026-01-31
**Purpose**: Practical guidance beyond empirical evidence

This document contains best practices, style recommendations, and patterns that work well in practice but may not have rigorous empirical backing. These are informed opinions from documentation, community experience, and practical implementation.

---

## 1. Structural Patterns for Agent Configs

### Recommended Config Structure

```yaml
---
# 1. CRITICAL CONSTRAINTS (Top Priority)
# Most important rules that must never be violated

# 2. ROLE & PURPOSE
# What this agent does and why

# 3. BEHAVIORAL GUIDELINES
# How the agent should act in different situations

# 4. TOOL USAGE PATTERNS
# When and how to use specific tools

# 5. OUTPUT FORMATTING
# How to structure responses

# 6. EDGE CASES & EXAMPLES
# Specific scenarios and how to handle them

# 7. FINAL REMINDERS
# Critical constraints repeated for emphasis
---
```

**Rationale**:
- Starts with critical rules (position effect)
- Ends with reminders (position effect)
- Clear sections reduce cognitive load
- Examples near the end provide context after rules established

---

## 2. Writing Style Guidelines

### Use Active Voice and Imperatives

```yaml
❌ "Files should be read before editing"
✅ "Read files before editing"

❌ "It is recommended to use absolute paths"
✅ "Use absolute paths"

❌ "The agent ought to avoid creating files"
✅ "Edit existing files. Only create new files when explicitly requested."
```

**Rationale**: Shorter, clearer, more direct. Reduces ambiguity.

---

### Be Direct, Not Apologetic

```yaml
❌ "If possible, try to use the Edit tool"
✅ "Use the Edit tool for modifying existing files"

❌ "You might want to consider reading the file first"
✅ "Read the file first"

❌ "Please attempt to avoid creating unnecessary files"
✅ "Do not create files unless explicitly requested"
```

**Rationale**: Confidence reduces hedging, improves clarity.

---

### Avoid Meta-Commentary

```yaml
❌ "This is important: always read files first"
✅ "Always read files before editing"

❌ "Note that you should use absolute paths"
✅ "Use absolute paths"

❌ "Remember to check if the file exists"
✅ "Verify the file exists before reading"
```

**Rationale**: Meta-commentary adds noise without adding information.

---

## 3. Constraint Language Hierarchy

### Recommended Vocabulary by Strength

**ABSOLUTE (Use for hard requirements)**
- MUST / MUST NOT
- NEVER / ALWAYS
- DO NOT / REQUIRED
- CRITICAL / ESSENTIAL

**STRONG (Use for important guidelines)**
- Use / Do not use
- Imperative commands (Read, Edit, Verify)
- Ensure / Guarantee

**MODERATE (Use for preferences)**
- Should / Should not
- Prefer / Avoid
- Typically / Generally

**WEAK (Use sparingly)**
- Could / Might
- Consider / Try to
- It's a good idea to

**Style Recommendation**: Use stronger language for critical constraints, moderate language for preferences. Avoid weak language entirely in agent configs.

---

## 4. Negative Instruction Conversion Patterns

### Pattern: Prohibition → Positive Action

```yaml
❌ "Don't create files"
✅ "Edit existing files"

❌ "Avoid using relative paths"
✅ "Use absolute paths"

❌ "Don't read files unnecessarily"
✅ "Read files only when needed to complete the task"

❌ "Never skip error checking"
✅ "Check for errors after every operation"
```

---

### Pattern: Multiple Negatives → Single Positive

```yaml
❌ "Don't use emojis, don't use informal language, don't use slang"
✅ "Use professional, technical language without emojis"

❌ "Don't create files, don't delete files, don't move files unless asked"
✅ "Only modify files when explicitly requested by the user"
```

**Rationale**: Easier to follow affirmative instructions than track multiple prohibitions.

---

## 5. XML Tag Usage for Claude

### Recommended Tag Patterns

**For Content Separation**
```xml
<instruction>
Edit existing files. Only create new files when explicitly requested.
</instruction>

<context>
Working directory: /path/to/project
Current branch: main
</context>

<examples>
<example>
User: "Update the README"
Action: Use Edit tool to modify existing README.md
</example>
</examples>
```

**For Structured Data**
```xml
<constraints>
<constraint priority="critical">Always read files before editing</constraint>
<constraint priority="high">Use absolute paths</constraint>
<constraint priority="medium">Prefer Edit over Write</constraint>
</constraints>
```

**For Multi-Part Instructions**
```xml
<workflow>
<step>1. Read the file to understand current content</step>
<step>2. Identify the specific changes needed</step>
<step>3. Use Edit tool with exact old_string and new_string</step>
<step>4. Verify the edit succeeded</step>
</workflow>
```

**Rationale**:
- XML tags create clear semantic boundaries
- Models trained on web data understand XML structure
- Reduces ambiguity about instruction scope
- Enables hierarchical information organization

---

### XML Tag Best Practices

**DO:**
- Use semantic tag names (`<instruction>`, `<example>`, `<constraint>`)
- Keep nesting shallow (2-3 levels max)
- Close all tags properly
- Use tags to separate different types of information

**DON'T:**
- Over-nest tags (confusing, harder to parse)
- Mix tagged and untagged sections inconsistently
- Use tags when simple separators (###) suffice
- Create deeply hierarchical structures

```yaml
❌ BAD: Over-nested
<config>
  <instructions>
    <file_operations>
      <reading>
        <requirement>Always read before editing</requirement>
      </reading>
    </file_operations>
  </instructions>
</config>

✅ GOOD: Flat structure
<file_operations>
- Always read files before editing
- Use Edit tool for modifications
- Verify edits succeed
</file_operations>
```

---

## 6. Example Selection and Placement

### Example Structure Recommendations

**1. Simple → Complex Progression**
```yaml
<examples>
  <example type="simple">
    Task: "Fix typo in README"
    Actions: Read README.md → Edit typo → Verify
  </example>

  <example type="moderate">
    Task: "Refactor function across multiple files"
    Actions: Grep for function → Read files → Edit each → Test
  </example>

  <example type="complex">
    Task: "Implement new feature with tests"
    Actions: [Multi-step workflow]
  </example>
</examples>
```

**Rationale**: Progression helps model understand increasing complexity patterns.

---

**2. Diverse Scenario Coverage**
```yaml
Include examples of:
- Common happy path (most frequent use case)
- Edge cases (boundary conditions)
- Error recovery (what to do when things fail)
- Multi-step workflows (complex tasks)
```

**Rationale**: Diversity improves generalization across task types.

---

**3. What-Not-To-Do Examples**
```yaml
<anti-patterns>
  <anti-pattern>
    ❌ BAD: Creating new file without checking if it exists
    ✅ GOOD: Use Glob to check for existing file, then Edit if found
  </anti-pattern>
</anti-patterns>
```

**Rationale**: Showing failures helps prevent common mistakes, but keep these brief (positive framing rule still applies).

---

## 7. Context Optimization

### What Context to Include

**INCLUDE:**
- **Working environment** (directory, git status, language/framework)
- **Available tools** (what capabilities exist)
- **Constraints** (what not to do, resource limits)
- **Output format** (how to structure responses)
- **Common scenarios** (typical tasks the agent handles)

**EXCLUDE:**
- **Philosophical explanations** (why AI works this way)
- **Meta-commentary** (about the prompt itself)
- **Redundant information** (saying the same thing multiple ways)
- **Backstory** (origin story of the agent)
- **Irrelevant details** (information that doesn't affect decisions)

---

### Context Placement Strategy

```yaml
# Pattern 1: Factual Context (Beginning)
Working directory: /path/to/repo
Available tools: Read, Edit, Write, Bash, Grep

# Pattern 2: Behavioral Context (Middle)
When editing files:
1. Always read first
2. Use Edit tool
3. Verify changes

# Pattern 3: Reminder Context (End)
Critical: Never create files unless explicitly requested.
```

**Rationale**: Factual info first, behavioral guidelines after, reminders at end.

---

## 8. Few-Shot Prompting Patterns

### Minimal Few-Shot (1-3 examples)
Use when the task is relatively straightforward.

```yaml
<examples>
  <example>
    User: "Fix the bug in auth.py"
    Thought: Need to read the file first to understand the bug
    Action: Read auth.py → Identify issue → Edit to fix → Verify
  </example>
</examples>
```

---

### Standard Few-Shot (4-7 examples)
Use for moderate complexity with multiple task types.

```yaml
<examples>
  <example>Simple file edit</example>
  <example>Multi-file refactor</example>
  <example>Search and replace</example>
  <example>Error recovery</example>
  <example>Complex workflow</example>
</examples>
```

---

### Rich Few-Shot (8+ examples)
Use for complex agents with many edge cases.

```yaml
<examples>
  # 3 simple examples
  # 3 moderate examples
  # 2 complex examples
  # 1-2 error recovery examples
</examples>
```

**Rationale**: Balance between coverage and prompt length. Too many examples increases cost without proportional benefit.

---

## 9. Chain-of-Thought Prompting Patterns

### When to Use CoT in Configs

**USE CoT for:**
- Debugging complex issues
- Architecture decision-making
- Multi-step planning
- Error diagnosis
- Tradeoff analysis

**DON'T USE CoT for:**
- Simple file operations
- Straightforward edits
- Basic commands
- Well-defined workflows

---

### CoT Framing Patterns

**Pattern 1: Explicit CoT Request**
```yaml
When debugging an issue:
1. Analyze the error message to understand the failure mode
2. Identify the root cause by examining related code
3. Propose a fix that addresses the root cause
4. Verify the fix resolves the issue
```

**Pattern 2: Implicit CoT Trigger**
```yaml
"Before implementing a solution, explain your reasoning"
"Analyze the codebase to determine the best approach"
```

**Pattern 3: Zero-Shot CoT**
```yaml
"Let's think step-by-step about the best way to implement this feature"
```

**Rationale**: Explicit workflows for complex tasks, implicit triggers for flexible reasoning.

---

## 10. Output Formatting Guidelines

### Structured Output Patterns

**Pattern 1: Markdown Formatting**
```yaml
Respond using this format:

## Analysis
[Your analysis here]

## Actions Taken
- Action 1
- Action 2

## Results
[Outcome description]
```

---

**Pattern 2: JSON Structured Output**
```yaml
Format responses as JSON:
{
  "analysis": "...",
  "actions": ["...", "..."],
  "files_modified": ["...", "..."],
  "next_steps": "..."
}
```

---

**Pattern 3: Minimal Output**
```yaml
For simple tasks, respond concisely:
- What you did
- What changed
- Any issues encountered
```

**Rationale**: Structure improves parsability, consistency, and downstream processing.

---

## 11. Error Handling and Recovery

### Recommended Error Handling Patterns

```yaml
When an operation fails:
1. Capture the complete error message
2. Identify the error type (syntax, permission, not found, etc.)
3. Determine the root cause
4. Attempt the appropriate recovery action:
   - File not found → Use Glob to locate correct file
   - Permission denied → Suggest user intervention
   - Syntax error → Fix and retry
5. If recovery fails, explain the issue to the user clearly
```

---

### Error Communication Patterns

```yaml
❌ BAD: "Something went wrong"
❌ BAD: "Error occurred, please fix"

✅ GOOD: "File not found: /path/to/file.py. Searching for similar files..."
✅ GOOD: "Permission denied for /etc/config. This file requires sudo access."
✅ GOOD: "Syntax error on line 42: missing closing parenthesis. Fixing..."
```

**Rationale**: Specific error messages enable better recovery and user understanding.

---

## 12. Iterative Refinement Patterns

### Recommended Workflow for Complex Tasks

```yaml
For complex multi-step tasks:

1. **Understand**: Read relevant files and gather context
2. **Plan**: Outline the approach before taking action
3. **Execute**: Perform changes incrementally
4. **Verify**: Check each step before proceeding
5. **Iterate**: Adjust based on results

Present progress updates at each major step.
```

**Rationale**: Breaking complex tasks into phases reduces errors and improves success rates.

---

## 13. Tool Usage Patterns

### Recommended Tool Selection Guidance

```yaml
Use this tool selection hierarchy:

1. **Read** - For viewing file contents
   - Use when you need to understand existing code
   - Always use before Edit

2. **Edit** - For modifying existing files
   - Preferred over Write for existing files
   - Requires exact old_string match

3. **Write** - For creating new files
   - Only when file doesn't exist
   - Only when explicitly requested

4. **Grep** - For searching code
   - Use instead of reading multiple files
   - Preferred over Bash grep

5. **Glob** - For finding files
   - Use instead of Bash find or ls
   - Returns sorted results

6. **Bash** - For system operations
   - Git operations
   - Build/test commands
   - System state checks
```

**Rationale**: Clear hierarchy reduces decision-making overhead and prevents tool misuse.

---

## 14. Git Workflow Patterns

### Recommended Git Operation Guidance

```yaml
When committing changes:
1. Run `git status` to see untracked and modified files
2. Run `git diff` to review staged changes
3. Run `git log` to understand commit message style
4. Draft a commit message following the repository's style
5. Stage relevant files with `git add`
6. Create commit with descriptive message
7. Run `git status` again to verify success

Commit message format:
- Start with verb (Add, Update, Fix, Remove, Refactor)
- Be concise (1-2 sentences)
- Focus on "why" not "what"
- Follow existing repository conventions

Never:
- Run git commands with -i flag (interactive not supported)
- Use --amend unless explicitly requested
- Force push to main/master without explicit user request
- Skip hooks (--no-verify) unless explicitly requested
```

**Rationale**: Consistent workflow prevents common Git mistakes.

---

## 15. Readability and Maintenance

### Config Readability Guidelines

**DO:**
- Use clear section headers
- Keep instructions concise (1-2 sentences each)
- Group related guidelines together
- Use bullet points for lists
- Add examples for complex concepts
- Use consistent terminology throughout

**DON'T:**
- Write paragraphs of prose
- Repeat the same instruction in multiple places
- Use inconsistent formatting
- Mix metaphors or analogies
- Include jokes or humor (adds noise)

---

### Maintenance-Friendly Patterns

```yaml
# GOOD: Versioned constraints with rationale
# v1.2 (2026-01-31): Added absolute path requirement due to directory reset issue
Use absolute paths, not relative paths.

# GOOD: Grouped related rules
File Operations:
- Always read before editing
- Use Edit for existing files
- Use Write only when creating new files

# BAD: Scattered, unversioned, no context
Use absolute paths.
[... 20 lines later ...]
Don't use relative paths.
```

**Rationale**: Well-organized configs are easier to debug, update, and understand.

---

## 16. Agent Personality and Tone

### Recommended Tone Patterns

**Professional and Direct**
```yaml
✅ "Edit the file using the Edit tool"
✅ "Read the file to understand the current implementation"
✅ "Use absolute paths for all file operations"
```

**Avoid:**
```yaml
❌ "Hey! Let's edit that file together!"
❌ "Oops, looks like we need to read the file first"
❌ "It would be super awesome if you could use absolute paths"
```

**Rationale**: Professional tone reduces noise and maintains focus on task execution.

---

### Confidence Without Overconfidence

```yaml
✅ "Edit the existing function to fix the bug"
✅ "If the edit fails, try using Write to replace the entire file"

❌ "I will definitely fix this perfectly"
❌ "This might work, but I'm not sure"
```

**Rationale**: Balanced confidence improves user trust without creating false expectations.

---

## 17. Multi-Agent Patterns

### Delegation Patterns

```yaml
When working with sub-agents:

1. **Delegate simple, well-defined tasks** to smaller/faster models
2. **Reserve complex reasoning** for larger models
3. **Provide clear instructions** to sub-agents
4. **Validate sub-agent outputs** before using them
5. **Aggregate results** from multiple agents coherently

Example:
- Use Haiku for simple file edits
- Use Sonnet for complex refactoring
- Use Opus for architecture decisions
```

**Rationale**: Optimizes cost and latency while maintaining quality.

---

## 18. Caching and Efficiency Patterns

### Prompt Caching Recommendations

```yaml
Structure prompts for caching:

1. **Static content at the beginning**
   - System instructions
   - Tool definitions
   - Unchanging context

2. **Dynamic content at the end**
   - User request
   - Current state
   - Recent history

This enables prefix caching to reduce costs.
```

**Rationale**: Proper structure enables caching systems to reuse computed prefixes.

---

## 19. Testing and Validation

### Recommended Config Testing Approach

```yaml
Test your agent config with:

1. **Simple tasks** (basic operations)
2. **Complex tasks** (multi-step workflows)
3. **Edge cases** (unusual inputs, errors)
4. **Failure recovery** (how agent handles errors)
5. **Boundary conditions** (limits of capability)

Track:
- Success rate by task type
- Common failure modes
- Average response time
- Token usage
```

**Rationale**: Systematic testing reveals config weaknesses before production use.

---

## 20. Anti-Patterns to Avoid

### Common Config Mistakes

**1. Over-Specification**
```yaml
❌ BAD: Telling the model every possible scenario
❌ BAD: 50+ examples covering every edge case
✅ GOOD: Core principles + representative examples
```

**2. Under-Specification**
```yaml
❌ BAD: "Be helpful"
❌ BAD: "Use tools wisely"
✅ GOOD: Specific, actionable instructions
```

**3. Contradictory Instructions**
```yaml
❌ BAD: "Always use Edit" ... [later] ... "Write is preferred"
✅ GOOD: Consistent, non-contradictory guidelines
```

**4. Anthropomorphization**
```yaml
❌ BAD: "You are a helpful AI assistant who loves coding"
✅ GOOD: "You are a code editing agent that modifies files"
```

**5. Unnecessary Backstory**
```yaml
❌ BAD: "In the beginning, there was Claude, and Claude was designed to..."
✅ GOOD: [Start with actual instructions]
```

---

## Summary: Opinionated Best Practices

### Config Structure
1. Critical constraints at top and bottom
2. Clear sections with semantic XML tags
3. Examples progress from simple to complex
4. Output format specified explicitly

### Writing Style
1. Active voice, imperative mood
2. Direct, confident, professional tone
3. No meta-commentary or fluff
4. Positive framing over negative

### Instruction Design
1. Specific and detailed over vague
2. Stronger constraint language for critical rules
3. Moderate language for preferences
4. Avoid weak, hedging language

### Tool Usage
1. Clear tool selection hierarchy
2. Specific guidance on when to use each tool
3. Error recovery patterns documented

### Examples
1. Diverse scenario coverage
2. Simple → complex progression
3. Quality over quantity
4. Include error recovery examples

### Maintenance
1. Version constraints with rationale
2. Group related rules together
3. Consistent terminology
4. Clear section organization

---

## Style Template

```yaml
---
name: Agent Name
version: 1.0
last_updated: 2026-01-31

# CRITICAL CONSTRAINTS
<constraints priority="critical">
- [Most important rule 1]
- [Most important rule 2]
- [Most important rule 3]
</constraints>

# ROLE
You are [specific role description].

# BEHAVIORAL GUIDELINES
<behavior>
When [situation]:
1. [Action 1]
2. [Action 2]
3. [Action 3]
</behavior>

# TOOL USAGE
<tool-usage>
- **Read**: [When to use]
- **Edit**: [When to use]
- **Write**: [When to use]
- **Grep**: [When to use]
- **Bash**: [When to use]
</tool-usage>

# OUTPUT FORMAT
Respond using this structure:
[Specify format]

# EXAMPLES
<examples>
<example type="simple">
[Example 1]
</example>

<example type="complex">
[Example 2]
</example>
</examples>

# FINAL REMINDERS
<reminders>
- [Critical constraint 1 repeated]
- [Critical constraint 2 repeated]
</reminders>
---
```

---

## Additional Resources

- **Anthropic Cookbook**: https://github.com/anthropics/anthropic-cookbook
- **Prompt Engineering Guide**: https://www.promptingguide.ai
- **Learn Prompting**: https://learnprompting.org
- **Lilian Weng's Blog**: https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/
- **DAIR.AI Guide**: https://github.com/dair-ai/Prompt-Engineering-Guide

---

**Note**: These are opinionated recommendations based on practical experience, community wisdom, and documented patterns. Test these approaches with your specific use case and iterate based on results. What works best may vary by model, task, and context.
