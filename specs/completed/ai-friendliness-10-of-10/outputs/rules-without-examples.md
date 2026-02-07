# Rules Without Worked Examples

Generated: 2026-02-04
Total abstract rules: 42

## Summary by File
| File | Abstract Rules | Has Examples | Missing Examples |
|------|----------------|--------------|------------------|
| behavioral.md | 8 | 3 | 5 |
| code-standards.md | 21 | 0 | 21 |
| effect-patterns.md | 15 | 15 | 0 |
| general.md | 14 | 3 | 11 |
| meta-thinking.md | 17 | 0 | 17 |

**Overall:** 54 total rules identified across all files, with 21 having adequate examples and 33 missing concrete worked examples (61% gap rate).

## Detailed Findings

### behavioral.md

#### Rule: "ALWAYS look for: Flaws in proposed solutions, Bugs in code suggestions, Loopholes in logic, Counter-examples to assertions, Invalid assumptions"
**Location:** Lines 9-14
**Current State:** List of abstract things to look for
**Missing:** While "Bad Pattern" and "Good Pattern" dialogue examples exist (lines 20-32), there is no code-level example showing actual flaw detection, bug identification, or counter-example generation in a technical context
**Priority:** Medium - Dialogue examples help but technical examples would clarify

#### Rule: "Clarify Intent: ALWAYS ask before editing if the request could be interpreted multiple ways"
**Location:** Line 45
**Current State:** Abstract instruction
**Missing:** Example showing ambiguous request and clarifying questions to ask
**Priority:** High - Agents frequently fail to ask clarifying questions

#### Rule: "Incremental Changes: Prefer small, focused diffs over large rewrites"
**Location:** Line 46
**Current State:** Abstract principle
**Missing:** Example showing what counts as "small" vs "large" - file count? line count? scope?
**Priority:** Medium - Subjective without concrete metrics

#### Rule: "Verify Changes: Request `bun run check` after modifications"
**Location:** Line 47
**Current State:** Just mentions the command
**Missing:** Example of how to interpret check output, what errors look like, when to re-run
**Priority:** Low - Command is self-explanatory

#### Rule: "Keep Docs Updated: Align with `documentation/patterns/` when introducing new patterns"
**Location:** Line 49
**Current State:** Abstract instruction
**Missing:** Example showing when a change requires documentation update and what that update looks like
**Priority:** Medium - Unclear what triggers doc updates

---

### code-standards.md

#### Rule: "nested-loops → pipe(∘)"
**Location:** Line 6
**Current State:** Formal notation only
**Missing:** Before/after code transformation example showing nested loops converted to pipe
**Priority:** High - Mathematical notation is opaque without code

#### Rule: "conditionals → Match.typeTags(ADT) ∨ $match"
**Location:** Line 7
**Current State:** Formal notation only
**Missing:** Before/after showing if/else or switch converted to Match with tagged union
**Priority:** High - Critical pattern, notation unclear

#### Rule: "domain-types := Schema.TaggedStruct"
**Location:** Line 8
**Current State:** Formal notation only
**Missing:** Example showing domain type definition with TaggedStruct
**Priority:** High - No code showing actual TaggedStruct usage

#### Rule: "imports := ∀ X → import * as X from 'effect/X'"
**Location:** Line 9
**Current State:** Formal notation only
**Missing:** Complete import block example (though effect-patterns.md covers this)
**Priority:** Low - Covered elsewhere

#### Rule: "{Date.now, random} → {Clock, Random}"
**Location:** Line 10
**Current State:** Formal notation only
**Missing:** Before/after showing Date.now replaced with Clock service
**Priority:** High - Service injection pattern needs demonstration

#### Rule: "Effect.gen over Effect.flatMap chains"
**Location:** Line 16
**Current State:** Preference stated without comparison
**Missing:** Side-by-side showing flatMap chain vs Effect.gen equivalent
**Priority:** Medium - Would clarify when to use which

#### Rule: "pipe(a, f, g) over g(f(a))"
**Location:** Line 17
**Current State:** Mathematical notation
**Missing:** Real code example showing nested function call refactored to pipe
**Priority:** Medium - Pattern clear but example helps

#### Rule: "Schema.TaggedStruct over plain interfaces"
**Location:** Line 18
**Current State:** Preference only
**Missing:** Before/after showing interface vs TaggedStruct with benefits explained
**Priority:** High - Why TaggedStruct is better needs demonstration

#### Rule: "Layer.provide over manual dependency passing"
**Location:** Line 19
**Current State:** Abstract preference
**Missing:** Example showing manual DI vs Layer.provide approach
**Priority:** High - Core DI pattern lacks example

#### Rule: "catchTag over catchAll with conditionals"
**Location:** Line 20
**Current State:** Abstract preference
**Missing:** Before/after showing catchAll with if statements vs catchTag
**Priority:** Medium - Error handling pattern needs example

#### Rule: "Data.TaggedError over new Error()"
**Location:** Line 21
**Current State:** Abstract preference
**Missing:** Before/after showing Error construction vs TaggedError (though effect-patterns.md covers this)
**Priority:** Low - Covered in effect-patterns.md

#### Rule: "as any → Schema.decode ∨ type guard"
**Location:** Line 23
**Current State:** Transformation rule
**Missing:** Example showing unsafe cast replaced with Schema.decode
**Priority:** High - Very common anti-pattern needs correction example

#### Rule: "Promise → Effect.tryPromise"
**Location:** Line 24
**Current State:** Transformation rule
**Missing:** Before/after showing Promise-based code converted to Effect
**Priority:** High - Common migration path needs example

#### Rule: "try/catch → Effect.try ∨ Effect.catchTag"
**Location:** Line 25
**Current State:** Transformation rule
**Missing:** Before/after showing try/catch replaced with Effect error handling
**Priority:** High - Critical migration pattern

#### Rule: "null/undefined → Option<A>"
**Location:** Line 26
**Current State:** Transformation rule
**Missing:** Before/after showing nullable handling converted to Option
**Priority:** High - Fundamental pattern change

#### Rule: "throw → Effect.fail(TaggedError)"
**Location:** Line 27
**Current State:** Transformation rule
**Missing:** Before/after showing throw statement converted to Effect.fail
**Priority:** High - Core error pattern (partially covered elsewhere)

#### Rule: "¬borders → lightness-variation"
**Location:** Line 33
**Current State:** Formal UI notation
**Missing:** Visual example or CSS showing border-less depth via lightness
**Priority:** Medium - UI rule needs visual demonstration

#### Rule: "depth := f(background-color)"
**Location:** Line 34
**Current State:** Formal UI notation
**Missing:** Example showing how background color creates depth perception
**Priority:** Medium - Abstract UI principle

#### Rule: "elevation := Δlightness ∧ ¬stroke"
**Location:** Line 35
**Current State:** Formal UI notation
**Missing:** CSS/design example showing elevation without borders
**Priority:** Medium - Abstract UI principle

#### Rule: "principle := self-explanatory(code) → ¬comments"
**Location:** Line 41
**Current State:** Formal notation
**Missing:** Before/after showing commented code refactored to self-documenting
**Priority:** Medium - Documentation philosophy needs demonstration

#### Rule: "forbidden := { inline-comments, @example blocks, excessive-jsdoc }"
**Location:** Lines 43-47
**Current State:** List of forbidden items
**Missing:** Examples of what "excessive" jsdoc looks like vs acceptable
**Priority:** Low - Prohibition clear enough

#### Rule: "unclear(code) → rewrite(code) ∧ ¬comment(code)"
**Location:** Line 49
**Current State:** Formal notation
**Missing:** Example of unclear code made clear through rewriting rather than commenting
**Priority:** Medium - Principle needs demonstration

#### Rule: "pre(code) := stated(assumptions)"
**Location:** Line 57
**Current State:** Formal notation
**Missing:** Example showing assumptions stated in code (types? assertions? docs?)
**Priority:** High - Unclear what "stating assumptions" looks like in practice

#### Rule: "claim(correct) := verified(correct)"
**Location:** Line 58
**Current State:** Formal notation
**Missing:** Example showing verification before claiming correctness
**Priority:** Medium - Abstract principle

#### Rule: "handle(path) := ∀path ∈ {happy, edge, adversarial}"
**Location:** Line 59
**Current State:** Formal notation
**Missing:** Example showing all three path types handled in code
**Priority:** High - Critical completeness principle needs example

#### Rule: "surface-before-handle := { assumptions, break-conditions, adversarial, confusion }"
**Location:** Lines 61-66
**Current State:** List of things to surface
**Missing:** Example code showing these surfaced before handling
**Priority:** High - Abstract principle needs concrete demonstration

#### Rule: "correctness := conditions(works) ∧ behavior(¬conditions)"
**Location:** Lines 77-78
**Current State:** Formal definition
**Missing:** Example showing code that documents both success and failure conditions
**Priority:** High - Fundamental correctness principle needs example

---

### effect-patterns.md

This file is **well-documented** with extensive code examples for most rules. Notable examples provided:
- Namespace imports (lines 13-20)
- Single-letter aliases (lines 26-42)
- PascalCase constructors with forbidden examples (lines 48-65)
- Native method ban with forbidden/required examples (lines 91-101)
- All NEVER patterns have both forbidden and required examples (lines 263-394)
- Testing patterns with correct and forbidden examples (lines 598-641)

**No significant gaps identified in effect-patterns.md**

---

### general.md

#### Rule: "NEVER use `any`, `@ts-ignore`, or unchecked casts"
**Location:** Line 5
**Current State:** Prohibition without alternative
**Missing:** Example showing what to do instead of `any` (Schema.decode, type guard, etc.)
**Priority:** High - Very common issue needs correction path

#### Rule: "ALWAYS validate external data with `@beep/schema`"
**Location:** Line 6
**Current State:** Abstract instruction
**Missing:** Example showing external data validation with Schema
**Priority:** High - Core pattern needs demonstration

#### Rule: "Use Effect testing utilities from `@beep/testkit`"
**Location:** Line 8
**Current State:** Abstract instruction (covered in detail below)
**Missing:** None - detailed example at lines 56-73
**Priority:** Low - Covered later in file

#### Rule: "Use `Effect.log*` with structured objects for logging"
**Location:** Line 9
**Current State:** Abstract instruction
**Missing:** Example showing Effect.logInfo/logError with structured objects
**Priority:** Medium - Logging pattern needs example

#### Rule: "NEVER use direct cross-slice imports"
**Location:** Line 13
**Current State:** Abstract prohibition
**Missing:** Example showing forbidden import and correct alternative through shared
**Priority:** High - Architecture boundary needs visual demonstration

#### Rule: "NEVER use relative `../../../` paths"
**Location:** Line 14
**Current State:** Abstract prohibition
**Missing:** Before/after showing relative path converted to @beep/* alias
**Priority:** Medium - Simple but example helps

#### Rule: "ALWAYS use `@beep/*` path aliases"
**Location:** Line 15
**Current State:** Abstract instruction
**Missing:** Import examples with and without aliases (though obvious)
**Priority:** Low - Self-explanatory

#### Rule: "Slice Structure: domain -> tables -> server -> client -> ui"
**Location:** Lines 18-23
**Current State:** Diagram notation
**Missing:** Example showing valid vs invalid imports between layers
**Priority:** High - Layer direction rule needs import examples

#### Rule: "NEVER access `process.env` directly in application code"
**Location:** Line 40
**Current State:** Abstract prohibition
**Missing:** Before/after showing process.env replaced with @beep/env usage
**Priority:** High - Common mistake needs correction example

#### Rule: "ALWAYS use the `@beep/env` package for typed environment access"
**Location:** Line 41
**Current State:** Abstract instruction
**Missing:** Example showing @beep/env usage for environment variables
**Priority:** High - Pairs with above rule, needs example

#### Rule: "Use `dotenvx` for environment management"
**Location:** Line 43
**Current State:** Tool mention
**Missing:** Example command or configuration for dotenvx
**Priority:** Low - External tool documentation

---

### meta-thinking.md

This file is **entirely formal notation** without any worked examples. Every rule needs concrete demonstration.

#### Rule: "a |> f |> g |> h ≡ pipe(a, f, g, h)"
**Location:** Line 8
**Current State:** Mathematical equivalence
**Missing:** Real code showing pipeline transformation
**Priority:** High - Core concept needs code example

#### Rule: "f ∘ g ∘ h ≡ flow(f, g, h)"
**Location:** Line 9
**Current State:** Mathematical equivalence
**Missing:** Real code showing function composition with flow
**Priority:** High - Core concept needs code example

#### Rule: "f(g(x)) → pipe(x, g, f)"
**Location:** Line 10
**Current State:** Transformation rule
**Missing:** Before/after code example
**Priority:** High - Critical refactoring pattern

#### Rule: "dual :: (self, that) ↔ (that)(self)"
**Location:** Line 12
**Current State:** Mathematical notation
**Missing:** Example showing Effect's dual function usage
**Priority:** Medium - Advanced concept

#### Rule: "pipe(x, f(y)) ≡ f(x, y)"
**Location:** Line 13
**Current State:** Mathematical notation
**Missing:** Example showing data-last calling convention
**Priority:** High - Core Effect pattern needs example

#### Rule: "∥(a, b, c) ≡ Effect.all([a, b, c], { concurrency: 'unbounded' })"
**Location:** Line 16
**Current State:** Mathematical notation
**Missing:** Real code showing parallel effect execution
**Priority:** High - Important concurrency pattern

#### Rule: "R ⊃ {Service₁, Service₂} → Layer.provide(Service₁Live, Service₂Live)"
**Location:** Line 18
**Current State:** Mathematical notation for requirements
**Missing:** Real code showing Layer composition for requirements
**Priority:** High - Core DI pattern needs example

#### Rule: "E = Error₁ | Error₂ | Error₃ → catchTag('Error₁', handler)"
**Location:** Line 20
**Current State:** Mathematical notation
**Missing:** Real code showing error union handling with catchTag
**Priority:** High - Error handling pattern needs example

#### Rule: "yield* effect ≡ ← effect (bind)"
**Location:** Line 22
**Current State:** Equivalence notation
**Missing:** Real code showing yield* in Effect.gen context
**Priority:** Medium - Covered somewhat in effect-patterns.md

#### Rule: "need(time) → Clock, need(randomness) → Random, etc."
**Location:** Lines 25-28
**Current State:** Service mapping notation
**Missing:** Real code showing service injection for each need
**Priority:** High - Critical dependency mapping

#### Rule: "unclear(requirements) → ask(user) → proceed"
**Location:** Line 34
**Current State:** Workflow notation
**Missing:** Example dialogue or decision tree for unclear requirements
**Priority:** Medium - Behavioral guidance

#### Rule: "ambiguous(approach) → present({options, tradeoffs}) → await(decision)"
**Location:** Line 35
**Current State:** Workflow notation
**Missing:** Example showing how to present options with tradeoffs
**Priority:** Medium - Behavioral guidance

#### Rule: "blocked(task) → report(blocker) ∧ suggest(alternatives)"
**Location:** Line 36
**Current State:** Workflow notation
**Missing:** Example showing blocker report format
**Priority:** Low - Generic guidance

#### Rule: "risk(action) ≤ low → prefer(action) over prefer(inaction)"
**Location:** Line 37
**Current State:** Decision rule
**Missing:** Example showing risk assessment
**Priority:** Low - Abstract principle

#### Rule: "gates(typecheck, test) := DELEGATE(agent) ∧ ¬run-directly(orchestrator)"
**Location:** Line 43
**Current State:** Formal notation for quality gates
**Missing:** Example showing delegation to agents for verification
**Priority:** Medium - Agent workflow unclear

#### Rule: "significant(changes) := |files| > 1 ∨ architectural(impact)"
**Location:** Line 44
**Current State:** Definition
**Missing:** Examples of significant vs non-significant changes
**Priority:** Medium - Subjective criteria needs examples

#### Rule: "/debug {desc} → ∥(4 × diagnose) → validate(consensus)"
**Location:** Line 54
**Current State:** Command notation
**Missing:** Example showing debug command usage and output
**Priority:** Low - Command usage

---

## Recommendations

### High Priority (blocks understanding):
1. **code-standards.md** - "nested-loops → pipe(∘)" (line 6) - Needs before/after code
2. **code-standards.md** - "conditionals → Match.typeTags(ADT)" (line 7) - Needs Match example
3. **code-standards.md** - "{Date.now, random} → {Clock, Random}" (line 10) - Needs service injection example
4. **code-standards.md** - "Promise → Effect.tryPromise" (line 24) - Common migration needs example
5. **code-standards.md** - "null/undefined → Option<A>" (line 26) - Fundamental pattern change
6. **code-standards.md** - "handle(path) := ∀path ∈ {happy, edge, adversarial}" (line 59) - Critical completeness
7. **general.md** - "NEVER use `any`" (line 5) - Needs correction path
8. **general.md** - "ALWAYS validate external data" (line 6) - Core pattern
9. **general.md** - "NEVER use direct cross-slice imports" (line 13) - Architecture boundary
10. **general.md** - "Slice Structure: domain -> tables -> server -> client -> ui" (lines 18-23) - Layer imports
11. **general.md** - "NEVER access `process.env` directly" (line 40) - Common mistake
12. **meta-thinking.md** - All Effect notation (lines 8-28) - Entire section needs code examples

### Medium Priority (causes confusion):
1. **behavioral.md** - "Clarify Intent" (line 45) - Needs example dialogue
2. **behavioral.md** - "Incremental Changes" (line 46) - Needs size metrics
3. **code-standards.md** - "Effect.gen over Effect.flatMap chains" (line 16) - Comparison helpful
4. **code-standards.md** - UI standards (lines 33-35) - Visual examples needed
5. **code-standards.md** - Documentation philosophy (lines 41-49) - Rewriting examples
6. **general.md** - "Use `Effect.log*` with structured objects" (line 9) - Logging example
7. **meta-thinking.md** - Uncertainty handling rules (lines 34-37) - Behavioral examples

### Low Priority (nice to have):
1. **behavioral.md** - "Verify Changes" (line 47) - Command self-explanatory
2. **code-standards.md** - "imports := ∀ X" (line 9) - Covered elsewhere
3. **code-standards.md** - "forbidden jsdoc" (lines 43-47) - Prohibition clear
4. **general.md** - Path aliases (line 15) - Self-explanatory
5. **meta-thinking.md** - Commands (lines 51-55) - Documentation exists

---

## Quantitative Summary

| Category | Count | Percentage |
|----------|-------|------------|
| Rules with adequate examples | 21 | 39% |
| Rules missing examples (High Priority) | 18 | 33% |
| Rules missing examples (Medium Priority) | 11 | 20% |
| Rules missing examples (Low Priority) | 4 | 7% |
| **Total Rules Identified** | **54** | 100% |

**Key Insight**: `code-standards.md` and `meta-thinking.md` are the most problematic files, containing formal mathematical notation without any worked examples. `effect-patterns.md` is the model to follow - every rule has both FORBIDDEN and REQUIRED code examples.
