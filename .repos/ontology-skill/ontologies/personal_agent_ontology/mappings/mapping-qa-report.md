# PAO Mapping Quality Report

Date: 2026-02-20
Version: 0.5.0
Mapper: ontology-mapper skill

## Summary

| Metric | Value |
|--------|-------|
| Mapping files | 4 |
| Total mappings | 52 |
| PAO classes mapped | 24/56 (43%) |
| PAO properties mapped | 6/88 (7%) |
| exactMatch count | 3 |
| Transitivity conflicts | 0 |
| Validation errors | 0 |

## Mapping Files

### pao-to-schema.sssom.tsv (schema.org)

- **Target**: schema.org vocabulary (web interoperability)
- **Mappings**: 18
- **Predicates**: closeMatch (9), broadMatch (4), exactMatch (3), narrowMatch (1), relatedMatch (1)
- **Confidence**: 0.45 - 0.95 (mean 0.72)
- **exactMatch pairs**:
  - `pao:Conversation` -> `schema:Conversation` (0.95)
  - `pao:Message` -> `schema:Message` (0.92)
  - `pao:Organization` -> `schema:Organization` (0.92)
- **v0.5.0 additions**: CommunicationChannel -> ContactPoint (closeMatch),
  Integration -> WebAPI (closeMatch), Organization -> Organization (exactMatch),
  viaChannel -> serviceUrl (relatedMatch)
- **Rationale**: Schema.org is the primary interoperability target. Action,
  conversation, and message concepts have strong structural overlap. Memory
  operations map to CRUD actions at a broader level. v0.5.0 adds integration
  and channel coverage.

### pao-to-as2.sssom.tsv (ActivityStreams 2.0)

- **Target**: W3C ActivityStreams 2.0 (activity log interop, Fediverse)
- **Mappings**: 14
- **Predicates**: closeMatch (9), broadMatch (5)
- **Confidence**: 0.55 - 0.88 (mean 0.73)
- **v0.5.0 additions**: Organization -> as:Organization (closeMatch),
  Integration -> as:Service (closeMatch)
- **Rationale**: AS2 provides a complementary activity vocabulary. The
  Actor/Activity/Object model maps naturally to PAO's Agent/Action/Entity
  pattern, but AS2's looser semantics prevent exactMatch.

### pao-to-sioc.sssom.tsv (SIOC)

- **Target**: Semantically-Interlinked Online Communities (conversation threading)
- **Mappings**: 11 (including 3 property mappings)
- **Predicates**: closeMatch (9), broadMatch (2)
- **Confidence**: 0.55 - 0.90 (mean 0.77)
- **v0.5.0 additions**: CommunicationChannel -> sioc:Site (closeMatch)
- **Rationale**: SIOC's Thread/Post model is the closest structural match
  to PAO's Conversation/Turn pattern. Property mappings (hasTopic, hasContent,
  partOfConversation) strengthen the alignment. SIOC is the highest mean
  confidence mapping set.

### pao-to-dpv.sssom.tsv (Data Privacy Vocabulary)

- **Target**: W3C Data Privacy Vocabulary (privacy compliance)
- **Mappings**: 9 (including 1 property mapping)
- **Predicates**: closeMatch (6), broadMatch (2), relatedMatch (1)
- **Confidence**: 0.50 - 0.85 (mean 0.68)
- **v0.5.0 additions**: Integration -> dpv:DataProcessor (relatedMatch)
- **Rationale**: DPV aligns with PAO's governance module (PermissionPolicy,
  SafetyConstraint, ErasureEvent). Essential for privacy compliance
  interoperability in agent systems handling personal data.

## Predicate Distribution

| Predicate | Count | % |
|-----------|-------|---|
| skos:closeMatch | 33 | 63.5% |
| skos:broadMatch | 13 | 25.0% |
| skos:exactMatch | 3 | 5.8% |
| skos:relatedMatch | 2 | 3.8% |
| skos:narrowMatch | 1 | 1.9% |

The conservative predicate distribution (64% closeMatch, 25% broadMatch)
reflects the cross-domain nature of these mappings. PAO's BFO-aligned formal
semantics rarely match exactly with the lighter-weight web vocabularies.
Only 3 mappings qualify as exactMatch (Conversation, Message, Organization
to schema.org). v0.5.0 introduced 2 relatedMatch predicates for weak
structural parallels (viaChannel -> serviceUrl, Integration -> DataProcessor).

## Transitivity Analysis

- **exactMatch chains**: None detected. The 3 exactMatch mappings
  (pao:Conversation, pao:Message, pao:Organization) only target schema.org
  and do not participate in any transitive chains across mapping files.
- **Clique size**: Maximum clique size is 2 (binary pairs only).

## Coverage Analysis

### Mapped PAO Classes (24/56)

| PAO Class | Mapping Targets |
|-----------|----------------|
| Action | schema, as2 |
| Agent | schema, as2, sioc, dpv |
| AgentRole | sioc |
| AIAgent | schema, as2 |
| CommunicationChannel | schema, sioc |
| Consolidation | as2 |
| Conversation | schema, as2, sioc |
| Encoding | schema, as2 |
| ErasureEvent | schema, as2, dpv |
| Forgetting | schema, as2 |
| HumanUser | schema, as2, sioc, dpv |
| Integration | schema, as2, dpv |
| MemoryItem | dpv |
| Message | schema, sioc |
| Organization | schema, as2 |
| PermissionPolicy | dpv |
| Plan | schema |
| Retrieval | schema, as2 |
| SafetyConstraint | dpv |
| Session | sioc |
| Task | schema |
| ToolInvocation | schema, as2 |
| Turn | schema, sioc |

### Unmapped Classes (32/56)

The 32 unmapped classes fall into three categories:

**Domain-specific (no external equivalents)**: Claim, CompactionEvent,
CompactionDisposition, ContextWindow, Episode, Intention, MemoryBlock,
MemoryOperation, MemoryTier, Observation, Persona, Rehearsal, StatusTransition,
SessionStatusTransition, TaskStatusTransition, SubAgent, ToolDefinition,
WorkingMemory, EpisodicMemory, SemanticMemory, ProceduralMemory. These
represent PAO's novel contributions to the AI agent domain.

**Value partitions (not mappable)**: Status, SessionStatus, TaskStatus,
ComplianceStatus, SensitivityLevel, ItemFate, ChannelType, IntegrationStatus.
Status types are PAO-internal value partitions with owl:oneOf enumerations.

**Governance/planning (weak matches only)**: Goal, ConsentRecord,
RetentionPolicy. These have governance semantics that don't align cleanly
with the 4 target vocabularies.

## Methodology

- **Candidate generation**: Manual semantic analysis informed by reuse
  report recommendations (no lexical matching — target vocabularies are
  not OBO-format ontologies).
- **Verification**: LLM-assisted semantic evaluation with definition
  comparison, parent class analysis, and BFO category alignment.
- **Confidence calibration**: Conservative confidence assignments reflecting
  cross-domain semantic distance. Scores below 0.55 were excluded.
- **Justification**: All mappings use `semapv:SemanticSimilarityThresholdMatching`.

## v0.5.0 Changes

- Added 8 new mappings across 4 files for CommunicationChannel, Integration,
  and Organization classes
- New exactMatch: pao:Organization -> schema:Organization (0.92)
- New closeMatch: CommunicationChannel -> schema:ContactPoint, sioc:Site;
  Integration -> schema:WebAPI, as:Service
- New relatedMatch: viaChannel -> schema:serviceUrl, Integration -> dpv:DataProcessor
- Updated subject_source_version to 0.5.0 in all mapping files

## Recommendations

1. **SIOC property mappings could be extended**: Additional property
   pairs (e.g., performedBy/sioc:has_creator, inSession/sioc:has_container)
   could strengthen the conversation threading alignment.

2. **SEM (Simple Event Model) mapping**: Identified as Priority 5 in the
   reuse report but not yet created. Would add 3-4 broadMatch pairs for
   the event hierarchy.

3. **MCP ontology mapping**: When a formal MCP vocabulary is published,
   Integration -> MCP:Server and ChannelType individuals -> MCP transport
   types would be valuable exactMatch candidates.

4. **Future versions**: As target vocabularies evolve, review mappings
   for upgraded predicates (closeMatch -> exactMatch where definitions
   converge).
