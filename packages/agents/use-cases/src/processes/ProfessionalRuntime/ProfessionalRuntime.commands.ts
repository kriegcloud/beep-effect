/**
 * SDK commands for the Agentic Professional Runtime proof.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $AgentsUseCasesId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { CandidateOutputSet, RuntimeScope } from "./ProfessionalRuntime.contracts.js";

const $I = $AgentsUseCasesId.create("processes/ProfessionalRuntime/ProfessionalRuntime.commands");

/**
 * Command for proposing candidate work through the SDK facade.
 *
 * @example
 * ```ts
 * import { ProposeCandidateOutputSet } from "@beep/agents-use-cases/public"
 *
 * console.log(ProposeCandidateOutputSet)
 * ```
 *
 * @category commands
 * @since 0.0.0
 */
export class ProposeCandidateOutputSet extends S.Class<ProposeCandidateOutputSet>($I`ProposeCandidateOutputSet`)(
  {
    outputSet: CandidateOutputSet,
    producedByPrincipalId: S.String,
    scope: RuntimeScope,
  },
  $I.annote("ProposeCandidateOutputSet", {
    description: "Command proposing a candidate output set with producing-principal provenance.",
  })
) {}
