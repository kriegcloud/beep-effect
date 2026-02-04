# Frontend UX & Architecture Strategy: "Live Evidence" Workflow

## 1. Executive Summary
This document outlines the strategic refactoring of the frontend architecture and User Experience (UX) to support a **Streamlined Core Workflow**:  
**Ingest Link → Document Processing → Extraction → Fact Generation (Timeline)**.

The goal is to move from a static "Refresh to see updates" model to a **"Live Evidence"** model where the user perceives the system "thinking" and "learning" in real-time as facts emerge from documents.

## 2. Core Workflow Analysis

### 2.1 The "Happy Path"
1.  **Ingest:** User submits a URL (`/ingest`).
2.  **Processing:** System fetches content, classifies it, and chunks it.
3.  **Extraction:** LLM extracts entities and claims.
4.  **Timeline:** New facts appear in the Knowledge Graph (`/timeline`).

### 2.2 Current UX Frictions
*   **Disconnection:** After clicking "Ingest", the user is redirected to the static Link Detail page. They have no visibility into the background extraction process.
*   **Latency:** The user must manually refresh the Timeline or Document page to see if extraction finished.
*   **Context Switching:** Users have to jump between "Links", "Documents", and "Timeline" to piece together the story.

## 3. Proposed UX Improvements

### 3.1 "Live Status" Indicator
*   **Concept:** A global or persistent status indicator for active batches.
*   **Implementation:** A `BatchMonitor` component in the sidebar or top bar that pulses when extraction is active, showing "Processing 3 documents...".
*   **Tech:** Powered by the `eventsAtom` stream filtering for `BatchStarted` / `BatchCompleted` events.

### 3.2 Unified "Evidence View"
*   **Concept:** Merge "Link Detail" and "Document Detail".
*   **Change:** When a Link is ingested, immediately show the **Document Detail** view in a "Pending" state.
*   **Live Updates:** As extraction proceeds, the "Claims" section of the document page populates in real-time (using the `liveTimelineAtom` pattern).
*   **Visuals:** Highlight new claims as they "pop" into existence.

### 3.3 The "Living Timeline"
*   **Concept:** The Timeline is the primary output. It should feel alive.
*   **Change:** Use the `liveTimelineAtom` to animate new claims appearing at the top.
*   **Groupings:** Instead of just grouping by Date, introduce **"Just In"** grouping for claims extracted in the last session.

## 4. Architectural Refactoring Plan

### 4.1 "Live Atom" Pattern (Adopted)
We will formalize the `atomFromLiveQuery` pattern (`packages/web/src/lib/atom-utils.ts`) to serve as the backbone for all list views.
*   **Input:** Initial API Fetch + WebSocket Stream.
*   **Output:** A reactive Array that patches itself.
*   **Benefit:** Zero-latency updates, simplified component logic (no `useEffect` subscription wiring in components).

### 4.2 Streamlined Route Structure
Simplify the routing to focus on the core workflow:
*   `/ingest` -> Redirects to `/documents/:id` (not `/links/:id`)
*   `/documents/:id` -> Shows Source Content + Live Extracted Claims side-by-side.
*   `/timeline` -> Global view of all facts.

### 4.3 Component "Smartening"
Refactor key components to accept **Atoms** as props rather than static data.
*   **Old:** `<ClaimList claims={data} />`
*   **New:** `<ClaimList atom={liveClaimsAtom} />`
*   **Why:** Allows the list component to handle its own efficient re-rendering and animation when the atom updates.

## 5. Implementation Roadmap (Engineering Handoff)

### Phase 1: Core Plumbing (Backend & Infra)
*   **Task:** Verify WebSocket Ticket Auth is deployed and stable.
*   **Task:** Ensure `EventStreamRouter` broadcasts granular events (`ClaimAdded`, `ExtractionProgress`).

### Phase 2: Frontend "Live" Foundation
*   **Task:** Implement `atomFromLiveQuery` utility.
*   **Task:** Replace `EventBusClient` polling with reactive stream (Completed in previous review).

### Phase 3: UX Redesign
*   **Task:** Update `IngestPage` to redirect to `DocumentPage`.
*   **Task:** Update `DocumentPage` to use `liveTimelineAtom` filtered by document ID.
*   **Task:** Add "New" highlight animation to `ClaimCard`.

## 6. Conclusion
By aligning the architecture to the "Live Atom" pattern and streamlining the UX routing, we transform the application from a static database viewer into a **real-time knowledge extraction console**. This directly supports the goal of making the "Links -> Documents -> Timeline" flow seamless and observable.
