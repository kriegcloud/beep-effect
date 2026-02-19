# Spec: IAM Client Schema Consistency Inventory

## Status
- Phase: Scaffolding
- Target: Extend existing IAM client and shared-domain schema alignment

## Current State (Extend)
- `@beep/iam-client` already implements contract schemas and Better Auth transforms.
- Some contracts and schemas drift from shared-domain models and `@beep/schema` primitives.
- Several Better Auth responses are mapped directly to ad-hoc Effect schemas instead of domain models.
- Nullable/optional handling in transforms is inconsistent with canonical patterns.

## Objective
Create an inventory of all schema consistency violations across the IAM client (and related schema usage) with exact file paths, line numbers, and a named violation category. This is a discovery-only spec; no code changes are made here.

## Non-Goals
- Do not refactor schemas or update contracts.
- Do not change Better Auth adapters or domain entities.
- Do not create or update tests.

## Scope
- Primary: `packages/iam/client/src/**`.
- Include any contract/transform schemas that reference IAM or shared-domain models.
- Include tacit `effect/Schema` usage where a more canonical `@beep/schema` (BS) primitive exists.
- Include mismatches between contract payloads/success schemas and domain model variants (e.g., `Model.insert`).

## Sources of Truth (Must Read)
- `packages/iam/client/AGENTS.md` (client contract + transformation rules).
- `packages/iam/domain/AGENTS.md` (entity alignment + Model.insert guidance).
- `packages/common/schema/AGENTS.md` (BS primitives and schema guardrails).
- `documentation/patterns/iam-client-patterns.md` (contract patterns).
- `documentation/patterns/external-api-integration.md` (optional/nullable schema rules).
- `documentation/EFFECT_PATTERNS.md` (Effect Schema conventions).
- Effect docs for `@effect/sql/Model.Class` variant schemas (`insert`, `update`, `json*`).

## Violation Taxonomy
Use the repo documentation above to name each violation. The inventory must use consistent, specific names.
Examples of expected categories (confirm or refine from docs):
- "Non-canonical primitive" (e.g., `S.String` used where `BS.Phone`/`BS.Email`/`BS.URLPath` is required).
- "Missing domain transform" (Better Auth response not mapped to domain model transform).
- "Ad-hoc schema for domain entity" (contract uses local `S.Class` instead of domain model or transform).
- "Wrong domain variant" (payload/success uses non-`Model.insert`/`Model.json*` variant).
- "Nullability mismatch" (`S.optional` vs `S.optionalWith(..., { nullable: true })`, or schema allows null but transform requires non-null).

## Inventory Output Format
Write findings to:
- `specs/iam-client-schema-consistency-inventory/outputs/violations-inventory.md`

Each entry must include:
- Exact file path
- Exact line number
- Violation name (from taxonomy)
- Short evidence snippet (1-2 lines max, no large blocks)
- Canonical reference (doc or model/schema that should be used)

Example entry:
- Path: `packages/iam/client/src/admin/ban-user/contract.ts:47`
- Violation: Non-canonical primitive
- Evidence: `banReason: S.optional(S.String)`
- Canonical: `User.Model.fields.banReason` or `S.NonEmptyTrimmedString`

## Discovery Workflow (For the Inventory Agent)
1. Read the Sources of Truth and derive the final violation name list.
2. Scan IAM client contracts and internal schemas for:
   - Ad-hoc Effect Schema definitions that duplicate domain entities.
   - Primitive usage that should map to `BS` equivalents.
   - Contract payloads/success schemas that should use `Model.insert` or `Model.json*`.
   - Better Auth transforms that should use `S.optionalWith(..., { nullable: true })`.
3. Record each violation with file path + exact line number.
4. Avoid speculative violations; every entry must be backed by a concrete code line.

## Search Hints
- `rg -n "S\\.String" packages/iam/client/src` (locate primitive usage to compare with `BS.*`).
- `rg -n "S\\.optional\\(" packages/iam/client/src` (nullable vs optional mismatch).
- `rg -n "Domain.*FromBetterAuth" packages/iam/client/src` (verify transforms are used in contracts).
- `rg -n "Model\\.insert|Model\\.json" packages/iam/client/src` (ensure correct domain variants).
- `rg -n "S\\.Struct\\(" packages/iam/client/src` (ad-hoc schemas for domain entities).

## Line Number Rules
- Line numbers must be 1-based.
- Prefer `rg -n` or `nl -ba` for exact line anchors.
- If a violation spans multiple lines, pick the first line that declares the incorrect schema.

## Exclusions
- Do not flag generated files or `docs/` outputs.
- Do not flag tests unless they define production schemas under `packages/iam/client/src/**`.
- Ignore temporary or commented-out code unless it is actively exported/used.

## Acceptance Criteria
- `outputs/violations-inventory.md` exists and follows the format above.
- Every entry includes a line number and a clear, documented violation name.
- Coverage includes at least:
  - IAM client admin contracts (e.g., create/ban user).
  - IAM client multi-session list contracts.
  - Better Auth transform schemas in `_internal`.
  - Any pure `effect/Schema` usage that should be replaced by `@beep/schema` primitives.

## Notes
- Prefer `Model.insert` for create payloads where domain models exist.
- Better Auth transforms should allow nullable fields via `S.optionalWith(schema, { nullable: true })`.
- Keep the inventory strictly descriptive; no fixes or diffs in this spec.
