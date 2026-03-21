/**
 * CurrentEnvironmentContext - Service tag for providing environment context
 *
 * Provides request-scoped environment information (time, IP, user agent)
 * that can be used by the ABAC policy engine for environment-based policies.
 *
 * This context is captured by API middleware from the HTTP request and
 * made available to the AuthorizationService for policy evaluation.
 *
 * @module @beep/shared-domain/services/authorization/CurrentEnvironmentContext
 */
// import { $SharedDomainId } from "@beep/identity";

// const $I = $SharedDomainId.create("services/authorization/.ts");