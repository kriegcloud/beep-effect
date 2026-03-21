/**
 * FunctionalRole - Additive roles for organization members
 *
 * Users with the 'member' base role can be assigned functional roles
 * that grant specific capabilities:
 *
 * - 'controller': Period lock/unlock, consolidation run/approval, full financial oversight
 * - 'finance_manager': Period soft close, account management, exchange rates, elimination rules
 * - 'accountant': Create/edit/post journal entries, reconciliation
 * - 'period_admin': Open/close periods, create adjustment periods
 * - 'consolidation_manager': Manage consolidation groups, elimination rules
 *
 * @module @beep/shared-domain/services/authorization/FunctionalRole
 */
// import { $SharedDomainId } from "@beep/identity";
// import * as S from "effect/Schema";
// const $I = $SharedDomainId.create("services/authorization/.ts");
