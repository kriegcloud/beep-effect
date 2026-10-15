/**
 * The claim self-check service contract: decompose claims into element trees,
 * check antecedent basis, and map findings into epistemic candidates.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $LawPracticeUseCasesId } from "@beep/identity/packages";
import * as Context from "effect/Context";
import type { PatentClaims } from "@beep/law-practice-domain/values/PatentDocument";
import type * as Effect from "effect/Effect";
import type { ClaimSelfCheckError } from "./ClaimSelfCheck.errors.ts";
import type {
  ClaimFindingCandidate,
  ClaimSelfCheckInput,
  ClaimSelfCheckReport,
  PublishedClaimSelfCheckReport,
  UsptoClaimSource,
} from "./ClaimSelfCheck.schemas.ts";

const $I = $LawPracticeUseCasesId.create("ClaimSelfCheck/ClaimSelfCheck.service");

/**
 * Service shape of the claim self-check.
 *
 * **Details**
 *
 * Every method runs the domain `ClaimElementDecomposer` over each claim and
 * then the domain `AntecedentPolicy` over the resulting trees. A claim that
 * fails to decompose is reported in the report's `undecomposed` list and does
 * not discard its siblings' findings; only a set where no claim decomposes
 * fails with `decomposition-failed`. Findings are advisory results, never
 * failures, and nothing here blocks a draft or a pipeline.
 *
 * **Example** (Name a self-check method)
 *
 * ```ts
 * import type { ClaimSelfCheckShape } from "@beep/law-practice-use-cases/ClaimSelfCheck"
 *
 * const method: keyof ClaimSelfCheckShape = "check"
 * console.log(method)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export interface ClaimSelfCheckShape {
  /**
   * Map each finding over a normalized document into a `candidate`-lifecycle `CandidateClaim`
   * and its referring-term `Evidence`, the way `PatentClaimCandidate` maps whole claims.
   */
  readonly candidates: (
    input: ClaimSelfCheckInput
  ) => Effect.Effect<ReadonlyArray<ClaimFindingCandidate>, ClaimSelfCheckError>;
  /** Decompose every claim of the set, then check antecedent basis over the trees. */
  readonly check: (claims: PatentClaims) => Effect.Effect<ClaimSelfCheckReport, ClaimSelfCheckError>;
  /**
   * Fetch a public USPTO claim set through the `UsptoClaims` port, then check it.
   * The result keeps the claim set, so its source document travels with the report as provenance.
   */
  readonly checkPublished: (
    source: UsptoClaimSource
  ) => Effect.Effect<PublishedClaimSelfCheckReport, ClaimSelfCheckError>;
}

/**
 * The claim self-check: advisory 35 U.S.C. 112(b) antecedent-basis findings
 * over a document's claims.
 *
 * **Details**
 *
 * Its layer depends on the `UsptoClaims` port for `checkPublished`; `check`
 * and `candidates` use only the pure domain decomposer and policy. Domain
 * decomposition failures and port failures are translated into
 * `ClaimSelfCheckError`.
 *
 * **Example** (Reference the service)
 *
 * ```ts
 * import { ClaimSelfCheck } from "@beep/law-practice-use-cases/ClaimSelfCheck"
 *
 * console.log(ClaimSelfCheck.key)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class ClaimSelfCheck extends Context.Service<ClaimSelfCheck, ClaimSelfCheckShape>()($I`ClaimSelfCheck`) {}
