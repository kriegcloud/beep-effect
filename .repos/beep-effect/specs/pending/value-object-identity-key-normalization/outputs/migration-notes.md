# Migration Notes

## Files Renamed

| old_path | new_path |
|---|---|
| `packages/workspaces/domain/src/value-objects/AccessLevel.value.ts` | `packages/workspaces/domain/src/values/AccessLevel.value.ts` |
| `packages/workspaces/domain/src/value-objects/DefaultAccess.value.ts` | `packages/workspaces/domain/src/values/DefaultAccess.value.ts` |
| `packages/workspaces/domain/src/value-objects/PageType.value.ts` | `packages/workspaces/domain/src/values/PageType.value.ts` |
| `packages/workspaces/domain/src/value-objects/SerializedEditorState.ts` | `packages/workspaces/domain/src/values/SerializedEditorState.value.ts` |
| `packages/workspaces/domain/src/value-objects/ShareType.value.ts` | `packages/workspaces/domain/src/values/ShareType.value.ts` |
| `packages/workspaces/domain/src/value-objects/link-type.value.ts` | `packages/workspaces/domain/src/values/LinkType.value.ts` |
| `packages/workspaces/domain/src/value-objects/text-style.value.ts` | `packages/workspaces/domain/src/values/TextStyle.value.ts` |
| `packages/knowledge/domain/src/value-objects/Attributes.value.ts` | `packages/knowledge/domain/src/values/Attributes.value.ts` |
| `packages/knowledge/domain/src/value-objects/BatchConfig.value.ts` | `packages/knowledge/domain/src/values/BatchConfig.value.ts` |
| `packages/knowledge/domain/src/value-objects/BatchEvent.value.ts` | `packages/knowledge/domain/src/values/BatchEvent.value.ts` |
| `packages/knowledge/domain/src/value-objects/BatchMachine.schema.ts` | `packages/knowledge/domain/src/values/BatchMachine.schema.ts` |
| `packages/knowledge/domain/src/value-objects/BatchState.value.ts` | `packages/knowledge/domain/src/values/BatchState.value.ts` |
| `packages/knowledge/domain/src/value-objects/ClassIri.value.ts` | `packages/knowledge/domain/src/values/ClassIri.value.ts` |
| `packages/knowledge/domain/src/value-objects/CountResult.value.ts` | `packages/knowledge/domain/src/values/CountResult.value.ts` |
| `packages/knowledge/domain/src/value-objects/EntityCandidate.value.ts` | `packages/knowledge/domain/src/values/EntityCandidate.value.ts` |
| `packages/knowledge/domain/src/value-objects/EvidenceSpan.value.ts` | `packages/knowledge/domain/src/values/EvidenceSpan.value.ts` |
| `packages/knowledge/domain/src/value-objects/ExtractionConfig.value.ts` | `packages/knowledge/domain/src/values/ExtractionConfig.value.ts` |
| `packages/knowledge/domain/src/value-objects/ExtractionProgress.value.ts` | `packages/knowledge/domain/src/values/ExtractionProgress.value.ts` |
| `packages/knowledge/domain/src/value-objects/MergeParams.value.ts` | `packages/knowledge/domain/src/values/MergeParams.value.ts` |
| `packages/knowledge/domain/src/value-objects/RelationDirection.value.ts` | `packages/knowledge/domain/src/values/RelationDirection.value.ts` |
| `packages/knowledge/domain/src/value-objects/WorkflowState.value.ts` | `packages/knowledge/domain/src/values/WorkflowState.value.ts` |
| `packages/knowledge/domain/src/value-objects/shacl-policy.value.ts` | `packages/knowledge/domain/src/values/ShaclPolicy.value.ts` |
| `packages/knowledge/domain/src/value-objects/token-budget.value.ts` | `packages/knowledge/domain/src/values/TokenBudget.value.ts` |
| `packages/knowledge/domain/src/value-objects/validation-report.value.ts` | `packages/knowledge/domain/src/values/ValidationReport.value.ts` |
| `packages/knowledge/domain/src/value-objects/rdf/NamedGraph.ts` | `packages/knowledge/domain/src/values/rdf/NamedGraph.value.ts` |
| `packages/knowledge/domain/src/value-objects/rdf/ProvenanceVocabulary.ts` | `packages/knowledge/domain/src/values/rdf/ProvenanceVocabulary.value.ts` |
| `packages/knowledge/domain/src/value-objects/rdf/Quad.ts` | `packages/knowledge/domain/src/values/rdf/Quad.value.ts` |
| `packages/knowledge/domain/src/value-objects/rdf/QuadPattern.ts` | `packages/knowledge/domain/src/values/rdf/QuadPattern.value.ts` |
| `packages/knowledge/domain/src/value-objects/rdf/RdfFormat.ts` | `packages/knowledge/domain/src/values/rdf/RdfFormat.value.ts` |
| `packages/knowledge/domain/src/value-objects/rdf/SparqlBindings.ts` | `packages/knowledge/domain/src/values/rdf/SparqlBindings.value.ts` |
| `packages/knowledge/domain/src/value-objects/reasoning/InferenceResult.ts` | `packages/knowledge/domain/src/values/reasoning/InferenceResult.value.ts` |
| `packages/knowledge/domain/src/value-objects/reasoning/ReasoningConfig.ts` | `packages/knowledge/domain/src/values/reasoning/ReasoningConfig.value.ts` |
| `packages/knowledge/domain/src/value-objects/reasoning/ReasoningProfile.ts` | `packages/knowledge/domain/src/values/reasoning/ReasoningProfile.value.ts` |
| `packages/knowledge/domain/src/value-objects/sparql/SparqlQuery.ts` | `packages/knowledge/domain/src/values/sparql/SparqlQuery.value.ts` |
| `packages/comms/domain/src/value-objects/logging.value.ts` | `packages/comms/domain/src/values/Logging.value.ts` |
| `packages/comms/domain/src/value-objects/mail.value.ts` | `packages/comms/domain/src/values/Mail.value.ts` |
| `packages/shared/domain/src/value-objects/EntitySource.value.ts` | `packages/shared/domain/src/values/EntitySource.value.ts` |
| `packages/shared/domain/src/value-objects/LocalDate.ts` | `packages/shared/domain/src/values/LocalDate.value.ts` |
| `packages/shared/domain/src/value-objects/Plan.ts` | `packages/shared/domain/src/values/Plan.value.ts` |
| `packages/shared/domain/src/value-objects/Query.ts` | `packages/shared/domain/src/values/Query.value.ts` |
| `packages/shared/domain/src/value-objects/paths.value.ts` | `packages/shared/domain/src/values/paths.value.ts` |
| `packages/customization/domain/src/value-objects/index.ts` | `packages/customization/domain/src/values/index.ts` |

## Identity Key Rewrites

| file | old_key | new_key |
|---|---|---|
| `packages/workspaces/domain/src/values/SerializedEditorState.value.ts` | `values/SerializedEditorState` | `values/SerializedEditorState.value` |
| `packages/workspaces/domain/src/values/LinkType.value.ts` | `schemaId: @beep/workspaces-domain/value-objects/LinkType` | `values/LinkType.value` |
| `packages/workspaces/domain/src/values/TextStyle.value.ts` | `schemaId: @beep/workspaces-domain/value-objects/TextStyle` | `values/TextStyle.value` |
| `packages/knowledge/domain/src/values/Attributes.value.ts` | `values/Attributes` | `values/Attributes.value` |
| `packages/knowledge/domain/src/values/BatchConfig.value.ts` | `values/batch-config` | `values/BatchConfig.value` |
| `packages/knowledge/domain/src/values/BatchEvent.value.ts` | `values/batch-event` | `values/BatchEvent.value` |
| `packages/knowledge/domain/src/values/BatchState.value.ts` | `values/batch-state` | `values/BatchState.value` |
| `packages/knowledge/domain/src/values/ClassIri.value.ts` | `values/ClassIri` | `values/ClassIri.value` |
| `packages/knowledge/domain/src/values/CountResult.value.ts` | `values/count-result.value` | `values/CountResult.value` |
| `packages/knowledge/domain/src/values/EntityCandidate.value.ts` | `values/EntityCandidate` | `values/EntityCandidate.value` |
| `packages/knowledge/domain/src/values/EvidenceSpan.value.ts` | `values/EvidenceSpan` | `values/EvidenceSpan.value` |
| `packages/knowledge/domain/src/values/ExtractionConfig.value.ts` | `values/extraction-config` | `values/ExtractionConfig.value` |
| `packages/knowledge/domain/src/values/ExtractionProgress.value.ts` | `values/extraction-progress` | `values/ExtractionProgress.value` |
| `packages/knowledge/domain/src/values/MergeParams.value.ts` | `values/MergeParams` | `values/MergeParams.value` |
| `packages/knowledge/domain/src/values/RelationDirection.value.ts` | `values/relation-direction.value` | `values/RelationDirection.value` |
| `packages/knowledge/domain/src/values/WorkflowState.value.ts` | `values/workflow-state` | `values/WorkflowState.value` |
| `packages/knowledge/domain/src/values/ShaclPolicy.value.ts` | `values/shacl-policy` | `values/ShaclPolicy.value` |
| `packages/knowledge/domain/src/values/TokenBudget.value.ts` | `values/token-budget.value` | `values/TokenBudget.value` |
| `packages/knowledge/domain/src/values/ValidationReport.value.ts` | `values/validation-report` | `values/ValidationReport.value` |
| `packages/knowledge/domain/src/values/rdf/NamedGraph.value.ts` | `values/rdf/NamedGraph` | `values/rdf/NamedGraph.value` |
| `packages/knowledge/domain/src/values/rdf/ProvenanceVocabulary.value.ts` | `values/rdf/ProvenanceVocabulary` | `values/rdf/ProvenanceVocabulary.value` |
| `packages/knowledge/domain/src/values/rdf/Quad.value.ts` | `values/rdf/Quad` | `values/rdf/Quad.value` |
| `packages/knowledge/domain/src/values/rdf/QuadPattern.value.ts` | `values/rdf/QuadPattern` | `values/rdf/QuadPattern.value` |
| `packages/knowledge/domain/src/values/rdf/RdfFormat.value.ts` | `values/rdf/RdfFormat` | `values/rdf/RdfFormat.value` |
| `packages/knowledge/domain/src/values/rdf/SparqlBindings.value.ts` | `values/rdf/SparqlBindings` | `values/rdf/SparqlBindings.value` |
| `packages/knowledge/domain/src/values/sparql/SparqlQuery.value.ts` | `values/sparql/SparqlQuery` | `values/sparql/SparqlQuery.value` |
| `packages/knowledge/domain/src/values/reasoning/InferenceResult.value.ts` | `values/reasoning/InferenceResult` | `values/reasoning/InferenceResult.value` |
| `packages/knowledge/domain/src/values/reasoning/ReasoningConfig.value.ts` | `values/reasoning/ReasoningConfig` | `values/reasoning/ReasoningConfig.value` |
| `packages/knowledge/domain/src/values/reasoning/ReasoningProfile.value.ts` | `values/reasoning/ReasoningProfile` | `values/reasoning/ReasoningProfile.value` |
| `packages/comms/domain/src/values/Logging.value.ts` | `values/logging.values` | `values/Logging.value` |
| `packages/comms/domain/src/values/Mail.value.ts` | `values/mail.values` | `values/Mail.value` |
| `packages/shared/domain/src/values/EntitySource.value.ts` | `schemaId: @beep/shared-domain/value-objects/EntitySource` | `values/EntitySource.value` |
| `packages/shared/domain/src/values/LocalDate.value.ts` | `LocalDate` (raw class id) | `values/LocalDate.value` |
| `packages/shared/domain/src/values/Plan.value.ts` | `values/Plan` | `values/Plan.value` |
| `packages/shared/domain/src/values/Query.value.ts` | `values/Query` | `values/Query.value` |

## Exceptions and Rationale

| path | decision | rationale |
|---|---|---|
| `packages/knowledge/domain/src/values/BatchMachine.schema.ts` | Kept `*.schema.ts` filename | This file defines an effect-machine state/event schema, not a value-object file. |
| `packages/shared/domain/src/values/paths.value.ts` | Kept lowercase filename | Utility path constants, not a schema identity/value object. |
| `mcp-refactor-typescript` tool | Not used (unavailable in this session) | Applied deterministic `mv` + targeted import rewrites + grep assertions + per-slice compile checks. |

## Verification

### Package checks

| command | result | output snippet |
|---|---|---|
| `bun run --cwd packages/workspaces/domain check` | PASS | `$ tsgo --noEmit -p tsconfig.json` |
| `bun run --cwd packages/knowledge/domain check` | PASS | `$ tsgo --noEmit -p tsconfig.json` |
| `bun run --cwd packages/comms/domain check` | PASS | `$ tsgo --noEmit -p tsconfig.json` |
| `bun run --cwd packages/shared/domain check` | PASS | `$ tsgo --noEmit -p tsconfig.json` |
| `bun run --cwd packages/customization/domain check` | PASS | `$ tsgo --noEmit -p tsconfig.json` |
| `bun run --cwd packages/iam/domain check` | PASS | `$ tsgo --noEmit -p tsconfig.json` |

### Grep assertions

| assertion | command | result |
|---|---|---|
| No stale `value-objects` paths | `rg -n 'value-objects' packages/{workspaces,knowledge,comms,shared,customization,iam}/domain/src --glob '*.ts'` | PASS (no matches) |
| No `.values` identity suffixes | `rg -n 'create\("values/[^"\\n]*\\.values"\)' packages/{workspaces,knowledge,comms,shared,customization,iam}/domain/src --glob '*.ts'` | PASS (no matches) |
| No kebab/lowercase final identity tails | `rg -nP 'create\("values(?:/[a-z]+)*/(?:[a-z][A-Za-z0-9]*|[A-Za-z0-9]+-[A-Za-z0-9-]+)\\.value"\)' packages/{workspaces,knowledge,comms,shared,customization,iam}/domain/src --glob '*.ts'` | PASS (no matches) |
