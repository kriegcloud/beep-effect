# Reflection Log

Cumulative learnings from the repo-tooling spec phases.

## Prior Work Reflections (repo-utils migration)

### refl-2026-02-18-001
- **Phase**: repo-utils implementation
- **Outcome**: success
- **Task**: Port core utilities from beep-effect v3 to Effect v4
- **Key Insight**: Effect v4 has many renamed/removed APIs - maintaining a corrections doc prevented repeated mistakes
- **Pattern**: Always verify API existence against source before using it

### refl-2026-02-19-001
- **Phase**: preferSchemaOverJson refactor
- **Outcome**: success
- **Task**: Replace all raw JSON.parse/JSON.stringify with Schema-based operations
- **Key Insight**: SchemaGetter.stringifyJson({ space: 2 }).run() is the canonical way to pretty-print JSON in Effect v4's Schema ecosystem
- **Pattern**: Use SchemaGetter for JSON serialization, Schema.decodeUnknownEffect(Schema.UnknownFromJsonString) for parsing

### refl-2026-02-19-002
- **Phase**: encodePackageJsonPrettyEffect
- **Outcome**: success
- **Task**: Add Schema-based encoding helpers for PackageJson
- **Key Insight**: Compose validation (Schema.encodeUnknownEffect) with serialization (jsonStringifyPretty) rather than trying to build a single Schema transformation
- **Pattern**: Validate through schema first, then serialize - don't try to combine into one Schema pipe

## create-package Overhaul Reflections

### refl-2026-02-20-001
- **Phase**: phase-4-planning
- **Outcome**: identified gap
- **Task**: Assess whether create-package internals are reusable for a new create-slice implementation
- **Key Insight**: Handler-level implementation is sufficient for single-package scaffolding but not for create-slice's multi-package + ts-morph orchestration needs
- **Pattern**: Extract service boundaries early (`TemplateService`, generation planner, config orchestration, AST integration) before implementing higher-level commands

### refl-2026-02-20-002
- **Phase**: phase-4-implementation
- **Outcome**: success
- **Task**: Extract reusable create-package service boundaries and verify zero-manual multi-package scaffolding
- **Key Insight**: Treating package creation as a deterministic plan (`createPlan`/`executePlan`) plus multi-target config orchestration removes handler coupling and creates a direct handoff surface for create-slice flows
- **Pattern**: Keep command handlers thin; push template rendering, generation planning, and batch config updates into explicit service contracts, and include required `homepage` metadata in generated package manifests so docgen/lint gates stay green without manual patching

### refl-2026-02-20-003
- **Phase**: phase-5-hardening
- **Outcome**: success
- **Task**: Fix dist/runtime defects and lock missing CLI failure-path coverage
- **Key Insight**: `create-package` template failures in built CLI were caused by a two-part asset gap: build output did not copy `.hbs` templates into `dist`, and publish `files` metadata did not include those template assets; fixing only runtime lookup was insufficient without build + package metadata alignment
- **Pattern**: For template-driven CLIs, treat static assets as first-class build artifacts by: (1) explicit copy step during build, (2) package `files` allowlist coverage, and (3) runtime template directory resolution that supports both source and built execution roots

### refl-2026-02-20-004
- **Phase**: phase-5-hardening
- **Outcome**: success
- **Task**: Correct `topo-sort` output contract and add missing negative/edge tests
- **Key Insight**: Passing `Console.log` directly into `Effect.forEach` leaked the iteration index because callback arity did not match the intended single-argument contract, producing `"<package> <index>"` output lines
- **Pattern**: Avoid passing variadic/arity-sensitive functions directly as higher-order callbacks in Effect collection traversals; wrap with explicit lambdas, and backstop with branch tests for unmatched filters, cycle detection, and empty-result command paths
