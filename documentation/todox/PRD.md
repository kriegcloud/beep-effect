# TodoX Product Requirements Document

## AI-Native Wealth Management Platform

**Version:** 1.0.0
**Last Updated:** 2026-02-04
**Status:** Draft

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision](#2-product-vision)
3. [Target Users](#3-target-users)
4. [Problem Statement](#4-problem-statement)
5. [Core Capabilities](#5-core-capabilities)
6. [Feature Specifications](#6-feature-specifications)
7. [Technical Architecture](#7-technical-architecture)
8. [Integration Architecture](#8-integration-architecture)
9. [Security & Compliance](#9-security--compliance)
10. [Success Metrics](#10-success-metrics)
11. [Roadmap](#11-roadmap)
12. [Appendices](#12-appendices)

---

## 1. Executive Summary

TodoX is an AI-native wealth management platform designed for Registered Investment Advisors (RIAs) and Multi-Family Offices (MFOs) serving Ultra-High-Net-Worth Individuals (UHNWI) with $30M+ in assets under management.

**Core Innovation:** Unlike traditional wealth management software that treats data as discrete records in silos, TodoX uses an ontology-driven knowledge graph to create a unified semantic model across all data sources. This enables AI agents to reason about relationships, not just retrieve records.

**Key Differentiators:**

| Capability | Traditional CRM | TodoX |
|------------|-----------------|-------|
| Data Model | Flat tables, foreign keys | Semantic graph with typed relationships |
| Integration | ETL to unified schema | Entity resolution with owl:sameAs |
| Search | Keyword matching | Semantic traversal + embedding similarity |
| AI Context | Raw data dumps | GraphRAG subgraph retrieval |
| Compliance | Manual audit trails | Automatic provenance tracking |
| Relationships | Implicit (in advisor's head) | Explicit, computable, queryable |
| AI Customization | Generic assistants | Workspace-specific agents with domain skills |

**Business Outcome:** Advisors spend 60% less time on information retrieval and 40% more time on client relationships.

---

## 2. Product Vision

### 2.1 Vision Statement

> "Every wealth advisor has a perfect memory and infinite attention, powered by AI that truly understands client relationships."

### 2.2 Strategic Pillars

```
┌─────────────────────────────────────────────────────────────────┐
│                      TODOEX PLATFORM                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  UNIFIED    │  │  AI-NATIVE  │  │  COMPLIANCE │            │
│  │  KNOWLEDGE  │  │  WORKFLOWS  │  │  BY DEFAULT │            │
│  │             │  │             │  │             │            │
│  │ • Ontology  │  │ • GraphRAG  │  │ • Provenance│            │
│  │ • Entity    │  │ • Agent     │  │ • Audit     │            │
│  │   Resolution│  │   Context   │  │   Trails    │            │
│  │ • Semantic  │  │ • Voice/Text│  │ • RLS       │            │
│  │   Search    │  │   Interface │  │ • ABAC      │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ REAL-TIME   │  │  MULTI-     │  │ EXTENSIBLE  │            │
│  │ COLLABORATION│ │  CHANNEL    │  │ INTEGRATIONS│            │
│  │             │  │  COMMS      │  │             │            │
│  │ • Liveblocks│  │ • Email     │  │ • Custodians│            │
│  │ • Presence  │  │ • Calendar  │  │ • CRM       │            │
│  │ • Cursors   │  │ • SMS/Voice │  │ • Documents │            │
│  │ • Versions  │  │ • Unified   │  │ • Custom    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Design Principles

1. **Relationships First**: Data models start with relationships, not records
2. **Evidence Always**: Every fact links to source text with confidence scores
3. **Local First**: Works offline, syncs when connected
4. **AI Augmented**: AI enhances human judgment, never replaces it
5. **Compliance Native**: Audit trails are automatic, not afterthoughts

---

## 3. Target Users

### 3.1 Primary Persona: The UHNWI Advisor

**Name:** Sarah Chen
**Title:** Senior Wealth Advisor
**Firm:** Multi-Family Office (MFO)
**AUM:** $500M across 15 client families

**Daily Challenges:**
- Manages complex household structures (trusts, LLCs, family foundations)
- Coordinates with 8+ external parties per client (CPAs, attorneys, custodians)
- Tracks multi-generational wealth transfer strategies
- Must maintain FINRA/SEC compliance across all interactions

**Current Pain Points:**
- 3+ hours daily synthesizing information across systems
- Relationship context exists only in her head
- Compliance documentation is manual and error-prone
- Junior advisors can't access her institutional knowledge

**Success Metric:** "Prepare me for my Thompson meeting in 30 seconds, not 30 minutes"

### 3.2 Secondary Persona: The Operations Associate

**Name:** Marcus Williams
**Title:** Client Operations Associate
**Responsibilities:** Trade execution, account transfers, document processing

**Needs:**
- Clear action items from advisor meetings
- Document templates that auto-populate client data
- Task tracking with compliance checkpoints
- Handoff documentation when advisors are unavailable

### 3.3 Tertiary Persona: The Compliance Officer

**Name:** Jennifer Park
**Title:** Chief Compliance Officer
**Responsibilities:** Regulatory compliance, audit preparation, policy enforcement

**Needs:**
- Audit trails for all client interactions
- Policy enforcement across all advisors
- Automated compliance reporting
- Real-time risk monitoring

---

## 4. Problem Statement

### 4.1 The Information Fragmentation Problem

Wealth management advisors operate across 10+ systems that don't communicate:

```
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│Salesforce│  │ Schwab  │  │  Gmail  │  │ Notion  │  │ Calendar│
│ Clients │  │Accounts │  │ Threads │  │  Notes  │  │Meetings │
└────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘
     │            │            │            │            │
     ▼            ▼            ▼            ▼            ▼
   [Manual mental integration by advisor]
```

**Consequence:** When an advisor asks "What's happening with the Thompson family?", they must:
1. Search Salesforce for the contact
2. Cross-reference Schwab for account activity
3. Search email for recent conversations
4. Check calendar for upcoming meetings
5. Review Notion for planning notes
6. **Mentally synthesize all of this**

This takes 30+ minutes per client meeting preparation.

### 4.2 The Relationship Complexity Problem

Wealth management relationships are inherently graph-structured:

- **Household structures**: Clients → Spouses → Children → Trusts → Beneficiaries
- **Account hierarchies**: Households → Account Groups → Individual Accounts
- **Service teams**: Clients → Advisors → CPAs → Attorneys → Custodians
- **Event chains**: Life Events → Financial Triggers → Action Items → Compliance Requirements

Traditional relational databases cannot efficiently query:
- "Show all accounts that might be affected by John Thompson's divorce"
- "Which clients have year-end Roth conversion deadlines?"
- "What compliance actions are triggered by Emily's 21st birthday?"

### 4.3 The Compliance Documentation Problem

FINRA Rule 4512 and SEC Rule 17a-4 require comprehensive documentation:
- All investment recommendations and rationale
- Client communications and responses
- Suitability assessments and changes
- Disclosure acknowledgments

**Current State:** Documentation is manual, inconsistent, and audit-vulnerable.

**Required State:** Every fact has automatic provenance tracking with click-through audit trails.

---

## 5. Core Capabilities

### 5.1 Unified Knowledge Graph

```
┌──────────────────────────────────────────────────────────────┐
│              TODOEX KNOWLEDGE GRAPH ARCHITECTURE             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Data Sources          Extraction         Knowledge Graph    │
│  ┌─────────┐                              ┌──────────────┐  │
│  │  Email  │───┐                          │              │  │
│  └─────────┘   │    ┌──────────────┐      │  Entities    │  │
│  ┌─────────┐   ├───►│  Ontology-   │      │  ┌────────┐  │  │
│  │Calendar │───┤    │  Guided      │─────►│  │Thompson│  │  │
│  └─────────┘   │    │  Extraction  │      │  │  HH    │  │  │
│  ┌─────────┐   │    │              │      │  └───┬────┘  │  │
│  │   CRM   │───┤    │ • Mention    │      │      │       │  │
│  └─────────┘   │    │   Detection  │      │  Relations   │  │
│  ┌─────────┐   │    │ • Entity     │      │  ┌────────┐  │  │
│  │Documents│───┤    │   Typing     │      │  │hasAcct │  │  │
│  └─────────┘   │    │ • Relation   │      │  └────────┘  │  │
│  ┌─────────┐   │    │   Extraction │      │      │       │  │
│  │Custodian│───┘    │ • Resolution │      │  ┌────────┐  │  │
│  └─────────┘        └──────────────┘      │  │IRA-4521│  │  │
│                                           │  └────────┘  │  │
│                                           └──────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Key Components:**

| Component | Purpose | Implementation |
|-----------|---------|----------------|
| **Ontology** | Domain model for wealth management | OWL/RDF extending DOLCE+DnS |
| **Entity Extraction** | Convert unstructured text → entities | LLM + ontology constraints |
| **Entity Resolution** | Cluster same entities across sources | Embedding similarity + owl:sameAs |
| **Relation Extraction** | Identify typed relationships | LLM + property domain/range validation |
| **Provenance Tracking** | Evidence spans for every fact | Character-level source linking |

### 5.2 GraphRAG Agent Context

```typescript
// Query: "Prepare me for my Thompson meeting tomorrow"

// GraphRAG Process:
// 1. Embed query → find "Thompson household" entity
// 2. 2-hop graph traversal from that seed
// 3. Retrieve: family members, accounts, life events, recent comms, pending actions
// 4. RRF scoring to prioritize relevance
// 5. Format as structured context for LLM

// Agent Receives:
┌─────────────────────────────────────────────────┐
│ Thompson Household (3 members)                  │
│                                                 │
│ John Thompson (Primary Contact)                 │
│   • Schwab Traditional IRA ending 4521         │
│   • Pending: $50k Roth conversion (year-end)   │
│   • Recent: Email Jan 15 re retirement         │
│                                                 │
│ Emily Thompson (Daughter)                       │
│   • Life Event: Stanford graduation            │
│   • Action Needed: Set up Roth IRA             │
│                                                 │
│ Open Items for This Meeting:                    │
│   1. Discuss Roth conversion timeline          │
│   2. Emily's new Roth IRA setup                │
│   3. Form 8606 tax implications                │
└─────────────────────────────────────────────────┘
```

### 5.3 Multi-Tenant Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    MULTI-TENANT MODEL                      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Organization (RIA Firm)                                   │
│  ├── Teams                                                 │
│  │   ├── Wealth Advisory Team                              │
│  │   ├── Operations Team                                   │
│  │   └── Compliance Team                                   │
│  │                                                         │
│  ├── Workspaces (Internal Collaboration)                   │
│  │   ├── Quarterly Planning Workspace                      │
│  │   ├── Compliance Review Workspace                       │
│  │   └── Training Materials Workspace                      │
│  │                                                         │
│  └── Client Databases (External Client Data)               │
│      ├── Thompson Family Database                          │
│      ├── Chen Holdings Database                            │
│      └── Williams Trust Database                           │
│                                                            │
│  Authorization: ABAC with functional roles                 │
│  ├── controller: Period lock/unlock, full oversight        │
│  ├── finance_manager: Account management                   │
│  ├── accountant: Journal entries, reconciliation          │
│  └── period_admin: Fiscal period management                │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Workspace vs Client Database Distinction:**

| Aspect | Workspace | Client Database |
|--------|-----------|-----------------|
| **Purpose** | Internal team collaboration | Client-specific data repository |
| **Data Sources** | Internal documents, meeting notes | Gmail, calendar, CRM, custodian feeds |
| **Sharing Model** | Teams, users, other workspaces | Advisor teams assigned to client |
| **Knowledge Graph** | Optional (manual tagging) | Required (automatic extraction) |
| **Compliance Scope** | Internal audit only | Full FINRA/SEC audit trail |
| **Example** | "Q1 2026 Planning" | "Thompson Family" |

### 5.4 Rich Document Editor

**Editor Capabilities (50+ Lexical Plugins):**

| Category | Features | Status |
|----------|----------|--------|
| **Content** | Images, Excalidraw, YouTube, Twitter, Figma embeds | Implemented |
| **Formatting** | Floating toolbar, bubble menu, slash commands | Implemented |
| **Tables** | Full table support with resizing, hover actions | Implemented |
| **Code** | Syntax highlighting (Prism, Shiki), code actions | Implemented |
| **Math** | LaTeX equations | Implemented |
| **AI** | AI assistant panel, prompt-based generation | Implemented |
| **Collaboration** | Liveblocks presence, Yjs sync, cursors | Implemented |
| **Mentions** | @user mentions with notifications | Implemented |
| **Versioning** | Document version history | Implemented |
| **Export** | HTML, Markdown, DOCX, PDF | Partial |

**Email Composition Mode:**
- Rich formatting for client emails
- Template library with variable substitution
- Compliance-approved signature blocks
- Attachment management with document linking

### 5.5 FlexLayout Dashboard System

**Capabilities:**
- Drag-and-drop panel arrangement
- Tabbed interfaces with docking
- Save/restore layout configurations
- Agent-assisted layout creation ("Show me accounts and recent emails side by side")

**Pre-built Dashboard Components:**
- Client summary cards
- Account performance charts
- Calendar widget
- Email inbox
- Task/action item list
- Document browser
- Knowledge graph explorer
- AI chat panel

### 5.6 Workspace Agent SDK

**Core Innovation:** Each workspace includes an `agents/` folder that functions as a Claude Code-style configuration, enabling domain-specific AI agents. Powered by `@anthropic-ai/claude-agent-sdk`.

```
┌────────────────────────────────────────────────────────────┐
│               WORKSPACE AGENT ARCHITECTURE                 │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Workspace                                                 │
│  ├── documents/                                            │
│  ├── data-sources/                                         │
│  └── agents/         ◄── Claude Code-style config          │
│      ├── manifest.yaml    (agent registry)                 │
│      ├── rules/           (behavioral constraints)         │
│      ├── skills/          (domain knowledge)               │
│      ├── commands/        (slash commands)                 │
│      └── agents/          (agent definitions)              │
│                                                            │
│  Agent Capabilities:                                       │
│  • Domain-specific skills (RMDs, estate planning, etc.)    │
│  • Custom slash commands (/meeting-prep, /compliance-check)│
│  • Compliance rules enforcement                            │
│  • GraphRAG context injection                              │
│  • Tool access (knowledge graph, tasks, notifications)     │
│                                                            │
│  Inheritance: Org → Workspace → Agent → Session            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Key Differentiator:** Unlike generic AI assistants, workspace agents understand your specific domain, clients, and compliance requirements because they're trained on your workspace's knowledge graph and configured with your firm's rules.

---

## 6. Feature Specifications

### 6.1 Knowledge Graph Management

#### 6.1.1 Ontology System

**Wealth Management Ontology Classes:**

```turtle
@prefix wm: <http://beep.com/ontology/wealth-management#> .
@prefix dul: <http://www.loa-cnr.it/ontologies/DUL.owl#> .

wm:Client a owl:Class ;
    rdfs:subClassOf dul:Agent ;
    rdfs:label "Client" ;
    rdfs:comment "Individual or entity receiving wealth management services" .

wm:Household a owl:Class ;
    rdfs:subClassOf dul:CollectiveAgent ;
    rdfs:label "Household" ;
    rdfs:comment "Family unit for financial planning purposes" .

wm:Account a owl:Class ;
    rdfs:subClassOf dul:Object ;
    rdfs:label "Financial Account" .

wm:TaxableAccount rdfs:subClassOf wm:Account .
wm:TaxAdvantaged rdfs:subClassOf wm:Account .
wm:TraditionalIRA rdfs:subClassOf wm:TaxAdvantaged .
wm:RothIRA rdfs:subClassOf wm:TaxAdvantaged .
wm:Trust rdfs:subClassOf wm:TaxAdvantaged .

wm:LifeEvent a owl:Class ;
    rdfs:subClassOf dul:Event ;
    rdfs:label "Life Event" ;
    rdfs:comment "Significant event affecting financial planning" .

wm:Marriage rdfs:subClassOf wm:LifeEvent .
wm:Divorce rdfs:subClassOf wm:LifeEvent .
wm:Birth rdfs:subClassOf wm:LifeEvent .
wm:Death rdfs:subClassOf wm:LifeEvent .
wm:Graduation rdfs:subClassOf wm:LifeEvent .
wm:Retirement rdfs:subClassOf wm:LifeEvent .
wm:Inheritance rdfs:subClassOf wm:LifeEvent .

wm:ActionItem a owl:Class ;
    rdfs:subClassOf dul:Task ;
    rdfs:label "Action Item" ;
    rdfs:comment "Pending task with compliance tracking" .
```

**Core Properties:**

```turtle
wm:belongsToHousehold a owl:ObjectProperty ;
    rdfs:domain wm:Client ;
    rdfs:range wm:Household .

wm:ownsAccount a owl:ObjectProperty ;
    rdfs:domain wm:Client ;
    rdfs:range wm:Account .

wm:experiencedEvent a owl:ObjectProperty ;
    rdfs:domain wm:Client ;
    rdfs:range wm:LifeEvent .

wm:hasActionItem a owl:ObjectProperty ;
    rdfs:domain [ owl:unionOf (wm:Client wm:Household) ] ;
    rdfs:range wm:ActionItem .

wm:hasEvidentialMention a owl:ObjectProperty ;
    rdfs:domain owl:Thing ;
    rdfs:range wm:Mention ;
    rdfs:comment "Links entity to source text evidence" .
```

#### 6.1.2 Entity Extraction Pipeline

**6-Stage Process:**

1. **Ontology Loading**
   - Parse Turtle/RDF via N3.js
   - Build class hierarchy and property constraints
   - Cache with content-hash invalidation

2. **Text Chunking**
   - Semantic-aware chunking (sentence boundaries)
   - Configurable chunk size (default: 1000 tokens)
   - Overlap preservation for context continuity

3. **Mention Extraction**
   - LLM-powered Named Entity Recognition
   - Confidence scoring per mention
   - Configurable minimum threshold (default: 0.7)

4. **Entity Classification**
   - Type assignment using ontology classes
   - Batch processing (default: 10 entities/batch)
   - Validation against class hierarchy
   - Minimum confidence threshold (default: 0.8)

5. **Relation Extraction**
   - Subject-predicate-object triple extraction
   - Property domain/range validation
   - Deduplication
   - Minimum confidence threshold (default: 0.75)

6. **Graph Assembly**
   - Entity merging by canonical name
   - Entity index construction
   - Statistics generation

**Configuration Schema:**

```typescript
interface ExtractionConfig {
  organizationId: OrganizationId;
  ontologyId: OntologyId;
  documentId: DocumentId;
  sourceUri: string;
  chunkingConfig?: {
    chunkSize: number;       // default: 1000
    overlap: number;         // default: 100
  };
  mentionMinConfidence?: number;  // default: 0.7
  entityMinConfidence?: number;   // default: 0.8
  relationMinConfidence?: number; // default: 0.75
  mergeEntities?: boolean;        // default: true
}
```

#### 6.1.3 Entity Resolution

**4-Step Deduplication:**

1. **Clustering** (similarity threshold: 0.85)
   - Embedding-based similarity
   - Phonetic matching for names
   - Alias detection

2. **Canonical Selection**
   - Pick representative entity
   - Merge attributes from all cluster members
   - Preserve highest-confidence information

3. **Same-As Link Generation**
   - Create owl:sameAs links with confidence
   - Track provenance (source extraction ID)
   - Enable click-through audit

4. **Graph Reconstruction**
   - Remap entity IDs to canonical
   - Deduplicate relations
   - Generate resolution statistics

**Cross-Source Entity Resolution Example:**

```
Source 1 (Salesforce): "John M. Thompson"
Source 2 (Schwab):     "THOMPSON, JOHN MICHAEL"
Source 3 (Gmail):      "John Thompson <john@email.com>"
Source 4 (Calendar):   "Meeting with John T"

Resolution Result:
  wm:client-john-thompson
      owl:sameAs salesforce:contact-123 ;
      owl:sameAs schwab:holder-456 ;
      owl:sameAs gmail:sender-789 ;
      owl:sameAs calendar:attendee-abc .
```

#### 6.1.4 GraphRAG Query System

**Query Schema:**

```typescript
interface GraphRAGQuery {
  query: string;              // Natural language query
  topK?: number;              // Seed entities (default: 10, range: 1-50)
  hops?: number;              // Graph traversal depth (default: 1, range: 0-3)
  maxTokens?: number;         // Context budget (default: 4000)
  similarityThreshold?: number; // Embedding threshold (default: 0.5)
  includeScores?: boolean;    // Return RRF scores
  filters?: {
    typeIris?: string[];      // Filter by ontology types
    minConfidence?: number;   // Minimum entity confidence
    ontologyId?: string;      // Scope to specific ontology
  };
}
```

**RRF (Reciprocal Rank Fusion) Scoring:**

```
Score(entity) = Σ 1/(k + rank_i) for each ranking signal

Ranking Signals:
  1. Embedding similarity rank (semantic relevance)
  2. Graph distance rank (structural proximity)
  3. Recency rank (temporal relevance)
  4. Confidence rank (extraction quality)

k = 60 (standard RRF constant)
```

### 6.2 Multi-Channel Communications

#### 6.2.1 Email Integration

**Supported Providers:**
- Gmail (OAuth 2.0, Push notifications)
- Outlook/Microsoft 365 (Graph API)

**Capabilities:**

| Feature | Description | Status |
|---------|-------------|--------|
| **Sync** | Full mailbox sync with incremental updates | Planned |
| **Compose** | Rich text editor with templates | Partial |
| **Thread View** | Conversation threading | Planned |
| **Search** | Full-text + semantic search | Planned |
| **Extraction** | Auto-extract entities to knowledge graph | Planned |
| **Offline** | Local PGlite database for offline access | Planned |
| **Notifications** | Real-time push notifications | Planned |

**Architecture:**

```
┌──────────────────────────────────────────────────────┐
│                  EMAIL SYNC ARCHITECTURE             │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Gmail API ───► Webhook ───► Worker ───► PostgreSQL  │
│                                │                     │
│                                ▼                     │
│                          Extraction                  │
│                          Pipeline                    │
│                                │                     │
│                                ▼                     │
│                        Knowledge Graph               │
│                                                      │
│  Browser:                                            │
│  ┌────────────┐      ┌────────────┐                 │
│  │   React    │ ◄──► │   PGlite   │ (offline)       │
│  │    UI      │      │   (local)  │                 │
│  └────────────┘      └────────────┘                 │
│         │                   │                        │
│         └───────────────────┘                        │
│              WebSocket Sync                          │
│                                                      │
└──────────────────────────────────────────────────────┘
```

#### 6.2.2 Calendar Integration

**Supported Providers:**
- Google Calendar
- Outlook Calendar

**Capabilities:**

| Feature | Description | Status |
|---------|-------------|--------|
| **Sync** | Bidirectional calendar sync | Planned |
| **View** | Day/Week/Month/Agenda views | Planned |
| **Create** | Event creation with client linking | Planned |
| **Prep** | Auto-generate meeting prep from knowledge graph | Planned |
| **Notes** | Post-meeting notes with extraction | Planned |
| **Reminders** | Action item reminders | Planned |

### 6.3 Document Management

#### 6.3.1 Document Editor

**Core Features:**
- Lexical-based rich text editor
- Real-time collaboration via Liveblocks
- Version history with diff view
- Template system with variable substitution
- Export to HTML, Markdown, DOCX, PDF

**AI Features:**
- Writing assistance (tone, clarity, compliance)
- Auto-summarization
- Action item extraction
- Entity linking

#### 6.3.2 Document Organization

**Hierarchy:**
```
Organization
└── Workspace / Client Database
    └── Folder
        └── Document
            └── Version
```

**Metadata:**
- Tags (manual + auto-generated)
- Entity links (auto-extracted)
- Access history
- Compliance flags

### 6.4 Task & Action Item Management

#### 6.4.1 Task Model

```typescript
interface ActionItem {
  id: ActionItemId;
  title: string;
  description?: string;

  // Ownership
  assigneeId: UserId;
  createdById: UserId;

  // Context
  clientId?: ClientId;
  householdId?: HouseholdId;
  workspaceId?: WorkspaceId;

  // Status
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: DateTime;

  // Compliance
  complianceType?: ComplianceType;
  requiredBy?: DateTime;

  // Evidence
  sourceEntityId?: KnowledgeEntityId;  // Auto-extracted from
  evidenceSpan?: EvidenceSpan;         // Source text

  // Audit
  createdAt: DateTime;
  updatedAt: DateTime;
  completedAt?: DateTime;
}
```

#### 6.4.2 Task Sources

| Source | Extraction Method |
|--------|-------------------|
| **Email** | LLM extraction with compliance tagging |
| **Meeting Notes** | LLM extraction + manual addition |
| **Calendar Events** | Auto-generate prep tasks |
| **Knowledge Graph** | Life event → action triggers |
| **Manual** | User-created tasks |

### 6.5 AI Assistant

#### 6.5.1 Interaction Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| **Chat** | Conversational interface | Open-ended questions |
| **Command** | Slash commands | Specific actions |
| **Voice** | Speech-to-text input | Hands-free operation |
| **PiP** | Picture-in-picture window | Persistent assistant |

#### 6.5.2 Agent Capabilities

| Capability | Description |
|------------|-------------|
| **Meeting Prep** | Generate client briefings from knowledge graph |
| **Email Draft** | Compose emails with compliance awareness |
| **Document Summary** | Summarize documents with key points |
| **Task Extraction** | Identify action items from text |
| **Compliance Check** | Validate communications for compliance |
| **Dashboard Config** | Configure FlexLayout via natural language |

#### 6.5.3 Context Sources

```typescript
interface AgentContext {
  // GraphRAG-provided
  relevantEntities: Entity[];
  relevantRelations: Relation[];
  rffScores: Record<EntityId, number>;

  // Session context
  currentClient?: Client;
  currentWorkspace?: Workspace;
  recentDocuments: Document[];
  pendingTasks: ActionItem[];

  // User preferences
  communicationStyle: "formal" | "casual";
  complianceLevel: "standard" | "strict";
}
```

### 6.6 Notifications System

#### 6.6.1 Notification Types

| Type | Trigger | Delivery |
|------|---------|----------|
| **Mention** | @user in document/comment | In-app, email |
| **Assignment** | Task assigned | In-app, email |
| **Deadline** | Task due soon | In-app, email, push |
| **Invitation** | Team/org invite | In-app, email |
| **Comment** | Comment on owned document | In-app |
| **Extraction** | Knowledge graph updated | In-app |
| **Compliance** | Compliance deadline approaching | In-app, email, push |

#### 6.6.2 Delivery Preferences

```typescript
interface NotificationPreferences {
  channels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
  };
  digest: "immediate" | "hourly" | "daily" | "weekly";
  quietHours?: {
    start: string; // "22:00"
    end: string;   // "08:00"
    timezone: string;
  };
  perType: Record<NotificationType, NotificationChannels>;
}
```

### 6.7 Workspace Agent SDK

**Core Innovation:** Each workspace contains an `agents/` folder that functions as a Claude Code-style configuration directory, enabling domain-specific AI agents with custom skills, commands, rules, and behaviors. Powered by `@anthropic-ai/claude-agent-sdk`.

#### 6.7.1 Agent Configuration Structure

```
workspace/
├── documents/
├── data-sources/
└── agents/                          # Claude Code-style config
    ├── manifest.yaml               # Agent registry
    ├── rules/                      # Behavioral rules
    │   ├── compliance.md           # Compliance requirements
    │   ├── communication.md        # Communication style
    │   └── domain.md               # Domain-specific rules
    ├── skills/                     # Learned capabilities
    │   ├── client-onboarding.md    # Onboarding procedures
    │   ├── rmd-calculations.md     # Required minimum distributions
    │   └── estate-planning.md      # Estate planning patterns
    ├── commands/                   # Slash commands
    │   ├── meeting-prep.md         # /meeting-prep command
    │   ├── compliance-check.md     # /compliance-check command
    │   └── portfolio-review.md     # /portfolio-review command
    └── agents/                     # Specialized agent definitions
        ├── compliance-reviewer.md  # Compliance review agent
        ├── meeting-assistant.md    # Meeting prep agent
        └── research-analyst.md     # Research agent
```

#### 6.7.2 Agent Manifest Schema

```yaml
# agents/manifest.yaml
name: "Thompson Family Workspace"
version: "1.0.0"

# Default agent settings
defaults:
  model: "claude-sonnet-4"
  temperature: 0.3
  max_tokens: 4096

# Context sources
context:
  knowledge_graph: true
  recent_documents: 10
  pending_tasks: true
  calendar_events: 7  # days ahead

# Agent definitions
agents:
  - id: compliance-reviewer
    name: "Compliance Reviewer"
    description: "Reviews communications for FINRA/SEC compliance"
    skills:
      - compliance
      - communication
    commands:
      - compliance-check
    rules:
      - compliance.md
      - communication.md

  - id: meeting-assistant
    name: "Meeting Assistant"
    description: "Prepares briefings and meeting agendas"
    skills:
      - client-onboarding
      - estate-planning
    commands:
      - meeting-prep
    context:
      calendar_events: 14
      recent_documents: 20

  - id: research-analyst
    name: "Research Analyst"
    description: "Analyzes market conditions and investment opportunities"
    model: "claude-opus-4"  # Override for complex analysis
    skills:
      - rmd-calculations
    tools:
      - web_search
      - calculator
```

#### 6.7.3 Skill Documents

Skills are markdown documents that teach agents domain-specific knowledge:

```markdown
# skills/rmd-calculations.md

## Required Minimum Distributions (RMDs)

### Overview
RMDs are mandatory annual withdrawals from tax-deferred retirement accounts
starting at age 73 (SECURE 2.0 Act).

### Calculation Formula
RMD = Account Balance (Dec 31 prior year) / Life Expectancy Factor

### Life Expectancy Tables
- Uniform Lifetime Table (most common)
- Joint Life Table (spouse >10 years younger)
- Single Life Table (beneficiaries)

### Key Dates
- First RMD: April 1 of year following age 73
- Subsequent RMDs: December 31 annually

### Penalties
- 25% excise tax on shortfall (reduced from 50% by SECURE 2.0)
- Reduced to 10% if corrected within 2 years

### Common Scenarios

#### Scenario: Client Turning 73
1. Calculate year-end balance from prior year
2. Look up divisor from Uniform Lifetime Table
3. Divide balance by divisor
4. Client may delay first RMD to April 1 (but must take two RMDs that year)

#### Scenario: Inherited IRA
- Spouse beneficiary: Can treat as own or remain beneficiary
- Non-spouse: 10-year rule (SECURE Act)
- Eligible designated beneficiary: Stretch RMD available
```

#### 6.7.4 Command Documents

Commands define slash-command interfaces for agents:

```markdown
# commands/meeting-prep.md

## /meeting-prep

### Description
Generates a comprehensive briefing for an upcoming client meeting.

### Usage
```
/meeting-prep [client_name] [meeting_date]
```

### Parameters
- `client_name` (required): Name of client or household
- `meeting_date` (optional): Date of meeting, defaults to next scheduled

### Output Structure
1. **Client Summary**
   - Household overview
   - Recent life events
   - Account summary

2. **Recent Activity**
   - Communications (last 30 days)
   - Document changes
   - Knowledge graph updates

3. **Action Items**
   - Pending tasks for this client
   - Compliance deadlines

4. **Meeting Agenda**
   - Suggested discussion topics
   - Questions to address
   - Documents to review

### Context Requirements
- GraphRAG query: 2-hop traversal from client entity
- Calendar: Next 7 days
- Documents: Last 30 days
- Tasks: All pending for client
```

#### 6.7.5 Rule Documents

Rules enforce behavioral constraints:

```markdown
# rules/compliance.md

## Compliance Rules

### Communication Standards

1. **Never guarantee returns**
   - FORBIDDEN: "This investment will return 10%"
   - ALLOWED: "Historical returns have averaged 10%"

2. **Always disclose risks**
   - Every investment recommendation must include risk disclosure
   - Use standardized risk language from compliance library

3. **Suitability requirements**
   - Before any recommendation, verify:
     - Client risk tolerance
     - Investment timeline
     - Financial situation
   - Document rationale for recommendation

### Documentation Requirements

1. **Meeting notes**
   - Must include attendees, topics discussed, action items
   - Must link to relevant client entities in knowledge graph

2. **Email communications**
   - Must be archived automatically
   - Must extract action items for compliance tracking

### Prohibited Actions

- Never provide tax advice (refer to CPA)
- Never provide legal advice (refer to attorney)
- Never discuss specific securities in public channels
- Never share client information across households without consent
```

#### 6.7.6 Agent Inheritance

Agents inherit from workspace configuration and can be overridden:

```
Organization Level (defaults)
    └── Workspace Level (agents/ folder)
        └── Agent Level (agent definition)
            └── Session Level (user overrides)
```

**Inheritance Resolution:**
1. Start with organization-wide defaults
2. Apply workspace `manifest.yaml` settings
3. Apply agent-specific overrides
4. Apply user session preferences
5. Apply runtime context (current client, task, etc.)

#### 6.7.7 Agent SDK Integration

```typescript
import { AgentSDK } from "@anthropic-ai/claude-agent-sdk";

// Initialize agent from workspace configuration
const agent = await AgentSDK.fromWorkspace({
  workspaceId: "thompson-family",
  agentId: "meeting-assistant",

  // Runtime context
  context: {
    currentClient: clientEntity,
    knowledgeGraph: graphRAGResult,
    pendingTasks: clientTasks,
  },

  // Tool bindings
  tools: {
    knowledge_query: knowledgeService.query,
    create_task: taskService.create,
    send_notification: notificationService.send,
  },
});

// Execute command
const briefing = await agent.execute("/meeting-prep Thompson 2026-02-10");
```

#### 6.7.8 Workspace Agent Capabilities

| Capability | Description | Implementation |
|------------|-------------|----------------|
| **Skill Learning** | Agents learn from domain documents | Markdown skills in `skills/` |
| **Command Execution** | Slash commands with structured output | Command specs in `commands/` |
| **Rule Enforcement** | Behavioral constraints | Rule docs in `rules/` |
| **Context Injection** | GraphRAG + workspace data | Automatic via manifest |
| **Tool Access** | Knowledge graph, tasks, notifications | Tool bindings in SDK |
| **Model Selection** | Per-agent model configuration | Manifest overrides |
| **Audit Logging** | All agent actions logged | Automatic via SDK |

#### 6.7.9 Pre-built Agent Templates

| Template | Purpose | Default Skills |
|----------|---------|----------------|
| **Compliance Reviewer** | Communication review | compliance, communication |
| **Meeting Assistant** | Briefing generation | client-context, agenda |
| **Research Analyst** | Market analysis | research, calculations |
| **Onboarding Specialist** | New client setup | onboarding, forms |
| **Estate Planner** | Estate planning support | trusts, beneficiaries |
| **Tax Coordinator** | Tax-related tasks | rmd, tax-loss-harvesting |

---

## 7. Technical Architecture

### 7.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT TIER                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Next.js   │  │   PGlite    │  │  Liveblocks │            │
│  │   App (16)  │  │   (local)   │  │   (collab)  │            │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘            │
│         │                │                │                     │
│         └────────────────┼────────────────┘                     │
│                          │                                      │
│                    Effect Runtime                               │
│                    (Browser ManagedRuntime)                     │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                         HTTPS/WSS
                              │
┌─────────────────────────────┼───────────────────────────────────┐
│                      API TIER                                   │
├─────────────────────────────┼───────────────────────────────────┤
│                              │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               Effect Platform HTTP Server               │   │
│  │                     (Bun Runtime)                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │              │              │              │          │
│  ┌──────┴────┐  ┌──────┴────┐  ┌──────┴────┐  ┌─────┴─────┐   │
│  │    IAM    │  │ Documents │  │ Knowledge │  │   Comms   │   │
│  │  Slice    │  │   Slice   │  │   Slice   │  │   Slice   │   │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Effect RPC Layer                       │   │
│  │              (Type-safe client-server contracts)         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────────┐
│                      DATA TIER                                  │
├─────────────────────────────┼───────────────────────────────────┤
│                              │                                  │
│  ┌──────────────┐  ┌─────────────────┐  ┌──────────────────┐   │
│  │  PostgreSQL  │  │     Redis       │  │       S3         │   │
│  │  + pgvector  │  │  (sessions,     │  │   (documents,    │   │
│  │  (primary)   │  │   cache)        │  │    attachments)  │   │
│  └──────────────┘  └─────────────────┘  └──────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Package Structure

```
packages/
├── shared/                    # Cross-slice shared code
│   ├── domain/               # Entity models, authorization
│   ├── env/                  # Typed environment access
│   ├── schema/               # Effect Schema utilities
│   └── server/               # Shared server utilities
│
├── iam/                      # Identity & Access Management
│   ├── domain/               # User, Org, Team, Session models
│   ├── tables/               # Drizzle table definitions
│   ├── server/               # Auth services (better-auth)
│   ├── client/               # Auth handlers
│   └── ui/                   # Auth flows
│
├── knowledge/                # Knowledge Graph
│   ├── domain/               # Entity, Relation, Ontology models
│   ├── tables/               # pgvector embeddings
│   ├── server/               # Extraction, GraphRAG services
│   ├── client/               # RPC contracts
│   └── ui/                   # Graph visualization
│
├── documents/                # Document Management
│   ├── domain/               # Document, Folder, Version models
│   ├── tables/               # Document storage
│   ├── server/               # Storage service (S3)
│   ├── client/               # Document handlers
│   └── ui/                   # Document browser
│
├── comms/                    # Communications
│   ├── domain/               # Email, Thread, Calendar models
│   ├── tables/               # Message storage
│   ├── server/               # Gmail/Outlook integration
│   ├── client/               # Sync handlers
│   └── ui/                   # Email client UI
│
├── calendar/                 # Calendar Management
│   ├── domain/               # Event, Recurrence models
│   ├── tables/               # Event storage
│   ├── server/               # Calendar sync
│   ├── client/               # Calendar handlers
│   └── ui/                   # Calendar views
│
└── customization/            # User Preferences
    ├── domain/               # Preference models
    ├── tables/               # User settings
    ├── server/               # Preference service
    ├── client/               # Settings handlers
    └── ui/                   # Settings UI
```

### 7.3 Data Model (Core Entities)

```
┌─────────────────────────────────────────────────────────────┐
│                    CORE DATA MODEL                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐         ┌──────────┐         ┌──────────┐   │
│  │   User   │◄───────►│  Member  │◄───────►│   Org    │   │
│  └──────────┘  1:N    └──────────┘   N:1   └──────────┘   │
│       │                    │                     │          │
│       │                    │                     │          │
│       │               ┌────┴────┐                │          │
│       │               │         │                │          │
│       │               ▼         ▼                ▼          │
│       │          ┌───────┐  ┌───────┐      ┌─────────┐     │
│       │          │ Team  │  │ Role  │      │Workspace│     │
│       │          └───────┘  └───────┘      └────┬────┘     │
│       │                                         │          │
│       │                                         │          │
│       │                    ┌────────────────────┤          │
│       │                    │                    │          │
│       │                    ▼                    ▼          │
│       │            ┌────────────┐      ┌────────────┐     │
│       └───────────►│  Document  │      │  Client DB │     │
│                    └─────┬──────┘      └─────┬──────┘     │
│                          │                   │             │
│                          │                   │             │
│                          ▼                   ▼             │
│                    ┌──────────────────────────────┐       │
│                    │      Knowledge Graph          │       │
│                    │                               │       │
│                    │  ┌────────┐    ┌──────────┐  │       │
│                    │  │ Entity │◄──►│ Relation │  │       │
│                    │  └────────┘    └──────────┘  │       │
│                    │       │                      │       │
│                    │       ▼                      │       │
│                    │  ┌──────────┐               │       │
│                    │  │ Mention  │ (provenance)  │       │
│                    │  └──────────┘               │       │
│                    │                               │       │
│                    └──────────────────────────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.4 Effect Architecture Patterns

**Layer Composition:**

```typescript
// Server entry point
const AppLive = Layer.mergeAll(
  // Infrastructure
  PostgresLive,
  RedisLive,
  S3Live,

  // Cross-cutting
  TelemetryLive,
  AuthMiddlewareLive,

  // Slice layers
  IamServerLive,
  KnowledgeServerLive,
  DocumentsServerLive,
  CommsServerLive,
  CalendarServerLive,
);

// Client entry point
const ClientLive = Layer.mergeAll(
  HttpClientLive,
  AuthClientLive,
  KnowledgeClientLive,
  DocumentsClientLive,
);
```

**Error Handling:**

```typescript
// Tagged errors for each domain
export class EntityNotFoundError extends S.TaggedError<EntityNotFoundError>()(
  "EntityNotFoundError",
  { entityId: S.String, entityType: S.String }
) {}

export class ExtractionError extends S.TaggedError<ExtractionError>()(
  "ExtractionError",
  { message: S.String, documentId: DocumentsEntityIds.DocumentId }
) {}

// Catchable by tag
pipe(
  extractEntities(doc),
  Effect.catchTag("ExtractionError", (e) =>
    Effect.logWarning(`Extraction failed: ${e.message}`)
  )
)
```

---

## 8. Integration Architecture

### 8.1 Integration Priority

| Phase | Integration | Complexity | Value |
|-------|-------------|------------|-------|
| **P1** | Gmail | Medium | High (most advisors use Gmail) |
| **P1** | Google Calendar | Medium | High (scheduling critical) |
| **P2** | Outlook/M365 | Medium | High (enterprise clients) |
| **P2** | Salesforce | High | High (CRM data) |
| **P3** | Schwab | High | Medium (custodian data) |
| **P3** | Fidelity | High | Medium (custodian data) |
| **P4** | Notion | Low | Low (document import) |
| **P4** | Google Drive | Medium | Medium (document sync) |

### 8.2 Integration Architecture

```
┌────────────────────────────────────────────────────────────┐
│                 INTEGRATION LAYER                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Integration Registry                    │  │
│  │                                                      │  │
│  │  • OAuth credential management                       │  │
│  │  • Webhook endpoint registration                     │  │
│  │  • Rate limit tracking                               │  │
│  │  • Health monitoring                                 │  │
│  └─────────────────────────────────────────────────────┘  │
│                          │                                 │
│          ┌───────────────┼───────────────┐                │
│          │               │               │                │
│          ▼               ▼               ▼                │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │
│  │    Gmail     │ │   Outlook    │ │  Salesforce  │      │
│  │   Adapter    │ │   Adapter    │ │   Adapter    │      │
│  │              │ │              │ │              │      │
│  │ • Push sync  │ │ • Graph API  │ │ • REST API   │      │
│  │ • Labels     │ │ • Webhooks   │ │ • Bulk sync  │      │
│  │ • Threads    │ │ • Calendar   │ │ • CDC        │      │
│  └──────────────┘ └──────────────┘ └──────────────┘      │
│          │               │               │                │
│          └───────────────┼───────────────┘                │
│                          │                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Extraction Pipeline                     │  │
│  │                                                      │  │
│  │  Raw Data → Normalization → Entity Extraction →     │  │
│  │  Relation Extraction → Resolution → Knowledge Graph │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 8.3 OAuth Flow

```
User                    TodoX                    Provider (Gmail)
  │                       │                           │
  ├──Connect Account─────►│                           │
  │                       ├──OAuth Redirect──────────►│
  │                       │                           │
  │◄─────────────────────────────Login + Consent─────►│
  │                       │                           │
  │                       │◄──Auth Code───────────────┤
  │                       │                           │
  │                       ├──Exchange for Tokens─────►│
  │                       │                           │
  │                       │◄──Access + Refresh Tokens─┤
  │                       │                           │
  │◄─Connection Success───┤                           │
  │                       │                           │
  │                       ├──Initial Sync────────────►│
  │                       │◄──Historical Data─────────┤
  │                       │                           │
  │                       ├──Register Webhook────────►│
  │                       │◄──Webhook Confirmation────┤
  │                       │                           │
```

### 8.4 Sync Strategy

**Full Sync (Initial):**
1. Paginate through all historical data
2. Rate-limit aware batching
3. Checkpointing for resumability
4. Background extraction processing

**Incremental Sync (Ongoing):**
1. Webhook-triggered for real-time updates
2. Polling fallback (5-minute intervals)
3. Delta processing only
4. Immediate extraction for new items

**Conflict Resolution:**
1. Server wins for extraction results
2. Last-write-wins for user edits
3. Merge for concurrent document edits (Yjs CRDT)

---

## 9. Security & Compliance

### 9.1 Authentication & Authorization

**Authentication:**
- Better Auth with multiple providers (email, Google, Microsoft)
- Session management with Redis
- MFA support (TOTP, WebAuthn)

**Authorization (ABAC):**

```typescript
// Policy evaluation order
1. System policies (priority 900-1000) - Immutable
2. Custom policies (priority 0-899) - User-defined
3. Default deny if no allow matches

// Example: Locked period protection
{
  id: "LOCKED_PERIOD_PROTECTION",
  effect: "deny",
  priority: 999,
  subject: { roles: ["*"] },
  resource: {
    type: "journal_entry",
    attributes: { periodStatus: ["Locked"] }
  },
  action: { actions: ["*"] }
}
```

**Role Hierarchy:**

| Role | Capabilities |
|------|--------------|
| **owner** | Full organization control |
| **admin** | User management, settings |
| **member** | Standard access |
| **viewer** | Read-only access |

**Functional Roles (Additive):**

| Role | Capabilities |
|------|--------------|
| **controller** | Period lock/unlock, consolidation approval |
| **finance_manager** | Account management, exchange rates |
| **accountant** | Journal entries, reconciliation |
| **period_admin** | Fiscal period management |
| **consolidation_manager** | Consolidation groups, elimination rules |

### 9.2 Data Protection

**Encryption:**
- TLS 1.3 for transit
- AES-256 for data at rest
- Separate encryption keys per organization

**Data Isolation:**
- Row-Level Security (RLS) in PostgreSQL
- Organization ID in every table
- Query-level enforcement

**Sensitive Data Handling:**
- Effect Schema `Redacted` for credentials
- Automatic log scrubbing
- PII tokenization for analytics

### 9.3 Compliance Framework

**FINRA/SEC Requirements:**

| Requirement | Implementation |
|-------------|----------------|
| **4512** | Automatic client communication logging |
| **17a-4** | Immutable audit logs with retention |
| **Reg S-P** | Privacy controls, data minimization |
| **Reg BI** | Suitability documentation with evidence |

**Audit Trail:**

```typescript
interface AuditEntry {
  id: AuditId;
  timestamp: DateTime;

  // Actor
  userId: UserId;
  organizationId: OrganizationId;
  ipAddress: string;
  userAgent: string;

  // Action
  action: string;
  resourceType: string;
  resourceId: string;

  // Change
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;

  // Evidence
  sourceEntityId?: KnowledgeEntityId;
  evidenceSpan?: EvidenceSpan;
}
```

**Retention Policies:**
- Client communications: 6 years (FINRA)
- Transaction records: 6 years (SEC)
- Audit logs: 10 years
- Knowledge graph: Indefinite (with provenance)

### 9.4 Privacy Controls

**Data Subject Rights (GDPR/CCPA):**
- Export: Full data export in JSON/CSV
- Deletion: Cascade delete with audit preservation
- Correction: Edit with version history
- Portability: Standard format export

**Consent Management:**
- Granular consent tracking
- Integration-specific permissions
- Revocation with data cleanup

---

## 10. Success Metrics

### 10.1 North Star Metric

**Time to Client Context**: Median time from advisor query to actionable client briefing

- **Baseline**: 30+ minutes (manual synthesis)
- **Target**: < 30 seconds (GraphRAG retrieval)
- **Measurement**: Query-to-response latency for meeting prep queries

### 10.2 Key Performance Indicators

| Category | Metric | Target | Measurement |
|----------|--------|--------|-------------|
| **Adoption** | DAU/MAU ratio | > 40% | Analytics |
| **Engagement** | Knowledge queries/user/day | > 10 | Query logs |
| **Quality** | Entity extraction F1 score | > 0.85 | Evaluation set |
| **Quality** | Entity resolution accuracy | > 0.90 | Manual audit |
| **Reliability** | API p99 latency | < 500ms | APM |
| **Reliability** | System uptime | > 99.9% | Monitoring |
| **Compliance** | Audit coverage | 100% | Compliance audit |
| **Satisfaction** | NPS | > 50 | Survey |

### 10.3 Feature-Specific Metrics

**Knowledge Graph:**
- Entities extracted per document
- Relation accuracy (sampled validation)
- Entity resolution cluster purity
- GraphRAG context relevance (human eval)

**Document Editor:**
- Documents created per user per week
- Collaboration sessions per document
- Export frequency by format
- AI assistance usage rate

**Communications:**
- Emails processed per day
- Extraction latency (email → knowledge graph)
- Thread accuracy (grouping correctness)
- Offline sync success rate

---

## 11. Roadmap

### 11.1 Phase 1: Foundation (Q1 2026)

**Goal:** Core platform with knowledge graph and document editing

| Feature | Status | Priority |
|---------|--------|----------|
| Multi-tenant auth (better-auth) | Complete | P0 |
| Organization/Team management | Complete | P0 |
| ABAC authorization | Complete | P0 |
| Lexical editor (50+ plugins) | Complete | P0 |
| Real-time collaboration (Liveblocks) | Complete | P0 |
| Knowledge domain models | Complete | P0 |
| Entity extraction pipeline | Complete | P1 |
| GraphRAG query system | Complete | P1 |
| Knowledge graph UI | In Progress | P1 |
| FlexLayout dashboard | In Progress | P1 |

### 11.2 Phase 2: Communications (Q2 2026)

**Goal:** Email and calendar integration with extraction

| Feature | Status | Priority |
|---------|--------|----------|
| Gmail OAuth integration | Planned | P0 |
| Email sync (full + incremental) | Planned | P0 |
| Email UI (inbox, compose, threads) | Planned | P0 |
| Email → knowledge extraction | Planned | P0 |
| Google Calendar integration | Planned | P1 |
| Calendar UI (day/week/month) | Planned | P1 |
| Meeting prep automation | Planned | P1 |
| Outlook/M365 integration | Planned | P2 |
| Local-first PGlite sync | Planned | P2 |

### 11.3 Phase 3: AI Assistant (Q3 2026)

**Goal:** Full AI agent capabilities

| Feature | Status | Priority |
|---------|--------|----------|
| AI chat interface | Partial | P0 |
| Meeting prep agent | Planned | P0 |
| Email draft agent | Planned | P0 |
| Task extraction agent | Planned | P1 |
| Dashboard config agent | Planned | P1 |
| Voice-to-text (Whisper) | Planned | P2 |
| Text-to-voice (ElevenLabs) | Planned | P2 |
| PiP mode | Planned | P2 |

### 11.4 Phase 4: Enterprise (Q4 2026)

**Goal:** Custodian integrations and compliance features

| Feature | Status | Priority |
|---------|--------|----------|
| Salesforce integration | Planned | P1 |
| Schwab/Fidelity integration | Planned | P2 |
| Compliance reporting | Planned | P1 |
| Audit log export | Planned | P1 |
| SSO (SAML/OIDC) | Planned | P2 |
| Advanced analytics | Planned | P2 |

### 11.5 Milestone Summary

```
Q1 2026  ─────────────────────────────────────────────
         │ Foundation
         │ • Auth & Multi-tenancy ✓
         │ • Document Editor ✓
         │ • Knowledge Graph ✓
         │ • FlexLayout Dashboard
         │
Q2 2026  ─────────────────────────────────────────────
         │ Communications
         │ • Gmail Integration
         │ • Calendar Integration
         │ • Email ↔ Knowledge Extraction
         │
Q3 2026  ─────────────────────────────────────────────
         │ AI Assistant
         │ • Agent Framework
         │ • Meeting Prep
         │ • Voice Interface
         │
Q4 2026  ─────────────────────────────────────────────
         │ Enterprise
         │ • Custodian Integrations
         │ • Compliance Reporting
         │ • Advanced Analytics
```

---

## 12. Appendices

### Appendix A: Glossary

| Term | Definition |
|------|------------|
| **UHNWI** | Ultra-High-Net-Worth Individual ($30M+ net worth) |
| **RIA** | Registered Investment Advisor |
| **MFO** | Multi-Family Office |
| **AUM** | Assets Under Management |
| **GraphRAG** | Graph-based Retrieval Augmented Generation |
| **RRF** | Reciprocal Rank Fusion (ranking algorithm) |
| **ABAC** | Attribute-Based Access Control |
| **RLS** | Row-Level Security |
| **owl:sameAs** | OWL property linking equivalent entities |
| **Provenance** | Origin and audit trail of data |
| **Entity Resolution** | Deduplication of entities across sources |

### Appendix B: Competitor Analysis

| Competitor | Strengths | Weaknesses vs TodoX |
|------------|-----------|---------------------|
| **Salesforce Financial Services Cloud** | Enterprise scale, ecosystem | No knowledge graph, weak AI |
| **Wealthbox** | Simple UX, affordable | Limited integrations, no extraction |
| **Redtail** | CRM features, integrations | No AI, traditional data model |
| **Orion** | Portfolio management | CRM add-on, no knowledge graph |
| **Addepar** | Data aggregation, reporting | Analytics focus, not advisor workflow |

### Appendix C: Technical Dependencies

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Runtime** | Bun | 1.3.x | JavaScript runtime |
| **Framework** | Next.js | 16 | React framework |
| **UI** | React | 19 | UI library |
| **Backend** | Effect | 3.x | Functional core |
| **Database** | PostgreSQL | 16 | Primary database |
| **Vector** | pgvector | 0.7.x | Embedding storage |
| **Cache** | Redis | 7.x | Session/cache |
| **Storage** | S3 | - | Document storage |
| **Auth** | better-auth | latest | Authentication |
| **Collaboration** | Liveblocks | latest | Real-time sync |
| **Editor** | Lexical | 0.21.x | Rich text editor |
| **AI** | @effect/ai | latest | LLM integration |
| **Agent SDK** | @anthropic-ai/claude-agent-sdk | latest | Workspace agents |

### Appendix D: Risk Register

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **LLM hallucination in extraction** | High | Medium | Ontology constraints, confidence thresholds, human review |
| **Integration API changes** | Medium | Medium | Adapter pattern, version pinning, monitoring |
| **Scale limitations (pgvector)** | High | Low | Sharding strategy, external vector DB fallback |
| **Compliance violations** | Critical | Low | Audit automation, policy enforcement, regular reviews |
| **Data breach** | Critical | Low | Encryption, RLS, penetration testing, SOC 2 |
| **User adoption resistance** | High | Medium | Gradual rollout, training, champion program |

### Appendix E: Open Questions

1. **Workspace sharing semantics**: Can workspaces be shared across organizations, or only within?
2. **Client database access control**: How granular should client-level permissions be?
3. **Offline conflict resolution**: What happens when the same document is edited offline by two users?
4. **Custodian data freshness**: Real-time vs daily sync for portfolio data?
5. **AI assistant guardrails**: What actions should require human confirmation?
6. **Multi-language support**: Priority for non-English entity extraction?

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-04 | AI Assistant | Initial PRD |

---

*This document is a living specification. Updates should be made as requirements evolve and implementation progresses.*
