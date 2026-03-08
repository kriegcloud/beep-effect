# PROV-O Spec Review

## Goal and Normative Sources

This review audits the internal PROV schema implementation in [ProvO.ts](../../src/internal/ProvO/ProvO.ts) against the W3C PROV-O Recommendation and records the remediation work needed to make the schema surface spec-first.

Normative sources:

- W3C PROV-O Recommendation, Sections 3 and 4: [https://www.w3.org/TR/prov-o/](https://www.w3.org/TR/prov-o/)
- W3C PROV-O Appendix B, inverse-property sanity only: [https://www.w3.org/TR/prov-o/#description-inverse-names](https://www.w3.org/TR/prov-o/#description-inverse-names)

Baseline inventory frozen before remediation:

- Canonical schema module: [ProvO.ts](../../src/internal/ProvO/ProvO.ts)
- Canonical schema tests: [ProvO.test.ts](../../test/ProvO.test.ts)
- Localized fixture corpus: [test/fixtures](../../test/fixtures)
- Baseline verification before remediation:
  - `bun run check`
  - `bun run --cwd packages/common/schema test`

## Review Method and Scoring Rules

Method:

1. Inventory the canonical schema surface and test coverage.
2. Map every official PROV-O class and property from Sections 3 and 4 to the current codebase.
3. Classify each term as one of:
   - `Implemented correctly`
   - `Implemented partially`
   - `Missing`
   - `Intentional compatibility extension outside spec`
4. Log every non-green baseline term in the issue log with the remediation action.
5. Apply the remediation in code and tests, then update the matrix and issue log to the post-remediation state.

Scoring rules:

- `Implemented correctly` means the term has first-class schema surface or field coverage and the surrounding range/domain semantics are not weaker than the PROV-O spec in this JSON transport.
- `Implemented partially` means some representation existed, but important term surface or semantic coverage was missing.
- `Missing` means the term did not exist as schema surface or field coverage.
- Compatibility helpers are allowed only when documented and when they do not weaken PROV-O semantics.

## Coverage Matrix by Official PROV-O Category

Status legend:

- `Baseline`: status before remediation.
- `Final`: status after remediation in this branch.

### Starting Point Terms

| Term | Kind | Spec | Baseline | Final | Repo surface |
| --- | --- | --- | --- | --- | --- |
| `prov:Entity` | Class | §3.1 | Implemented correctly | Implemented correctly | `Entity`, `EntityWithRequirements` |
| `prov:wasGeneratedBy` | Property | §3.1 | Implemented correctly | Implemented correctly | `Entity.wasGeneratedBy` |
| `prov:wasDerivedFrom` | Property | §3.1 | Implemented correctly | Implemented correctly | `Entity.wasDerivedFrom` |
| `prov:wasAttributedTo` | Property | §3.1 | Implemented correctly | Implemented correctly | `Entity.wasAttributedTo` |
| `prov:Activity` | Class | §3.1 | Implemented correctly | Implemented correctly | `Activity`, `ActivityWithRequirements` |
| `prov:used` | Property | §3.1 | Implemented correctly | Implemented correctly | `Activity.used`, `Usage`, `qualifiedUsage` |
| `prov:wasInformedBy` | Property | §3.1 | Implemented correctly | Implemented correctly | `Activity.wasInformedBy` |
| `prov:wasAssociatedWith` | Property | §3.1 | Implemented correctly | Implemented correctly | `Activity.wasAssociatedWith`, `Association`, `qualifiedAssociation` |
| `prov:Agent` | Class | §3.1 | Implemented correctly | Implemented correctly | `Agent`, `AgentWithRequirements` |
| `prov:actedOnBehalfOf` | Property | §3.1 | Implemented correctly | Implemented correctly | `Agent.actedOnBehalfOf`, `Delegation`, `qualifiedDelegation` |

### Expanded Terms

| Term | Kind | Spec | Baseline | Final | Repo surface |
| --- | --- | --- | --- | --- | --- |
| `prov:Collection` | Class | §3.2 | Implemented partially | Implemented correctly | `Collection`, `Entity`, collection invariants |
| `prov:EmptyCollection` | Class | §3.2 | Implemented partially | Implemented correctly | `EmptyCollection`, `Entity`, collection invariants |
| `prov:Bundle` | Class | §3.2 | Implemented partially | Implemented correctly | `Bundle` |
| `prov:alternateOf` | Property | §3.2 | Implemented correctly | Implemented correctly | `Entity.alternateOf` |
| `prov:specializationOf` | Property | §3.2 | Implemented correctly | Implemented correctly | `Entity.specializationOf` |
| `prov:generatedAtTime` | Property | §3.2 | Missing | Implemented correctly | `Entity.generatedAtTime` |
| `prov:hadPrimarySource` | Property | §3.2 | Implemented partially | Implemented correctly | `Entity.hadPrimarySource`, `PrimarySource`, `qualifiedPrimarySource` |
| `prov:value` | Property | §3.2 | Missing | Implemented correctly | `ProvValue`, `Entity.value` |
| `prov:wasQuotedFrom` | Property | §3.2 | Implemented partially | Implemented correctly | `Entity.wasQuotedFrom`, `Quotation`, `qualifiedQuotation` |
| `prov:wasRevisionOf` | Property | §3.2 | Implemented partially | Implemented correctly | `Entity.wasRevisionOf`, `Revision`, `qualifiedRevision` |
| `prov:wasInvalidatedBy` | Property | §3.2 | Implemented correctly | Implemented correctly | `Entity.wasInvalidatedBy`, `Invalidation`, `qualifiedInvalidation` |
| `prov:Person` | Class | §3.2 | Implemented partially | Implemented correctly | `Person` |
| `prov:SoftwareAgent` | Class | §3.2 | Implemented partially | Implemented correctly | `SoftwareAgent` |
| `prov:Organization` | Class | §3.2 | Implemented partially | Implemented correctly | `Organization` |
| `prov:influenced` | Property | §3.2 | Missing | Implemented correctly | `Influence.influenced` |
| `prov:atLocation` | Property | §3.2 | Implemented partially | Implemented correctly | `Location`, `LocationReference`, `Entity.atLocation`, `Activity.atLocation`, `Agent.atLocation`, instantaneous-event qualified relations |
| `prov:generated` | Property | §3.2 | Implemented correctly | Implemented correctly | `Activity.generated` |
| `prov:invalidated` | Property | §3.2 | Implemented correctly | Implemented correctly | `Activity.invalidated` |
| `prov:hadMember` | Property | §3.2 | Implemented partially | Implemented correctly | `Entity.hadMember`, `Collection`, `EmptyCollection` |
| `prov:startedAtTime` | Property | §3.2 | Implemented correctly | Implemented correctly | `Activity.startedAtTime` |
| `prov:endedAtTime` | Property | §3.2 | Implemented correctly | Implemented correctly | `Activity.endedAtTime` |
| `prov:wasStartedBy` | Property | §3.2 | Implemented correctly | Implemented correctly | `Activity.wasStartedBy`, `Start`, `qualifiedStart` |
| `prov:wasEndedBy` | Property | §3.2 | Implemented correctly | Implemented correctly | `Activity.wasEndedBy`, `End`, `qualifiedEnd` |
| `prov:invalidatedAtTime` | Property | §3.2 | Missing | Implemented correctly | `Entity.invalidatedAtTime` |
| `prov:Location` | Class | §3.2 | Missing | Implemented correctly | `Location`, `LocationReference` |

### Qualified Terms

| Term | Kind | Spec | Baseline | Final | Repo surface |
| --- | --- | --- | --- | --- | --- |
| `prov:wasInfluencedBy` | Property | §3.3 | Implemented correctly | Implemented correctly | `wasInfluencedBy` mixin |
| `prov:qualifiedInfluence` | Property | §3.3 | Implemented partially | Implemented correctly | `qualifiedInfluence`, `Influence` |
| `prov:Influence` | Class | §3.3 | Implemented partially | Implemented correctly | `Influence` |
| `prov:EntityInfluence` | Class | §3.3 | Missing | Implemented correctly | `EntityInfluence` |
| `prov:Usage` | Class | §3.3 | Implemented partially | Implemented correctly | `Usage` |
| `prov:Start` | Class | §3.3 | Implemented partially | Implemented correctly | `Start` |
| `prov:End` | Class | §3.3 | Implemented partially | Implemented correctly | `End` |
| `prov:Derivation` | Class | §3.3 | Implemented correctly | Implemented correctly | `Derivation` |
| `prov:PrimarySource` | Class | §3.3 | Missing | Implemented correctly | `PrimarySource` |
| `prov:Quotation` | Class | §3.3 | Missing | Implemented correctly | `Quotation` |
| `prov:Revision` | Class | §3.3 | Missing | Implemented correctly | `Revision` |
| `prov:ActivityInfluence` | Class | §3.3 | Implemented correctly | Implemented correctly | `ActivityInfluence` |
| `prov:Generation` | Class | §3.3 | Implemented partially | Implemented correctly | `Generation` |
| `prov:Communication` | Class | §3.3 | Implemented correctly | Implemented correctly | `Communication` |
| `prov:Invalidation` | Class | §3.3 | Implemented partially | Implemented correctly | `Invalidation` |
| `prov:AgentInfluence` | Class | §3.3 | Missing | Implemented correctly | `AgentInfluence` |
| `prov:Attribution` | Class | §3.3 | Implemented partially | Implemented correctly | `Attribution` |
| `prov:Association` | Class | §3.3 | Implemented partially | Implemented correctly | `Association` |
| `prov:Plan` | Class | §3.3 | Implemented partially | Implemented correctly | `Plan`, `OneOrMorePlansOrRefIds` |
| `prov:Delegation` | Class | §3.3 | Implemented partially | Implemented correctly | `Delegation` |
| `prov:InstantaneousEvent` | Class | §3.3 | Missing | Implemented correctly | `InstantaneousEvent` |
| `prov:Role` | Class | §3.3 | Missing | Implemented correctly | `Role`, `OneOrMoreRolesOrRefIds` |
| `prov:qualifiedGeneration` | Property | §3.3 | Implemented correctly | Implemented correctly | `Entity.qualifiedGeneration` |
| `prov:qualifiedDerivation` | Property | §3.3 | Implemented correctly | Implemented correctly | `Entity.qualifiedDerivation` |
| `prov:qualifiedPrimarySource` | Property | §3.3 | Missing | Implemented correctly | `Entity.qualifiedPrimarySource` |
| `prov:qualifiedQuotation` | Property | §3.3 | Missing | Implemented correctly | `Entity.qualifiedQuotation` |
| `prov:qualifiedRevision` | Property | §3.3 | Missing | Implemented correctly | `Entity.qualifiedRevision` |
| `prov:qualifiedAttribution` | Property | §3.3 | Implemented correctly | Implemented correctly | `Entity.qualifiedAttribution` |
| `prov:qualifiedInvalidation` | Property | §3.3 | Implemented correctly | Implemented correctly | `Entity.qualifiedInvalidation` |
| `prov:qualifiedStart` | Property | §3.3 | Implemented correctly | Implemented correctly | `Activity.qualifiedStart` |
| `prov:qualifiedUsage` | Property | §3.3 | Implemented correctly | Implemented correctly | `Activity.qualifiedUsage` |
| `prov:qualifiedCommunication` | Property | §3.3 | Implemented correctly | Implemented correctly | `Activity.qualifiedCommunication` |
| `prov:qualifiedAssociation` | Property | §3.3 | Implemented correctly | Implemented correctly | `Activity.qualifiedAssociation` |
| `prov:qualifiedEnd` | Property | §3.3 | Implemented correctly | Implemented correctly | `Activity.qualifiedEnd` |
| `prov:qualifiedDelegation` | Property | §3.3 | Implemented correctly | Implemented correctly | `Agent.qualifiedDelegation` |
| `prov:influencer` | Property | §3.3 | Implemented correctly | Implemented correctly | `Influence.influencer` and qualified subtypes |
| `prov:entity` | Property | §3.3 | Implemented correctly | Implemented correctly | `Usage.entity`, `Derivation.entity`, `Start.entity`, `End.entity` |
| `prov:hadUsage` | Property | §3.3 | Implemented correctly | Implemented correctly | `Derivation.hadUsage`, `PrimarySource.hadUsage`, `Quotation.hadUsage`, `Revision.hadUsage` |
| `prov:hadGeneration` | Property | §3.3 | Implemented correctly | Implemented correctly | `Derivation.hadGeneration`, `PrimarySource.hadGeneration`, `Quotation.hadGeneration`, `Revision.hadGeneration` |
| `prov:activity` | Property | §3.3 | Implemented correctly | Implemented correctly | `ActivityInfluence.activity` and qualified activity-influence subtypes |
| `prov:agent` | Property | §3.3 | Implemented correctly | Implemented correctly | `Attribution.agent`, `Association.agent`, `Delegation.agent`, `AgentInfluence.agent` |
| `prov:atTime` | Property | §3.3 | Implemented correctly | Implemented correctly | `Usage.atTime`, `Generation.atTime`, `Invalidation.atTime`, `Start.atTime`, `End.atTime`, `InstantaneousEvent.atTime` |
| `prov:hadActivity` | Property | §3.3 | Implemented correctly | Implemented correctly | `Derivation.hadActivity`, `Delegation.hadActivity`, `Start.hadActivity`, `End.hadActivity`, influence bases |
| `prov:hadPlan` | Property | §3.3 | Implemented partially | Implemented correctly | `Association.hadPlan`, `Plan`, `OneOrMorePlansOrRefIds` |
| `prov:hadRole` | Property | §3.3 | Implemented partially | Implemented correctly | `Role`, `OneOrMoreRolesOrRefIds`, qualified relations using `hadRole` |

## Issue Log

Each row records a non-green baseline term. All items below were resolved during this remediation pass.

| Official term | Spec | Current repo status before remediation | Gap type | Severity | Planned remediation | Resolution status |
| --- | --- | --- | --- | --- | --- | --- |
| `prov:Collection` | §3.2 | Collection semantics existed only as filters on `Entity`; no dedicated class surface | Missing class surface | High | Add `Collection` export with canonical type enforcement | Resolved |
| `prov:EmptyCollection` | §3.2 | Empty-collection semantics existed only as filters on `Entity`; no dedicated class surface | Missing class surface | High | Add `EmptyCollection` export with canonical type enforcement | Resolved |
| `prov:Bundle` | §3.2 | Only literal support existed | Missing class surface | Medium | Add `Bundle` export | Resolved |
| `prov:generatedAtTime` | §3.2 | Field missing from entity surface | Missing property | High | Add `Entity.generatedAtTime` | Resolved |
| `prov:hadPrimarySource` | §3.2 | Unqualified property existed, but no qualified primary-source term surface | Qualification gap | High | Add `PrimarySource` and `qualifiedPrimarySource` | Resolved |
| `prov:value` | §3.2 | Field missing | Missing property | High | Add scalar `ProvValue` and `Entity.value` | Resolved |
| `prov:wasQuotedFrom` | §3.2 | Unqualified property existed, but no quotation term surface | Qualification gap | Medium | Add `Quotation` and `qualifiedQuotation` | Resolved |
| `prov:wasRevisionOf` | §3.2 | Unqualified property existed, but no revision term surface | Qualification gap | Medium | Add `Revision` and `qualifiedRevision` | Resolved |
| `prov:Person` | §3.2 | Only literal support existed | Missing class surface | Medium | Add `Person` export | Resolved |
| `prov:SoftwareAgent` | §3.2 | Only literal support existed | Missing class surface | Medium | Add `SoftwareAgent` export | Resolved |
| `prov:Organization` | §3.2 | Only literal support existed | Missing class surface | Medium | Add `Organization` export | Resolved |
| `prov:influenced` | §3.2 | Generic influence target property missing | Missing property | Medium | Add `Influence.influenced` | Resolved |
| `prov:atLocation` | §3.2 | Only object references were accepted; no `Location` class surface | Range too weak / missing class | High | Add `Location`, `LocationReference`, and use them in all location-bearing terms | Resolved |
| `prov:hadMember` | §3.2 | Collection members only accepted inline entities; references were not modeled | Range too narrow | Medium | Allow collection member references or inline entities | Resolved |
| `prov:invalidatedAtTime` | §3.2 | Field missing | Missing property | High | Add `Entity.invalidatedAtTime` | Resolved |
| `prov:Location` | §3.2 | Missing | Missing class | High | Add `Location` export | Resolved |
| `prov:qualifiedInfluence` / `prov:Influence` | §3.3 | Generic influence surface lacked `influenced`, `hadRole`, and `hadActivity` coverage | Incomplete semantics | Medium | Expand `Influence` base structure | Resolved |
| `prov:EntityInfluence` | §3.3 | Missing | Missing class | Medium | Add `EntityInfluence` export | Resolved |
| `prov:Usage` | §3.3 | Missing `hadRole` support | Missing property on class | Medium | Add `Usage.hadRole` | Resolved |
| `prov:Start` / `prov:End` | §3.3 | Start and end lacked `atLocation` and forced `atTime` more narrowly than needed | Semantics mismatch | Medium | Add event location support and make `atTime` optional field coverage | Resolved |
| `prov:PrimarySource` | §3.3 | Missing | Missing class | High | Add `PrimarySource` export | Resolved |
| `prov:Quotation` | §3.3 | Missing | Missing class | High | Add `Quotation` export | Resolved |
| `prov:Revision` | §3.3 | Missing | Missing class | High | Add `Revision` export | Resolved |
| `prov:Generation` / `prov:Invalidation` | §3.3 | Event subclasses lacked location coverage and prefixed type support | Incomplete semantics | Medium | Add `atLocation` and prefixed type literals | Resolved |
| `prov:AgentInfluence` | §3.3 | Missing | Missing class | Medium | Add `AgentInfluence` export | Resolved |
| `prov:Attribution` | §3.3 | Missing `hadRole` support | Missing property on class | Medium | Add `Attribution.hadRole` | Resolved |
| `prov:Association` / `prov:hadPlan` | §3.3 | `hadPlan` accepted arbitrary object refs with no `Plan` surface | Range too weak | High | Add `Plan` export and typed plan references | Resolved |
| `prov:Plan` | §3.3 | Only literal support existed | Missing class surface | High | Add `Plan` export | Resolved |
| `prov:Delegation` | §3.3 | Missing `hadRole` support | Missing property on class | Medium | Add `Delegation.hadRole` | Resolved |
| `prov:InstantaneousEvent` | §3.3 | Missing | Missing class | Medium | Add `InstantaneousEvent` export | Resolved |
| `prov:Role` / `prov:hadRole` | §3.3 | No `Role` term surface; role-bearing properties used untyped object refs | Missing class / range too weak | High | Add `Role` export and typed role references | Resolved |
| Canonical `ProvO` root surface | Package surface | Root schema excluded standalone agents and used a typo-era alias in its internal identity and test/module surface | Export/module inconsistency | High | Make `ProvO` canonical, accept standalone agents, and remove the typo alias surface | Resolved |

## Remediation Checklist

- [x] Freeze the baseline inventory in this review document.
- [x] Map the official W3C term set to the current codebase.
- [x] Add missing class surfaces: `Collection`, `EmptyCollection`, `Bundle`, `Person`, `SoftwareAgent`, `Organization`, `Location`, `EntityInfluence`, `AgentInfluence`, `PrimarySource`, `Quotation`, `Revision`, `Plan`, `InstantaneousEvent`, `Role`.
- [x] Add missing property surfaces: `generatedAtTime`, `invalidatedAtTime`, `value`, `influenced`, `qualifiedPrimarySource`, `qualifiedQuotation`, `qualifiedRevision`.
- [x] Tighten range helpers so `atLocation`, `hadPlan`, `hadRole`, and `hadMember` are not weaker than the ontology.
- [x] Canonicalize the module surface around `ProvO` and remove the typo alias surface.
- [x] Keep transport-specific helpers, but document them as non-normative compatibility extensions.
- [x] Expand test coverage from fixture regression into spec-conformance coverage.
- [x] Update package docs home to link to this review.

## Final Conformance Summary

The canonical PROV schema surface now covers the official PROV-O term set from Sections 3 and 4 as first-class classes, field schemas, or qualified relation surfaces in [ProvO.ts](../../src/internal/ProvO/ProvO.ts). The implementation remains JSON-transport aware, but the transport helpers are now explicitly separated from the normative term surface.

Retained non-normative compatibility extensions:

- `JsonReference`
- `ExternalLink`
- `OneOrMoreObjectRef`
- open-world `type` compatibility field
- upstream transport fields such as `has_provenance`, `featureType`, `entityType`, and `links`

These extensions remain because they preserve compatibility with the upstream building-block transport without weakening the PROV-O term semantics implemented in the canonical schema.
