/**
 * Worker commands and queries.
 *
 * @packageDocumentation
 * @category commands
 * @since 0.0.0
 */

import * as DomainWorker from "@beep/architecture-lab-domain/entities/Worker";
import { $ArchitectureLabUseCasesId } from "@beep/identity/packages";
import { Effect } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $ArchitectureLabUseCasesId.create("entities/Worker/Worker.commands");

/**
 * Command payload accepted by the Worker creation use case.
 *
 * @example
 * ```ts
 * import * as DomainWorker from "@beep/architecture-lab-domain/entities/Worker"
 * import { CreateWorkerCommand } from "@beep/architecture-lab-use-cases/entities/Worker"
 * import * as S from "effect/Schema"
 *
 * const command = CreateWorkerCommand.make({
 *   id: S.decodeUnknownSync(DomainWorker.WorkerId)(1),
 *   organizationId: S.decodeUnknownSync(DomainWorker.WorkerOrganizationId)(10),
 *   displayName: "Avery Reviewer"
 * })
 *
 * console.log(command.displayName) // "Avery Reviewer"
 * ```
 *
 * @category commands
 * @since 0.0.0
 */
export class CreateWorkerCommand extends S.Class<CreateWorkerCommand>($I`CreateWorkerCommand`)(
  {
    id: DomainWorker.WorkerId,
    organizationId: DomainWorker.WorkerOrganizationId,
    displayName: S.NonEmptyString,
  },
  $I.annote("CreateWorkerCommand", {
    title: "Create Worker command",
    description: "Public command for creating a synthetic architecture lab Worker entity.",
  })
) {}

/**
 * Query payload for loading one Worker by id.
 *
 * @example
 * ```ts
 * import * as DomainWorker from "@beep/architecture-lab-domain/entities/Worker"
 * import { GetWorkerQuery } from "@beep/architecture-lab-use-cases/entities/Worker"
 * import * as S from "effect/Schema"
 *
 * const query = GetWorkerQuery.make({
 *   id: S.decodeUnknownSync(DomainWorker.WorkerId)(1)
 * })
 *
 * console.log(query.id) // 1
 * ```
 *
 * @category queries
 * @since 0.0.0
 */
export class GetWorkerQuery extends S.Class<GetWorkerQuery>($I`GetWorkerQuery`)(
  {
    id: DomainWorker.WorkerId,
  },
  $I.annote("GetWorkerQuery", {
    title: "Get Worker query",
    description: "Public query for loading one synthetic architecture lab Worker entity.",
  })
) {}

/**
 * Query payload for listing Workers, optionally constrained by lifecycle status.
 *
 * @example
 * ```ts
 * import { ListWorkersQuery } from "@beep/architecture-lab-use-cases/entities/Worker"
 * import * as O from "effect/Option"
 *
 * const query = ListWorkersQuery.make({ status: O.some("active") })
 *
 * console.log(O.getOrUndefined(query.status)) // "active"
 * ```
 *
 * @category queries
 * @since 0.0.0
 */
export class ListWorkersQuery extends S.Class<ListWorkersQuery>($I`ListWorkersQuery`)(
  {
    status: S.OptionFromOptionalKey(DomainWorker.WorkerStatus).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<DomainWorker.WorkerStatus>()))
    ),
  },
  $I.annote("ListWorkersQuery", {
    title: "List Workers query",
    description: "Public query for listing synthetic architecture lab Workers.",
  })
) {}
