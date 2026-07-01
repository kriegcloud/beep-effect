/**
 * Worker entity model.
 *
 * @packageDocumentation
 * @category entities
 * @since 0.0.0
 */

import { $ArchitectureLabDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as EntitySchema from "@beep/schema/EntitySchema";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as Shared from "@beep/shared-domain/identity/Shared";
import { Result } from "effect";
import * as S from "effect/Schema";
import * as ArchitectureLab from "../../identity/ArchitectureLab.js";

const $I = $ArchitectureLabDomainId.create("entities/Worker/Worker.model");

/**
 * Entity identifier for a persisted architecture lab Worker.
 *
 * @example
 * ```ts
 * import { WorkerId, type WorkerId as WorkerIdValue } from "@beep/architecture-lab-domain/entities/Worker"
 * import * as S from "effect/Schema"
 *
 * const id: WorkerIdValue = S.decodeUnknownSync(WorkerId)(1)
 *
 * if (id !== 1) {
 *   throw new Error("expected decoded Worker id")
 * }
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const WorkerId = ArchitectureLab.WorkerId;

/**
 * Runtime type for {@link WorkerId}.
 *
 * @example
 * ```ts
 * import { WorkerId, type WorkerId as WorkerIdValue } from "@beep/architecture-lab-domain/entities/Worker"
 * import * as S from "effect/Schema"
 *
 * const id: WorkerIdValue = S.decodeUnknownSync(WorkerId)(1)
 * const ids: ReadonlyArray<WorkerIdValue> = [id]
 *
 * if (ids.length !== 1) {
 *   throw new Error("expected Worker id evidence")
 * }
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export type WorkerId = typeof WorkerId.Type;

/**
 * Organization identity used by the Worker proof entity.
 *
 * @example
 * ```ts
 * import { WorkerOrganizationId, type WorkerOrganizationId as WorkerOrganizationIdValue } from "@beep/architecture-lab-domain/entities/Worker"
 * import * as S from "effect/Schema"
 *
 * const organizationId: WorkerOrganizationIdValue = S.decodeUnknownSync(WorkerOrganizationId)(1)
 *
 * if (organizationId !== 1) {
 *   throw new Error("expected decoded organization id")
 * }
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const WorkerOrganizationId = Shared.OrganizationId;

/**
 * Runtime type for {@link WorkerOrganizationId}.
 *
 * @example
 * ```ts
 * import {
 *   WorkerOrganizationId,
 *   type WorkerOrganizationId as WorkerOrganizationIdValue
 * } from "@beep/architecture-lab-domain/entities/Worker"
 * import * as S from "effect/Schema"
 *
 * const organizationId: WorkerOrganizationIdValue = S.decodeUnknownSync(WorkerOrganizationId)(1)
 *
 * if (organizationId !== 1) {
 *   throw new Error("expected organization id evidence")
 * }
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export type WorkerOrganizationId = typeof WorkerOrganizationId.Type;

/**
 * Closed lifecycle vocabulary for the Worker proof entity.
 *
 * @example
 * ```ts
 * import { WorkerStatus, type WorkerStatus as WorkerStatusValue } from "@beep/architecture-lab-domain/entities/Worker"
 *
 * const status: WorkerStatusValue = WorkerStatus.Enum.active
 * const isActive = status === "active"
 *
 * console.log(isActive)
 *
 * if (status !== "active") {
 *   throw new Error("expected active Worker status")
 * }
 * ```
 *
 * @category value-objects
 * @since 0.0.0
 */
export const WorkerStatus = LiteralKit(["active", "inactive"]).pipe(
  $I.annoteSchema("WorkerStatus", {
    title: "Worker status",
    description: "Lifecycle status for a synthetic architecture lab Worker entity.",
  })
);

/**
 * Runtime type for {@link WorkerStatus}.
 *
 * @example
 * ```ts
 * import type { WorkerStatus } from "@beep/architecture-lab-domain/entities/Worker"
 *
 * const status: WorkerStatus = "inactive"
 * const isInactive = status === "inactive"
 *
 * console.log(isInactive)
 *
 * if (status !== "inactive") {
 *   throw new Error("expected inactive Worker status")
 * }
 * ```
 *
 * @category value-objects
 * @since 0.0.0
 */
export type WorkerStatus = typeof WorkerStatus.Type;

/**
 * Persisted Worker entity used by WorkItem assignment flows.
 *
 * @example
 * ```ts
 * import {
 *   CreateWorkerInput,
 *   Worker,
 *   WorkerId,
 *   WorkerOrganizationId,
 *   create
 * } from "@beep/architecture-lab-domain/entities/Worker"
 * import * as S from "effect/Schema"
 *
 * const worker: Worker = create(
 *   CreateWorkerInput.make({
 *     id: S.decodeUnknownSync(WorkerId)(1),
 *     organizationId: S.decodeUnknownSync(WorkerOrganizationId)(1),
 *     displayName: "Ada Lovelace"
 *   })
 * )
 *
 * if (worker.entityType !== WorkerId.entityType || worker.status !== "active") {
 *   throw new Error("expected active Worker entity")
 * }
 * ```
 *
 * @category entities
 * @since 0.0.0
 */
export class Worker extends BaseEntity.Class<Worker>($I`Worker`)(
  WorkerId,
  {
    fields: {
      displayName: S.NonEmptyString,
      status: WorkerStatus,
    },
    persisted: {
      displayName: EntitySchema.persist.text({
        columnName: "display_name",
      }),
      status: EntitySchema.persist.literal({
        indexHints: [EntitySchema.IndexHint.lookup],
      }),
    },
  },
  $I.annote("Worker", {
    title: "Worker",
    description: "Canonical architecture lab persisted entity used to prove entity archetype generation.",
  })
) {}

/**
 * Constructor input for an active Worker in an organization.
 *
 * @example
 * ```ts
 * import { CreateWorkerInput, WorkerId, WorkerOrganizationId } from "@beep/architecture-lab-domain/entities/Worker"
 * import * as S from "effect/Schema"
 *
 * const input = CreateWorkerInput.make({
 *   id: S.decodeUnknownSync(WorkerId)(1),
 *   organizationId: S.decodeUnknownSync(WorkerOrganizationId)(1),
 *   displayName: "Ada Lovelace"
 * })
 *
 * if (input.displayName !== "Ada Lovelace") {
 *   throw new Error("expected Worker input")
 * }
 * ```
 *
 * @category entities
 * @since 0.0.0
 */
export class CreateWorkerInput extends S.Class<CreateWorkerInput>($I`CreateWorkerInput`)(
  {
    id: WorkerId,
    organizationId: WorkerOrganizationId,
    displayName: S.NonEmptyString,
  },
  $I.annote("CreateWorkerInput", {
    title: "Create Worker input",
    description: "Input required to create an active architecture lab Worker entity.",
  })
) {}

const systemPrincipal = {
  component: "Runtime",
  kind: "System",
} as const;

const decodeWorker = S.decodeUnknownResult(Worker);

/**
 * Create a new active Worker entity.
 *
 * @example
 * ```ts
 * import { CreateWorkerInput, WorkerId, WorkerOrganizationId, create } from "@beep/architecture-lab-domain/entities/Worker"
 * import * as S from "effect/Schema"
 *
 * const worker = create(
 *   CreateWorkerInput.make({
 *     id: S.decodeUnknownSync(WorkerId)(1),
 *     organizationId: S.decodeUnknownSync(WorkerOrganizationId)(1),
 *     displayName: "Ada Lovelace"
 *   })
 * )
 *
 * if (worker.status !== "active" || worker.displayName !== "Ada Lovelace") {
 *   throw new Error("expected active Worker")
 * }
 * ```
 *
 * @category entities
 * @since 0.0.0
 */
export const create = (input: CreateWorkerInput): Worker =>
  Result.getOrThrow(
    decodeWorker({
      createdAt: 0,
      createdByPrincipal: systemPrincipal,
      displayName: input.displayName,
      entityType: WorkerId.entityType,
      id: input.id,
      orgId: input.organizationId,
      rowVersion: 1,
      schemaVersion: "0.1.0",
      source: "Application",
      status: "active",
      updatedAt: 0,
      updatedByPrincipal: systemPrincipal,
    })
  );
