# Wealth Management Domain Expert Agent Specification

## Purpose

Define and create the `.claude/agents/wealth-management-domain-expert.md` agent - a domain expert for wealth management serving UHNWI clients ($30M+ net worth).

## Deliverable

**Single Output**: `.claude/agents/wealth-management-domain-expert.md`

## Agent Capabilities

The agent provides domain expertise for:

- **Wealth Management Concepts**: Client portfolios, accounts, investments
- **Trust & Entity Structures**: Ownership hierarchies, beneficiary designations
- **Compliance Knowledge**: KYC, AML, fiduciary duty requirements
- **Financial Planning**: Risk tolerance, investment suitability

## Target Users

Users asking questions about:
- How wealth management firms organize client information
- Trust structures and their purposes
- Account types and tax treatment
- Ownership and beneficiary relationships
- Compliance requirements for financial services

## Domain Knowledge

Domain ontology is documented in `outputs/`:

| File | Content |
|------|---------|
| `outputs/wealth-management.ttl` | OWL/RDFS ontology |
| `outputs/ontology-class-hierarchy.md` | Class hierarchy visualization |
| `outputs/property-inventory.md` | Property definitions |

### Entity Hierarchy

```
Core Entities              Complex Structures
─────────────              ──────────────────
• Client                   • Household
• Account                  • Trust
• Investment               • LegalEntity
• Document                 • Beneficiary
                           • Custodian
```

## Key Documents

| Document | Purpose |
|----------|---------|
| `MASTER_ORCHESTRATION.md` | Implementation guide |
| `QUICK_START.md` | 5-minute overview |
| `outputs/` | Domain ontology outputs |

## Getting Started

1. Read `MASTER_ORCHESTRATION.md`
2. Review domain knowledge in `outputs/`
3. Create `.claude/agents/wealth-management-domain-expert.md`
4. Verify against existing agent patterns in `.claude/agents/`

## Success Criteria

- [ ] Agent file exists at `.claude/agents/wealth-management-domain-expert.md`
- [ ] Valid YAML frontmatter (name, description, model, tools)
- [ ] Clear "when to use" guidance in description
- [ ] Domain knowledge embedded in prompt
- [ ] Follows existing agent patterns

---

## Metadata

| Field | Value |
|-------|-------|
| Created | 2026-01-18 |
| Last Updated | 2026-01-19 |
| Version | 2.0.0 |
| Status | Simplified - Agent Definition Only |
