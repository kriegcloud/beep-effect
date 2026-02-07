# V05: Array Emptiness Checks Audit Report

## Summary

| Metric | Count |
|--------|-------|
| Total Violations | 35 |
| Files Affected | 11 |
| `.length === 0` | 17 |
| `.length > 0` | 18 |

## Rule Definition

**Source**: `.claude/rules/effect-patterns.md`

**Violation**: Using native `.length` property for array emptiness checks.

**Correct Pattern**:
```typescript
import * as A from "effect/Array";

// For empty check
A.isEmptyReadonlyArray(array)

// For non-empty check
A.isNonEmptyReadonlyArray(array)
```

---

## Violations by File

### 1. `packages/knowledge/server/src/GraphRAG/GraphRAGService.ts`

**Violation 1** (Line 229):
```typescript
// CURRENT
if (similarResults.length === 0) {

// CORRECT
if (A.isEmptyReadonlyArray(similarResults)) {
```

**Violation 2** (Line 349):
```typescript
// CURRENT
if (seedEntityIds.length === 0) {

// CORRECT
if (A.isEmptyReadonlyArray(seedEntityIds)) {
```

**Violation 3** (Line 450):
```typescript
// CURRENT
for (let hop = 1; hop <= maxHops && frontier.length > 0; hop++) {

// CORRECT
for (let hop = 1; hop <= maxHops && A.isNonEmptyReadonlyArray(frontier); hop++) {
```

---

### 2. `packages/knowledge/server/src/GraphRAG/ContextFormatter.ts`

**Violation 4** (Line 45):
```typescript
// CURRENT
const typeStr = types.length > 0 ? A.join(types, ", ") : "Unknown";

// CORRECT
const typeStr = A.isNonEmptyReadonlyArray(types) ? A.join(types, ", ") : "Unknown";
```

**Violation 5** (Line 49):
```typescript
// CURRENT
attrEntries.length > 0

// CORRECT
A.isNonEmptyReadonlyArray(attrEntries)
```

**Violation 6** (Line 121):
```typescript
// CURRENT
if (entities.length > 0) {

// CORRECT
if (A.isNonEmptyReadonlyArray(entities)) {
```

**Violation 7** (Line 127):
```typescript
// CURRENT
if (relations.length > 0) {

// CORRECT
if (A.isNonEmptyReadonlyArray(relations)) {
```

**Violation 8** (Line 160):
```typescript
// CURRENT
if (entities.length > 0) {

// CORRECT
if (A.isNonEmptyReadonlyArray(entities)) {
```

**Violation 9** (Line 170):
```typescript
// CURRENT
if (relations.length > 0) {

// CORRECT
if (A.isNonEmptyReadonlyArray(relations)) {
```

**Violation 10** (Line 229):
```typescript
// CURRENT
while (tokens > maxTokens && includedRelations.length > 0) {

// CORRECT
while (tokens > maxTokens && A.isNonEmptyReadonlyArray(includedRelations)) {
```

---

### 3. `packages/knowledge/server/src/Nlp/NlpService.ts`

**Violation 11** (Line 44):
```typescript
// CURRENT
return parts.length > 0 ? parts : [text];

// CORRECT
return A.isNonEmptyReadonlyArray(parts) ? parts : [text];
```

**Violation 12** (Line 64):
```typescript
// CURRENT
if (currentChunkSentences.length === 0) return;

// CORRECT
if (A.isEmptyReadonlyArray(currentChunkSentences)) return;
```

**Violation 13** (Line 92):
```typescript
// CURRENT
if (currentLength + sentence.length > config.maxChunkSize && currentChunkSentences.length > 0) {

// CORRECT
if (currentLength + sentence.length > config.maxChunkSize && A.isNonEmptyReadonlyArray(currentChunkSentences)) {
```

**Violation 14** (Line 101):
```typescript
// CURRENT
if (currentChunkSentences.length > 0) {

// CORRECT
if (A.isNonEmptyReadonlyArray(currentChunkSentences)) {
```

**Violation 15** (Line 157):
```typescript
// CURRENT
if (text.length === 0) {

// CORRECT - NOTE: This is a string, not array. Use Str.isEmpty instead:
if (Str.isEmpty(text)) {
```

---

### 4. `packages/knowledge/server/src/Grounding/ConfidenceFilter.ts`

**Violation 16** (Line 286):
```typescript
// CURRENT
if (values.length === 0) {

// CORRECT
if (A.isEmptyReadonlyArray(values)) {
```

---

### 5. `packages/knowledge/server/src/Grounding/GroundingService.ts`

**Violation 17** (Line 119):
```typescript
// CURRENT
if (a.length !== b.length || a.length === 0) {

// CORRECT
if (a.length !== b.length || A.isEmptyReadonlyArray(a)) {
```

**Violation 18** (Line 210):
```typescript
// CURRENT
if (graph.relations.length === 0) {

// CORRECT
if (A.isEmptyReadonlyArray(graph.relations)) {
```

**Violation 19** (Line 290):
```typescript
// CURRENT
averageConfidence: grounded.length > 0 ? totalConfidence / grounded.length : 0,

// CORRECT
averageConfidence: A.isNonEmptyReadonlyArray(grounded) ? totalConfidence / grounded.length : 0,
```

---

### 6. `packages/knowledge/server/src/Extraction/EntityExtractor.ts`

**Violation 20** (Line 115):
```typescript
// CURRENT
additionalTypes: validAdditional.length > 0 ? validAdditional : undefined,

// CORRECT
additionalTypes: A.isNonEmptyReadonlyArray(validAdditional) ? validAdditional : undefined,
```

**Violation 21** (Line 146):
```typescript
// CURRENT
if (mentions.length === 0) {

// CORRECT
if (A.isEmptyReadonlyArray(mentions)) {
```

---

### 7. `packages/knowledge/server/src/Extraction/GraphAssembler.ts`

**Violation 22** (Line 349):
```typescript
// CURRENT
if (graphs.length === 0) {

// CORRECT
if (A.isEmptyReadonlyArray(graphs)) {
```

---

### 8. `packages/knowledge/server/src/EntityResolution/SameAsLinker.ts`

**Violation 23** (Line 346):
```typescript
// CURRENT
valid: issues.length === 0,

// CORRECT
valid: A.isEmptyReadonlyArray(issues),
```

---

### 9. `packages/knowledge/server/src/EntityResolution/EntityClusterer.ts`

**Violation 24** (Line 132):
```typescript
// CURRENT
if (entities.length === 0) return [];

// CORRECT
if (A.isEmptyReadonlyArray(entities)) return [];
```

**Violation 25** (Line 357):
```typescript
// CURRENT
if (members.length === 0) continue;

// CORRECT
if (A.isEmptyReadonlyArray(members)) continue;
```

**Violation 26** (Line 425):
```typescript
// CURRENT
if (allEntities.length === 0) {

// CORRECT
if (A.isEmptyReadonlyArray(allEntities)) {
```

**Violation 27** (Line 446):
```typescript
// CURRENT
if (embedding.length > 0) {

// CORRECT
if (A.isNonEmptyReadonlyArray(embedding)) {
```

**Violation 28** (Line 518):
```typescript
// CURRENT
if (candidateEmbedding.length === 0) continue;

// CORRECT
if (A.isEmptyReadonlyArray(candidateEmbedding)) continue;
```

---

### 10. `packages/knowledge/server/src/EntityResolution/CanonicalSelector.ts`

**Violation 29** (Line 119):
```typescript
// CURRENT
if (cluster.length === 0) {

// CORRECT
if (A.isEmptyReadonlyArray(cluster)) {
```

**Violation 30** (Line 208):
```typescript
// CURRENT
if (members.length === 0) {

// CORRECT
if (A.isEmptyReadonlyArray(members)) {
```

---

### 11. `packages/knowledge/server/src/EntityResolution/EntityResolutionService.ts`

**Violation 31** (Line 283):
```typescript
// CURRENT
if (members.length === 0) continue;

// CORRECT
if (A.isEmptyReadonlyArray(members)) continue;
```

**Violation 32** (Line 315):
```typescript
// CURRENT
const averageClusterSize = updatedClusters.length > 0 ? totalMembers / updatedClusters.length : 0;

// CORRECT
const averageClusterSize = A.isNonEmptyReadonlyArray(updatedClusters) ? totalMembers / updatedClusters.length : 0;
```

---

### 12. `packages/knowledge/server/src/Ai/PromptTemplates.ts`

**Violation 33** (Line 70):
```typescript
// CURRENT
const altLabels = cls.altLabels.length > 0 ? ` (also: ${A.join(", ")(cls.altLabels)})` : "";

// CORRECT
const altLabels = A.isNonEmptyReadonlyArray(cls.altLabels) ? ` (also: ${A.join(", ")(cls.altLabels)})` : "";
```

**Violation 34** (Line 136):
```typescript
// CURRENT
const domainStr = domainLabels.length > 0 ? `domain: ${A.join(", ")(domainLabels)}` : "";

// CORRECT
const domainStr = A.isNonEmptyReadonlyArray(domainLabels) ? `domain: ${A.join(", ")(domainLabels)}` : "";
```

**Violation 35** (Line 137):
```typescript
// CURRENT
const rangeStr = rangeLabels.length > 0 ? `range: ${A.join(", ")(rangeLabels)}` : "";

// CORRECT
const rangeStr = A.isNonEmptyReadonlyArray(rangeLabels) ? `range: ${A.join(", ")(rangeLabels)}` : "";
```

---

## Special Cases

### String Length Check (NlpService.ts:157)

The check `text.length === 0` is for a string, not an array. The correct fix uses:
```typescript
import * as Str from "effect/String";

// CORRECT
if (Str.isEmpty(text)) {
```

### Numeric Embedding Vectors (EntityClusterer.ts, GroundingService.ts)

Several checks involve numeric embedding vectors (e.g., `candidateEmbedding.length === 0`). While these are technically arrays, `A.isEmptyReadonlyArray` is still the correct approach for consistency.

---

## Test File Exclusions

The following violation was found in a test file and is **excluded** from the main count:

**packages/knowledge/server/test/Nlp/NlpService.test.ts** (Line 68):
```typescript
// Test assertion - acceptable in test context
assertTrue(lastChar === "." || lastChar === "!" || lastChar === "?" || chunk.text.trim().length === 0);
```

---

## Remediation Priority

| Priority | File | Violations |
|----------|------|------------|
| High | EntityClusterer.ts | 5 |
| High | ContextFormatter.ts | 7 |
| Medium | NlpService.ts | 5 |
| Medium | GroundingService.ts | 3 |
| Medium | PromptTemplates.ts | 3 |
| Medium | GraphRAGService.ts | 3 |
| Low | EntityResolutionService.ts | 2 |
| Low | CanonicalSelector.ts | 2 |
| Low | EntityExtractor.ts | 2 |
| Low | SameAsLinker.ts | 1 |
| Low | ConfidenceFilter.ts | 1 |
| Low | GraphAssembler.ts | 1 |

---

## Import Requirements

All affected files need to ensure they have the Array import:
```typescript
import * as A from "effect/Array";
```

Files with string length checks also need:
```typescript
import * as Str from "effect/String";
```
