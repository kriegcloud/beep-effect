# Handoff: Agent Creation Context

## Summary

This handoff provides context for creating the `.claude/agents/wealth-management-domain-expert.md` agent definition file.

## Domain Knowledge Location

The wealth management domain ontology is already defined in the `outputs/` directory:

| File | Content |
|------|---------|
| `outputs/wealth-management.ttl` | OWL/RDFS ontology (Turtle format) |
| `outputs/ontology-class-hierarchy.md` | Class hierarchy with property details |
| `outputs/property-inventory.md` | Property definitions with domains/ranges |

## Domain Overview

### Core Entity Classes (Priority 0)

| Class | Description |
|-------|-------------|
| `wm:Client` | Natural person receiving wealth management services (UHNWI: $30M+) |
| `wm:Account` | Custodial account holding investments |
| `wm:Investment` | Asset holdings (securities, funds, real estate, alternatives) |
| `wm:Document` | Compliance evidence and client documentation |

### Complex Structures (Priority 1)

| Class | Description |
|-------|-------------|
| `wm:Household` | Family unit grouping for consolidated reporting |
| `wm:Trust` | Legal trust structure (Revocable, Irrevocable, Charitable) |
| `wm:LegalEntity` | Business entities (LLC, Partnership, Foundation) |
| `wm:Beneficiary` | Designated recipients of account/trust benefits |
| `wm:Custodian` | Financial institutions holding client assets |

### Key Relationships

| Property | Domain | Range | Description |
|----------|--------|-------|-------------|
| `wm:ownsAccount` | Client | Account | Client ownership of accounts |
| `wm:containsInvestment` | Account | Investment | Holdings within accounts |
| `wm:hasBeneficiary` | Account, Trust | Beneficiary | Beneficiary designations |
| `wm:establishedBy` | Trust | Client | Grantor relationship |
| `wm:managedBy` | Trust | Client, Entity | Trustee relationship |
| `wm:memberOf` | Client | Household | Family grouping |

### Account Types

| Type | Tax Treatment |
|------|---------------|
| Individual | Taxable |
| Joint | Taxable |
| Trust | Varies |
| Entity (LLC/LP) | Pass-through or corporate |
| Retirement (IRA, 401k) | Tax-advantaged |

### Trust Types

| Type | Modifiable | Purpose |
|------|------------|---------|
| Revocable | Yes | Estate planning, probate avoidance |
| Irrevocable | No | Asset protection, estate tax reduction |
| Charitable | No | Philanthropy, tax benefits |

### Compliance Awareness

| Requirement | Description |
|-------------|-------------|
| KYC | Know Your Customer - identity verification |
| AML | Anti-Money Laundering - source of funds |
| Fiduciary Duty | Acting in client's best interest |
| Suitability | Matching recommendations to client profile |

## Agent Definition Task

Create `.claude/agents/wealth-management-domain-expert.md` with:

1. **Frontmatter**: name, description, model, tools
2. **Description**: When to use this agent
3. **Prompt**: Domain knowledge, response guidelines

## Reference

See `MASTER_ORCHESTRATION.md` for the complete agent definition template.
