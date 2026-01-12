# Spec Bootstrapper Rubrics

> Evaluation criteria for the spec bootstrapper implementation.

---

## CLI Command Rubrics

### R1: Command Interface (Weight: 25%)

| Score | Criteria |
|-------|----------|
| 5 | All options implemented with validation, help text, and examples |
| 4 | Core options work, validation present, minor help gaps |
| 3 | Basic options work, validation incomplete |
| 2 | Minimal options, poor error messages |
| 1 | Command fails or is unusable |

**Evidence Required**: `bun run beep bootstrap-spec --help` output

### R2: File Generation (Weight: 30%)

| Score | Criteria |
|-------|----------|
| 5 | All templates generated correctly, complexity-aware, idempotent |
| 4 | Core templates work, handles edge cases |
| 3 | Basic file generation works, some template issues |
| 2 | Partial file generation, template errors |
| 1 | File generation fails |

**Evidence Required**: Generated spec folder structure

### R3: Effect Patterns (Weight: 25%)

| Score | Criteria |
|-------|----------|
| 5 | Full Effect patterns: namespace imports, Layer composition, tagged errors |
| 4 | Most patterns correct, minor deviations |
| 3 | Core patterns present, some native methods |
| 2 | Mixed patterns, inconsistent |
| 1 | Minimal Effect usage |

**Evidence Required**: Code review of `tooling/cli/src/commands/bootstrap-spec/`

### R4: Integration (Weight: 20%)

| Score | Criteria |
|-------|----------|
| 5 | Command registered, CLI CLAUDE.md updated, tests passing |
| 4 | Command works, documentation mostly complete |
| 3 | Basic integration, missing documentation |
| 2 | Partial integration, errors in registration |
| 1 | Not integrated |

**Evidence Required**: `bun run beep --help`, CLI CLAUDE.md content

---

## Skill Rubrics

### S1: Skill Format (Weight: 25%)

| Score | Criteria |
|-------|----------|
| 5 | Proper format, clear sections, registered correctly |
| 4 | Format correct, minor gaps |
| 3 | Basic format, missing sections |
| 2 | Incomplete format |
| 1 | Invalid format |

**Evidence Required**: `.claude/skills/new-spec.md` content

### S2: Guidance Quality (Weight: 35%)

| Score | Criteria |
|-------|----------|
| 5 | Comprehensive guidance, references all relevant docs, examples |
| 4 | Good guidance, covers main scenarios |
| 3 | Basic guidance, some gaps |
| 2 | Minimal guidance |
| 1 | Poor or incorrect guidance |

**Evidence Required**: Skill content review

### S3: Workflow Integration (Weight: 25%)

| Score | Criteria |
|-------|----------|
| 5 | Integrates with CLI, references SPEC_CREATION_GUIDE, proper agent mapping |
| 4 | Good integration, minor gaps |
| 3 | Basic integration |
| 2 | Partial integration |
| 1 | No integration |

**Evidence Required**: Cross-reference with SPEC_CREATION_GUIDE.md

### S4: Usability (Weight: 15%)

| Score | Criteria |
|-------|----------|
| 5 | Intuitive invocation, clear output, helpful errors |
| 4 | Easy to use, minor rough edges |
| 3 | Usable with some friction |
| 2 | Confusing or unclear |
| 1 | Unusable |

**Evidence Required**: User testing feedback

---

## Overall Success Thresholds

| Outcome | Requirement |
|---------|-------------|
| **Pass** | All rubrics >= 3, average >= 3.5 |
| **Good** | All rubrics >= 4, average >= 4.0 |
| **Excellent** | All rubrics >= 4, average >= 4.5 |

---

## Evaluation Protocol

1. Run CLI command with various inputs
2. Inspect generated files for correctness
3. Review code for Effect pattern compliance
4. Test skill invocation and guidance quality
5. Score each rubric with evidence
6. Calculate weighted average
7. Document findings in `outputs/evaluation.md`
