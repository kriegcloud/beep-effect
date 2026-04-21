# @category Tag Canonicalization — Orchestrator Prompt

## Usage

Paste this prompt into a fresh Claude Code session to orchestrate a parallel agent swarm that audits and fixes every `@category` JSDoc tag across the beep-effect monorepo.

The orchestrator dispatches package-scoped sub-agents in parallel. Phase 1 audits (read-only). A human review checkpoint follows. Phase 2 applies approved changes.

---

## Section 1: Orchestrator Instructions

### Mission

Bring every exported symbol's `@category` JSDoc tag into alignment with the 12 canonical values defined in `tooling/repo-utils/src/JSDoc/models/TSCategory.model.ts`. This means:

1. **Remap** non-canonical `@category` values to their canonical equivalents.
2. **Add** `@category` tags to exported symbols that are missing them entirely.
3. **Preserve** symbols that already use a canonical value unchanged.
4. **Escalate** genuinely ambiguous cases for human review rather than guessing.

### Canonical Taxonomy Reference

The 12 canonical `@category` values, in priority order:

| # | Tag | Definition | Classification Guidance |
|---|-----|-----------|------------------------|
| 1 | `DomainModel` | Core business concepts and stable type-level contracts that represent domain state and invariants. | Branded/opaque types, entity interfaces, value objects, tagged error classes, enum-like unions. If it defines *what the domain is*, it belongs here. NOT schema decoders (Validation), NOT table definitions (DataAccess). |
| 2 | `DomainLogic` | Pure domain rules and transformations that operate on domain models without infrastructure side effects. | Deterministic computations, policies, pricing rules, state machine transitions, normalization functions. Takes domain types in, returns domain types out. No I/O, no framework imports. NOT generic string helpers (Utility), NOT orchestration of multiple services (UseCase). |
| 3 | `Configuration` | Environment, wiring, and runtime setup that determines how services are instantiated and composed. | Environment decoders, settings modules, Layer assembly, runtime bootstrap, constants modules. If it wires dependencies or reads config, it belongs here. NOT use-case orchestration (UseCase), NOT logging middleware (CrossCutting). |
| 4 | `PortContract` | Abstract capability contracts that define how core and UseCase logic talks to external dependencies. | Interfaces/types for repositories, gateways, service boundaries. Declares shapes with no concrete implementation. Port/Repository/Gateway naming. NOT concrete Drizzle repos (DataAccess), NOT use-case handlers (UseCase). |
| 5 | `Validation` | Boundary parsing, schema validation, and normalization that converts unknown input into trusted typed values. | Schema definitions (S.Struct, S.Class, S.TaggedRequest, etc.), decoders, parser functions, codec definitions. If it sits at a trust boundary converting untrusted → typed, it belongs here. NOT pure domain types (DomainModel), NOT route handlers (Presentation). |
| 6 | `Utility` | Reusable generic helpers that are not specific to one domain workflow or infrastructure boundary. | Cross-context helpers: formatting, collection transforms, string utilities, class-name merging. Generic and domain-agnostic. NOT business rules (DomainLogic), NOT config loaders (Configuration). |
| 7 | `UseCase` | Application-level orchestration that coordinates domain logic, validation, and port interactions to fulfill business intents. | Command/query handlers, workflow services, multi-step operations. Coordinates multiple concerns. Effect.fn or async with multiple service calls. NOT route handlers (Presentation), NOT gateway adapters (Integration). |
| 8 | `Presentation` | Transport and UI surface code that handles requests, responses, rendering, and interaction flow. | React components, route handlers, controllers, HTTP API group definitions, CLI commands. Framework-dependent surface code. NOT schema validation (Validation), NOT business orchestration (UseCase). |
| 9 | `DataAccess` | Persistence adapters and data-mapping logic that interact with databases and storage engines. | Drizzle table definitions, repository implementations, query builders, migration files. Database-touching code. NOT abstract repository interfaces (PortContract), NOT external API clients (Integration). |
| 10 | `Integration` | Adapters for external systems and third-party services such as APIs, queues, payment providers, and AI backends. | Outbound SDK wrappers, HTTP clients for external services, queue producers/consumers. External system boundary. NOT database repos (DataAccess), NOT route handlers (Presentation). |
| 11 | `CrossCutting` | Shared operational concerns that span multiple layers, such as auth, logging, tracing, metrics, and caching. | Middleware, interceptors, observability decorators, auth guards, cache wrappers. Orthogonal to business use cases. NOT generic string helpers (Utility), NOT route definitions (Presentation). |
| 12 | `Uncategorized` | Fallback category for elements that remain ambiguous after deterministic signals and boundary-context rules. | Last resort ONLY. Classify by nearest exportable ancestor first, then by source-file dominant category. Only use when confidence is genuinely below threshold. Every Uncategorized tag is tech debt. |

### CATEGORY_PRECEDENCE (Tiebreaker Order)

When multiple categories seem equally valid, prefer the one that appears earlier in this precedence list:

```
Validation → DataAccess → Integration → Presentation → UseCase → PortContract → Configuration → CrossCutting → DomainModel → DomainLogic → Utility → Uncategorized
```

Most-specific signals (boundary/infrastructure) win over general-purpose categories.

### Non-Canonical → Canonical Mapping Table

This deterministic table covers ~80% of remapping decisions. Sub-agents apply these mappings without deliberation:

| Non-Canonical Value | → Canonical | Rationale |
|---|---|---|
| `Models` | `DomainModel` | Plural variant of canonical |
| `models` | `DomainModel` | Lowercase plural variant |
| `Model` | `DomainModel` | Missing "Domain" prefix |
| `Errors` | `DomainModel` | Tagged error classes are domain type contracts in Effect |
| `Constructors` | `DomainLogic` | Factory functions are pure domain transformations |
| `constructors` | `DomainLogic` | Lowercase variant |
| `Services` | `PortContract` | Service interface declarations → abstract contracts. If concrete implementation → `UseCase` or `Integration` (escalate if unclear) |
| `Layers` | `Configuration` | Layer composition = dependency wiring and runtime setup |
| `layers` | `Configuration` | Lowercase variant |
| `Internal` | `Utility` | Internal helpers. Context-dependent — escalate if domain-specific |
| `Identity` | `Utility` | Identity builders are generic reusable helpers |
| `Observability` | `CrossCutting` | Logging, tracing, metrics = shared operational concerns |
| `Status` | `DomainModel` | Status types represent domain state |
| `Rpc` | `PortContract` | RPC schema definitions = abstract capability contracts |
| `HttpApi` | `Presentation` | HTTP API surface = transport layer |
| `constants` | `Configuration` | Constant value modules = environment/wiring setup |
| `Transitions` | `DomainLogic` | State transitions = pure domain rules |
| `Transformation` | `DomainLogic` | Data transformations = pure domain rules |
| `pattern matching` | `DomainLogic` | Match helpers = pure domain logic |
| `sequencing` | `Utility` | Sequencing combinators = generic helpers |
| `Normalization` | `Validation` | Boundary normalization = validation concern |
| `mapping` | `DomainLogic` | Mapping functions = pure transformations |
| `JsonPatch` | `Utility` | JSON operations = generic helper |
| `Helpers` | `Utility` | Helper functions → generic reusable |
| `Exports` | *(inherit)* | Re-exports inherit the source module's category |
| `Re-exports` | *(inherit)* | Re-exports inherit the source module's category |
| `ReExport` | *(inherit)* | Re-exports inherit the source module's category |
| `Drivers` | `Integration` | External system adapters |
| `Artifacts` | `Configuration` | Build/output artifacts = setup concern |
| `Diagnostics` | `CrossCutting` | Diagnostic tooling = shared operational concern |
| `Codecs` | `Validation` | Encode/decode at trust boundaries |
| `type utils` | `Utility` | Type-level utilities |
| `tags` | `DomainModel` | Tag definitions = domain type discriminants |
| `Projections` | `DomainLogic` | Data projections = pure transformations |

**For values not in this table**: sub-agents must use the Classification Decision Tree below.

### Classification Decision Tree (for unlisted values and missing tags)

When encountering an export with no `@category` or with a non-canonical value not in the mapping table, apply these rules in order:

```
1. Does it import a database/ORM library (drizzle, prisma)?
   YES → DataAccess

2. Does it import an external SDK (openai, stripe, aws-sdk, etc.)?
   YES → Integration

3. Does it import a framework (react, next, express) or return JSX?
   YES → Presentation

4. Is it an Effect Schema definition (S.Struct, S.Class, S.TaggedRequest, etc.)?
   YES → Validation

5. Does it define an Effect Layer, provide dependencies, or read environment config?
   YES → Configuration

6. Is it an interface/type with no implementation (Port/Repository/Gateway pattern)?
   YES → PortContract

7. Does it handle auth, logging, tracing, metrics, or caching middleware?
   YES → CrossCutting

8. Does it orchestrate multiple services/ports (Effect.fn, async with injected deps)?
   YES → UseCase

9. Is it a type/interface/class representing domain state, entity, or tagged error?
   YES → DomainModel

10. Is it a pure function transforming domain types with no I/O?
    YES → DomainLogic

11. Is it a generic, domain-agnostic helper function?
    YES → Utility

12. None of the above match with confidence?
    → Escalate to ambiguousEscalations array
```

### Work Unit Assignments

Each sub-agent owns a disjoint set of packages. No file conflicts possible.

| WU | Packages | ~Files | Primary Gap |
|----|----------|--------|-------------|
| 1 | `packages/ai/sdk` | 114 | ~111 missing tags |
| 2 | `packages/repo-memory/*` (5 pkgs) | 58 | ~30 non-canonical |
| 3 | `packages/common/schema`, `packages/common/semantic-web`, `packages/common/data` | 71 | ~21 missing |
| 4 | `packages/common/utils`, `packages/common/identity`, `packages/common/messages`, `packages/common/nlp`, `packages/common/types`, `packages/ui/*` | 23 | ~8 missing |
| 5 | `packages/shared/*` (7 pkgs) | 18 | ~10 missing |
| 6 | `packages/runtime/*`, `packages/_internal/db-admin` | 7 | minimal |
| 7 | `tooling/repo-utils`, `tooling/cli` | 102 | ~7 missing |
| 8 | `tooling/configs`, `tooling/codegraph`, `tooling/test-utils` | 27 | ~3 missing |

### Phase 1: Audit (Read-Only)

Dispatch all 8 work units in parallel. Each sub-agent:

1. Scans every `.ts` and `.tsx` file in its assigned packages (excluding test files, internal dirs, dist, stories).
2. For each exported symbol, records:
   - File path and symbol name
   - Current `@category` value (or `MISSING`)
   - Proposed canonical `@category` value
   - Confidence: `deterministic` (from mapping table), `high` (from decision tree), or `escalate` (ambiguous)
3. Outputs a structured JSON manifest (see Sub-Agent Output Contract below).
4. Makes **zero file modifications**.

**Orchestrator collects all 8 manifests, then:**

1. Aggregates all entries into a consolidated audit report.
2. Presents all `escalate`-confidence entries to the human for review.
3. Reports summary statistics:
   - Total symbols audited
   - Already canonical (no change needed)
   - Deterministic remappings
   - Decision-tree classifications
   - Escalations requiring human judgment
4. Waits for human approval before proceeding to Phase 2.

### Phase 2: Apply (With Approved Manifests)

After human approval (with any escalation overrides applied):

1. Dispatch all 8 work units in parallel with their approved manifests.
2. Each sub-agent applies JSDoc `@category` changes per the manifest.
3. Each sub-agent runs package-scoped verification:
   ```
   bun run --filter=@beep/<package> check
   bun run --filter=@beep/<package> lint
   bun run --filter=@beep/<package> docgen
   ```
4. Reports verification results back to orchestrator.

**Orchestrator then runs workspace-wide verification:**
```bash
bun run check
bun run lint
bun run lint:effect-laws
bun run docgen
```

### Success Criteria

1. Zero non-canonical `@category` values remain in `packages/` and `tooling/` source files.
2. Zero exported symbols without `@category` tags (in scope — excluding test files, internal dirs).
3. All workspace-level quality gates pass (`check`, `lint`, `docgen`).
4. No code logic changes — only JSDoc comment modifications.
5. Every Uncategorized assignment is documented with rationale.

---

## Section 2: Sub-Agent Prompt Template

The orchestrator uses this template for each work unit, replacing placeholders.

````
### Sub-Agent Prompt: @category Canonicalization — WU {{WU_NUMBER}}

Work from the repository root of the current workspace.

You are a sub-agent in a @category canonicalization swarm. Your job is to audit OR apply canonical @category JSDoc tags for a specific set of packages.

**Phase**: `{{PHASE}}` (either `audit` or `apply`)
**Work Unit**: {{WU_NUMBER}}
**Assigned Packages**: {{PACKAGE_LIST}}

#### Scope

Source directories to process:
{{SOURCE_DIRS}}

File inclusion: `**/*.ts`, `**/*.tsx`

File exclusions (do NOT process these):
- `**/*.test.ts`, `**/*.test.tsx`, `**/*.spec.ts`, `**/*.spec.tsx`
- `**/*.stories.tsx`
- `**/test/**`, `**/tests/**`, `**/dtslint/**`
- `**/.storybook/**`
- `**/dist/**`, `**/.turbo/**`, `**/.next/**`
- `**/src/internal/**`
- `**/*.d.ts`

#### Canonical Taxonomy (12 values)

The ONLY valid `@category` values are:

1. `DomainModel` — Core business concepts, type contracts, entities, tagged errors, value objects
2. `DomainLogic` — Pure domain rules, transformations, state machine transitions, no I/O
3. `Configuration` — Environment decoding, Layer assembly, runtime bootstrap, constants modules
4. `PortContract` — Abstract interfaces for repositories, gateways, service boundaries (no implementation)
5. `Validation` — Schema definitions, decoders, parsers, codec definitions at trust boundaries
6. `Utility` — Generic, domain-agnostic helper functions (formatting, collection transforms)
7. `UseCase` — Application orchestration coordinating multiple services/ports
8. `Presentation` — React components, route handlers, HTTP API groups, CLI commands
9. `DataAccess` — Drizzle tables, repository implementations, query builders, migrations
10. `Integration` — External SDK wrappers, third-party API clients, queue adapters
11. `CrossCutting` — Auth middleware, logging, tracing, metrics, caching interceptors
12. `Uncategorized` — Last resort ONLY when confidence is genuinely below threshold

#### CATEGORY_PRECEDENCE (tiebreaker)

```
Validation → DataAccess → Integration → Presentation → UseCase → PortContract → Configuration → CrossCutting → DomainModel → DomainLogic → Utility → Uncategorized
```

#### Non-Canonical Mapping Table

Apply these deterministic mappings without deliberation:

| Non-Canonical | → Canonical |
|---|---|
| Models, models, Model | DomainModel |
| Errors | DomainModel |
| Constructors, constructors | DomainLogic |
| Services | PortContract (interface) or UseCase/Integration (concrete) |
| Layers, layers | Configuration |
| Internal | Utility |
| Identity | Utility |
| Observability | CrossCutting |
| Status | DomainModel |
| Rpc | PortContract |
| HttpApi | Presentation |
| constants | Configuration |
| Transitions, Transformation, pattern matching, mapping, Projections | DomainLogic |
| sequencing, JsonPatch, Helpers, type utils | Utility |
| Normalization, Codecs | Validation |
| Drivers | Integration |
| Artifacts | Configuration |
| Diagnostics | CrossCutting |
| tags | DomainModel |
| Exports, Re-exports, ReExport | Inherit source module's category |

#### Classification Decision Tree (for unmapped values and missing tags)

Apply in order — first match wins:

1. Database/ORM imports? → `DataAccess`
2. External SDK imports? → `Integration`
3. React/Next/Express imports or JSX? → `Presentation`
4. Effect Schema definition (S.Struct, S.Class, S.TaggedRequest)? → `Validation`
5. Effect Layer / dependency wiring / env config? → `Configuration`
6. Interface/type with no implementation (Port/Repo/Gateway)? → `PortContract`
7. Auth/logging/tracing/metrics/caching middleware? → `CrossCutting`
8. Multi-service orchestration (Effect.fn, async+deps)? → `UseCase`
9. Domain type/entity/tagged error? → `DomainModel`
10. Pure function on domain types, no I/O? → `DomainLogic`
11. Generic domain-agnostic helper? → `Utility`
12. None match → add to `ambiguousEscalations`

#### Phase: Audit

If `{{PHASE}}` is `audit`:

1. Scan every in-scope file in your assigned packages.
2. For each **exported** symbol (function, class, variable, type alias, interface), record:
   - `filePath`: relative path from repo root
   - `symbolName`: exported name
   - `currentCategory`: existing `@category` value or `"MISSING"`
   - `proposedCategory`: one of the 12 canonical values
   - `confidence`: `"deterministic"` | `"high"` | `"escalate"`
   - `rationale`: one-line explanation (only required for `"high"` and `"escalate"`)
3. Do NOT modify any files.
4. Output your manifest as JSON (see Output Contract below).

#### Phase: Apply

If `{{PHASE}}` is `apply`:

You will receive an approved manifest as `{{APPROVED_MANIFEST}}`.

1. For each entry in the manifest:
   - If `currentCategory` is `"MISSING"`: add `@category <proposedCategory>` to the symbol's JSDoc block. If no JSDoc block exists, add a minimal one:
     ```
     /**
      * <existing description or symbol name>.
      *
      * @since 0.0.0
      * @category <proposedCategory>
      */
     ```
   - If `currentCategory` is non-canonical: replace the `@category <old>` line with `@category <proposedCategory>`.
   - If `currentCategory` is already the same as `proposedCategory`: skip (no change).
2. Constraints:
   - Modify ONLY JSDoc comments. Do NOT change any code logic, imports, types, or function bodies.
   - Preserve existing JSDoc content (descriptions, @param, @returns, @since, @example, etc.).
   - When adding a new JSDoc block, follow `.patterns/jsdoc-documentation.md` conventions.
3. After all changes, run package-scoped verification:
   ```bash
   bun run --filter=@beep/<package> check
   bun run --filter=@beep/<package> lint
   bun run --filter=@beep/<package> docgen
   ```
4. Report results.

#### Output Contract

**Phase 1 (Audit) — JSON Manifest:**

```json
{
  "workUnit": {{WU_NUMBER}},
  "phase": "audit",
  "packages": ["{{PACKAGE_LIST}}"],
  "timestamp": "<ISO-8601>",
  "summary": {
    "totalSymbolsAudited": 0,
    "alreadyCanonical": 0,
    "deterministicRemappings": 0,
    "decisionTreeClassifications": 0,
    "escalations": 0,
    "missing": 0
  },
  "entries": [
    {
      "filePath": "packages/ai/sdk/src/core/Foo.ts",
      "symbolName": "Foo",
      "currentCategory": "Models",
      "proposedCategory": "DomainModel",
      "confidence": "deterministic",
      "rationale": ""
    }
  ],
  "ambiguousEscalations": [
    {
      "filePath": "...",
      "symbolName": "...",
      "currentCategory": "...",
      "candidateCategories": ["...", "..."],
      "reason": "Why this is ambiguous"
    }
  ]
}
```

**Phase 2 (Apply) — Verification Report:**

```json
{
  "workUnit": {{WU_NUMBER}},
  "phase": "apply",
  "packages": ["{{PACKAGE_LIST}}"],
  "timestamp": "<ISO-8601>",
  "summary": {
    "filesModified": 0,
    "symbolsUpdated": 0,
    "symbolsAdded": 0,
    "symbolsSkipped": 0
  },
  "verification": {
    "check": "pass|fail",
    "lint": "pass|fail",
    "docgen": "pass|fail",
    "failures": []
  }
}
```
````

---

## Section 3: Post-Swarm Enhancement Recommendations

After the swarm completes successfully, make these changes to prevent regression:

### 1. Extend `RequireCategoryTagRule` to validate canonical values

Currently the rule at `tooling/configs/src/eslint/RequireCategoryTagRule.ts` only checks for the *presence* of `@category`. Extend it to also validate that the value is one of the 12 canonical categories.

Import `TS_CATEGORY_TAG_VALUES` from `@beep/repo-utils` and add a second message:

```typescript
messages: {
  missingCategory: "Exported symbol '{{name}}' must include a @category tag in its JSDoc block.",
  invalidCategory: "Exported symbol '{{name}}' has non-canonical @category value '{{value}}'. Must be one of: {{allowed}}.",
},
```

### 2. Extend rule scope to include `packages/`

Currently `beep-jsdoc/require-category-tag` only applies to `tooling/*/src/**/*.ts`. Add `packages/*/src/**/*.ts` and `packages/*/*/src/**/*.ts` to the file patterns in `ESLintConfig.ts`.

### 3. Add CI enforcement

Once all packages are clean, promote the rule from `"warn"` to `"error"` to prevent new non-canonical values from being introduced.
