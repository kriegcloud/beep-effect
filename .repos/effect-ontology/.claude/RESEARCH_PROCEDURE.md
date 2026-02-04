# Research Handling Procedure

## Three-Tier Research Pattern

```
ontology_research/
  {topic}_research.md                       # Primary sources (deep, N+ citations)
  sota_review.md                            # Synthesis across topics
  synthesis_and_implementation_roadmap.md   # Actionable plan with effort estimates
```

## Research Document Structure

### Primary Source Document
```markdown
# {Topic} Research

**Last Updated**: {Month YYYY}
**Sources**: {N}+ papers, tools, libraries

## Key Findings Summary
## {Subtopic} - State of the Art
## Tool/Library Comparison (table)
## Best Practices
## References
```

### SOTA Synthesis
```markdown
# SOTA Review: {Domain}

## Scope and Constraints
## Research Doc Takeaways
## Implementation Review (vs current codebase)
## Gaps and Risks (prioritized)
## Recommendations (P0/P1/P2)
```

### Implementation Roadmap
```markdown
# Synthesis and Implementation Roadmap

## Key Finding: Current Pipeline Gaps (table)
## Top N Takeaways (with effort/impact)
## Implementation Priority Matrix
## Phase Plan (Now/Next Quarter/Future)
```

## When Research Becomes Actionable

Transition to implementation when:
1. Gap is **P0** (critical) - blocks core functionality
2. Effort is **bounded** - < 2 weeks implementation
3. Dependencies are **met** - prerequisite work complete
4. Evidence is **strong** - multiple sources confirm approach

## Transition Process

1. **Create plan**: `docs/plans/YYYY-MM-DD-{topic}-implementation.md`
2. **Create issue**: `/beads:create "{Topic}" feature P0` with links
3. **Update research**: Mark status as `IMPLEMENTING → IMPLEMENTED`
4. **Update SOTA**: Add checkmarks to completed items

## Preserving Research Value

### In Code Comments
```typescript
/**
 * Implements RRF score fusion per Anthropic contextual retrieval study.
 * See: `docs/ontology_research/advanced_retrieval_nlp_research.md`
 */
```

### Preserve Negative Results
```markdown
### Alternatives Considered
- **Louvain clustering**: Rejected - produces disconnected clusters
```

## Location Conventions

| Type | Location |
|------|----------|
| Domain research | `packages/@core-v2/docs/ontology_research/` |
| Cross-cutting patterns | `docs/` |
| Tool recommendations | `docs/recommendations/` |

## Research Workflow

```
CONDUCT → DOCUMENT → SYNTHESIZE → PLAN → TRACK → IMPLEMENT → UPDATE
   ↓         ↓          ↓          ↓       ↓         ↓          ↓
sources  {topic}.md  sota_review  plan  beads    code     mark done
```

## Quality Checklist

- [ ] Sources cited
- [ ] Findings actionable (not just theoretical)
- [ ] Prioritization explicit (P0/P1/P2)
- [ ] Effort estimates included
- [ ] Gaps connected to current codebase
- [ ] Status clear
- [ ] Links to related docs exist
