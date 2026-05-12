/**
 * Worker commands and queries.
 *
 * @packageDocumentation
 * @category commands
 * @since 0.1.0
 */

import * as DomainWorker from "@beep/architecture-lab-domain/entities/Worker";
import { $ArchitectureLabUseCasesId } from "@beep/identity/packages";
import { Effect } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $ArchitectureLabUseCasesId.create("entities/Worker/Worker.commands");

/**
 * Create Worker command.
 *
 * @category commands
 * @since 0.1.0
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
 * Get Worker query.
 *
 * @category commands
 * @since 0.1.0
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
 * List Workers query.
 *
 * @category commands
 * @since 0.1.0
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
