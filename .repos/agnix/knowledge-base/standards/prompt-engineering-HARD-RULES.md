# Config Prompt Engineering - Hard Rules

**Status**: Research-backed anti-patterns and proven failure modes
**Last Updated**: 2026-01-31
**Sources**: 15+ research papers, official documentation, empirical studies

This document contains ONLY research-backed findings with empirical evidence. These are not opinions—these are measured failure modes and proven patterns.

---

## 1. Position Effects (Lost in the Middle)

**PROVEN FINDING**: Information position significantly affects model recall and performance in long contexts.

### The Effect
- Performance is **highest** when relevant information appears at the **beginning or end** of input
- Performance **significantly degrades** when models must access information in the **middle** of long contexts
- This effect persists even in models explicitly designed for long contexts

**Source**: Liu et al. (2023), "Lost in the Middle: How Language Models Use Long Contexts," TACL
- Tested on multi-document QA and key-value retrieval tasks
- Peer-reviewed and accepted by Transactions of the Association for Computational Linguistics

### Application to Agent Configs
```
❌ BAD: Critical constraints buried in middle of long config
✅ GOOD: Critical constraints at start or end of config
✅ GOOD: Most important instructions at beginning
✅ GOOD: Final reminders/constraints at end
```

---

## 2. Instruction Framing: Positive vs Negative

**PROVEN FINDING**: Positive instructions (what TO do) outperform negative instructions (what NOT to do).

### The Evidence
- Telling models what TO do generates superior results compared to listing prohibitions
- Negative framing ("don't do X") is empirically less effective than positive framing ("do Y")

**Sources**:
- Prompt Engineering Guide (promptingguide.ai) - "Focus on Do's, Not Don'ts"
- Learn Prompting documentation - Common mistakes identified across implementations
- Anthropic Claude 2.1 research - Positive instruction framing shown more effective

### Application to Agent Configs
```yaml
❌ BAD: "Don't use emojis"
✅ GOOD: "Use plain text without emojis"

❌ BAD: "Don't create files unless necessary"
✅ GOOD: "Edit existing files. Only create new files when explicitly requested."

❌ BAD: "Avoid being vague"
✅ GOOD: "Be specific and detailed"
```

---

## 3. Constraint Language Strength

**PROVEN FINDING**: Imperative constraint language shows stronger compliance than suggestive language.

### The Evidence
- Direct commands ("Write", "Classify", "Summarize") outperform suggestions
- Being "specific and precise" rather than describing what to avoid improves outcomes
- Vague or ambiguous requirements lead to inconsistent behavior

**Sources**:
- Prompt Engineering Guide - "Use Clear Instructions"
- Weng, Lilian (2023) - "Prompt Engineering" research compilation
- Multiple instruction-tuning papers showing natural language instructions work best when imperative

### Application to Agent Configs
```yaml
❌ WEAK: "You should avoid creating files"
❌ WEAK: "Try to edit existing files"
❌ WEAK: "It would be better to..."

✅ STRONG: "Edit existing files"
✅ STRONG: "Do not create new files"
✅ STRONG: "Use absolute paths"
✅ STRONG: "Always read files before editing"
```

**Hierarchy of Strength** (measured effectiveness):
1. MUST / NEVER / ALWAYS (strongest)
2. Imperative commands (Edit, Use, Read)
3. Should / Could (weaker)
4. Consider / Try to (weakest)

---

## 4. Instruction Clarity and Specificity

**PROVEN FINDING**: Descriptive, detailed prompts significantly outperform vague ones.

### The Evidence
- "The more descriptive and detailed the prompt is, the better the results"
- Specific prompts with examples outperform generic instructions
- Being direct outperforms being "clever" with instructions

**Sources**:
- Prompt Engineering Guide - "Prioritize Specificity"
- Liu et al. (2021) - Instruction tuning research showing natural language instructions require specificity
- Zhao et al. (2021) - Few-shot learning research showing example quality matters

### Application to Agent Configs
```yaml
❌ VAGUE: "Be careful with files"
✅ SPECIFIC: "Always read files before editing. Verify file paths exist before writing."

❌ VAGUE: "Handle errors well"
✅ SPECIFIC: "If a command fails, capture the error message, analyze the cause, and provide a fix."

❌ VAGUE: "Use good judgment"
✅ SPECIFIC: "Edit existing files instead of creating new ones. Only create files when explicitly requested by the user."
```

---

## 5. Example Ordering Bias (Few-Shot Learning)

**PROVEN FINDING**: Example order significantly affects performance in unpredictable ways.

### The Evidence
Three documented biases in few-shot prompting:
1. **Majority label bias**: Unbalanced label distribution affects predictions
2. **Recency bias**: Models favor patterns from final examples
3. **Common token bias**: Models prefer frequent tokens over rare ones

**CRITICAL**: "Increasing model sizes or including more training examples does not reduce variance among different permutations"

**Sources**:
- Zhao et al. (2021) - "Calibrate Before Use: Improving Few-Shot Performance of Language Models"
- Weng, Lilian (2023) - Comprehensive prompt engineering research compilation

### Application to Agent Configs
```yaml
✅ GOOD: Place most important examples first (but test variations)
✅ GOOD: Balance example types (not all edge cases, include common cases)
✅ GOOD: Be aware order matters—test different orderings
❌ BAD: Assuming more examples always helps
❌ BAD: Placing all negative examples together at the end
```

---

## 6. Chain-of-Thought Effectiveness Constraints

**PROVEN FINDING**: CoT is NOT universally beneficial—it helps complex tasks but can harm simple ones.

### The Evidence
- CoT benefits are pronounced for **complex reasoning tasks** with **larger models** (50B+ parameters)
- Simple tasks show **minimal or no improvement** with CoT
- CoT with only complex examples performs **poorly on simple questions**
- Nonfactual explanations in prompts "most likely lead to incorrect predictions"

**Sources**:
- Wei et al. (2022) - "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models"
- Weng, Lilian (2023) - CoT analysis and effectiveness boundaries

### Application to Agent Configs
```yaml
✅ GOOD: Use CoT for complex reasoning (debugging, architecture decisions)
❌ BAD: Forcing step-by-step reasoning for simple file operations
✅ GOOD: "Analyze the error and determine the root cause before fixing"
❌ BAD: "Think step-by-step: 1) Look at file 2) Read file 3) Edit file" (unnecessary for simple tasks)
```

---

## 7. Instruction Length vs Effectiveness

**PROVEN FINDING**: Relevant detail improves performance, but unnecessary information does not.

### The Evidence
- Including relevant details improves results
- Unnecessary information does NOT improve results
- Balance detail with length—focus on task-relevant context only

**Sources**:
- Prompt Engineering Guide - "Balance Detail with Length"
- Instruction tuning research - More diverse tasks improve performance, but irrelevant tasks do not

### Application to Agent Configs
```yaml
❌ BAD: Long backstory about why the agent exists
❌ BAD: Philosophical explanations about AI behavior
✅ GOOD: Direct, task-relevant instructions
✅ GOOD: Context that affects decision-making
✅ GOOD: Specific examples of desired behavior
```

---

## 8. Instruction Separation and Structure

**PROVEN FINDING**: Clear separation between instructions, context, and input improves performance.

### The Evidence
- Using separators (like "###") to distinguish instructions from context improves results
- Placing instructions at the prompt's beginning increases effectiveness
- Four core elements work best when separated: Instruction, Context, Input Data, Output Indicator

**Sources**:
- Prompt Engineering Guide - "Elements of a Prompt"
- Prompt Engineering Guide - "Use Clear Instructions"

### Application to Agent Configs
```yaml
✅ GOOD: Use clear sections
---
# Instructions
Edit existing files. Only create new files when explicitly requested.

# Context
You are working in a git repository at /path/to/repo

# Output Format
Respond with file paths and explanations.
---

❌ BAD: Mixed instructions and context in a single paragraph
```

---

## 9. Claude-Specific: Long Context Reluctance

**PROVEN EMPIRICAL FINDING**: Claude exhibits reluctance when answering from isolated sentences in long contexts.

### The Evidence
- Accuracy: **27% → 98%** with single prompt modification
- Adding "Here is the most relevant sentence in the context:" dramatically improved performance
- Claude 2.1 shows 30% fewer incorrect answers vs Claude 2.0
- 3-4x lower rate of false claims
- Near-complete fidelity across 200K token window with corrected prompt

**Source**: Anthropic (2023) - "Claude 2.1 Long Context Prompting"

### Application to Agent Configs
```yaml
✅ GOOD: "Locate the relevant configuration section, then apply the rule"
✅ GOOD: "First identify the instruction that applies, then follow it"
❌ BAD: Expecting Claude to reference deeply buried rules without explicit retrieval instruction
```

---

## 10. Adversarial Prompt Injection Vulnerabilities

**PROVEN FINDING**: Instruction-following models are inherently susceptible to prompt injection.

### The Evidence
- Simple warnings don't reliably prevent prompt injection
- Treating all prompt components identically creates vulnerabilities (similar to SQL injection)
- "There is no clear guidelines how to achieve" robust defense against prompt injection
- Over-reliance on instruction-tuned models increases vulnerability

**Sources**:
- Prompt Engineering Guide - "Adversarial Prompting"
- Ongoing research showing no foolproof mitigation exists

### Application to Agent Configs
```yaml
✅ GOOD: Parameterize inputs separately from instructions (when possible)
✅ GOOD: Use fine-tuned models for security-critical tasks
✅ GOOD: Add protective language but don't rely on it alone
❌ BAD: Assuming warnings alone prevent manipulation
❌ BAD: No separation between user input and system instructions
```

---

## 11. Few-Shot Learning Requirements

**PROVEN FINDING**: Choice of format, examples, and order dramatically affects performance.

### The Evidence
- Example quality matters more than quantity
- K-NN clustering with semantic similarity improves example selection
- Diverse, representative examples outperform homogeneous ones
- "Choice of prompt format, training examples, and the order of the examples can lead to dramatically different performance"

**Sources**:
- Weng, Lilian (2023) - Few-shot learning research compilation
- Multiple papers on example selection strategies

### Application to Agent Configs
```yaml
✅ GOOD: Include diverse examples (simple and complex)
✅ GOOD: Select semantically similar examples to the task
❌ BAD: Only showing edge cases
❌ BAD: Random example selection
❌ BAD: All examples following the same pattern
```

---

## 12. Instruction vs Fine-Tuning Tradeoffs

**PROVEN FINDING**: Natural language instructions enable zero-shot generalization but have limitations.

### The Evidence
- Instruction-tuned models (137B FLAN) outperformed larger models (175B GPT-3) on many tasks
- Number of finetuning datasets, model scale, and natural language format are critical
- Instruction tuning enables "unseen task" performance without task-specific training
- But: Instruction-following models are more vulnerable to adversarial attacks than fine-tuned or few-shot approaches

**Sources**:
- Wei et al. (2021) - "Finetuned Language Models Are Zero-Shot Learners" (FLAN paper)
- Learn Prompting - "The Turking Test: Can Language Models Understand Instructions?"

### Application to Agent Configs
```yaml
✅ GOOD: Natural language instructions work best for general-purpose agents
✅ GOOD: Use instruction-following for diverse, unseen tasks
⚠️ TRADEOFF: More vulnerable to prompt injection than fine-tuned alternatives
⚠️ TRADEOFF: May not match specialized fine-tuned models on narrow tasks
```

---

## 13. Retrieval Performance in Augmented LMs

**PROVEN FINDING**: External knowledge retrieval improves performance, but has documented limitations.

### The Evidence
- External retrieval helps with questions beyond training cutoff dates
- However: "Despite LM has access to latest information via Google Search, its performance on post-2020 questions are still a lot worse than on pre-2020 questions"
- Internal retrieval (self-generating knowledge before answering) also proves beneficial

**Sources**:
- Weng, Lilian (2023) - "Augmented Language Models" section
- Multiple RAG effectiveness studies

### Application to Agent Configs
```yaml
✅ GOOD: Provide relevant context explicitly in the config
✅ GOOD: Use internal retrieval patterns ("First check X, then do Y")
⚠️ LIMITATION: External retrieval doesn't fully solve knowledge gaps
❌ BAD: Assuming retrieval makes all information equally accessible
```

---

## Summary: Hard Rules for Agent Configs

### DO (Empirically Proven Effective)
1. **Position critical instructions at start or end** (not middle)
2. **Use positive framing** ("do X" not "don't do Y")
3. **Use imperative constraint language** (MUST/NEVER/ALWAYS)
4. **Be specific and detailed** (outperforms vague instructions)
5. **Separate instructions from context** (use clear structure)
6. **Place instructions at the beginning** of sections
7. **Use few-shot examples with diversity** (not all edge cases)
8. **Test example ordering** (it matters unpredictably)
9. **Use CoT for complex reasoning only** (not simple tasks)
10. **Include only relevant context** (more ≠ better)

### DON'T (Empirically Proven Ineffective)
1. **Don't bury critical info in the middle** (lost in the middle effect)
2. **Don't use negative framing** ("avoid X" is weaker than "do Y")
3. **Don't use suggestive language** ("should", "try to" is weaker)
4. **Don't be vague or ambiguous** (measured performance drop)
5. **Don't mix instructions and context** (reduces effectiveness)
6. **Don't use CoT for simple tasks** (no benefit, potential harm)
7. **Don't rely on warnings alone** (adversarial vulnerability)
8. **Don't assume more examples always helps** (quality > quantity)
9. **Don't place unbalanced examples** (creates biases)
10. **Don't include irrelevant context** (doesn't improve results)

---

## Research Sources

1. Liu et al. (2023) - "Lost in the Middle: How Language Models Use Long Contexts"
2. Wei et al. (2022) - "Chain-of-Thought Prompting Elicits Reasoning"
3. Wei et al. (2021) - "Finetuned Language Models Are Zero-Shot Learners" (FLAN)
4. Zhao et al. (2021) - "Calibrate Before Use: Improving Few-Shot Performance"
5. Zhou et al. (2022) - "Large Language Models Are Human-Level Prompt Engineers" (APE)
6. Anthropic (2023) - "Claude 2.1 Long Context Prompting"
7. Weng, Lilian (2023) - "Prompt Engineering" (comprehensive research compilation)
8. Prompt Engineering Guide (promptingguide.ai) - Multi-source aggregation
9. Learn Prompting documentation - Research-backed best practices
10. Efrat & Levy (2020) - "The Turking Test: Can Language Models Understand Instructions?"
11. Mishra et al. (2022) - Instruction interpretation research
12. OpenAI - Few-shot learning and instruction-following research
13. Anthropic Cookbook - Practical Claude implementation patterns
14. Multiple adversarial prompting vulnerability studies
15. RAG and retrieval-augmented LM effectiveness studies

---

**Note**: This document will be updated as new research provides quantitative evidence about prompt engineering effectiveness. Only findings with empirical backing will be included.
