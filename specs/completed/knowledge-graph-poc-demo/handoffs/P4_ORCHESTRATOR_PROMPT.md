# Phase 4 Orchestrator Prompt

> **Quick Start:** [QUICK_START.md](../QUICK_START.md)

Copy-paste this prompt to start Phase 4 implementation.

---

## Context

Phases 1-3 established extraction, visualization, and query capabilities. Phase 4 demonstrates entity resolution - the ability to deduplicate entities across multiple extractions.

**Full Context:** `specs/knowledge-graph-poc-demo/handoffs/HANDOFF_P4.md`

**Previous Phases:**
- P1: Basic extraction UI
- P2: Relations & evidence UI
- P3: GraphRAG query interface

---

## Your Mission

Create the entity resolution UI with these deliverables:

1. **Multi-extraction Support** - Accumulate results from multiple emails
2. **EntityResolutionPanel** - Trigger and display resolution
3. **ClusterList** - Show grouped duplicate entities
4. **SameAsLinkTable** - Display owl:sameAs relationships
5. **Resolution Stats** - Show before/after counts

---

## Phase Tasks

| Task | Agent | Priority |
|------|-------|----------|
| Add extraction history state | Orchestrator | P0 |
| Show extraction count in UI | Orchestrator | P0 |
| Add "Resolve Entities" button | Orchestrator | P0 |
| Create resolution server action | Orchestrator | P0 |
| Create EntityResolutionPanel | Orchestrator | P0 |
| Create ClusterList component | Orchestrator | P1 |
| Create SameAsLinkTable | Orchestrator | P1 |
| Add resolution stats display | Orchestrator | P1 |

---

## Critical Patterns

**Multi-Extraction State:**
```typescript
const [extractions, setExtractions] = React.useState<ExtractionResult[]>([]);

const handleExtract = async () => {
  const result = await extractFromText(emailText);
  setExtractions(prev => [...prev, result]);
};

// Enable resolution after 2+ extractions
const canResolve = extractions.length >= 2;
```

**Resolution Server Action:**
```typescript
"use server";

import { EntityResolutionService } from "@beep/knowledge-server/EntityResolution";
import * as Effect from "effect/Effect";

export async function resolveEntities(
  graphs: KnowledgeGraph[]
) {
  const program = Effect.gen(function* () {
    const service = yield* EntityResolutionService;
    return yield* service.resolve(graphs, {
      organizationId: "demo_org",
    });
  });

  return Effect.runPromise(
    program.pipe(Effect.provide(/* layers */))
  );
}
```

**Cluster Display:**
```typescript
function ClusterItem({ cluster }: { cluster: EntityCluster }) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Card>
      <CardHeader onClick={() => setExpanded(!expanded)}>
        <CardTitle>{cluster.canonicalEntity.mention}</CardTitle>
        <Badge>{cluster.memberIds.length} members</Badge>
      </CardHeader>
      {expanded && (
        <CardContent>
          {cluster.memberEntities.map(entity => (
            <div key={entity.id}>{entity.mention}</div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}
```

---

## Success Criteria

- [ ] Can extract from multiple emails sequentially
- [ ] Extraction count displayed in UI
- [ ] "Resolve Entities" button after 2+ extractions
- [ ] Clusters displayed with canonical + members
- [ ] SameAs links show confidence and reason
- [ ] Stats: original vs resolved counts

---

## Verification

Test workflow:
1. Extract Email 1 (John Smith, Sarah Chen)
2. Extract Email 2 (John, Sarah, Mike)
3. Extract Email 3 (J. Smith, Alex)
4. Click "Resolve Entities"
5. Verify: "John Smith", "J. Smith", "John" in same cluster

---

## Reference Files

1. `specs/knowledge-graph-poc-demo/handoffs/HANDOFF_P4.md` - Full context
2. `packages/knowledge/server/src/EntityResolution/EntityResolutionService.ts`
3. `specs/knowledge-graph-poc-demo/sample-data/emails.md` - Expected clusters

---

## Important Notes

1. **Name Variations**: The sample emails include variations like "John Smith", "J. Smith", "John". These should resolve to the same canonical entity.

2. **Cluster Visualization**: Consider expandable cards or accordion for clusters. Canonical entity should be visually prominent.

3. **Resolution Reason**: Display why entities were merged (name similarity, shared relations, etc.)

---

## Handoff Instructions

After completing Phase 4:

1. Update `REFLECTION_LOG.md` with learnings
2. Document resolution UI patterns
3. Proceed to `handoffs/P5_ORCHESTRATOR_PROMPT.md` for Polish & Integration
