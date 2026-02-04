# Technology Alignment

> Package-by-package comparison ensuring beep-effect uses the same Effect ecosystem.

---

## Summary

| Status | Count |
|--------|-------|
| ✓ Aligned | ___ |
| ⚠ Version Mismatch | ___ |
| ✗ Missing | ___ |
| ○ Not Needed | ___ |

---

## Core Effect Packages

### effect

**effect-ontology Usage**:
```typescript
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Stream from "effect/Stream"
import * as Schema from "effect/Schema"
import * as Ref from "effect/Ref"
import * as Deferred from "effect/Deferred"
import * as PubSub from "effect/PubSub"
import * as Queue from "effect/Queue"
import * as FiberMap from "effect/FiberMap"
import * as Duration from "effect/Duration"
import * as Schedule from "effect/Schedule"
import * as Clock from "effect/Clock"
import * as Config from "effect/Config"
// ... (list all used modules)
```

**beep-effect Status**: ___

**Required Changes**: ___

---

### @effect/platform

**effect-ontology Usage**:
- `HttpRouter` - HTTP routing
- `HttpServerRequest` - Request handling
- `HttpServerResponse` - Response building
- `FileSystem` - File I/O
- `Path` - Path manipulation

**beep-effect Status**: ___

**Required Changes**: ___

---

### @effect/platform-bun

**effect-ontology Usage**:
- `BunContext` - Bun runtime context
- `BunRuntime` - Bun runtime execution
- `BunFileSystem` - Bun file system implementation

**beep-effect Status**: ___

**Required Changes**: ___

---

## Database Packages

### @effect/sql

**effect-ontology Usage**:
- `SqlClient` - Generic SQL client
- `SqlEventJournal` - Event sourcing journal
- `SqlPersistedQueue` - Persistent job queue

**beep-effect Status**: ___

**Required Changes**: ___

---

### @effect/sql-pg

**effect-ontology Usage**:
- `PgClient` - PostgreSQL client

**beep-effect Status**: ___

**Required Changes**: ___

---

### @effect/sql-sqlite-bun

**effect-ontology Usage**:
- `SqliteClient` - SQLite client for development

**beep-effect Status**: ___

**Required Changes**: ___

---

## AI/LLM Packages

### @effect/ai

**effect-ontology Usage**:
- `LanguageModel` - LLM abstraction
- `AI.gen` - AI generation context (if used)

**beep-effect Status**: ___

**Required Changes**: ___

---

### @effect/ai-anthropic

**effect-ontology Usage**:
- `AnthropicLanguageModel` - Anthropic provider
- `AnthropicClient` - Anthropic API client

**beep-effect Status**: ___

**Required Changes**: ___

---

### @effect/ai-openai

**effect-ontology Usage**:
- `OpenAiLanguageModel` - OpenAI provider
- `OpenAiClient` - OpenAI API client

**beep-effect Status**: ___

**Required Changes**: ___

---

## Durability Packages

### @effect/workflow

**effect-ontology Usage**:
- `Workflow.make` - Workflow definition
- `Activity` - Durable activity definition
- `WorkflowEngine` - Workflow execution engine

**beep-effect Status**: ✗ Not integrated (package installed but not used)

**Required Changes**:
- Create ExtractionWorkflow using Workflow.make
- Convert pipeline stages to Activity.make
- Wire WorkflowEngine into runtime

---

### @effect/cluster

**effect-ontology Usage**:
- `SingleRunner` - Single-node durable runner
- `SqlMessageStorage` - Message persistence
- `SqlRunnerStorage` - Runner registration
- `ShardingConfig` - Cluster configuration
- `Entity` - Distributed entity definition (optional)

**beep-effect Status**: ✗ Not integrated (package installed but not used)

**Required Changes**:
- Create PostgresLayer with Sql*Storage layers
- Create ClusterRuntime with SingleRunner
- Auto-create cluster tables on startup

---

## Experimental Packages

### @effect/experimental

**effect-ontology Usage**:
- `EventLogServer` - Event log protocol
- `EventLogServer.Storage` - Storage interface

**beep-effect Status**: ___

**Required Changes**: ___

---

## Observability Packages

### @effect/opentelemetry

**effect-ontology Usage**:
- Span attributes
- Metrics
- Tracing integration

**beep-effect Status**: ___

**Required Changes**: ___

---

## Third-Party Packages

### n3 (RDF)

**effect-ontology Usage**:
- N3 parser for Turtle/N-Triples
- N3 store for in-memory RDF
- N3 writer for serialization

**beep-effect Status**: ___

**Required Changes**: ___

---

### wink-nlp

**effect-ontology Usage**:
- Text chunking
- Tokenization
- Entity mention detection

**beep-effect Status**: ___

**Required Changes**: ___

---

## Version Alignment Table

| Package | effect-ontology | beep-effect | Aligned? |
|---------|-----------------|-------------|----------|
| effect | ___ | ___ | ___ |
| @effect/platform | ___ | ___ | ___ |
| @effect/platform-bun | ___ | ___ | ___ |
| @effect/sql | ___ | ___ | ___ |
| @effect/sql-pg | ___ | ___ | ___ |
| @effect/ai | ___ | ___ | ___ |
| @effect/ai-anthropic | ___ | ___ | ___ |
| @effect/ai-openai | ___ | ___ | ___ |
| @effect/workflow | ___ | ___ | ___ |
| @effect/cluster | ___ | ___ | ___ |
| @effect/experimental | ___ | ___ | ___ |
| @effect/opentelemetry | ___ | ___ | ___ |
| n3 | ___ | ___ | ___ |
| wink-nlp | ___ | ___ | ___ |

---

## Module Import Patterns

### effect-ontology Convention

```typescript
// Full namespace imports for core modules
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Schema from "effect/Schema"

// Abbreviated imports for frequently used modules
import * as A from "effect/Array"
import * as O from "effect/Option"
import * as S from "effect/Schema"

// Platform imports
import { HttpRouter, HttpServerRequest, HttpServerResponse } from "@effect/platform"

// AI imports
import { LanguageModel } from "@effect/ai"
import { AnthropicLanguageModel } from "@effect/ai-anthropic"

// Workflow imports
import { Workflow, Activity, WorkflowEngine } from "@effect/workflow"
import { SingleRunner, SqlMessageStorage, SqlRunnerStorage, ShardingConfig } from "@effect/cluster"
```

### beep-effect Convention

```typescript
// (Document current convention and note any differences)
```

---

## Action Items

### Must Install

| Package | Version | Purpose |
|---------|---------|---------|
| ___ | ___ | ___ |

### Must Upgrade

| Package | From | To | Reason |
|---------|------|-----|--------|
| ___ | ___ | ___ | ___ |

### Must Integrate

| Package | Status | Spec |
|---------|--------|------|
| @effect/workflow | Installed, not used | knowledge-workflow-durability |
| @effect/cluster | Installed, not used | knowledge-workflow-durability |

---

## Notes

_Additional observations about technology alignment go here._
