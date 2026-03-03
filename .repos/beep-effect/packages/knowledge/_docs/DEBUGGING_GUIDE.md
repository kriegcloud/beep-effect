# Debugging Guide: Extraction Runs

**For**: Investigating failed or slow extractions in MVP
**Updated**: 2025-12-09

---

## Quick Start: Inspecting a Run

### 1. Find the run ID
```bash
# List all extraction runs (sorted by date, newest first)
ls -lt ./output/runs/ | head -20

# Or check a specific run
ls ./output/runs/doc-abc123def456/
```

### 2. View the audit trail
```bash
# Human-readable timeline
cat ./output/runs/doc-abc123def456/metadata.json | jq '.events'

# See what went wrong (if run failed)
cat ./output/runs/doc-abc123def456/metadata.json | jq '.errors'

# Full metadata
cat ./output/runs/doc-abc123def456/metadata.json | jq '.' | less
```

### 3. Check outputs
```bash
# What got saved?
ls -lh ./output/runs/doc-abc123def456/outputs/

# Peek at knowledge graph size
cat ./output/runs/doc-abc123def456/outputs/knowledge-graph.json | jq '.entities | length'

# Look at first 3 entities
cat ./output/runs/doc-abc123def456/outputs/knowledge-graph.json | jq '.entities[0:3]'
```

### 4. Inspect input
```bash
# Original text
head -20 ./output/runs/doc-abc123def456/input/document.txt

# Chunk breakdown
ls -1 ./output/runs/doc-abc123def456/input/chunks/ | wc -l
head ./output/runs/doc-abc123def456/input/chunks/chunk-0.txt
```

---

## Extracting Run ID from Text

The run ID is deterministic from input text hash:

```typescript
import { getRunIdFromText } from "@effect-ontology/core-v2/Service/ExtractionRun"

const text = "The Dutch soccer teams..."
const runId = getRunIdFromText(text)
console.log(runId)  // → doc-abc123def456
```

Or from command line:
```bash
# If you have the exact text, hash it
cat document.txt | sha256sum | cut -c1-12
# Then: doc-{first12chars}
```

---

## Event Timeline

Each run records key events as it progresses:

```json
{
  "runId": "doc-abc123def456",
  "createdAt": "2025-12-09T10:30:00Z",
  "completedAt": "2025-12-09T10:31:45Z",
  "events": [
    {
      "timestamp": "2025-12-09T10:30:00Z",
      "type": "run.created",
      "data": { "textLength": 1500 }
    },
    {
      "timestamp": "2025-12-09T10:30:05Z",
      "type": "chunking.complete",
      "data": { "chunkCount": 8 }
    },
    {
      "timestamp": "2025-12-09T10:30:15Z",
      "type": "chunk_extraction.complete",
      "data": {
        "chunkIndex": 0,
        "entityCount": 5,
        "relationCount": 2
      }
    },
    {
      "timestamp": "2025-12-09T10:30:45Z",
      "type": "extraction.complete",
      "data": {
        "entityCount": 45,
        "relationCount": 23
      }
    },
    {
      "timestamp": "2025-12-09T10:31:30Z",
      "type": "resolution.complete",
      "data": {
        "resolvedCount": 12,
        "clusterCount": 8
      }
    },
    {
      "timestamp": "2025-12-09T10:31:45Z",
      "type": "run.completed",
      "data": { "duration": 105 }
    }
  ]
}
```

### Event Types Reference

| Event | Meaning | Data | Normal Duration |
|-------|---------|------|-----------------|
| `run.created` | Extraction started | `textLength` | - |
| `chunking.complete` | Text chunked | `chunkCount` | ~1s |
| `chunk_extraction.complete` | One chunk done | `chunkIndex, entityCount, relationCount` | ~5s per chunk |
| `extraction.complete` | All chunks done | `entityCount, relationCount` | - |
| `resolution.complete` | Entity resolution done | `resolvedCount, clusterCount` | ~5s |
| `refine.complete` | KG refined | Entity/relation counts | ~1s |
| `rdf.complete` | RDF generated | - | ~1s |
| `run.completed` | Run finished | `duration` (seconds) | - |

---

## Error Scenarios

### Scenario 1: Run Failed (No "run.completed" event)

```bash
cat ./output/runs/doc-abc123def456/metadata.json | jq '.errors'

# Output:
[
  {
    "timestamp": "2025-12-09T10:30:25Z",
    "type": "ExtractionError",
    "message": "Mention extraction failed for chunk 2",
    "context": {
      "stage": "chunk-processing",
      "chunkIndex": 2,
      "error": "LLM rate limit exceeded"
    }
  }
]
```

**Interpretation**:
- Chunk 2 failed during extraction
- LLM rate limited
- The extraction stopped (systemic error)

**Action**:
```bash
# Wait and retry (should work if it was rate limiting)
# Or: Reduce concurrency in config
```

### Scenario 2: Partial Extraction (Chunks succeeded, resolution failed)

```bash
# Shows events up to extraction.complete but not resolution.complete
cat ./output/runs/doc-abc123def456/metadata.json | jq '.events | map(.type)'
# ["run.created", "chunking.complete", "chunk_extraction.complete", ..., "extraction.complete"]

# Check errors
cat ./output/runs/doc-abc123def456/metadata.json | jq '.errors'
```

**Interpretation**:
- Entity extraction worked (45 entities)
- Entity resolution failed
- Knowledge graph is incomplete

**Action**:
- Check entity resolution input format
- Verify ontology is loaded

### Scenario 3: Slow Extraction (Normal, but timing visible)

```bash
# Calculate phase durations
cat ./output/runs/doc-abc123def456/metadata.json | jq -r '.events |
  map({type, timestamp}) |
  to_entries |
  map(select(.key > 0) | {
    phase: .value.type,
    duration: ((.value.timestamp | fromdateiso8601) - ([.key - 1].timestamp | fromdateiso8601))
  })'
```

Or use utility function (Phase 1):
```typescript
import { getRunTimeline } from "@effect-ontology/core-v2/Service/ExtractionRunUtils"

const run = JSON.parse(fs.readFileSync("metadata.json", "utf-8"))
const timeline = getRunTimeline(run)
timeline.forEach(e => console.log(`${e.type}: ${e.duration}s`))
```

---

## Checking Output Quality

### Knowledge Graph Sanity Checks

```bash
# Entity count
cat ./output/runs/doc-abc123def456/outputs/knowledge-graph.json | jq '.entities | length'

# Relation count
cat ./output/runs/doc-abc123def456/outputs/knowledge-graph.json | jq '.relations | length'

# Do entities have types?
cat ./output/runs/doc-abc123def456/outputs/knowledge-graph.json | jq '.entities[0] | .types'

# Entity resolution: did anything get merged?
cat ./output/runs/doc-abc123def456/outputs/entity-resolution-graph.json | jq '.stats.clusterCount'

# If clusterCount > 0, deduplication happened
```

### Mermaid Diagram
```bash
# View as text
cat ./output/runs/doc-abc123def456/outputs/mermaid-diagram.md

# Convert to image (requires mermaid CLI)
mermaid ./output/runs/doc-abc123def456/outputs/mermaid-diagram.md -o diagram.png
```

### RDF Turtle
```bash
# Valid Turtle?
cat ./output/runs/doc-abc123def456/outputs/rdf-turtle.ttl | head -50

# Count triples
cat ./output/runs/doc-abc123def456/outputs/rdf-turtle.ttl | grep -c '^ *.*\.$'
```

---

## Comparing Two Runs

### Same text, different results?

If you extract the same text twice and get different results, runs should have identical IDs:

```bash
# Both should have same run ID
bun run src/main.ts | grep "Run ID"  # First run
# → Run ID: doc-abc123def456

bun run src/main.ts | grep "Run ID"  # Second run
# → Run ID: doc-abc123def456  ✓ Identical (deterministic)

# But outputs might differ if:
# - Random seed changed
# - LLM gave different response
# - Ontology changed
# - Bug in code

# Compare:
diff <(cat ./output/runs/doc-abc123def456/outputs/knowledge-graph.json | jq '.entities | sort') \
     <(cat ./output/runs/doc-xyz789abc123/outputs/knowledge-graph.json | jq '.entities | sort')
```

### A-B testing configurations

```bash
# Run with config A
CONFIG_A=true bun run src/main.ts
RUN_A=$(ls -t ./output/runs/ | head -1)

# Run with config B
CONFIG_B=true bun run src/main.ts
RUN_B=$(ls -t ./output/runs/ | head -1)

# Compare stats
echo "Config A:"
cat ./output/runs/$RUN_A/metadata.json | jq '.stats'
echo "Config B:"
cat ./output/runs/$RUN_B/metadata.json | jq '.stats'
```

---

## Advanced Debugging

### Following logs in real-time

The extraction emits Effect logs. To see them:

```bash
# Run with debug logging
RUST_LOG=debug bun run src/main.ts 2>&1 | grep -i "extraction\|error"

# Or structured logs (if JSON output enabled)
bun run src/main.ts 2>&1 | jq 'select(.level == "error")'
```

### Inspecting a specific chunk

```bash
# Which chunk had issues?
cat ./output/runs/doc-abc123def456/metadata.json | jq '.events[] | select(.type == "chunk_extraction.complete") | select(.data.relationCount == 0)'
# Chunk(s) with no relations - potential extraction issue

# Read that chunk's text
cat ./output/runs/doc-abc123def456/input/chunks/chunk-2.txt

# Does it have entities/relations at all?
# Manual review of text content
```

### Entity resolution graph details

```bash
# Full ERG (useful for manual inspection)
cat ./output/runs/doc-abc123def456/outputs/entity-resolution-graph.json | jq '.' | less

# Which entities were merged?
cat ./output/runs/doc-abc123def456/outputs/entity-resolution-graph.json | jq '.canonicalMap | to_entries | map(select(.key != .value))'

# Example:
# [
#   { "key": "ronald_ronald", "value": "cristiano_ronaldo" },
#   { "key": "cr7", "value": "cristiano_ronaldo" }
# ]
# → "ronald_ronald" and "cr7" were merged into "cristiano_ronaldo"
```

---

## Cleanup

### Delete a failed run

```bash
rm -rf ./output/runs/doc-abc123def456/
```

### Batch cleanup (keep last N runs)

```bash
# Delete all but 10 most recent runs
ls -t ./output/runs/ | tail -n +11 | xargs -I {} rm -rf ./output/runs/{}
```

### Archive old runs (Phase 2)

```bash
# Create archive
tar -czf runs-2025-12-01.tar.gz ./output/runs/

# Clear disk
rm -rf ./output/runs/*

# Later: restore specific run
tar -xzf runs-2025-12-01.tar.gz --wildcards "*doc-abc123*"
```

---

## Common Issues & Solutions

### Issue: "Run not found"

```
Error: Run not found: doc-abc123def456 - ENOENT
```

**Causes**:
1. Typo in run ID
2. Run directory was deleted
3. Run ID was computed from different text

**Solution**:
```bash
# List available runs
ls ./output/runs/ | head -10

# Recompute run ID from original text
node -e "
  const { getRunIdFromText } = require('./dist/Service/ExtractionRun');
  const text = 'your actual text...';
  console.log(getRunIdFromText(text));
"
```

### Issue: "Extraction too slow"

Check timeline:
```bash
cat ./output/runs/doc-abc123def456/metadata.json | jq '.events[] | select(.data.duration) | .data.duration'
```

**If chunk extraction is slow** (>10s per chunk):
- LLM rate limiting?
- Large chunks?
- Network latency?

**If entity resolution is slow** (>30s):
- Many entities to resolve?
- Similarity computation expensive?
- Try reducing concurrency in next run

### Issue: "Entities extracted but no relations"

```bash
cat ./output/runs/doc-abc123def456/outputs/knowledge-graph.json | \
  jq '{entities: (.entities | length), relations: (.relations | length)}'
# { "entities": 45, "relations": 0 }
```

**Causes**:
1. Text doesn't describe relationships
2. Relation extractor failed silently
3. No property definitions in ontology
4. Grounder filtered all relations (confidence threshold too high)

**Debug**:
```bash
# Check per-chunk relation extraction
cat ./output/runs/doc-abc123def456/metadata.json | jq '.events[] | select(.type == "chunk_extraction.complete") | .data.relationCount'

# If all are 0: text doesn't have relations
# If some are >0: something broke during merge or grounder
```

---

## Metrics to Track

Create a monitoring script (Phase 2):

```bash
#!/bin/bash
# scripts/extraction-metrics.sh

echo "=== Extraction Run Metrics ==="
echo ""

for run in ./output/runs/*/; do
  runId=$(basename "$run")
  metadata="$run/metadata.json"

  if [ -f "$metadata" ]; then
    status=$(jq -r '.completedAt // "running"' "$metadata")
    entities=$(jq '.outputs[] | select(.type == "knowledge-graph")' "$metadata" 2>/dev/null | wc -l)
    duration=$(jq '.events[-1].data.duration // 0' "$metadata")

    printf "%s | entities: %s | duration: %ss\n" "$runId" "$entities" "$duration"
  fi
done
```

---

## Support Tickets

When reporting an extraction issue, include:

```bash
# Gather diagnostic info
cat > diagnostic.json << EOF
{
  "runId": "$(ls -t ./output/runs/ | head -1)",
  "metadata": $(cat ./output/runs/$(ls -t ./output/runs/ | head -1)/metadata.json),
  "stats": $(cat ./output/runs/$(ls -t ./output/runs/ | head -1)/metadata.json | jq '.stats'),
  "errors": $(cat ./output/runs/$(ls -t ./output/runs/ | head -1)/metadata.json | jq '.errors'),
  "timeline": $(cat ./output/runs/$(ls -t ./output/runs/ | head -1)/metadata.json | jq '.events | map({type, timestamp})')
}
EOF

# Attach diagnostic.json to issue
```

---

## References

- Extraction Run Model: `/packages/@core-v2/src/Domain/Model/ExtractionRun.ts`
- ExtractionRunService: `/packages/@core-v2/src/Service/ExtractionRun.ts`
- Streaming Extraction: `/packages/@core-v2/src/Workflow/StreamingExtraction.ts`
- Main Program: `/packages/@core-v2/src/main.ts`
