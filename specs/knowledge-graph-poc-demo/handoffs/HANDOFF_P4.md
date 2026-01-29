# Handoff P4: Entity Resolution UI

> **Quick Start:** [QUICK_START.md](../QUICK_START.md)

---

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working Memory | 2,000 tokens | ~1,800 | OK |
| Episodic Memory | 1,000 tokens | ~800 | OK |
| Semantic Memory | 500 tokens | ~450 | OK |
| Procedural Memory | 500 tokens | ~300 | OK |
| **Total** | **4,000 tokens** | **~3,350** | **OK** |

---

## Working Memory (Current Phase)

### Phase 4 Goal

Demonstrate entity deduplication across multiple extractions with cluster visualization and merge controls.

### Deliverables

1. Multi-extraction support (sequential email processing)
2. `EntityResolutionPanel` - Resolution trigger and results
3. `ClusterList` - Display entity clusters (grouped duplicates)
4. `SameAsLinkTable` - Show owl:sameAs links with provenance
5. Resolution statistics display

### Success Criteria

- [ ] Can extract from multiple emails sequentially
- [ ] "Resolve Entities" button appears after 2+ extractions
- [ ] Resolution shows entity clusters
- [ ] Clusters expandable to show member entities
- [ ] SameAs links displayed with confidence and reason
- [ ] Stats show: original count, resolved count, merge count

### Blocking Issues

- **P1-P3 Required**: Extraction and query UI must work
- **EntityResolutionService**: May need mock for demo
- **Graph State**: Need to accumulate extractions across multiple runs

### Key Constraints

1. **Multi-Extraction State**
   - Store multiple `KnowledgeGraph` results
   - Combine graphs for resolution
   - Track which entities came from which extraction

2. **Resolution Service API**
   - `resolve(graphs)` returns `ResolutionResult`
   - Result includes `clusters`, `sameAsLinks`, `stats`
   - Each cluster has `canonicalId` and `memberIds`

3. **Cluster Visualization**
   - Show canonical entity prominently
   - List aliases/variations as members
   - Display merge confidence

### Implementation Order

1. Add extraction history state (array of results)
2. Modify UI to show extraction count
3. Create "Resolve Entities" button (enabled after 2+)
4. Create server action for resolution
5. Create `EntityResolutionPanel` container
6. Create `ClusterList` component
7. Create `SameAsLinkTable` component
8. Add resolution stats display

---

## Episodic Memory (Previous Context)

### Phase 1 Summary

- Page route at `/knowledge-demo`
- `EmailInputPanel` with sample selector
- `EntityCardList` for results
- Server action for extraction

### Phase 2 Summary

- `RelationTable` showing triples
- `EntityDetailDrawer` with evidence
- Source text highlighting
- Evidence navigation

### Phase 3 Summary

**Completed:**
- `GraphRAGQueryPanel` with query input
- `QueryConfigForm` (topK, hops)
- `QueryResultDisplay` with entities/relations
- Context preview for LLM consumption
- Query stats display

**Architecture Established:**
- Server action pattern for services
- Mock provider approach if needed
- Tab-based result organization

---

## Semantic Memory (Project Constants)

### File Locations

| Item | Path |
|------|------|
| ResolutionPanel | `apps/todox/src/app/knowledge-demo/components/EntityResolutionPanel.tsx` |
| ClusterList | `apps/todox/src/app/knowledge-demo/components/ClusterList.tsx` |
| SameAsLinkTable | `apps/todox/src/app/knowledge-demo/components/SameAsLinkTable.tsx` |
| Actions | `apps/todox/src/app/knowledge-demo/actions.ts` |

### Resolution Service API

```typescript
import { EntityResolutionService } from "@beep/knowledge-server/EntityResolution";

interface EntityCluster {
  canonicalId: string;
  canonicalEntity: Entity;
  memberIds: string[];
  memberEntities: Entity[];
  confidence: number;
}

interface SameAsLink {
  id: string;
  canonicalId: string;
  aliasId: string;
  confidence: number;
  reason: string;        // "name_similarity", "attribute_match", etc.
  provenance: string;    // Which extraction created this
}

interface ResolutionResult {
  clusters: EntityCluster[];
  sameAsLinks: SameAsLink[];
  stats: {
    originalCount: number;
    resolvedCount: number;
    clusterCount: number;
    mergeCount: number;
  };
}
```

### Expected Clusters (from sample emails)

| Canonical | Aliases | Cluster Size |
|-----------|---------|--------------|
| John Smith | J. Smith, John | 3 |
| Sarah Chen | Sarah | 2 |
| Mike Wilson | Mike | 2 |
| Alex Rodriguez | Alex | 2 |
| Lisa Park | Lisa | 2 |

---

## Procedural Memory (Reference Links)

### Effect Patterns

- `.claude/rules/effect-patterns.md` - Required patterns

### Existing Code References

- `packages/knowledge/server/src/EntityResolution/EntityResolutionService.ts`
- `packages/knowledge/domain/src/entities/cluster/cluster.model.ts`
- `packages/knowledge/domain/src/entities/same-as-link/same-as-link.model.ts`

### Spec Documents

- `specs/knowledge-graph-poc-demo/README.md` - Resolution panel spec
- `specs/knowledge-graph-poc-demo/sample-data/emails.md` - Expected resolution results

---

## Verification Tables

### Code Quality Checks

| Check | Command | Expected |
|-------|---------|----------|
| Type check | `bun run check --filter @beep/todox` | No errors |
| Lint | `bun run lint` | No errors |
| Dev server | `bun run dev` | No console errors |

### Output Verification

| Criterion | How to Verify |
|-----------|---------------|
| Multi-extraction | Extract 3+ emails, see count |
| Resolution button | Button appears after 2+ extractions |
| Clusters display | Click Resolve, see cluster list |
| Cluster expansion | Click cluster, see members |
| SameAs links | See link table with reasons |
| Stats accurate | Compare stats to visible results |

---

## Handoff to Phase 5

After completing Phase 4:

1. Update `REFLECTION_LOG.md` with learnings
2. Document resolution algorithm observations
3. Note any UI/UX challenges with cluster display
4. Proceed to Phase 5: Polish & Integration
