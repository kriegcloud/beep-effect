# P1 Source Index

## Objective

Produce a complete, deterministic file inventory for all locked source areas and define evidence ID ranges used by `fact-ledger.json`.

## Inventory Method

1. Enumerate files with `find <source-root> -type f | sort` for each locked source area.
2. Classify file types by extension and split into text (`md|ts|mjs|json`) and binary (all others).
3. Use this snapshot as the sole counting baseline for `coverage-baseline.md` and evidence planning.

## Source Area Summary

| Source Area ID | Locked Path | Indexed Files | Text Files | Binary Files | Extension Breakdown | Index Status |
|---|---|---:|---:|---:|---|---|
| S01 | `tooling/repo-utils/src/JSDoc/*` | 31 | 31 | 0 | ts:31 | complete |
| S02 | `specs/pending/repo-codegraph-canonical/*` | 7 | 7 | 0 | md:7 | complete |
| S03 | `specs/pending/repo-codegraph-jsdoc/*` | 48 | 48 | 0 | md:40, ts:5, mjs:2, json:1 | complete |
| S04 | `.repos/beep-effect/packages/knowledge/_docs` | 78 | 75 | 3 | md:72, json:2, jpeg:1, jpg:1, pdf:1, ts:1 | complete |
| Total | -- | 164 | 161 | 3 | -- | complete |

## Evidence ID Allocation

| Source Area ID | Evidence ID Range Reserved in P1 | Notes |
|---|---|---|
| S01 | `E-S01-001` .. `E-S01-005` | JSDoc model and tag schema facts |
| S02 | `E-S02-001` .. `E-S02-004` | Canonical phase/gate architecture facts |
| S03 | `E-S03-001` .. `E-S03-005` | JSDoc fibration and validation artifact facts |
| S04 | `E-S04-001` .. `E-S04-006` | Knowledge corpus and binary metadata facts |

## Complete File Inventory

### S01 - tooling/repo-utils/src/JSDoc

Canonical TypeScript JSDoc model, schemas, and tag-value catalog.

File count: 31 (text: 31, binary: 0)

```text
tooling/repo-utils/src/JSDoc/JSDoc.ts
tooling/repo-utils/src/JSDoc/index.ts
tooling/repo-utils/src/JSDoc/models/ASTDerivability.model.ts
tooling/repo-utils/src/JSDoc/models/ASTSignal.model.ts
tooling/repo-utils/src/JSDoc/models/ApplicableTo.model.ts
tooling/repo-utils/src/JSDoc/models/ArchitecturalLayer.model.ts
tooling/repo-utils/src/JSDoc/models/CanonicalJSDocSourceMetadata.model.ts
tooling/repo-utils/src/JSDoc/models/DependencyProfile.model.ts
tooling/repo-utils/src/JSDoc/models/HasJSDocApplicableToMapEntry.model.ts
tooling/repo-utils/src/JSDoc/models/JSDocTagAnnotation.model.ts
tooling/repo-utils/src/JSDoc/models/JSDocTagDefinition.model.ts
tooling/repo-utils/src/JSDoc/models/Specification.model.ts
tooling/repo-utils/src/JSDoc/models/TSCategory.model.ts
tooling/repo-utils/src/JSDoc/models/TSSyntaxKind.model.ts
tooling/repo-utils/src/JSDoc/models/TagKind.model.ts
tooling/repo-utils/src/JSDoc/models/TagParameters.model.ts
tooling/repo-utils/src/JSDoc/models/TagValue.model.ts
tooling/repo-utils/src/JSDoc/models/index.ts
tooling/repo-utils/src/JSDoc/models/tag-values/AccessModifierTagValues.ts
tooling/repo-utils/src/JSDoc/models/tag-values/ClosureTagValues.ts
tooling/repo-utils/src/JSDoc/models/tag-values/DocumentationTagValues.ts
tooling/repo-utils/src/JSDoc/models/tag-values/EventDependencyTagValues.ts
tooling/repo-utils/src/JSDoc/models/tag-values/InlineTagValues.ts
tooling/repo-utils/src/JSDoc/models/tag-values/OrganizationalTagValues.ts
tooling/repo-utils/src/JSDoc/models/tag-values/RemainingTagValues.ts
tooling/repo-utils/src/JSDoc/models/tag-values/StructuralTagValues.ts
tooling/repo-utils/src/JSDoc/models/tag-values/TSDocTagValues.ts
tooling/repo-utils/src/JSDoc/models/tag-values/TypeDocTagValues.ts
tooling/repo-utils/src/JSDoc/models/tag-values/TypeScriptTagValues.ts
tooling/repo-utils/src/JSDoc/models/tag-values/_fields.ts
tooling/repo-utils/src/JSDoc/models/tag-values/index.ts
```

### S02 - specs/pending/repo-codegraph-canonical

Canonical orchestration package with locked defaults, phases, and rubrics.

File count: 7 (text: 7, binary: 0)

```text
specs/pending/repo-codegraph-canonical/MASTER_ORCHESTRATION.md
specs/pending/repo-codegraph-canonical/QUICK_START.md
specs/pending/repo-codegraph-canonical/README.md
specs/pending/repo-codegraph-canonical/REFLECTION_LOG.md
specs/pending/repo-codegraph-canonical/RUBRICS.md
specs/pending/repo-codegraph-canonical/handoffs/HANDOFF_P0.md
specs/pending/repo-codegraph-canonical/outputs/initial_plan.md
```

### S03 - specs/pending/repo-codegraph-jsdoc

Exploratory architecture synthesis, scripts, and compiled research corpus.

File count: 48 (text: 48, binary: 0)

```text
specs/pending/repo-codegraph-jsdoc/OVERVIEW.md
specs/pending/repo-codegraph-jsdoc/OVERVIEW_LEGACY_KNOWLEDGE_INTEGRATION_EXPLAINED.md
specs/pending/repo-codegraph-jsdoc/OVERVIEW_LEGACY_KNOWLEDGE_INTEGRATION_EXPLORATION.md
specs/pending/repo-codegraph-jsdoc/OVERVIEW_SEMANTIC_KG_INTEGRATION_EXPLAINED.md
specs/pending/repo-codegraph-jsdoc/outputs/Building a code-aware NLP service in TypeScript.md
specs/pending/repo-codegraph-jsdoc/outputs/JSDOC_FIBRATION_ARCHITECTURE.md
specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/2025 State of AI Code Quality.md
specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/A Toolkit for Generating Code Knowledge Graphs.md
specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/Building a TypeScript code knowledge graph: the definitive stack.md
specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/Can Knowledge Graphs Reduce Hallucinations in LLMs? : A Survey.md
specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/Code Graph: From Visualization to Integration.md
specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/Code Property Graph Specification.md
specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/CodeHalu: Investigating Code Hallucinations in LLMs via Execution-based Verification.md
specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/CodeRAG: Supportive Code Retrieval on Bigraph for Real-World Code Generation.md
specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/CodexGraph: Bridging Large Language Models and Code Repositories via Code Graph Databases.md
specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/De-Hallucinator: Mitigating LLM Hallucinations in Code Generation Tasks via Iterative Grounding.md
specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/Deterministic-first knowledge graphs that ground AI in code reality.md
specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/Efficient Knowledge Graph Construction and Retrieval from Unstructured Text for Large-Scale RAG Systems.md
specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/How DeepWiki turns raw code into navigable wikis.md
specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/Hybrid AST-JSDoc knowledge graphs: a genuinely novel approach with real risks.md
specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/Joern.md
specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/Knowledge Graph Based Repository-Level Code Generation.md
specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/Knowledge graphs for TypeScript monorepos: the definitive guide to grounding AI agents in code structure.md
specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/LAMBDANET: PROBABILISTIC TYPE INFERENCE USING GRAPH NEURAL NETWORKS.md
specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/Learning Graph-based Code Representations for Source-level Functional Similarity Detection.md
specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/Leveraging Codebase Knowledge Graphs for Agentic Code Generation.md
specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/RepoGraph: Enhancing AI Software Engineering with Repository-level Code Graph.md
specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/Repository Intelligence: Building the Next Generation of Agent Evaluation Data.md
specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/Retrieval-Augmented Code Generation: A Survey with Focus on Repository-Level Approaches.md
specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/SCIP - a better code indexing format than LSIF.md
specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/Semantic Code Graph – an information model to facilitate software comprehension.md
specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/TyFlow: A Type-Aware Approach to Neural Code Models.md
specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/Typilus: Neural Type Hints.md
specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/Unveiling Code Pre-Trained Models: Investigating Syntaxand Semantics Capacities.md
specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/scip-typescript: a new TypeScript and JavaScript indexer.md
specs/pending/repo-codegraph-jsdoc/outputs/context-for-more-comprehensive-reasoning-integration-points/high-level-overview-of-v3-knowledge-slice.md
specs/pending/repo-codegraph-jsdoc/outputs/extract-source-tags.mjs
specs/pending/repo-codegraph-jsdoc/outputs/jsdoc-exhaustiveness-audit/canonical-tag-lists.ts
specs/pending/repo-codegraph-jsdoc/outputs/jsdoc-exhaustiveness-audit/hasjsdoc-to-applicableto-map.ts
specs/pending/repo-codegraph-jsdoc/outputs/jsdoc-exhaustiveness-audit/jsdoc-tags-database.ts
specs/pending/repo-codegraph-jsdoc/outputs/jsdoc-exhaustiveness-audit/syntaxkind-jsdoc-tag-map.ts
specs/pending/repo-codegraph-jsdoc/outputs/jsdoc-exhaustiveness-audit/ts-category-taxonomy.ts
specs/pending/repo-codegraph-jsdoc/outputs/projects.md
specs/pending/repo-codegraph-jsdoc/outputs/reference-repos.md
specs/pending/repo-codegraph-jsdoc/outputs/source-tag-snapshots.json
specs/pending/repo-codegraph-jsdoc/outputs/sources_to_markdownify.md
specs/pending/repo-codegraph-jsdoc/outputs/validate-jsdoc-exhaustiveness.mjs
specs/pending/repo-codegraph-jsdoc/prompt.md
```

### S04 - .repos/beep-effect/packages/knowledge/_docs

Knowledge documentation corpus spanning architecture, operations, ontology, and audits.

File count: 78 (text: 75, binary: 3)

```text
.repos/beep-effect/packages/knowledge/_docs/DEBUGGING_GUIDE.md
.repos/beep-effect/packages/knowledge/_docs/DELIVERY_SUMMARY.md
.repos/beep-effect/packages/knowledge/_docs/ERROR_HANDLING.md
.repos/beep-effect/packages/knowledge/_docs/GLOSSARY.md
.repos/beep-effect/packages/knowledge/_docs/IMPLEMENTATION_CHECKLIST.md
.repos/beep-effect/packages/knowledge/_docs/INDEX.md
.repos/beep-effect/packages/knowledge/_docs/LLM_CONTROL_INDEX.md
.repos/beep-effect/packages/knowledge/_docs/LLM_CONTROL_QUICK_REFERENCE.md
.repos/beep-effect/packages/knowledge/_docs/LLM_CONTROL_STRATEGY_SUMMARY.md
.repos/beep-effect/packages/knowledge/_docs/LLM_ONTOLOGY.md
.repos/beep-effect/packages/knowledge/_docs/MVP_PERSISTENCE_CHECKLIST.md
.repos/beep-effect/packages/knowledge/_docs/PERSISTENCE_INDEX.md
.repos/beep-effect/packages/knowledge/_docs/PERSISTENCE_SUMMARY.md
.repos/beep-effect/packages/knowledge/_docs/PRODUCTION_SPEC.md
.repos/beep-effect/packages/knowledge/_docs/PROGRESS_STREAMING_INDEX.md
.repos/beep-effect/packages/knowledge/_docs/PROGRESS_STREAMING_QUICKREF.md
.repos/beep-effect/packages/knowledge/_docs/PROGRESS_STREAMING_SUMMARY.md
.repos/beep-effect/packages/knowledge/_docs/README-IDEMPOTENCY.md
.repos/beep-effect/packages/knowledge/_docs/README.md
.repos/beep-effect/packages/knowledge/_docs/architecture/cli_extraction_issues.md
.repos/beep-effect/packages/knowledge/_docs/architecture/effect-distributed-architecture-v2.md
.repos/beep-effect/packages/knowledge/_docs/architecture/effect-distributed-architecture.md
.repos/beep-effect/packages/knowledge/_docs/architecture/effect-patterns-guide.md
.repos/beep-effect/packages/knowledge/_docs/architecture/embedding-architecture.md
.repos/beep-effect/packages/knowledge/_docs/architecture/implementation-plan-v2.md
.repos/beep-effect/packages/knowledge/_docs/architecture/implementation-plan.md
.repos/beep-effect/packages/knowledge/_docs/architecture/system-architecture.md
.repos/beep-effect/packages/knowledge/_docs/architecture/workflow-state-patterns.md
.repos/beep-effect/packages/knowledge/_docs/archive/idempotency-architecture.md
.repos/beep-effect/packages/knowledge/_docs/archive/idempotency-design.md
.repos/beep-effect/packages/knowledge/_docs/archive/llm-control-deployment.md
.repos/beep-effect/packages/knowledge/_docs/archive/llm-control-implementation.md
.repos/beep-effect/packages/knowledge/_docs/archive/llm-control-strategy.md
.repos/beep-effect/packages/knowledge/_docs/archive/mvp-persistence-surface.md
.repos/beep-effect/packages/knowledge/_docs/archive/progress-streaming-contract.md
.repos/beep-effect/packages/knowledge/_docs/archive/trace-analysis-2025-11-26.md
.repos/beep-effect/packages/knowledge/_docs/audits/2025-12-18-medium-severity-modeling-audit.md
.repos/beep-effect/packages/knowledge/_docs/audits/ACTION_ITEMS.md
.repos/beep-effect/packages/knowledge/_docs/audits/AUDIT_SUMMARY.md
.repos/beep-effect/packages/knowledge/_docs/audits/PROPOSED_ONTOLOGY_CHANGES.md
.repos/beep-effect/packages/knowledge/_docs/design/IRI_TYPE_SAFETY.md
.repos/beep-effect/packages/knowledge/_docs/examples/metadata-failed.json
.repos/beep-effect/packages/knowledge/_docs/examples/metadata.json
.repos/beep-effect/packages/knowledge/_docs/functional_spec.md
.repos/beep-effect/packages/knowledge/_docs/idempotency-implementation.ts
.repos/beep-effect/packages/knowledge/_docs/mvp/ARCHITECTURAL_DECISIONS_MVP.md
.repos/beep-effect/packages/knowledge/_docs/mvp/UI_UX_RESEARCH_KNOWLEDGE_GRAPH_VIS.md
.repos/beep-effect/packages/knowledge/_docs/mvp/case_study_ontology_specific_research.md
.repos/beep-effect/packages/knowledge/_docs/mvp/mvp_discussion_research_case_study.md
.repos/beep-effect/packages/knowledge/_docs/mvp/mvp_discussion_research_case_study_cont.md
.repos/beep-effect/packages/knowledge/_docs/mvp/ontology_web_vis_research.md
.repos/beep-effect/packages/knowledge/_docs/mvp/popolo_alignment_notes.md
.repos/beep-effect/packages/knowledge/_docs/mvp/uk_gov_org_patterns.md
.repos/beep-effect/packages/knowledge/_docs/ontology_research/Generated Image December 18, 2025 - 9_07PM.jpeg
.repos/beep-effect/packages/knowledge/_docs/ontology_research/REASONING_RECOMMENDATIONS.md
.repos/beep-effect/packages/knowledge/_docs/ontology_research/advanced_retrieval_nlp_research.md
.repos/beep-effect/packages/knowledge/_docs/ontology_research/c8a1ad6715824053867758774872340e.jpg
.repos/beep-effect/packages/knowledge/_docs/ontology_research/entity_resolution_clustering_research.md
.repos/beep-effect/packages/knowledge/_docs/ontology_research/event_f_research.md
.repos/beep-effect/packages/knowledge/_docs/ontology_research/llm_owl.md
.repos/beep-effect/packages/knowledge/_docs/ontology_research/ontology101.pdf
.repos/beep-effect/packages/knowledge/_docs/ontology_research/ontology_llms.md
.repos/beep-effect/packages/knowledge/_docs/ontology_research/ontology_tech_research.md
.repos/beep-effect/packages/knowledge/_docs/ontology_research/owl_reasoning_validation_production.md
.repos/beep-effect/packages/knowledge/_docs/ontology_research/prod_owl_rdf_pipelines.md
.repos/beep-effect/packages/knowledge/_docs/ontology_research/rdf_shacl_reasoning_research.md
.repos/beep-effect/packages/knowledge/_docs/ontology_research/shacl_shape_management_research.md
.repos/beep-effect/packages/knowledge/_docs/ontology_research/sota_review.md
.repos/beep-effect/packages/knowledge/_docs/ontology_research/synthesis_and_implementation_roadmap.md
.repos/beep-effect/packages/knowledge/_docs/ontology_research/temporal_conflicting_claims_research.md
.repos/beep-effect/packages/knowledge/_docs/plans/2025-12-11-config-layer-unification.md
.repos/beep-effect/packages/knowledge/_docs/plans/2025-12-11-workflow-layer-composition-fix.md
.repos/beep-effect/packages/knowledge/_docs/plans/2025-12-16-implementation-gaps-sota.md
.repos/beep-effect/packages/knowledge/_docs/plans/2025-12-19-unified-extraction-pipeline.md
.repos/beep-effect/packages/knowledge/_docs/plans/domain_model_architecture.md
.repos/beep-effect/packages/knowledge/_docs/plans/local-postgres-dev-setup.md
.repos/beep-effect/packages/knowledge/_docs/plans/postgres-workflow-engine-investigation.md
.repos/beep-effect/packages/knowledge/_docs/plans/shacl-activity-implementation-plan.md
```

## P1 Source-Index Exit Checks

1. All four locked source areas are enumerated with exact file paths.
2. Summary counts match the file lists and include text/binary split.
3. Evidence ID ranges are explicitly allocated for all source areas.
