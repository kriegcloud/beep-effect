# Tech Stack: Effect Ontology

## Core Language & Runtime
- **Language:** TypeScript (v5.6+)
- **Runtime:** Bun (v1.2+)

## Primary Frameworks & Libraries
- **Effect Ecosystem:**
    - `effect`: Core functional programming library.
    - `@effect/platform`: Cross-platform abstractions (File System, HTTP, etc.).
    - `@effect/schema`: Data modeling and validation.
    - `@effect/sql`: SQL database client and toolkit.
    - `@effect/ai`: Unified interface for LLM providers.
    - `@effect/cli`: Building powerful CLI applications.
    - `@effect/printer`: Declarative document construction.
    - `@effect/workflow`: State-machine-based workflow orchestration.
- **Frontend:**
    - **UI Library:** React (v19)
    - **Build Tool:** Vite
    - **State Management:** `@effect-atom/atom-react`, TanStack Query
    - **Styling:** Tailwind CSS, Radix UI (Headless components)
    - **Icons:** Lucide React

## Infrastructure & Services
- **Databases:**
    - PostgreSQL (Primary production database)
    - SQLite (Local development/testing)
    - Drizzle ORM (Type-safe SQL querying)
- **AI / LLM Providers:**
    - Anthropic (Primary model family)
    - Google (Gemini)
    - OpenAI
- **Knowledge Representation:**
    - **N3.js:** RDF parsing and serialization.
    - **Oxigraph:** High-performance SPARQL and graph storage.
    - **SHACL Engine:** Validating RDF data against shapes.
- **Cloud Platform (GCP):**
    - **Cloud Run:** Serverless compute for core services.
    - **Pub/Sub:** Messaging for asynchronous workflows.
    - **Cloud Storage:** Storing unstructured data and ontologies.

## DevOps & Quality Assurance
- **Testing:**
    - **Vitest:** Primary test runner.
    - **@effect/vitest:** Effect-native testing utilities.
    - **Fast-check:** Property-based testing for invariants.
- **Observability:**
    - **OpenTelemetry:** Distributed tracing and metrics.
    - **Jaeger:** Trace visualization.
- **Linting & Formatting:**
    - **ESLint:** With specialized plugins (`@effect/eslint-plugin`, `@typescript-eslint`).
    - **Prettier:** Code formatting.
- **Infrastructure as Code:**
    - **Terraform:** Managing GCP resources.
- **Containerization:**
    - **Docker:** Consistent environment across development and production.
