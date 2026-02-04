# Specification: Core Capabilities Evaluation (Seattle Ontology Case Study)

## 1. Overview
This track focuses on a comprehensive evaluation of the system's core capabilities using the **Seattle** ontology as a case study. The goal is to verify, via code review and manual frontend testing, that the end-to-end flow from ingestion to reasoning works as expected. This includes verifying data extraction, provenance modeling, timeline visualization, example-based improvement loops, and proper ABox/TBox separation, ensuring the infrastructure supports these tasks seamlessly.

## 2. Functional Requirements

### 2.1 Ingestion & Extraction Verification
*   **Link Ingestion:** Verify the ability to ingest new links via the Frontend.
*   **Batch Creation:** Verify the creation of document batches from ingested links.
*   **Triple/Claim Extraction:** Confirm that extraction workflows produce Triples and Claims properly modeled by the Seattle ontology.
*   **Provenance:** Ensure every extracted fact allows tracing back to its source document and batch (Lineage).

### 2.2 Frontend Visualization & Interaction
*   **Data Inspector (ABox):** Verify the UI capability to browse ingested Claims and Triples linked to their definitions.
*   **Timeline View:** Verify the visualization of extracted events and facts ordered by time.
*   **Ontology Parameterization:** Ensure the frontend correctly isolates and displays data based on the `ontologyId` (e.g., 'seattle').

### 2.3 Recursive Improvement (Feedback Loop)
*   **Example Creation:** Verify that users can correct claims or create examples in the UI.
*   **Ontological Modeling of Corrections:** Confirm that corrections, updates, and feedback are modeled using the ontology itself (e.g., as triples/claims relating to original facts), ensuring this is part of the base ontology capabilities.
*   **Prompt Injection:** Confirm that these user-created examples are correctly retrieved and injected into the prompt context during subsequent extraction runs, adhering to implemented SOTA notes.

### 2.4 Infrastructure & Configuration
*   **Config Review:** Review `terraform`, `cloudbuild.yaml`, and other deployment configs to ensure seamless extraction task support.
*   **Runtime Verification:** Verify that the environment (Cloud Run/GCS/Postgres) processes these extraction tasks without errors during execution.

## 3. Non-Functional Requirements
*   **Usability:** The frontend flows for ingestion and inspection should be intuitive for an administrator.
*   **Coherence:** Data shown in the UI must match the underlying state in Postgres/Graph storage.

## 4. Out of Scope
*   Implementation of *new* features (unless critical gaps are found preventing verification).
*   Large-scale performance testing (focus is on functionality and correctness).
