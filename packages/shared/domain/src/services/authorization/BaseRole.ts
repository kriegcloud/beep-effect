/**
 * BaseRole - Base role for organization membership
 *
 * Defines the hierarchical access levels within an organization:
 * - 'owner': Organization creator/owner with full access, can delete org and transfer ownership
 * - 'admin': Organization administrator with full data operations and member management
 * - 'member': Standard user with access based on functional roles assigned
 * - 'viewer': Read-only access to view data and reports only
 *
 * @module @beep/shared-domain/services/authorization/BaseRole
 */
// import { $SharedDomainId } from "@beep/identity";

// const $I = $SharedDomainId.create("services/authorization/.ts");
