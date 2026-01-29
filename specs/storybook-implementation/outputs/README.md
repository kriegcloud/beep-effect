# Outputs Directory

This directory contains artifacts produced by sub-agents during spec execution.

## Expected Files

### Phase 1: Research
- `codebase-context.md` - Package analysis from codebase-researcher
- `external-research.md` - Storybook patterns from web-researcher
- `component-inventory.md` - Component catalog

### Phase 2: Design
- `architecture-design.md` - Storybook architecture decisions
- `addon-selection.md` - Addon recommendations
- `theme-integration-plan.md` - Theme system integration

### Phase 3: Planning
- `implementation-plan.md` - Ordered task list
- `directory-structure.md` - Target file layout

### Phase 5: Verification
- `code-review.md` - Quality review
- `verification-report.md` - Final verification
- `ci-integration.md` - CI/CD documentation

## File Size Limits

Each output file should be:
- ≤500 lines for comprehensive docs
- ≤300 lines for research outputs
- ≤200 lines for reviews/reports

Larger files indicate insufficient compression by sub-agents.
