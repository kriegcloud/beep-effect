---
name: pattern-identifier
description: Brief one-line description
event: PostToolUse
tool: (Edit|Write)
glob: "**/*.{ts,tsx}"
pattern: regex-pattern-to-match
action: context
level: warning
tag: suggestion-tag
---

# Pattern Name

Brief explanation of the pattern and why it matters.

```haskell
-- Type signatures
operation :: Input → Output Effect

-- Transformations
bad  :: A → B    -- what to avoid
good :: A → B    -- what to prefer
```

```haskell
-- Pattern examples
bad :: Example
bad = antipattern implementation

good :: Example
good = recommended implementation
```

Explanation of why the good pattern is better.

**When to use:**
- Condition 1
- Condition 2

**Exceptions:**
- When X is true
- Legacy code compatibility
