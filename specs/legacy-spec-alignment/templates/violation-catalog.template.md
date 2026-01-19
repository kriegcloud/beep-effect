# Violation Catalog

> Phase sizing violations identified during P0: Analysis.

**Date**: [YYYY-MM-DD]
**Generator**: Orchestrator (synthesis)

---

## Violation Summary

| Severity | Count |
|----------|-------|
| High (>10 over) | [N] |
| Medium (3-10 over) | [M] |
| Low (1-2 over) | [X] |

---

## Violations by Spec

### [spec-name] - [Severity]

| Phase | Current Items | Limit | Over By | Recommended Split |
|-------|---------------|-------|---------|-------------------|
| [Phase X] | [N] | 7 | [+M] | Phase Xa + Phase Xb |

**Notes**: [Any context about why this phase is oversized]

---

## Violations by Severity

### High Priority

| Spec | Phase | Items | Over By |
|------|-------|-------|---------|
| [spec-name] | [Phase] | [N] | [+M] |

### Medium Priority

| Spec | Phase | Items | Over By |
|------|-------|-------|---------|
| [spec-name] | [Phase] | [N] | [+M] |

### Low Priority

| Spec | Phase | Items | Over By |
|------|-------|-------|---------|
| [spec-name] | [Phase] | [N] | [+M] |

---

## Recommended Alignment Order

1. **[spec-name]** - [Reason for priority]
2. **[spec-name]** - [Reason for priority]

---

## Exemptions

| Spec | Reason for Exemption |
|------|---------------------|
| orchestrator-context-optimization | Self-referential (defines the rules) |
