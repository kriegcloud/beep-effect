# CSF-009: Turtle projection allows prefix injection

## Metadata

| Field | Value |
|---|---|
| Severity | Medium |
| Codex status | New |
| Repository | kriegcloud/beep-effect |
| Source commit | 8273eb9 |
| Reported age | 4d ago |
| Capture method | dom-get-page-text |
| Owner area | packages/foundation/modeling/ontology |
| Lane | _pending P4_ |
| Disposition | _pending P2_ |
| Triage verdict | _pending P2_ |
| Codex close reason | _pending P2_ |

## Summary

Introduced: the new @beep/ontology Turtle projection does not validate or safely serialize prefix labels before emitting them into Turtle output. The ontology package models `preferredPrefix` as an unrestricted string/NonEmptyString and preserves it when building metadata from `Ontology.create` or parsed JSON-LD. `projectTurtle` then emits that value directly in an `@prefix` directive. A malicious value containing whitespace, newlines, colons, or Turtle syntax can terminate or corrupt the directive and add attacker-controlled triples. The literal escaping helper only escapes backslashes and double quotes, so newline-bearing labels/comments can create invalid Turtle and downstream parser failures.

## Codex Patch

No patch provided by Codex.

- Patch status: _pending P5_

## Current-HEAD Triage

- Verdict: _pending P2_
- Disposition: _pending P2_
- Rationale: _pending P2_
- Remediation status: _pending P5_
- Lane: _pending P4_
- Verification command: _pending P2_
- Changed files: _pending P5_
- Verification notes: _pending P5_

## Evidence Paths

- packages/foundation/modeling/ontology/src/annotations.ts
- packages/foundation/modeling/ontology/src/model.ts
- packages/foundation/modeling/ontology/src/projections/jsonld.ts
- packages/foundation/modeling/ontology/src/projections/turtle.ts

## Validation Notes From Codex

- Confirm preferredPrefix enters the ontology creation/metadata model without a Turtle prefix-label validator.
- Confirm imported JSON-LD preserves attacker-controlled preferredPrefix without additional validation.
- Confirm Turtle projection directly serializes preferredPrefix into an @prefix directive without escaping or grammar checks.
- Demonstrate with a PoC that a malicious prefix value can terminate the directive, inject an attacker triple, and repair output so the rest remains plausible Turtle.
- Confirm literal escaping omits CR/LF handling and can emit raw newlines inside short Turtle literals.

## Sanitized Finding Content

```text
Finding
Turtle projection allows prefix injection
Report
Chat
Severity
Medium

Commit
8273eb9
4:21 AM Jun 4, 2026

by elpresidank

Repository
kriegcloud/beep-effect
Summary

Introduced: the new @beep/ontology Turtle projection does not validate or safely serialize prefix labels before emitting them into Turtle output.

The ontology package introduced in this commit models preferredPrefix as an unrestricted string/NonEmptyString and preserves it when building metadata from Ontology.create or from parsed JSON-LD. projectTurtle then emits that value directly in an @prefix directive. Turtle prefix labels have a restricted grammar, but a malicious value containing whitespace, newlines, colons, or Turtle syntax can terminate or corrupt the directive and add attacker-controlled triples to the serialized document. The literal escaping helper also only escapes backslashes and double quotes, so newline-bearing labels/comments can create invalid Turtle and downstream parser failures.

Validation
Confirm preferredPrefix enters the ontology creation/metadata model without a Turtle prefix-label validator.
Confirm imported JSON-LD preserves attacker-controlled preferredPrefix without additional validation.
Confirm Turtle projection directly serializes preferredPrefix into an @prefix directive without escaping or grammar checks.
Demonstrate with a PoC that a malicious prefix value can terminate the directive, inject an attacker triple, and repair output so the rest remains plausible Turtle.
Confirm literal escaping omits CR/LF handling and can emit raw newlines inside short Turtle literals.

Evidence
packages/foundation/modeling/ontology/src/annotations.ts (L61-65 OntologyCreateInput.preferredPrefix: string)
packages/foundation/modeling/ontology/src/model.ts (L50-56 metadata preferredPrefix: S.NonEmptyString; L546-552 JsonLdOntologyDocument preferredPrefix: S.NonEmptyString)
packages/foundation/modeling/ontology/src/projections/jsonld.ts (L238-245 jsonLdDocumentToOntology copies preferredPrefix)
packages/foundation/modeling/ontology/src/projections/turtle.ts (L22-27 escapeTurtleLiteral only escapes backslash/quote; L111-114 projectTurtle interpolates preferredPrefix into @prefix directive)

Attack-path analysis

Kept at medium. Source evidence and validation confirm a real injection flaw in normal @beep/ontology APIs: preferredPrefix is not grammar-validated and is emitted into @prefix syntax. The impact is meaningful RDF data integrity and potential parser availability loss, but it is bounded because the checkout does not show a public service route to the vulnerable function, the package is currently private, and there is no executable sink, auth bypass, or secret exposure.

Path
Untrusted ontology metadata / JSON-LD --decoded with only non-empty validation--> JsonLdOntologyDocument preferredPrefix: NonEmptyString --preserved in metadata--> jsonLdDocumentToOntology copies preferredPrefix --serialized--> projectTurtle @prefix interpolation --newline/Turtle syntax breaks directive--> Injected or corrupted Turtle document --trusted or ingested by consumer--> Conditional downstream RDF parser/store

Likelihood
Medium - The vulnerable API path is straightforward and part of normal library usage, and validation demonstrated the serializer behavior. Exploitation still requires a consumer that accepts untrusted ontology metadata/JSON-LD and then serializes or ingests Turtle.
Impact
Medium - Successful exploitation can alter generated RDF/Turtle content by injecting attacker-controlled triples or can produce malformed Turtle that breaks downstream parsers. No evidence shows code execution, credential exposure, authentication bypass, or direct service compromise.
Controls
Effect Schema validates preferredPrefix only as NonEmptyString.
baseIri uses IRI normalization, but preferredPrefix has no Turtle grammar validation.
Package is marked private:true in package.json.
```
