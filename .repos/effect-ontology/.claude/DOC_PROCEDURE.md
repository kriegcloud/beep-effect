# Documentation Management Procedure

## When to Create vs Update

**Create new** when: new feature/system, new doc family, dated plan, new research area.
**Update existing** when: adding to existing topic, corrections, status updates.
**Archive** when: superseded by newer version, plan completed, delivery snapshot incorporated.

## Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Reference docs | `TOPIC_QUALIFIER.md` (uppercase) | `LLM_CONTROL_QUICK_REFERENCE.md` |
| Doc families | `{TOPIC}_INDEX/QUICKREF/SUMMARY.md` | `PERSISTENCE_INDEX.md` |
| Dated plans | `YYYY-MM-DD-topic-slug.md` | `2025-12-16-shacl-validation.md` |
| Research | `topic_area_research.md` (lowercase) | `entity_resolution_clustering_research.md` |

## Document Family Pattern

For complex topics, create a family:
```
{TOPIC}_INDEX.md           # Navigation hub
{TOPIC}_QUICKREF.md        # 1-page reference card
{TOPIC}_SUMMARY.md         # Executive summary
archive/{topic}-details.md # Deep dive (archived when implemented)
```

## Required Sections by Type

### INDEX
- Quick Navigation table
- Document directory with line counts
- Reading paths for different audiences
- Implementation checklist

### QUICKREF (1 page)
- Problem/Solution overview
- Integration pattern (code snippet)
- Configuration profiles
- Troubleshooting quick guide

### SUMMARY
- Status/Scope/Date metadata
- Problem → Solution → Key Decisions
- Phase breakdown
- Validation checklist

### Implementation Plan
- Executive summary
- Current state → Gap analysis
- Prioritized actions (P0/P1/P2)
- Effort estimates
- Numbered tasks with code examples

## Archive Policy

1. Create `docs/archive/{category}-{YYYY-MM}/`
2. Move documents
3. Create `README.md` explaining why archived and what supersedes
4. Update INDEX.md references

## Cross-Linking

- INDEX.md must link all documents in family
- Plans link to related research
- Completed plans link to implementation
- Archived docs reference current location

## INDEX.md Maintenance

Update `packages/@core-v2/docs/INDEX.md` when:
- Adding new document
- Archiving documents
- Changing document status
- Adding document families

## Quality Checklist

- [ ] Follows naming convention
- [ ] Has required sections
- [ ] Contains metadata (date, status)
- [ ] Cross-links to related docs
- [ ] INDEX.md updated
- [ ] No broken links
