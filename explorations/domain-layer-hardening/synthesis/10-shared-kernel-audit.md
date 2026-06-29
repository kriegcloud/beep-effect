# Phase 1 Audit — `shared/domain` kernel (10)

Keystone audit: every product entity inherits `BaseEntity`, so the cross-cutting
decisions (soft-delete, temporal validity, domain events, attestation) are made
here and ripple to all five slices. Citations are `file:line` under
`packages/shared/domain/src/` unless noted.

## 1. The two competing audit bases (decision Q1)

| Concern | `BaseEntity` (live, canonical) `entity/BaseEntity.ts:71-122` | `@beep/schema/DomainModel` (unused) `foundation/modeling/schema/src/DomainModel.ts:33-42` |
|---|---|---|
| created-at | `createdAt` `DateTimeFromMillis`, `defaultedOnInsert` | `createdAt` `DateTimeInsertFromNumber` |
| updated-at | `updatedAt`, `updatedOnWrite` | `updatedAt` `DateTimeUpdateFromNumber` |
| **soft-delete** | **— absent —** | **`deletedAt` `FieldOption(DateTimeUtcFromMillis)`** |
| created-by | `createdByPrincipal` **`Principal`** (rich tagged union) | `createdBy` `FieldOption(String)` (weak) |
| updated-by | `updatedByPrincipal` **`Principal`** | `updatedBy` `FieldOption(String)` (weak) |
| **deleted-by** | **— absent —** | `deletedBy` `FieldOption(String)` (weak) |
| version | `rowVersion` `PosInt`, `incrementedOnWrite` | `version` `Generated(NonNegativeInt)` |
| source | `source` **`SourceKind`** (literal, indexed) | `source` `FieldOption(String)` (weak) |
| tenant | `orgId` `OrganizationId` (indexed) | — absent — |
| schema-evolution | `schemaVersion` `SemanticVersion` | — absent — |
| actor model | **`Principal` union** (User/ServiceAccount/Agent/ConnectorAccount/System), `Principal.ts:191` | plain string |

**Reading:** `BaseEntity` is strictly richer on actor/source/tenant/versioning;
`DomainModel` is richer only on **soft-delete** (`deletedAt`/`deletedBy`) — and
even there with weak `String` actor typing. `rowVersion` already subsumes
`DomainModel.version` (modulo a floor/mechanism difference: `rowVersion` is
`PosInt`/`incrementedOnWrite`, `version` is `Generated(NonNegativeInt)` — map
`version: 0` rows deliberately on retirement). `DomainModel` is adopted by no
product entity; only its own barrel, unit tests, and dtslint reference it.

**Recommendation (rubric 1✔ 2✔ 3✔ 4✔):** keep `BaseEntity` canonical; **port
soft-delete into `BaseEntity`** as `deletedAt: S.OptionFromNullOr(DateTimeFromMillis)`
+ `deletedByPrincipal: S.OptionFromNullOr(Principal)` (rich actor, not String);
**retire `DomainModel`** (or downgrade to a documented deprecated alias). Rubric:
(1) soft-delete serves audit/query/"never lose a privileged record"; (2) adding a
nullable column later is a cheap migration but *retrofitting deletion semantics
across every repository/read-model is not* — decide the shape now; (3) validated
by DMS corpora (versioned/recoverable documents) and legal retention norms;
(4) soft-delete is the canonical strategy for an audit-heavy, local-first,
recoverable store, and `Principal` keeps deletion attributable.

## 2. `BaseEntity` invariant-field matrix

| field | schema | persist strategy | annotations | provenance role | gap |
|---|---|---|---|---|---|
| `id` | branded `EntityId` (per-entity) | `generatedOnInsert` | `$I.annote` | identity | — |
| `entityType` | `S.Literal` (derived) | `derived` | — | identity | — |
| `createdAt` | `DateTimeFromMillis` | `defaultedOnInsert` | — | audit | ok |
| `updatedAt` | `DateTimeFromMillis` | `updatedOnWrite` | — | audit | ok |
| `createdByPrincipal` | `Principal` | `providedByContext` (jsonb) | — | actor provenance | strong |
| `updatedByPrincipal` | `Principal` | `providedByContext` (jsonb) | — | actor provenance | strong |
| `orgId` | `OrganizationId` | `providedByContext`, btree+lookup | — | tenancy | strong |
| `rowVersion` | `PosInt` | `incrementedOnWrite` | — | optimistic concurrency | strong |
| `schemaVersion` | `SemanticVersion` | `providedByContext` | — | schema evolution | strong; **never read back yet** |
| `source` | `SourceKind` | `derived`, btree+lookup | annoteSchema | denormalized origin | strong |
| **`deletedAt`** | — | — | — | **soft-delete** | **MISSING (§1)** |
| **`deletedByPrincipal`** | — | — | — | **soft-delete actor** | **MISSING (§1)** |

Observations: provenance/actor/tenant/versioning are best-in-class; the only base
gaps are **soft-delete** (§1) and the absence of any **lifecycle/state** concept
(every entity invents its own `status`, see slice audits).

## 3. Shared entities

| Entity | Fields (`*.model.ts`) | Notable strengths | Gaps / opportunities |
|---|---|---|---|
| `User` `entities/User/User.model.ts:32-39` | `displayName: NonEmptyString` | minimal-by-design | no `email`/contact, no account `status` (active/suspended/deactivated), no locale/timezone/preferred-name; likely deferred to an auth/iam slice — **open Q: where does User identity/contact live?** |
| `Organization` `entities/Organization/Organization.model.ts:35-42` | `legalName`, `name`, `slug`(unique), `licenseTier`, `settings`(jsonb), `parentOrgId: FieldOption` | **org hierarchy** via `parentOrgId`; `slug` unique; settings VO | no org `status`/lifecycle (active/suspended/closed), no `kind` (firm/individual/team), no jurisdiction/registration metadata for a legal tenant |
| `Membership` `entities/Membership/Membership.model.ts:35-39` | `role`, `status`, `userId` (orgId inherited) | clean join entity; role+status literals | no `invitedByPrincipal`, no `expiresAt` (temporary access), no scope/permission grant beyond `role` |

## 4. Unused substrate (defined, zero entity adoption) — `entity/primitives.ts`

| primitive | shape | natural future use |
|---|---|---|
| `Sha256` | `Sha256Hex` | content-addressing for documents/evidence/blobs; dedup; integrity |
| `Ed25519Signature` | branded `NonEmptyString` (base64url) | tamper-evident attestation on claims/approvals/signed docs |
| `EncryptionKeyId` | branded `NonEmptyString` | envelope-encryption key reference for privileged fields |
| `HybridLogicalClock` | branded `NonEmptyString` | local-first causal ordering / CRDT sync |
| `VectorClock` | `Record<String, NonNegativeInt>` | distributed-update conflict reasoning |

These are exactly the bricks for content-integrity, signature-provenance, and
local-first sync — but no entity wires them. **Opportunity:** a reusable
**attestation/integrity value-object** (`contentHash?: Sha256`, `signature?:
Ed25519Signature`, `signedByPrincipal?: Principal`) applied to evidence/approval
entities, rather than base-wide.

## 5. Cross-cutting recommendations (apply to all slices)

| # | Proposal | Strategy | Rubric (1/2/3/4) | Recommend | Decision |
|---|---|---|---|---|---|
| R1 | Soft-delete on `BaseEntity` (`deletedAt`,`deletedByPrincipal`) | soft-delete | ✔/✔/✔/✔ | **Adopt now** | Q1/Q2 |
| R2 | Retire/deprecate `@beep/schema/DomainModel` | dedup | ✔/✔/n-a/✔ | **Adopt** | Q1 |
| R3 | `TemporalValidity` VO (`validFrom`,`validTo`) as an **opt-in mixin** for entities with real effective-dating (Matter status, OfficeAction deadlines, Membership), NOT base-wide | temporal validity | ✔/✔/✔/△ | **Adopt VO now, apply selectively** | Q3 |
| R4 | `DomainEvent` envelope VO (`.events.ts`) + emission seam; entities stay candidate-only, events are the projection feed | event-sourcing/provenance | ✔/△/✔/✔ | **Define envelope now, wire later** | Q4 |
| R5 | Typed domain errors (`.errors.ts`) in every slice via `TaggedErrorClass` | tagged errors | ✔/✔/✔/✔ | **Adopt per slice** | Q5 |
| R6 | Attestation/integrity VO from `primitives` for evidence/approval/signed entities | provenance | ✔/△/✔/✔ | **Adopt VO, apply selectively** | new |
| R7 | Shared cross-field refinement idiom (fixes the self-documented `TextAnchor` gap) | refinement | ✔/✔/△/✔ | **Adopt** | new |
| R8 | A canonical lifecycle/`status` modeling convention (tagged union via `LiteralKit.toTaggedUnion`) so slices stop hand-rolling status bags | matchable variants | ✔/✔/✔/✔ | **Adopt convention** | new |

R3/R4/R6 are deliberately **value-objects/mixins, not base fields** — base-wide
temporal/event/crypto columns would tax every trivial row; the rubric's criterion
4 favors applying them where the domain genuinely needs them.

## 6. Open questions surfaced (→ `DECISIONS.md`)
- Q1 audit-base reconciliation → **recommend retire DomainModel, port soft-delete**.
- Q2 soft-delete posture → **recommend base-wide** (R1).
- Q3 temporal validity → **recommend opt-in VO** (R3), not base-wide.
- Q4 domain-event substrate → **recommend define envelope now** (R4).
- Q5 typed-error gap → **recommend per-slice `.errors.ts`** (R5).
- Q6 aggregate roots → resolve during slice audits (candidates: Matter, Thread, OfficeAction).
- NEW: where does `User` identity/contact/account-status live (kernel vs auth slice)?
- NEW: should `Organization`/`Membership` carry lifecycle status as tagged unions (R8)?
