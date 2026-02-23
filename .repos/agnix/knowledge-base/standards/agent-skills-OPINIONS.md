# Agent Skills Standard - Best Practices & Opinions

> Recommendations, style guides, and community conventions. These are SHOULD/RECOMMENDED/CONSIDER statements that improve quality but won't break compatibility.

**Last Updated**: 2026-01-31
**Standard Version**: Agent Skills Specification (agentskills.io)
**Sources**: 10+ authoritative sources including official specs, SDK docs, API docs, and community implementations

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [Naming Conventions](#naming-conventions)
3. [Description Writing](#description-writing)
4. [Structure and Organization](#structure-and-organization)
5. [Progressive Disclosure Patterns](#progressive-disclosure-patterns)
6. [Content Guidelines](#content-guidelines)
7. [Workflow Patterns](#workflow-patterns)
8. [Code and Scripts](#code-and-scripts)
9. [Testing and Evaluation](#testing-and-evaluation)
10. [Performance Optimization](#performance-optimization)
11. [Community Patterns](#community-patterns)

---

## Core Principles

### Concise is Key
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: Be concise. The context window is a public good.

Your Skill shares the context window with:
- System prompt
- Conversation history
- Other Skills' metadata
- User requests

**Default assumption**: Claude is already very smart. Only add context Claude doesn't already have.

Challenge each piece of information:
- "Does Claude really need this explanation?"
- "Can I assume Claude knows this?"
- "Does this paragraph justify its token cost?"

**Good example** (approximately 50 tokens):
````markdown
## Extract PDF text

Use pdfplumber for text extraction:

```python
import pdfplumber

with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```
````

**Bad example** (approximately 150 tokens):
```markdown
## Extract PDF text

PDF (Portable Document Format) files are a common file format that contains
text, images, and other content. To extract text from a PDF, you'll need to
use a library. There are many libraries available for PDF processing, but we
recommend pdfplumber because it's easy to use and handles most cases well...
```

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

### Set Appropriate Degrees of Freedom
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: Match the level of specificity to the task's fragility and variability.

**Analogy**: Think of Claude as a robot exploring a path:
- **Narrow bridge with cliffs**: Only one safe way forward → Provide specific guardrails and exact instructions (low freedom)
- **Open field with no hazards**: Many paths lead to success → Give general direction and trust Claude (high freedom)

**High freedom** (text-based instructions):
Use when:
- Multiple approaches are valid
- Decisions depend on context
- Heuristics guide the approach

**Medium freedom** (pseudocode or scripts with parameters):
Use when:
- A preferred pattern exists
- Some variation is acceptable
- Configuration affects behavior

**Low freedom** (specific scripts, few/no parameters):
Use when:
- Operations are fragile and error-prone
- Consistency is critical
- A specific sequence must be followed

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

### Test with All Models You Plan to Use
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: Skills act as additions to models, so effectiveness depends on the underlying model.

Test with all models you plan to use:
- **Claude Haiku** (fast, economical): Does the Skill provide enough guidance?
- **Claude Sonnet** (balanced): Is the Skill clear and efficient?
- **Claude Opus** (powerful reasoning): Does the Skill avoid over-explaining?

What works perfectly for Opus might need more detail for Haiku.

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

## Naming Conventions

### Use Gerund Form
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: Use gerund form (verb + -ing) for Skill names, as this clearly describes the activity or capability.

**Good naming examples**:
- `processing-pdfs`
- `analyzing-spreadsheets`
- `managing-databases`
- `testing-code`
- `writing-documentation`

**Acceptable alternatives**:
- Noun phrases: `pdf-processing`, `spreadsheet-analysis`
- Action-oriented: `process-pdfs`, `analyze-spreadsheets`

**Avoid**:
- Vague names: `helper`, `utils`, `tools`
- Overly generic: `documents`, `data`, `files`
- Inconsistent patterns within your skill collection

**Benefits of consistent naming**:
- Easier to reference in documentation
- Understand what a Skill does at a glance
- Organize and search through multiple Skills
- Maintain professional, cohesive skill library

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

## Description Writing

### Write in Third Person
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: ALWAYS write descriptions in third person.

The description is injected into the system prompt, and inconsistent point-of-view can cause discovery problems.

- **Good**: "Processes Excel files and generates reports"
- **Avoid**: "I can help you process Excel files"
- **Avoid**: "You can use this to process Excel files"

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

### Be Specific and Include Key Terms
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: Include both what the Skill does AND specific triggers/contexts for when to use it.

The description is critical for skill selection. Claude uses it to choose the right Skill from potentially 100+ available Skills.

**Effective examples**:

```yaml
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
```

```yaml
description: Analyze Excel spreadsheets, create pivot tables, generate charts. Use when analyzing Excel files, spreadsheets, tabular data, or .xlsx files.
```

```yaml
description: Generate descriptive commit messages by analyzing git diffs. Use when the user asks for help writing commit messages or reviewing staged changes.
```

**Avoid vague descriptions**:
```yaml
description: Helps with documents  # Too vague
description: Processes data         # Too generic
description: Does stuff with files  # Unclear
```

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

### Should Describe What AND When
**Source**: https://agentskills.io/specification

**RECOMMENDATION**: The description should describe both:
1. What the skill does
2. When to use it

This helps agents identify relevant tasks for skill activation.

**Source**: https://agentskills.io/specification

---

## Structure and Organization

### Keep SKILL.md Under 500 Lines
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: Keep SKILL.md body under 500 lines for optimal performance.

Target: < 5000 tokens recommended for instructions section.

When content approaches this limit, split it into separate files using progressive disclosure patterns.

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

### Recommended Sections
**Source**: https://agentskills.io/specification

**RECOMMENDATION**: Include these sections in your SKILL.md body:
- Step-by-step instructions
- Examples of inputs and outputs
- Common edge cases

Consider splitting longer content into referenced files.

**Source**: https://agentskills.io/specification

---

### Optional Directory Structure
**Source**: https://agentskills.io/specification

**RECOMMENDATION**: Use these optional directories as needed:

```
skill-name/
├── SKILL.md
├── scripts/          # Executable code
├── references/       # Additional documentation
└── assets/           # Static resources
```

**scripts/**: Contains executable code
- Should be self-contained or clearly document dependencies
- Include helpful error messages
- Handle edge cases gracefully

**references/**: Contains additional documentation
- `REFERENCE.md` - Detailed technical reference
- `FORMS.md` - Form templates or structured data formats
- Domain-specific files (`finance.md`, `legal.md`, etc.)

**assets/**: Contains static resources
- Templates (document templates, configuration templates)
- Images (diagrams, examples)
- Data files (lookup tables, schemas)

**Source**: https://agentskills.io/specification

---

### Keep Reference Files Focused
**Source**: https://agentskills.io/specification

**RECOMMENDATION**: Keep individual reference files focused.

Agents load these on demand, so smaller files mean less use of context.

**Source**: https://agentskills.io/specification

---

## Progressive Disclosure Patterns

### Pattern 1: High-Level Guide with References
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: Use SKILL.md as an overview that points to detailed materials.

````markdown
---
name: pdf-processing
description: Extracts text and tables from PDF files...
---

# PDF Processing

## Quick start

Extract text with pdfplumber:
```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

## Advanced features

**Form filling**: See [FORMS.md](FORMS.md) for complete guide
**API reference**: See [REFERENCE.md](REFERENCE.md) for all methods
**Examples**: See [EXAMPLES.md](EXAMPLES.md) for common patterns
````

Claude loads FORMS.md, REFERENCE.md, or EXAMPLES.md only when needed.

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

### Pattern 2: Domain-Specific Organization
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: For Skills with multiple domains, organize content by domain to avoid loading irrelevant context.

```
bigquery-skill/
├── SKILL.md (overview and navigation)
└── reference/
    ├── finance.md (revenue, billing metrics)
    ├── sales.md (opportunities, pipeline)
    ├── product.md (API usage, features)
    └── marketing.md (campaigns, attribution)
```

When a user asks about sales metrics, Claude only needs to read sales-related schemas.

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

### Pattern 3: Conditional Details
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: Show basic content, link to advanced content.

```markdown
# DOCX Processing

## Creating documents

Use docx-js for new documents. See [DOCX-JS.md](DOCX-JS.md).

## Editing documents

For simple edits, modify the XML directly.

**For tracked changes**: See [REDLINING.md](REDLINING.md)
**For OOXML details**: See [OOXML.md](OOXML.md)
```

Claude reads REDLINING.md or OOXML.md only when the user needs those features.

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

### Table of Contents for Long Files
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: For reference files longer than 100 lines, include a table of contents at the top.

This ensures Claude can see the full scope even when previewing with partial reads.

```markdown
# API Reference

## Contents
- Authentication and setup
- Core methods (create, read, update, delete)
- Advanced features (batch operations, webhooks)
- Error handling patterns
- Code examples

## Authentication and setup
...
```

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

## Content Guidelines

### Avoid Time-Sensitive Information
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: Don't include information that will become outdated.

**Bad example**:
```markdown
If you're doing this before August 2025, use the old API.
After August 2025, use the new API.
```

**Good example** (use "old patterns" section):
```markdown
## Current method

Use the v2 API endpoint: `api.example.com/v2/messages`

## Old patterns

<details>
<summary>Legacy v1 API (deprecated 2025-08)</summary>

The v1 API used: `api.example.com/v1/messages`

This endpoint is no longer supported.
</details>
```

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

### Use Consistent Terminology
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: Choose one term and use it throughout the Skill.

**Good - Consistent**:
- Always "API endpoint"
- Always "field"
- Always "extract"

**Bad - Inconsistent**:
- Mix "API endpoint", "URL", "API route", "path"
- Mix "field", "box", "element", "control"
- Mix "extract", "pull", "get", "retrieve"

Consistency helps Claude understand and follow instructions.

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

### Avoid Offering Too Many Options
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: Don't present multiple approaches unless necessary.

````markdown
**Bad example**:
"You can use pypdf, or pdfplumber, or PyMuPDF, or pdf2image, or..."

**Good example**:
"Use pdfplumber for text extraction:
```python
import pdfplumber
```

For scanned PDFs requiring OCR, use pdf2image with pytesseract instead."
````

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

## Workflow Patterns

### Use Workflows for Complex Tasks
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: Break complex operations into clear, sequential steps.

For particularly complex workflows, provide a checklist that Claude can copy and check off.

**Example workflow with checklist**:

````markdown
## Research synthesis workflow

Copy this checklist and track your progress:

```
Research Progress:
- [ ] Step 1: Read all source documents
- [ ] Step 2: Identify key themes
- [ ] Step 3: Cross-reference claims
- [ ] Step 4: Create structured summary
- [ ] Step 5: Verify citations
```

**Step 1: Read all source documents**
Review each document in the `sources/` directory...

**Step 2: Identify key themes**
Look for patterns across sources...
````

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

### Implement Feedback Loops
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: Common pattern: Run validator → fix errors → repeat

This pattern greatly improves output quality.

**Example**:
```markdown
## Document editing process

1. Make your edits to `word/document.xml`
2. **Validate immediately**: `python ooxml/scripts/validate.py unpacked_dir/`
3. If validation fails:
   - Review the error message carefully
   - Fix the issues in the XML
   - Run validation again
4. **Only proceed when validation passes**
5. Rebuild: `python ooxml/scripts/pack.py unpacked_dir/ output.docx`
```

The validation loop catches errors early.

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

### Conditional Workflow Pattern
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: Guide Claude through decision points.

```markdown
## Document modification workflow

1. Determine the modification type:

   **Creating new content?** → Follow "Creation workflow" below
   **Editing existing content?** → Follow "Editing workflow" below

2. Creation workflow:
   - Use docx-js library
   - Build document from scratch
   - Export to .docx format

3. Editing workflow:
   - Unpack existing document
   - Modify XML directly
   - Validate after each change
   - Repack when complete
```

**Tip**: If workflows become large or complicated, consider pushing them into separate files.

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

## Code and Scripts

### Solve, Don't Punt
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: When writing scripts for Skills, handle error conditions rather than punting to Claude.

**Good example**:
```python
def process_file(path):
    """Process a file, creating it if it doesn't exist."""
    try:
        with open(path) as f:
            return f.read()
    except FileNotFoundError:
        print(f"File {path} not found, creating default")
        with open(path, 'w') as f:
            f.write('')
        return ''
    except PermissionError:
        print(f"Cannot access {path}, using default")
        return ''
```

**Bad example**:
```python
def process_file(path):
    # Just fail and let Claude figure it out
    return open(path).read()
```

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

### Self-Documenting Constants
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: Configuration parameters should be justified to avoid "voodoo constants".

**Good example**:
```python
# HTTP requests typically complete within 30 seconds
# Longer timeout accounts for slow connections
REQUEST_TIMEOUT = 30

# Three retries balances reliability vs speed
# Most intermittent failures resolve by the second retry
MAX_RETRIES = 3
```

**Bad example**:
```python
TIMEOUT = 47  # Why 47?
RETRIES = 5   # Why 5?
```

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

### Provide Utility Scripts
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: Even if Claude could write a script, pre-made scripts offer advantages:

**Benefits**:
- More reliable than generated code
- Save tokens (no need to include code in context)
- Save time (no code generation required)
- Ensure consistency across uses

**Important distinction**: Make clear whether Claude should:
- **Execute the script** (most common)
- **Read it as reference** (for complex logic)

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

### Use Visual Analysis
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: When inputs can be rendered as images, have Claude analyze them.

````markdown
## Form layout analysis

1. Convert PDF to images:
   ```bash
   python scripts/pdf_to_images.py form.pdf
   ```

2. Analyze each page image to identify form fields
3. Claude can see field locations and types visually
````

Claude's vision capabilities help understand layouts and structures.

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

### Create Verifiable Intermediate Outputs
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: Use the "plan-validate-execute" pattern for complex tasks.

Have Claude first create a plan in a structured format, then validate that plan with a script before executing it.

**When to use**:
- Batch operations
- Destructive changes
- Complex validation rules
- High-stakes operations

**Why this pattern works**:
- Catches errors early
- Machine-verifiable
- Reversible planning
- Clear debugging

**Implementation tip**: Make validation scripts verbose with specific error messages.

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

### Package Dependencies
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: List required packages in your SKILL.md and verify they're available.

Different environments have different limitations:
- **claude.ai**: Can install packages from npm and PyPI
- **Anthropic API**: No network access, no runtime package installation

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

### MCP Tool References
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: If your Skill uses MCP tools, always use fully qualified tool names.

**Format**: `ServerName:tool_name`

**Example**:
```markdown
Use the BigQuery:bigquery_schema tool to retrieve table schemas.
Use the GitHub:create_issue tool to create issues.
```

Without the server prefix, Claude may fail to locate the tool.

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

### Avoid Assuming Tools are Installed
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: Don't assume packages are available.

````markdown
**Bad example**:
"Use the pdf library to process the file."

**Good example**:
"Install required package: `pip install pypdf`

Then use it:
```python
from pypdf import PdfReader
reader = PdfReader("file.pdf")
```"
````

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

## Testing and Evaluation

### Build Evaluations First
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: Create evaluations BEFORE writing extensive documentation.

This ensures your Skill solves real problems rather than documenting imagined ones.

**Evaluation-driven development**:
1. Identify gaps: Run Claude on tasks without a Skill, document failures
2. Create evaluations: Build three scenarios that test these gaps
3. Establish baseline: Measure performance without the Skill
4. Write minimal instructions: Create just enough to pass evaluations
5. Iterate: Execute evaluations, compare, and refine

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

### Develop Skills Iteratively with Claude
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: The most effective Skill development involves Claude itself.

Work with one instance ("Claude A") to create a Skill that will be used by other instances ("Claude B").

**Creating a new Skill**:
1. Complete a task without a Skill
2. Identify the reusable pattern
3. Ask Claude A to create a Skill
4. Review for conciseness
5. Improve information architecture
6. Test on similar tasks with Claude B
7. Iterate based on observation

**Iterating on existing Skills**:
1. Use the Skill in real workflows
2. Observe Claude B's behavior
3. Return to Claude A for improvements
4. Review suggestions
5. Apply and test changes
6. Repeat based on usage

**Why this works**: Claude A understands agent needs, you provide domain expertise, Claude B reveals gaps through real usage.

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

### Observe How Claude Navigates Skills
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: Pay attention to how Claude actually uses Skills in practice.

Watch for:
- Unexpected exploration paths
- Missed connections
- Overreliance on certain sections
- Ignored content

Iterate based on observations rather than assumptions.

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

## Performance Optimization

### Progressive Disclosure Token Economy
**Source**: https://agentskills.io/specification

**RECOMMENDATION**: Structure skills for efficient context usage:

1. **Metadata** (~100 tokens): Name and description loaded at startup
2. **Instructions** (< 5000 tokens recommended): Full SKILL.md loaded when activated
3. **Resources** (as needed): Files loaded only when required

Keep SKILL.md under 500 lines. Move detailed reference material to separate files.

**Source**: https://agentskills.io/specification

---

### File Organization for Discovery
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: Claude navigates your skill directory like a filesystem.

- Name files descriptively: `form_validation_rules.md`, not `doc2.md`
- Organize for discovery:
  - Good: `reference/finance.md`, `reference/sales.md`
  - Bad: `docs/file1.md`, `docs/file2.md`
- Bundle comprehensive resources (no context penalty until accessed)

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

### Version Management Strategy
**Source**: https://platform.claude.com/docs/en/docs/build-with-claude/skills-guide

**RECOMMENDATION**: Different strategies for production vs development.

**For production**:
```python
# Pin to specific versions for stability
container={
    "skills": [{
        "type": "custom",
        "skill_id": "skill_01AbCdEfGhIjKlMnOpQrStUv",
        "version": "1759178010641129"  # Specific version
    }]
}
```

**For development**:
```python
# Use latest for active development
container={
    "skills": [{
        "type": "custom",
        "skill_id": "skill_01AbCdEfGhIjKlMnOpQrStUv",
        "version": "latest"  # Always get newest
    }]
}
```

**Source**: https://platform.claude.com/docs/en/docs/build-with-claude/skills-guide

---

### Prompt Caching Considerations
**Source**: https://platform.claude.com/docs/en/docs/build-with-claude/skills-guide

**RECOMMENDATION**: Keep Skills list consistent across requests for better caching performance.

Changing the Skills list in your container breaks the cache.

**Source**: https://platform.claude.com/docs/en/docs/build-with-claude/skills-guide

---

### When to Use Multiple Skills
**Source**: https://platform.claude.com/docs/en/docs/build-with-claude/skills-guide

**RECOMMENDATION**: Combine Skills when tasks involve multiple document types or domains.

**Good use cases**:
- Data analysis (Excel) + presentation creation (PowerPoint)
- Report generation (Word) + export to PDF
- Custom domain logic + document generation

**Avoid**:
- Including unused Skills (impacts performance)

**Source**: https://platform.claude.com/docs/en/docs/build-with-claude/skills-guide

---

## Community Patterns

### Token Economy Standards
**Source**: https://github.com/HoangNguyen0403/agent-skills-standard

**RECOMMENDATION**: High-density instruction format.

- **Core density**: Maintain sub-70-line SKILL.md files (in some implementations)
- **Primary footprint**: Target < 500 tokens per skill
- **Measurement**: Character-based estimation

This is from community implementations that emphasize "40% more efficient than normal English."

**Source**: https://github.com/HoangNguyen0403/agent-skills-standard

---

### Modular Dependency Model
**Source**: https://github.com/HoangNguyen0403/agent-skills-standard

**RECOMMENDATION**: Skills function as versioned packages.

Categories contain individual skills, enabling granular inclusion/exclusion. Support:
- Relative paths (`bloc-state-management`)
- Absolute cross-category references (`react/hooks`)
- Glob patterns (`common/*`)

**Source**: https://github.com/HoangNguyen0403/agent-skills-standard

---

### Configuration via .skillsrc
**Source**: https://github.com/HoangNguyen0403/agent-skills-standard

**RECOMMENDATION**: YAML-based manifest for skill configuration.

Specifying:
- Registry URL
- Target agents
- Skill versions
- Exclusions
- Inclusions
- Protected overrides

**Source**: https://github.com/HoangNguyen0403/agent-skills-standard

---

## Common Patterns

### Template Pattern
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: Provide templates for output format. Match strictness to needs.

**For strict requirements**:
````markdown
## Report structure

ALWAYS use this exact template structure:

```markdown
# [Analysis Title]

## Executive summary
[One-paragraph overview]

## Key findings
- Finding 1 with supporting data
```
````

**For flexible guidance**:
````markdown
## Report structure

Here is a sensible default format, but use your best judgment:

```markdown
# [Analysis Title]
...
```

Adjust sections as needed for the specific analysis type.
````

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

### Examples Pattern
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: For Skills where output quality depends on examples, provide input/output pairs.

````markdown
## Commit message format

Generate commit messages following these examples:

**Example 1:**
Input: Added user authentication with JWT tokens
Output:
```
feat(auth): implement JWT-based authentication

Add login endpoint and token validation middleware
```

Follow this style: type(scope): brief description, then detailed explanation.
````

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

## Validation and Tooling

### Use Official Validation
**Source**: https://agentskills.io/specification

**RECOMMENDATION**: Use the skills-ref reference library to validate skills.

```bash
skills-ref validate ./my-skill
```

Checks frontmatter validity and naming conventions.

**Source**: https://agentskills.io/specification

---

### Generate Prompt XML
**Source**: https://agentskills.io/integrate-skills

**RECOMMENDATION**: Use skills-ref to generate prompt XML for agent integration.

```bash
skills-ref to-prompt <path>...
```

Generates properly formatted XML for system prompts.

**Source**: https://agentskills.io/integrate-skills

---

## Checklist for Effective Skills

### Before Sharing a Skill
**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

**RECOMMENDATION**: Verify these quality criteria:

#### Core quality
- [ ] Description is specific and includes key terms
- [ ] Description includes both what the Skill does and when to use it
- [ ] SKILL.md body is under 500 lines
- [ ] Additional details are in separate files (if needed)
- [ ] No time-sensitive information (or in "old patterns" section)
- [ ] Consistent terminology throughout
- [ ] Examples are concrete, not abstract
- [ ] File references are one level deep
- [ ] Progressive disclosure used appropriately
- [ ] Workflows have clear steps

#### Code and scripts
- [ ] Scripts solve problems rather than punt to Claude
- [ ] Error handling is explicit and helpful
- [ ] No "voodoo constants" (all values justified)
- [ ] Required packages listed and verified as available
- [ ] Scripts have clear documentation
- [ ] No Windows-style paths (all forward slashes)
- [ ] Validation/verification steps for critical operations
- [ ] Feedback loops for quality-critical tasks

#### Testing
- [ ] At least three evaluations created
- [ ] Tested with Haiku, Sonnet, and Opus
- [ ] Tested with real usage scenarios
- [ ] Team feedback incorporated (if applicable)

**Source**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

## Implementation-Specific Recommendations

### SDK Integration Patterns
**Source**: https://platform.claude.com/docs/en/agent-sdk/skills

**RECOMMENDATION**: When using the SDK:

1. Always configure `settingSources`/`setting_sources` to load Skills
2. Ensure `cwd` points to a directory containing `.claude/skills/`
3. Include `"Skill"` in `allowed_tools`
4. Test with realistic working directory paths

**Source**: https://platform.claude.com/docs/en/agent-sdk/skills

---

### Filesystem Location Best Practices
**Source**: https://platform.claude.com/docs/en/agent-sdk/skills

**RECOMMENDATION**: Use appropriate skill locations:

- **Project Skills** (`.claude/skills/`): Shared with team via git
- **User Skills** (`~/.claude/skills/`): Personal skills across all projects
- **Plugin Skills**: Bundled with installed plugins

Choose based on:
- Scope of use (project-specific vs personal)
- Sharing requirements (team vs individual)
- Maintenance ownership

**Source**: https://platform.claude.com/docs/en/agent-sdk/skills

---

### Error Handling Patterns
**Source**: https://platform.claude.com/docs/en/docs/build-with-claude/skills-guide

**RECOMMENDATION**: Handle Skill-related errors gracefully.

```python
try:
    response = client.beta.messages.create(...)
except anthropic.BadRequestError as e:
    if "skill" in str(e):
        print(f"Skill error: {e}")
        # Handle skill-specific errors
    else:
        raise
```

**Source**: https://platform.claude.com/docs/en/docs/build-with-claude/skills-guide

---

## Known Issues and Workarounds

### Specification Ambiguities
**Source**: https://github.com/agentskills/agentskills/issues

**RECOMMENDATION**: Be aware of these open issues:

- Inconsistent skill-to-skill invocation behavior between implementations (Issue #95)
- Reference file caching behavior unclear (Issue #97)
- Core skill structure documentation needs expansion (Issue #94)
- No standardized approach for skill-to-skill dependencies (Issue #100)
- Skill versioning/locking mechanisms not yet implemented (Issue #46)

**Source**: https://github.com/agentskills/agentskills/issues

---

### Feature Requests to Monitor
**Source**: https://github.com/agentskills/agentskills/issues

**RECOMMENDATION**: Track these proposed features:

- Support for namespaced skill names using forward slashes (Issue #109)
- Subdirectory support within skills (Issue #59)
- New frontmatter fields: `disable-model-invocation`, `model` preferences (Issues #102, #83)
- Secrets support (Issue #86)
- Progressive disclosure for tools (Issue #53)

**Source**: https://github.com/agentskills/agentskills/issues

---

## Summary of Recommendations

| Recommendation | Why It Matters | Source |
|----------------|----------------|--------|
| Keep SKILL.md under 500 lines | Context efficiency | best-practices |
| Use gerund form for names | Clarity and consistency | best-practices |
| Write descriptions in third person | Discovery reliability | best-practices |
| Include specific keywords in description | Skill selection accuracy | best-practices |
| Use progressive disclosure | Token efficiency | specification |
| Avoid time-sensitive info | Long-term maintainability | best-practices |
| Implement feedback loops | Output quality | best-practices |
| Test with all target models | Cross-model compatibility | best-practices |
| Build evaluations first | Real-world effectiveness | best-practices |
| Use consistent terminology | Instruction clarity | best-practices |
| Provide utility scripts | Reliability and efficiency | best-practices |
| Pin versions in production | Stability | skills-guide |
| Use latest in development | Rapid iteration | skills-guide |

---

## Version History

- **2026-01-31**: Initial comprehensive extraction from 10+ sources
  - Official specification (agentskills.io)
  - Claude API documentation
  - Agent SDK documentation
  - Best practices guide
  - GitHub issues and discussions
  - Community implementations

---

## References

### Primary Sources
1. **Specification**: https://agentskills.io/specification
2. **Best Practices**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
3. **What Are Skills**: https://agentskills.io/what-are-skills
4. **Integration Guide**: https://agentskills.io/integrate-skills
5. **API Skills Guide**: https://platform.claude.com/docs/en/docs/build-with-claude/skills-guide
6. **Agent SDK Skills**: https://platform.claude.com/docs/en/agent-sdk/skills
7. **GitHub Repository**: https://github.com/agentskills/agentskills
8. **Examples Repository**: https://github.com/anthropics/skills
9. **GitHub Issues**: https://github.com/agentskills/agentskills/issues
10. **Community Implementations**:
    - https://github.com/HoangNguyen0403/agent-skills-standard
    - https://github.com/QianjieTech/Open-ClaudeSkill

---

**Note**: This document contains recommendations and best practices. For hard requirements that will break compatibility, see `agent-skills-HARD-RULES.md`.
