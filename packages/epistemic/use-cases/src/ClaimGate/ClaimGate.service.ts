/**
 * Claim gate implementation.
 *
 * Maps a candidate claim plus its evidence into a bounded SHACL dataset (a claim
 * subject typed as a claim, with one quote triple per evidence span), runs the
 * bounded engine requiring at least one evidence quote, and projects the result
 * into a typed admitted/rejected verdict. The live layer that resolves
 * `ShaclValidationService` is provided in the epistemic server tier; this module
 * is a pure factory over the resolved engine shape.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { ClaimGateResult } from "@beep/epistemic-domain/values";
import { Dataset, makeDataset, makeLiteral, makeNamedNode, makeQuad } from "@beep/semantic-web/rdf";
import { ShaclValidationRequest } from "@beep/semantic-web/services/shacl-validation";
import { RDF_TYPE } from "@beep/semantic-web/vocab/rdf";
import { XSD_STRING } from "@beep/semantic-web/vocab/xsd";
import { Effect } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import type * as DomainCandidateClaim from "@beep/epistemic-domain/entities/CandidateClaim";
import type * as DomainEvidence from "@beep/epistemic-domain/entities/Evidence";
import type { ShaclValidationResult, ShaclValidationServiceShape } from "@beep/semantic-web/services/shacl-validation";
import type { ClaimGateShape } from "./ClaimGate.ports.js";

const CLAIM_CLASS_IRI = "https://beep.dev/epistemic/Claim";
const EVIDENCE_QUOTE_IRI = "https://beep.dev/epistemic/hasEvidenceQuote";
const CLAIM_SUBJECT_PREFIX = "https://beep.dev/epistemic/claim/";

const toDataset = (
  claim: DomainCandidateClaim.CandidateClaim,
  evidence: ReadonlyArray<DomainEvidence.Evidence>
): Dataset => {
  const subject = makeNamedNode(`${CLAIM_SUBJECT_PREFIX}${encodeURIComponent(claim.fixtureKey)}`);
  const typeQuad = makeQuad(subject, RDF_TYPE, makeNamedNode(CLAIM_CLASS_IRI));
  const quoteQuads = A.map(evidence, (ev) =>
    makeQuad(subject, makeNamedNode(EVIDENCE_QUOTE_IRI), makeLiteral(ev.span.quote, XSD_STRING.value))
  );
  return makeDataset([typeQuad, ...quoteQuads]);
};

const buildRequest = (
  claim: DomainCandidateClaim.CandidateClaim,
  evidence: ReadonlyArray<DomainEvidence.Evidence>
): ShaclValidationRequest =>
  // Built from statically known-good shapes; decode brands minCount and re-decodes the encoded dataset.
  S.decodeUnknownSync(ShaclValidationRequest)({
    dataset: S.encodeSync(Dataset)(toDataset(claim, evidence)),
    shapes: [
      {
        targetClass: { termType: "NamedNode", value: CLAIM_CLASS_IRI },
        properties: [
          {
            path: { termType: "NamedNode", value: EVIDENCE_QUOTE_IRI },
            minCount: 1,
            datatype: { termType: "NamedNode", value: XSD_STRING.value },
          },
        ],
      },
    ],
  });

// Project the engine result into the domain verdict; decode brands the violation fields from known-good values.
const toVerdict = (result: ShaclValidationResult): ClaimGateResult =>
  result.conforms && !result.truncated
    ? S.decodeUnknownSync(ClaimGateResult)({ verdict: "admitted" })
    : S.decodeUnknownSync(ClaimGateResult)({
        verdict: "rejected",
        violations: A.map(result.violations, (violation) => ({
          focusNode: violation.focusNode,
          path: violation.path.value,
          message: violation.message,
          severity: violation.severity,
        })),
      });

/**
 * Build the claim gate shape from a resolved bounded SHACL engine. Rejection is a
 * value ({@link ClaimGateResult}), never an error; the bounded engine is total,
 * so an (impossible) engine failure is treated as a defect.
 *
 * @example
 * ```ts
 * import { makeClaimGate } from "@beep/epistemic-use-cases/ClaimGate"
 *
 * console.log(makeClaimGate)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeClaimGate = (shacl: ShaclValidationServiceShape): ClaimGateShape => ({
  evaluate: (claim, evidence) =>
    Effect.orDie(shacl.validate(buildRequest(claim, evidence))).pipe(
      Effect.map(toVerdict),
      Effect.withSpan("epistemic.claim_gate.evaluate")
    ),
});
