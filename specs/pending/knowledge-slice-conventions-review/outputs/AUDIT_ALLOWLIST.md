# Audit Allowlist

This file enumerates known, acceptable occurrences of otherwise discouraged constructs within `packages/knowledge/**`.

When running the verification `rg` commands in `outputs/VERIFICATION_REPORT.md`, any remaining matches must be:
- already present in this allowlist, or
- fixed, or
- explicitly added here with justification.

Format:

| Path:Line | Pattern | Rationale |
|---|---|---|
| `___` | `___` | `___` |
| `packages/knowledge/domain/src/entities/Agent/KnowledgeAgent.model.ts:197` | `\\bany\\b` | Doc comment ("if any"), not a TypeScript `any` type. |
| `packages/knowledge/domain/src/entities/Agent/KnowledgeAgent.model.ts:497` | `\\bany\\b` | Doc comment ("if any"), not a TypeScript `any` type. |
| `packages/knowledge/domain/src/entities/Agent/KnowledgeAgent.model.ts:501` | `\\bany\\b` | Docstring in Schema `description`, not a TypeScript `any` type. |
| `packages/knowledge/domain/src/value-objects/rdf/Quad.ts:100` | `\\bany\\b` | Docstring in Schema `description` ("any term type"), not a TypeScript `any` type. |
