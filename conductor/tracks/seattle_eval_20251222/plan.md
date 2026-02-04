# Plan: Core Capabilities Evaluation (Seattle Ontology Case Study)

## Phase 1: Ingestion & Infrastructure Review [checkpoint: a5e8e9f]
- [x] Task: Review Infrastructure configuration (`terraform`, `cloudbuild.yaml`, `docker-compose.yml`) for extraction readiness. 53885b2
- [x] Task: Verify Environment Variable configuration for Cloud Run/GCS/Postgres integration. 54007a2
- [x] Task: Manual Verification: Ingest a new Seattle-related link via the Frontend and verify its entry in the `ingested_links` table. 54909a2
- [x] Task: Manual Verification: Create a document batch for the ingested link and verify GCS storage and Metadata persistence. 54909a2
- [x] Task: Conductor - User Manual Verification 'Ingestion & Infrastructure Review' (Protocol in workflow.md) 55842b2

## Phase 2: Extraction & Provenance Audit [checkpoint: pending]
- [~] Task: Execute Extraction Workflow for the Seattle batch.
- [ ] Task: Verify that extracted Triples/Claims use the Seattle ontology IRIs and types.
- [ ] Task: Trace a sample extraction from a Claim (Postgres) back to its source document (GCS) and Extraction Run.
- [ ] Task: Verify ABox vs TBox separation: Ensure instance data (claims) is distinct from schema data (ontology) in the DB/Store.
- [ ] Task: Conductor - User Manual Verification 'Extraction & Provenance Audit' (Protocol in workflow.md)

## Phase 3: Frontend Visualization & Interaction [checkpoint: pending]
- [ ] Task: Verify Timeline View: Load 'seattle' ontology data and confirm events are correctly ordered and displayed.
- [ ] Task: Verify Data Inspector: Browse extracted claims and confirm they link correctly to their source documents.
- [ ] Task: Verify Ontology Parameterization: Confirm that switching `ontologyId` correctly filters the displayed claims and timeline.
- [ ] Task: Conductor - User Manual Verification 'Frontend Visualization & Interaction' (Protocol in workflow.md)

## Phase 4: Recursive Improvement Loop [checkpoint: pending]
- [ ] Task: Verify Example Creation: Correct a claim in the UI and confirm it is saved as an example/correction in the DB.
- [ ] Task: Verify Ontological Representation: Ensure the saved correction is represented as ontological triples (e.g., using a `correctionOf` or similar relationship) in the store.
- [ ] Task: Code Review: Verify that `PromptGenerator` correctly retrieves and injects these examples into the LLM context.
- [ ] Task: Manual Verification: Run a second extraction and verify that the injected examples influence the output (if applicable/observable).
- [ ] Task: Conductor - User Manual Verification 'Recursive Improvement Loop' (Protocol in workflow.md)

## Phase 5: Final System Validation [checkpoint: pending]
- [ ] Task: Final End-to-End Walkthrough: Link -> Batch -> Extract -> View -> Correct -> Re-extract.
- [ ] Task: Document any gaps or bugs found during the evaluation.
- [ ] Task: Conductor - User Manual Verification 'Final System Validation' (Protocol in workflow.md)
