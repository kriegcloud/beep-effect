# Trace Analysis Report - 2025-11-26

Analysis of 7 traces, 1,586 LLM calls, ~$1.45 total cost.

## Executive Summary

**4 out of 7 traces (57%) had errors.** The extraction pipeline has several critical issues:

| Issue | Severity | Impact |
|-------|----------|--------|
| Semantic search failures | Critical | Chunks fail entirely when class retrieval errors |
| Entity mistyping | High | Players typed as Teams, years typed as Matches |
| Schema doesn't constrain types | High | LLM can use any URI, not just allowed classes |
| Transport/network errors | Medium | Intermittent API failures, retries not always working |

---

## Issue 1: Semantic Search Class Retrieval Failures (CRITICAL)

### Symptoms
```
"Class retrieval failed for mention shaw"
"Class retrieval failed for mention ruben_amorim"
"Class retrieval failed for mention premier_league"
"Class retrieval failed for mention nick_wright"
```

### Root Cause
When `OntologyService.searchClassesSemantic()` fails (Nomic embedding API error or zero results), the entire chunk processing pipeline fails. The error propagates up and causes "All fibers interrupted without errors" cascade.

### Evidence
- Trace `94ca9895` has **0 entities despite 12 chunks and 24 LLM calls**
- Multiple chunks fail with class retrieval errors
- The semantic search returns Effect errors instead of empty results

### Impact
- Chunks with common entity mentions (Shaw, Amorim, Premier League) fail entirely
- No partial results recovered from failed chunks

### Proposed Fixes
1. **Return empty Chunk instead of failing** when semantic search finds no matches
2. **Add fallback to BM25 search** when semantic search fails
3. **Cache the semantic index** instead of recreating per chunk (expensive)
4. **Add retry with backoff** for Nomic API calls

---

## Issue 2: Entity Mistyping (HIGH)

### Symptoms
From trace `3f1590c9d9546f67` relation extraction:
```
- eberechi_eze (Eberechi Eze): [http://visualdataweb.org/newOntology/Team]  <- WRONG: is a Player
- arsenal_fc (Arsenal): [http://visualdataweb.org/newOntology/Team]         <- CORRECT
- alan_sunderland (Alan Sunderland): [http://visualdataweb.org/newOntology/Team] <- WRONG: is a Player
- e1978 (1978): [http://visualdataweb.org/newOntology/Match]                <- WRONG: is a year
- e2025 (2025): [http://visualdataweb.org/newOntology/Match]                <- WRONG: is a year
```

### Root Cause
**Semantic search returning wrong classes.** The ontology has 13 classes including `Player`, but only 5 classes are passed to entity extraction. The semantic search fails to retrieve `Player` class for mentions of players.

Query: "Eberechi Eze: A player who scored a hat-trick"
Expected: Player class
Actual: Team, Match (semantic search misses Player)

### Why This Happens
1. Per-mention semantic search with only top-5 results
2. Semantic similarity may favor "Team" for football context over "Player"
3. No validation that returned classes semantically match entity type

### Impact
- ~30% of entities incorrectly typed based on sample
- Downstream relation extraction inherits wrong types
- Knowledge graph has incorrect RDF triples

### Proposed Fixes
1. **Increase semantic search limit** from 5 to 10-15 classes
2. **Add class description matching** - compare entity context to class definitions
3. **Consider ensemble approach** - combine semantic + BM25 search results
4. **Add a type verification step** - LLM double-check entity types before relation extraction

---

## Issue 3: Schema Doesn't Constrain Allowed Types (HIGH)

### Current Schema
```json
{
  "types": {
    "type": "array",
    "items": {"type": "string"},
    "minItems": 1
  }
}
```

### Problem
The schema accepts **any string** for types. There's no `enum` constraint limiting types to the 5 allowed classes. The LLM can invent URIs or use wrong casing.

### Evidence
- Schema in trace shows no enum constraint on types
- Prompt includes "ALLOWED CLASSES" list but schema doesn't enforce it
- LLM can hallucinate class URIs

### Proposed Fixes
1. **Add enum constraint to schema**:
   ```json
   {
     "types": {
       "type": "array",
       "items": {
         "type": "string",
         "enum": ["http://visualdataweb.org/newOntology/Player", ...]
       }
     }
   }
   ```
2. **Keep current approach but add post-validation** filtering invalid types

See: `packages/@core-v2/src/Schema/EntityFactory.ts`

---

## Issue 4: Years Being Extracted as Entities

### Symptoms
```
- e1978 (1978): [http://visualdataweb.org/newOntology/Match]
- e2025 (2025): [http://visualdataweb.org/newOntology/Match]
- e1934 (1934): [http://visualdataweb.org/newOntology/Match]
```

### Problem
Mention extraction extracts years as entity mentions. Entity extraction then tries to type them, and the only reasonable class is "Match" (a specific event).

### Impact
- Noise entities pollute the knowledge graph
- Wasted LLM tokens on non-entity mentions
- Incorrect Match instances (1978 is not a match, it's a year)

### Proposed Fixes
1. **Add negative examples to mention extraction prompt**:
   ```
   DO NOT extract:
   - Bare numbers or years (1978, 2025)
   - Generic nouns without proper names
   ```
2. **Filter numeric-only mentions** in post-processing
3. **Add a "Date" or "Year" class** to ontology if temporal entities matter

---

## Issue 5: Transport/Network Errors

### Symptoms
```
"Transport: An HTTP request error occurred. (POST https://api.anthropic.com/v1/messages?beta=true)"
"Transport error (POST https://api.anthropic.com/v1/messages?beta=true)"
```

### Evidence
- Trace `814fab42` has 26 transport errors
- Multiple LLM calls fail despite retry configuration

### Current Retry Configuration
- `maxAttempts: 8`
- Exponential backoff configured

### Questions
- Are retries actually being triggered?
- Is the backoff sufficient for rate limits?
- Are connection errors vs rate limits distinguished?

### Proposed Fixes
1. **Add circuit breaker** for sustained API failures
2. **Log retry attempts** with more detail
3. **Add jitter to backoff** to prevent thundering herd

---

## Issue 6: Prompt Truncation in Traces (Observability)

### Symptoms
- Prompt text truncated at ~1000-2000 characters
- Cannot see full ontology schema in traces
- Hard to debug class retrieval issues

### Evidence
```json
"promptText": "...http://visualdataweb.or" <- truncated mid-URL
```

### Current Behavior
`LlmAttributes.ts:102-104`:
```typescript
yield* Effect.annotateCurrentSpan(
  LlmAttributes.PROMPT_TEXT,
  attrs.promptText.slice(0, 1000)
)
```

### Proposed Fixes
1. **Increase truncation limit** to 4000 chars for debugging
2. **Store full prompt in separate span attribute** for detailed analysis
3. **Hash and store prompts in file** with reference in span

---

## Metrics Summary

| Metric | Value |
|--------|-------|
| Traces analyzed | 7 |
| Traces with errors | 4 (57%) |
| Total LLM calls | 1,586 |
| Total input tokens | 1,102,591 |
| Total output tokens | 153,907 |
| Total cost | $1.45 |
| Entities extracted | 613 |
| Relations extracted | 684 |
| Avg entities/trace | 87.6 |
| Avg relations/trace | 97.7 |

---

## Recommended Priority

1. **P0: Fix semantic search failures** - Return empty instead of error
2. **P0: Increase semantic search limit** - 5 classes is too few
3. **P1: Add enum constraint to schema** - Prevent hallucinated URIs
4. **P1: Filter numeric mentions** - Reduce noise entities
5. **P2: Improve transport error handling** - Circuit breaker
6. **P2: Increase trace prompt truncation** - Better observability

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/Workflow/StreamingExtraction.ts:210` | Handle empty semantic search gracefully |
| `src/Service/Ontology.ts:864` | Increase limit, add fallback |
| `src/Schema/EntityFactory.ts` | Add enum constraint to types |
| `src/Prompt/PromptGenerator.ts` | Add negative examples for mentions |
| `src/Telemetry/LlmAttributes.ts` | Increase truncation limit |
