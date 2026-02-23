# Quick Start: Wealth Management Domain Expert

**Goal**: Create `.claude/agents/wealth-management-domain-expert.md`

---

## When to Use This Spec

| Scenario | Use This Spec? |
|----------|----------------|
| Create wealth management domain expert agent | **Yes** |
| Understand wealth management ontology | **Yes** |
| Implement TypeScript models for wealth management | No - out of scope |
| Build extraction pipelines | No - out of scope |

---

## Steps

### 1. Review Domain Knowledge

```bash
# Read class hierarchy
cat specs/agents/wealth-management-domain-expert/outputs/ontology-class-hierarchy.md

# Read property definitions
cat specs/agents/wealth-management-domain-expert/outputs/property-inventory.md
```

### 2. Review Existing Agents

```bash
# See existing agent patterns
ls .claude/agents/
```

### 3. Create Agent File

Create `.claude/agents/wealth-management-domain-expert.md` following the template in `MASTER_ORCHESTRATION.md`.

---

## Domain Quick Reference

### Core Entities

| Entity | Description |
|--------|-------------|
| Client | Person receiving wealth management services |
| Account | Custodial account holding investments |
| Investment | Asset holdings (securities, funds, real estate) |
| Document | Compliance evidence and documentation |

### Complex Structures

| Entity | Description |
|--------|-------------|
| Household | Family unit grouping |
| Trust | Legal trust structure (Revocable, Irrevocable, Charitable) |
| LegalEntity | LLC, Partnership, Foundation |
| Beneficiary | Designated benefit recipient |

### Key Relationships

| Relationship | Meaning |
|--------------|---------|
| Client → Account | Ownership |
| Account → Investment | Holdings |
| Trust → Beneficiary | Designation |
| Trust → Client | Grantor/Trustee |

---

## Success Checklist

- [ ] Agent file at `.claude/agents/wealth-management-domain-expert.md`
- [ ] Valid YAML frontmatter
- [ ] Domain knowledge in prompt
- [ ] Clear usage guidance
