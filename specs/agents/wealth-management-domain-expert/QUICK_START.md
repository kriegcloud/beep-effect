# Quick Start: Wealth Management Domain Expert

**5-minute triage guide for the wealth management domain expert agent specification.**

---

## When to Use This Spec

| Scenario | Use This Spec? | Alternative |
|----------|----------------|-------------|
| Design wealth management ontology | **Yes** | — |
| Extract entities from financial documents | **Yes** | — |
| Build client/account/trust knowledge graph | **Yes** | — |
| General knowledge extraction (non-financial) | No | `specs/knowledge-graph-integration/` |
| Document storage/retrieval only | No | `packages/documents/` |
| User authentication/authorization | No | `packages/iam/` |

---

## 3 Most Common Usage Patterns

### 1. Start Phase 0 (Ontology Design)

```bash
# Copy the orchestrator prompt
cat specs/agents/wealth-management-domain-expert/handoffs/P0_ORCHESTRATOR_PROMPT.md

# Paste into new Claude Code session
# Follow Phase 0 instructions
```

### 2. Review Existing Ontology Patterns

```bash
# Check knowledge graph integration reference
cat specs/knowledge-graph-integration/outputs/effect-ontology-analysis.md

# Review existing domain models
ls packages/knowledge/domain/src/entities/
```

### 3. Understand Compliance Evidence Requirements

Read these sections:
- `HANDOFF_P0.md` → "Evidence Linking Requirements"
- `MASTER_ORCHESTRATION.md` → "Phase 2: Extraction Pipeline"

---

## Quick Reference

### Key Files

| File | Purpose | When to Read |
|------|---------|--------------|
| `README.md` | Overview, architecture | First visit |
| `MASTER_ORCHESTRATION.md` | Full 6-phase workflow | Planning implementation |
| `handoffs/HANDOFF_P0.md` | Phase 0 detailed context | Starting Phase 0 |
| `handoffs/P0_ORCHESTRATOR_PROMPT.md` | Copy-paste prompt | Starting Phase 0 |
| `REFLECTION_LOG.md` | Learnings, prompt patterns | Troubleshooting |
| `RUBRICS.md` | Output quality scoring | Reviewing deliverables |

### Domain Entities (Wealth Management)

```
Priority 0 (Core)           Priority 1 (Complex)
─────────────────           ────────────────────
• Client                    • Household
• Account                   • Trust (Revocable, Irrevocable, Charitable)
• Investment                • Entity (LLC, Partnership, Foundation)
• Document                  • Beneficiary
```

### Evidence Linking (Compliance Critical)

| Fact Type | Source Document | Required Fields |
|-----------|-----------------|-----------------|
| Account ownership | Account opening agreement | text, startChar, endChar, documentId |
| Beneficiary designation | Beneficiary form | text, startChar, endChar, effectiveDate |
| Trust terms | Trust document | text, startChar, endChar, documentId |
| Risk tolerance | Risk questionnaire | text, startChar, endChar, assessmentDate |

### Entity Resolution Keys

| Entity | Primary Key | Fuzzy Keys |
|--------|-------------|------------|
| Client | taxId (hashed) | normalizedName + dateOfBirth |
| Account | accountNumber + custodian | normalizedName + type |
| Trust | taxId (hashed) | normalizedName + establishedDate |
| Investment | CUSIP/ISIN | ticker + accountId |

---

## Common Questions

### How is this different from knowledge-graph-integration?

`knowledge-graph-integration` provides the **generic extraction framework**. This spec provides **wealth management domain specialization**:
- Wealth management ontology (Client, Account, Trust, etc.)
- Compliance evidence linking requirements
- Financial entity resolution strategies
- UHNWI-specific data modeling

### Do I need to complete all 6 phases?

No. Phases build on each other:
- **Phase 0-1**: Foundation (ontology + models) - Required
- **Phase 2-3**: Extraction pipeline - For document processing
- **Phase 4-5**: GraphRAG + Agent - For intelligent querying

### How do I know if Phase 0 succeeded?

Check the success criteria in `RUBRICS.md`:
- [ ] Ontology parses without syntax errors
- [ ] At least 8 classes defined
- [ ] At least 15 properties defined (9 object + 6 datatype)
- [ ] Evidence requirements for 6 compliance-critical facts
- [ ] Entity resolution keys for Client, Account, Trust, Investment

---

## Next Steps

1. **New to this spec?** → Read `README.md`
2. **Ready to implement?** → Copy prompt from `handoffs/P0_ORCHESTRATOR_PROMPT.md`
3. **Reviewing output?** → Use `RUBRICS.md` scoring criteria
4. **Troubleshooting?** → Check `REFLECTION_LOG.md` for common patterns
