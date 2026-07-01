/**
 * SDK queries for the Agentic Professional Runtime proof.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $AgentsUseCasesId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { RuntimeScope } from "./ProfessionalRuntime.contracts.js";

const $I = $AgentsUseCasesId.create("processes/ProfessionalRuntime/ProfessionalRuntime.queries");

/**
 * Request for an evidence-bounded context packet.
 *
 * @example
 * ```ts
 * import { GetContextPacket, RuntimeScope } from "@beep/agents-use-cases/public"
 *
 * const query = GetContextPacket.make({
 *   artifactId: "email-artifact-law-001",
 *   scenarioId: "law-patent-intake",
 *   scope: RuntimeScope.make({
 *     organizationId: "org-law-fixture",
 *     threadId: "thread-law-001",
 *     workspaceId: "workspace-law-fixture"
 *   })
 * })
 *
 * console.log(query.artifactId)
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
