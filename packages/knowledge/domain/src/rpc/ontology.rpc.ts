/**
 * Ontology RPC contracts for Knowledge slice
 *
 * RPC definitions for ontology CRUD and metadata operations.
 *
 * @module knowledge-domain/rpc/ontology
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as S from "effect/Schema";
import { ClassDefinition, Ontology, PropertyDefinition } from "../entities";
import { OntologyNotFoundError, OntologyParseError, OntologyValidationError } from "../errors";

const $I = $KnowledgeDomainId.create("rpc/ontology");

/**
 * Ontology create/update error union
 *
 * @since 0.1.0
 * @category errors
 */
export class OntologyMutationError extends S.Union(OntologyParseError, OntologyValidationError).annotations(
  $I.annotations("OntologyMutationError", {
    description: "Errors that can occur during ontology create/update operations",
  })
) {}

/**
 * RPC contract for Ontology operations.
 * All RPCs require authentication via RpcAuthMiddleware.
 *
 * @since 0.1.0
 * @category rpc
 */
export class Rpcs extends RpcGroup.make(
  /**
   * Get Ontology - Retrieve an ontology by its unique identifier.
   */
  Rpc.make("get", {
    payload: {
      id: KnowledgeEntityIds.OntologyId,
      organizationId: SharedEntityIds.OrganizationId,
    },
    success: Ontology.Model.json,
    error: OntologyNotFoundError,
  }),

  /**
   * List Ontologies - Stream all ontologies in an organization.
   */
  Rpc.make("list", {
    payload: {
      organizationId: SharedEntityIds.OrganizationId,
      status: S.optional(Ontology.OntologyStatus),
      cursor: S.optional(KnowledgeEntityIds.OntologyId),
      limit: S.optional(S.Int.pipe(S.positive())),
    },
    success: Ontology.Model.json,
    error: S.Never,
    stream: true,
  }),

  /**
   * Create Ontology - Create a new ontology definition.
   */
  Rpc.make("create", {
    payload: Ontology.Model.insert,
    success: Ontology.Model.json,
    error: OntologyMutationError,
  }),

  /**
   * Update Ontology - Update an existing ontology.
   */
  Rpc.make("update", {
    payload: Ontology.Model.update,
    success: Ontology.Model.json,
    error: S.Union(OntologyNotFoundError, OntologyMutationError),
  }),

  /**
   * Delete Ontology - Permanently delete an ontology.
   */
  Rpc.make("delete", {
    payload: {
      id: KnowledgeEntityIds.OntologyId,
      organizationId: SharedEntityIds.OrganizationId,
    },
    success: S.Void,
    error: OntologyNotFoundError,
  }),

  /**
   * Get Classes - Stream class definitions for an ontology.
   */
  Rpc.make("getClasses", {
    payload: {
      ontologyId: KnowledgeEntityIds.OntologyId,
      organizationId: SharedEntityIds.OrganizationId,
      parentIri: S.optional(S.String),
      limit: S.optional(S.Int.pipe(S.positive())),
    },
    success: ClassDefinition.Model.json,
    error: OntologyNotFoundError,
    stream: true,
  }),

  /**
   * Get Properties - Stream property definitions for an ontology.
   */
  Rpc.make("getProperties", {
    payload: {
      ontologyId: KnowledgeEntityIds.OntologyId,
      organizationId: SharedEntityIds.OrganizationId,
      domainIri: S.optional(S.String),
      rangeType: S.optional(PropertyDefinition.PropertyRangeType),
      limit: S.optional(S.Int.pipe(S.positive())),
    },
    success: PropertyDefinition.Model.json,
    error: OntologyNotFoundError,
    stream: true,
  })
).prefix("ontology_") {}
