# Agent Creation Orchestrator Prompt

Copy-paste this prompt to create the wealth management domain expert agent.

---

## Prompt

You are creating the **Wealth Management Domain Expert** agent definition file.

### Objective

Create `.claude/agents/wealth-management-domain-expert.md` - a domain expert for wealth management serving UHNWI clients ($30M+ net worth).

### Domain Knowledge Reference

The domain ontology is documented in:
- `specs/agents/wealth-management-domain-expert/outputs/ontology-class-hierarchy.md` - Class hierarchy
- `specs/agents/wealth-management-domain-expert/outputs/property-inventory.md` - Property definitions
- `specs/agents/wealth-management-domain-expert/handoffs/HANDOFF_P0.md` - Domain summary

### Agent Definition Template

Create the file with this structure:

```markdown
---
name: wealth-management-domain-expert
description: |
  Domain expert for wealth management serving UHNWI clients ($30M+ net worth).

  Use this agent when:
  - Answering questions about wealth management concepts
  - Explaining trust structures, beneficiary designations, or ownership hierarchies
  - Understanding client portfolio organization patterns
  - Providing compliance-aware guidance on financial planning
  - Interpreting wealth management terminology and relationships

model: sonnet
tools: [Read, Grep, Glob]
---

# Wealth Management Domain Expert

[Include domain expertise, entity types, relationships, compliance awareness, response guidelines]
```

### Required Content

The agent prompt must include:

1. **Entity Types**: Client, Account, Investment, Document, Household, Trust, LegalEntity, Beneficiary, Custodian
2. **Key Relationships**: ownsAccount, containsInvestment, hasBeneficiary, establishedBy, managedBy
3. **Account Types**: Individual, Joint, Trust, Entity, Retirement (with tax treatment)
4. **Trust Types**: Revocable, Irrevocable, Charitable (with purposes)
5. **Compliance Awareness**: KYC, AML, Fiduciary Duty, Suitability
6. **Response Guidelines**: Precision, compliance awareness, avoiding advice

### Reference Files

| File | Purpose |
|------|---------|
| `specs/agents/wealth-management-domain-expert/MASTER_ORCHESTRATION.md` | Full template with all content |
| `specs/agents/wealth-management-domain-expert/handoffs/HANDOFF_P0.md` | Domain knowledge summary |
| `.claude/agents/` | Existing agent patterns |

### Deliverable

Single file: `.claude/agents/wealth-management-domain-expert.md`

### Verification

- [ ] File exists at `.claude/agents/wealth-management-domain-expert.md`
- [ ] Valid YAML frontmatter
- [ ] Description includes "when to use" guidance
- [ ] Prompt includes all entity types
- [ ] Prompt includes key relationships
- [ ] Prompt includes compliance awareness
- [ ] Response guidelines present

---

## Quick Start

1. Read `MASTER_ORCHESTRATION.md` for the complete agent template
2. Review `handoffs/HANDOFF_P0.md` for domain knowledge
3. Check existing agents in `.claude/agents/` for patterns
4. Create the agent file
5. Verify against checklist
