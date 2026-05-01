/**
 * SDK queries for the Agentic Professional Runtime proof.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $AgentCapabilityUseCasesId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { RuntimeScope } from "./ProfessionalRuntime.contracts.js";

const $I = $AgentCapabilityUseCasesId.create("processes/ProfessionalRuntime/ProfessionalRuntime.queries");

/**
 * Request for an evidence-bounded context packet.
 *
 * @example
 * ```ts
 * import { GetContextPacket } from "@beep/agent-capability-use-cases/public"
 *
 * console.log(GetContextPacket)
 * ```
 *
 * @category queries
 * @since 0.0.0
 */
export class GetContextPacket extends S.Class<GetContextPacket>($I`GetContextPacket`)(
  {
    artifactId: S.String,
    scenarioId: S.String,
    scope: RuntimeScope,
  },
  $I.annote("GetContextPacket", {
    description: "Query requesting the context packet for a scenario artifact and scope.",
  })
) {}
