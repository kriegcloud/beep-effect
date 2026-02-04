# Core Workflow Streamlining: Links to Facts

## 1. Objective
Refactor the frontend UX and data flow to create a single, continuous journey from **URL Submission** to **Knowledge Discovery**. Eliminate the friction between technical ingestion states and semantic document views.

## 2. Target Workflow: "The Direct Path"
1.  **Input:** User provides URL at `/ingest`.
2.  **Conversion:** Backend ingests link, generates Document ID, and starts extraction.
3.  **Handoff:** UI redirects immediately to `/o/:ontologyId/documents/:docId`.
4.  **Observation:** User watches the document page as "Evidence Spans" are highlighted and "Claims" appear in the sidebar in real-time.
5.  **Output:** Fact appears in the global `/timeline` with a "Just Extracted" highlight.

## 3. UX Gaps & Solutions

### 3.1 The "Link Detail" Pitfall
*   **Current:** `/ingest` -> `/links/:id` (Static metadata view).
*   **Solution:** Retire the `LinkDetailPage` for active workflows. Links should be treated as "Document Drafts". Redirect ingestion directly to the Document view.

### 3.2 Real-time Extraction Feedback
*   **Current:** Extraction happens in the background; user must check `BatchMonitor` or refresh `DocumentsPage`.
*   **Solution:** 
    *   Implement a `DocumentStatus` indicator on the `DocumentDetailPage`.
    *   Use the `eventsAtom` to listen for `ExtractionCompleted` or `ClaimAdded` specifically for the current document ID.
    *   Animate the entrance of new claims into the sidebar.

### 3.3 Seamless Navigation
*   **Proposal:** Add an "Extraction Queue" persistent drawer in the sidebar. This shows the progress of the most recent 3 ingestions regardless of which page the user is on.

## 4. Architectural Evolution

### 4.1 Live Document Atoms
We should generalize the `liveTimelineAtom` pattern to a `liveDocumentClaimsAtom(docId)`.
*   **Source:** `eventsAtom` filtered by `payload.documentId === docId`.
*   **Update:** Push to local array immediately when `ClaimAdded` event is received via WebSocket.

### 4.2 State Synchronization
Ensure that when a batch completes, the global `timelineAtom` and specific `documentAtom` are invalidated/updated in sync to prevent UI flickering or stale data.

## 5. Next Steps for Implementation
1.  **Modify Router:** Update `LinkIngestionRouter` or Frontend redirect logic to point to Documents.
2.  **Refactor Document Detail:** Add the "Live" state handling to the document view.
3.  **Enhance Timeline UX:** Add time-based grouping ("Today", "Last 10 minutes") to emphasize recency.
